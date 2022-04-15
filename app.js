const Koa = require('koa')
const json = require('koa-json')
// const fs = require('fs');
// const sslify = require('koa-sslify').default;//http强制HTTPS
// const https = require('https');//node内置https server
const app = new Koa();
const router = require('koa-router')()
const bodyParser = require('koa-bodyparser')
const cors = require('koa2-cors')
const abnormal = require('./config/abnormal.js')
const { accessLogger } = require('./logger/index')


// 中间件
app.use(cors())
app.use(json())
// app.use(sslify())
app.use(bodyParser())
app.use(abnormal)
app.use(accessLogger())

// 登录、注册
const login = require('./router/login/login.js')
//商家设置
const upload  = require('./router/upload/info.js')

//配置路由接口
router.use('/api', login)
router.use('/api', upload)

// 启动路由
app.use(router.routes()).use(router.allowedMethods())

// var options = {
//     key: fs.readFileSync('./cert/example.com.key'),  //私钥文件路径
//     cert: fs.readFileSync('./cert/example.com.pem')  //证书文件路径
// };
// https.createServer(options, app.callback()).listen(3001, (err) => {
// 	if (err) {
// 	    console.log('服务启动失败: ', err);
// 	  } else {
// 		console.log('https 服务启动成功，端口为3001')
// 	  } 
// });

app.listen(3001);
console.log('http 服务启动成功，端口为3001')