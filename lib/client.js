/**
 * Created by Rube on 15/2/16.
 */

"use strict";

function QN(options) {
  if (!options || !options.accessKey || !options.secretKey || !options.bucket) {
    throw new TypeError("must have accessKey,secretKey,bucket");
  }
  this.options = options;
}

QN.create = function create(options) {
  return new QN(options);
};

['/up.js', '/dl.js'].map(function (name) {
  var proto = require('.' + name);
  for (var k in proto) {
    QN.prototype[k] = proto[k];
  }
});

module.exports = QN;



