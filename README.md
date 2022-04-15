train-order-node
# 启用HTTPS
## 1.添加网站key和pem到cert目录中
## 2.app.js中将如下内容取消注释
```JavaScript
// const fs = require('fs');
// const sslify = require('koa-sslify').default;//http强制HTTPS
// const https = require('https');//node内置https server
```
