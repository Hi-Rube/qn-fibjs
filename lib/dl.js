/**
 * Created by Rube on 15/2/17.
 */

"use strict";

var http = require('http');
var hash = require('hash');

/**
 * Create downloadToken
 * @param {String} url 加了e(过期时间)之后的地址
 * @returns {String} the download token
 */
exports.downloadToken = function (url) {
  var digest = hash.hmac_sha1(new Buffer(this.options.secretKey));
  digest.update(new Buffer(url));
  var encodedSign = digest.digest().base64().toString().replace(/\+/g, '-').replace(/\//g, '_');
  return this.options.accessKey + ':' + encodedSign;
};

/**
 * Download File
 * @param {String} key   要下载的文件名
 * @param {Object} options
 * - {Boolean} private 是否是私有空间
 * - {Number} [e] token过期时间，单位秒，默认3600秒
 * @returns {HttpResponse} HttpResponse对象
 */

exports.download = function (key, options) {
  if (options && !options.private){
    throw TypeError('must know whether private');
  }
  if (!this.options.domain) {
    throw TypeError('must have domain');
  }
  var url = this.options.domain + "/" + key;

  if (!options) {
    return http.get(url);
  }

  options.e = options.e || (Math.round(Date.now() / 1000) + 3600);
  url += '?e=' + options.e;
  var token = this.downloadToken(url);
  url += '&token=' + token;
  return http.get(url);
};