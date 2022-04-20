// 云函数入口文件
const cloud = require('wx-server-sdk')
const moment = require('moment')
moment.locale('zh-cn')
cloud.init()

const db = cloud.database()
const _ = db.command

// 云函数入口函数
exports.main = async (event, context) => {
	let {
		goods_info,
		receiver_name,
		receiver_phone,
		receiver_carriage_num,
		receiver_seat_num,
		note,
		shop_id
	} = event
	const {
		OPENID,
		APPID,
		UNIONID,
		ENV
	  } = cloud.getWXContext()
	let data = {
		OPENID: OPENID,
		APPID: APPID,
		UNIONID: UNIONID+'',
		cid: 'order' + moment().utcOffset(8).valueOf(),
		create_time: moment().utcOffset(8).valueOf(),
		payment_time: moment().utcOffset(8).valueOf(),
		status: 0,
		receiver_name: receiver_name,
		receiver_phone: receiver_phone,
		receiver_carriage_num: receiver_carriage_num,
		receiver_seat_num: receiver_seat_num,
		note: note,
		confirm_status: 0,
		delete_status: 0
	}

	const id_arr = goods_info.map(obj => {
		return obj._id;
	})
	const goods = await db.collection('dish-info')
		.where({
			_id: _.in(id_arr)
		})
		.get()
	let goods_json = []
	if (goods.data.length <= 0) return '订单商品不能为空'
	else {
		let total_amount = 0
		let total_count = 0
		for (var index in goods.data) {
			var good = goods.data[index]
			var count = parseInt(goods_info[index]['select_count'])
			total_amount += parseInt(good.price) * count
			total_count += count
			good['select_count'] = count
			goods_json.push(good)
			db.collection('dish-info').doc(good._id).update({data:{saleCount: _.inc(count), monthSale: _.inc(count)}})
		}
		db.collection('shop-info').doc(shop_id).update({data:{saleCount: _.inc(total_count), monthSale: _.inc(total_count)}})
		const shop_info = await db.collection('shop-info').doc(shop_id).field({
			_id: true,
			name: true,
			logo: true,
			uid: true
		  }).get()
		data['shop_info'] = shop_info.data
		data['goods'] = goods_json
		data['total_amount'] = total_amount
		data['total_count'] = total_count
		const res = await db.collection('order-info').add({data:data})
		data['_id'] = res._id
		return data
	}
}