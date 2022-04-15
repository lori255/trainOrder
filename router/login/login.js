const router = require('koa-router')()
const bodymessage = require('../../config/bodymessage.js')
const {Token, databaseAddurl, databaseQueryurl} = require('../../config/databaseapi.js')
const {checkRegister} = require('../../config/check.js')
const config = require('../../config')
const {generateToken} = require("../../token/jwt.js")
const businesses_name = config["database"]["businesses"]["name"]
const {Auth} = require('../../token/auth.js')

// 注册
router.post('/register', async ctx =>{
	let {username, password} = ctx.request.body
	// 手机、密码校验
	new checkRegister(ctx, username, password).check()
	//检测手机号是否已被注册
	const query = `db.collection("${businesses_name}").where({username:"${username}"}).get()`
	try{
		const user = await new Token().database(databaseQueryurl, query)
		if(user.data.length > 0){
			//手机号已被注册
			new bodymessage(ctx, '手机号已被注册', 202).answer()
		}else{
			const uid = JSON.stringify(new Date().getTime())
			const obj = JSON.stringify({uid, username, password})
			const addquery = `db.collection("${businesses_name}").add({data:${obj}})`
			await new Token().database(databaseAddurl, addquery)
			new bodymessage(ctx, '注册成功').answer()
		}
	}catch(e){
		new bodymessage(ctx, '注册失败', 500).answer()
	}
})

// 登录
router.post('/login', async ctx =>{
	//console.log(ctx.auth.uid)
	let {username, password} = ctx.request.body
	const query = `db.collection("${businesses_name}").where({username:"${username}", password:"${password}"}).get()`
	try{
		const user = await new Token().database(databaseQueryurl, query)
		if(user.data.length == 0){
			new bodymessage(ctx, '账号或密码错误', 202).answer()
		}else{
			const obj = JSON.parse(user.data[0])
			new bodymessage(ctx, '登录成功', 200, {token: generateToken(obj.uid)}).answer()			
		}
	}catch(e){
			new bodymessage(ctx, '登录失败', 500).answer()
	}

})

module.exports = router.routes()