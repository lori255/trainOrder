//全局异常处理
const appError = require('./handler.js')
const { logger } = require('../logger/index')
const abnormal = async(ctx, next) =>{
	try{
		await next()
	}catch(e){
		logger.error(e)
		const isappError = e instanceof appError
		if(isappError){
			ctx.body = {
				msg: e.msg
			}
			ctx.status = e.code
		}else{
			ctx.body = {
				msg: '服务器错误'
			}
			ctx.status = 500
		}
	}
}

module.exports = abnormal