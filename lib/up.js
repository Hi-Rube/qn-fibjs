/**
 * Created by Rube on 15/2/16.
 */

"use strict";


var encoding = require('encoding');
var hash = require('hash');
var http = require('http');
var fs = require('fs');

/**
 * Create uploadToken
 * @see http://docs.qiniu.com/api/v6/put.html#uploadToken
 *
 * @param {Object} options
 *  - {String} [scope] 一般指文件要上传到的目标存储空间（Bucket）。
 *                   若为”Bucket”，表示限定只能传到该Bucket（仅限于新增文件）；若为”Bucket:Key”，表示限定特定的文件，可修改该文件。
 *  - {Number} [deadline] 定义 uploadToken 的失效时间，Unix时间戳，精确到秒，缺省为 3600 秒
 *  - {String} [endUser] 给上传的文件添加唯一属主标识，特殊场景下非常有用，比如根据终端用户标识给图片或视频打水印
 *  - {String} [returnUrl] 设置用于浏览器端文件上传成功后，浏览器执行301跳转的URL，一般为 HTML Form 上传时使用。
 *                         文件上传成功后会跳转到 returnUrl?query_string, query_string 会包含 returnBody 内容。
 *                         returnUrl 不可与 callbackUrl 同时使用。
 *  - {String} [returnBody] 文件上传成功后，自定义从 Qiniu-Cloud-Server 最终返回給终端 App-Client 的数据。
 *                          支持 魔法变量，不可与 callbackBody 同时使用。
 *  - {String} [callbackBody] 文件上传成功后，Qiniu-Cloud-Server 向 App-Server 发送POST请求的数据。
 *                            支持 魔法变量 和 自定义变量，不可与 returnBody 同时使用。
 *  - {String} [callbackUrl] 文件上传成功后，Qiniu-Cloud-Server 向 App-Server 发送POST请求的URL，
 *                           必须是公网上可以正常进行POST请求并能响应 HTTP Status 200 OK 的有效 URL
 *  - {String} [asyncOps] 指定文件（图片/音频/视频）上传成功后异步地执行指定的预转操作。
 *                        每个预转指令是一个API规格字符串，多个预转指令可以使用分号“;”隔开
 * @return {String} upload token string
 */

exports.uploadToken = function uploadToken(options) {
  options = options || {};
  options.scope = options.scope || this.options.bucket;
  options.deadline = options.deadline || (Math.round(Date.now() / 1000) + 3600);
  var flags = options;
  // 步骤1：将 Flags 进行安全编码
  var encodedFlags = encoding.base64Encode(JSON.stringify(flags));
  encodedFlags.replace(/\+/g, '-').replace(/\//g, '_');
  // 步骤2：将编码后的元数据混入私钥进行签名
  // 步骤3：将签名摘要值进行安全编码
  var digest = hash.hmac_sha1(new Buffer(this.options.secretKey));
  digest.update(new Buffer(encodedFlags));
  var encodedSign = digest.digest().base64().toString().replace(/\+/g, '-').replace(/\//g, '_');
  // 步骤4：连接各字符串，生成上传授权凭证
  return this.options.accessKey + ':' + encodedSign + ':' + encodedFlags;
};

/**
 * Upload text
 * @param {String} content 上传的内容
 * @param {Object} options
 *  - {String} key 指定的存储文件名
 *  - {String} [token] 文件上传所使用的token，默认自动生成token
 *  - {String} [contentType] 文件类型 eg. text/html, text/plain, image/png  默认使用application/octet-stream
 * @return {Object} backInfo
 * - {String} hash
 * - {String} key
 * - {Integer} status
 */
exports.upload = function upload(content, options) {
  var boundary = "---------------------------leon";
  if (!options.key || !content || content.length == 0) {
    throw new TypeError('must have content,key');
  }

  var xValue = "";
  for (var k in options) {
    if (k.indexOf('x:') === 0) {
      xValue += '--' + boundary
      + '\r\n'
      + 'Content-Disposition: form-data; name="' + k + '"'
      + '\r\n\r\n'
      + options[k]
      + '\r\n';
    }
  }

  options.token = options.token || this.uploadToken();
  options.contentType = options.contentType || "application/octet-stream";
  options.filename = options.filename || options.key;
  var formStr = xValue + '--' + boundary
    + '\r\n'
    + 'Content-Disposition: form-data; name="key"'
    + '\r\n\r\n'
    + options.key
    + '\r\n'
    + '--' + boundary
    + '\r\n'
    + 'Content-Disposition: form-data; name="token"'
    + '\r\n\r\n'
    + options.token
    + '\r\n'
    + '--' + boundary
    + '\r\n'
    + 'Content-Disposition: form-data; name="file"; filename="' + options.filename + '"'
    + '\r\n'
    + 'Content-Type: ' + options.contentType
    + '\r\n\r\n';
  var formEnd = '\r\n--' + boundary + '--\r\n';
  var body = new Buffer();
  body.write(formStr);
  body.write(content);
  body.write(formEnd);
  var backInfo = http.post("http://up.qiniu.com", body, {
    'Content-Type': 'multipart/form-data; boundary=' + boundary
  });
  var back = JSON.parse(backInfo.body.readAll().toString());
  back.status = backInfo.status;
  return back;
};


/**
 * Upload File
 * @param {String} filePath 文件的路径
 * @param {Object} options
 *  - {String} [key] 指定的存储文件名，默认为原文件名
 *  - {String} [token] 文件上传所使用的token，默认自动生成token
 *  - {String} [contentType] 文件类型 eg. text/html, text/plain, image/png  默认使用application/octet-stream
 * @return {Object} backInfo
 * - {String} hash
 * - {String} key
 * - {Integer} status
 * - {Object} fileInfo  包括size，atime，mtime，ctime
 */
exports.uploadFile = function uploadFile (filePath, options) {
  var file = fs.open(filePath);

  var stat = file.stat();
  var fileInfo = {
    size: stat.size,
    atime: stat.atime,
    mtime: stat.mtime,
    ctime: stat.ctime
  };

  options.filename = file.stat().name;
  options.key = options.key || options.filename;
  var content = file.readAll();
  file.close();
  var back = this.upload(content, options);
  back.fileInfo = fileInfo;

  return back;
};



