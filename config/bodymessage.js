// 处理返回客户端的body
class bodymessage{
	constructor(ctx, msg='', code=200, data=null) {
	    this.ctx = ctx
	    this.msg = msg
	    this.code = code
	    this.data = data
	}
	
	//统一返回格式
	answer(){
		this.ctx.body = {
			msg: this.msg,
			data: this.data
		}
		this.ctx.status = this.code
	}
}

module.exports = bodymessage