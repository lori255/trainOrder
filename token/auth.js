const basicAuth = require('basic-auth')
const jwt = require("jsonwebtoken")
const security = require("./tokentime.js").security
const handler = require('../config/handler.js')
const businesses_name = require('../config')["database"]["businesses"]["name"]
const {Token, databaseQueryurl} = require('../config/databaseapi.js')

class Auth{
	constructor() {}
	
	//取值函数
	get v(){
		return async(ctx, next) =>{
			const token = basicAuth(ctx.req)
			if(!token || !token.name){
				throw new handler('身份信息缺失', 401)
			}
			try{
				var authcode = jwt.verify(token.name, security.secret)
				// let res = await this.verify(authcode.uid)
				// if (!res) throw new handler('账号过期，请重新登录', 401)
			}catch(e){
				if(e.name == 'TokenExpiredError'){
					throw new handler('账号过期，请重新登录', 401)
				}
				throw new handler('身份信息验证失败', 401)
			}
			ctx.auth = {
				uid: authcode.uid,
				scope: authcode.scope
			}
			await next()
		}
	}
	
	async verify(uid){
		const query = `db.collection("${businesses_name}").where({uid:"${uid}"}).get()`
		try{
			const user = await new Token().database(databaseQueryurl, query)
			if(user.data.length == 0) return false 
			else return true
		}catch(e){
			console.log(e)
			return false
		}		
	}
}

module.exports = {Auth}