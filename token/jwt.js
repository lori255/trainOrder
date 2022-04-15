const jwt = require("jsonwebtoken")
const security = require("./tokentime.js").security

//token加密生成
function generateToken(uid, scope=2){
	const secret = security.secret
	const expiresIn = security.expiresIn
	const token = jwt.sign({uid, scope}, secret, {expiresIn})
	return token
}

module.exports = {generateToken}