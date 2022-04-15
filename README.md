train-order-node
# 启用HTTPS
## 1.添加网站key和pem到cert目录中
## 2.app.js中将如下内容取消注释(可以自行更改端口号，前端也需要更改）
```JavaScript
const fs = require('fs');
const sslify = require('koa-sslify').default;//http强制HTTPS
const https = require('https');//node内置https server

var options = {
    key: fs.readFileSync('./cert/example.com.key'),  //私钥文件路径
    cert: fs.readFileSync('./cert/example.com.pem')  //证书文件路径
};
https.createServer(options, app.callback()).listen(3001, (err) => {
	if (err) {
	    console.log('服务启动失败: ', err);
	  } else {
		console.log('https 服务启动成功，端口为3001')
	  } 
});
app.use(sslify())
```JavaScript
## 3.app.js中将如下内容注释
```JavaScript
// app.listen(3001);
// console.log('http 服务启动成功，端口为3001')
```
# 设置腾讯云开发数据库和微信消息推送id
## 在config目录下的databaseapi.js中填写如下内容
```JavaScript
let param = qs.stringify({
	grant_type: 'client_credential',
	appid: '小程序appid',
	secret: '小程序secret'
})

let template_id = '微信消息推送 template_id'	//点餐成功通知 模板
```
## 在cos目录下的upload.js中填写如下内容
```JavaScript
// 初始化cos
var cos = new COS({
    SecretId: '腾讯云cos SecretId',
    SecretKey: '腾讯云cos SecretKey',
	Protocol: 'https:'
})
```
## 在token目录下的tokentime.js中填写如下内容
```JavaScript
// 初始化cos
module.exports = {
	security:{
		secret: "your secret",
		expiresIn: 60*60*24*7
	}
}
```
# 配置config.json中的集合名称
# 集合名称在集合.md中
