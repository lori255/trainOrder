class appError extends Error{
	constructor(msg, code) {
	    super()
		this.msg = msg
		this.code = code
	}
}

module.exports = appError