qn-fibjs
=======
qiniu API client for fib.js.
![fibjs](http://fibjs.org/logo.png)
#Usage
**First, u should download the [fibjs](http://fibjs.org/), then move the .modules folder**

##Upload

```
var qn = QN.create(
  {
    accessKey:"<YOUR ASSCESSKEY>",
    secretKey:"<YOUR SECRETKEY>",
    bucket:"<YOUR BUCKET NAME>",
    domain:"<YOUR DOMAIN>"
  }
);

var backInfo = qn.upload("Hello World", {key:"test.txt"});
console.log(backInfo);
//{
//  "hash": "Fhxn1T-E8B0CuSsjf2y1F-g9YVbv",
//  "key": "text.txt",
//  "status": 200
//}

var backInfo = qn.uploadFile("./test.png", {contentType:'image/png'});
console.log(backInfo);
//{
//  "hash": "Fhxn1T-E8B0CuSsjf2y1F-g9YVbv",
//  "key": "text.png",
//  "status": 200,
//  "fileInfo": {
//    "size": 115473,
//    "atime": Tue Feb 17 2015 22:28:11 GMT+0800 (CST),
//    "mtime": Tue Feb 17 2015 15:54:05 GMT+0800 (CST),
//    "ctime": Tue Feb 17 2015 21:48:10 GMT+0800 (CST)
//  }
//}

```

##Download
```
qn.download("test.png",{private:true});
//back the HttpResponse of fibjs

qn.download("test.png",{private:false});
//back the HttpResponse of fibjs

```

## TODO

* []  test
* []  CRUD Operations

## License

(The MIT License)

Copyright (c) 2014 - 2015 Rube &lt;353371737@qq.com &gt;

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.


