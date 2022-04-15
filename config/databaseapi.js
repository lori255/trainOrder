const axios = require('axios')
const qs = require('querystring')
const handler = require('./handler.js')

let param = qs.stringify({
	grant_type: 'client_credential',
	appid: '小程序appid',
	secret: '小程序secret'
})

// 获取token
// https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=APPID&secret=APPSECRET
let url = 'https://api.weixin.qq.com/cgi-bin/token?' + param
let env = '小程序 云环境id'	//云环境id
let databaseAddurl = 'https://api.weixin.qq.com/tcb/databaseadd?access_token='			// 数据库增加记录
let databaseQueryurl = 'https://api.weixin.qq.com/tcb/databasequery?access_token='		// 数据库查询
let databaseUpdateurl = 'https://api.weixin.qq.com/tcb/databaseupdate?access_token='	// 数据库更新记录
let databaseDelurl = 'https://api.weixin.qq.com/tcb/databasedelete?access_token='		// 数据库删除记录
let databaseAggregateurl = 'https://api.weixin.qq.com/tcb/databaseaggregate?access_token=' //数据库聚合
let subscribeMessageurl = 'https://api.weixin.qq.com/cgi-bin/message/subscribe/send?access_token='	//订阅消息发送

let template_id = '微信消息推送 template_id'	//点餐成功通知 模板

class Token{
	constructor() {}
	async getToken(){
		try{
			let token = await axios.get(url)
			if(token.status == 200){
				if("access_token" in token.data)
					return token.data.access_token
				else
					throw '获取token失败 ' + token.data.errmsg
			}else{
				throw 'token连接出错'
			}
		}catch(e){
			throw new handler(e, 500)
		}
	}
	
	//调用云开发http接口
	async database(dataurl, query){
		try{
			let access_token = await this.getToken()
			let data = await axios.post(dataurl + access_token, {env, query})
			if(data.data.errcode == 0){
				return data.data
			}else{
				throw '数据库请求出错 ' + data.data.errmsg
			}
		}catch(e){
			throw new handler(e, 500)
		}
	}
	
	//调用订阅消息发送接口
	async subscribe(touser, data) {
		try{
			let access_token = await this.getToken()
			let page ='pages/orderList/index'
			let res = await axios.post(subscribeMessageurl + access_token, {touser, template_id, page, data})
			if(res.data.errcode == 0){
				return res.data
			}else{
				throw '订阅消息发送出错 ' + res.data.errmsg
			}
		}catch(e){
			throw new handler(e, 500)
		}
	}
}

module.exports = {Token, databaseAddurl, databaseQueryurl, databaseUpdateurl, databaseDelurl, databaseAggregateurl}