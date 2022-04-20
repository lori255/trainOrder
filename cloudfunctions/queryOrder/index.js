// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
const db = cloud.database()
const _ = db.command
// 云函数入口函数
// stauts: 0、1|2|3|4
exports.main = async (event, context) => {
	const wxContext = cloud.getWXContext()
	let status = event.status
	return db.collection('order-info')
		.where({
			OPENID: wxContext.OPENID,
			status: status===0?_.in([0,1]):status+1
		})
		.get()
}