const router = require('koa-router')()
const bodymessage = require('../../config/bodymessage.js')
const {
	Token,
	databaseAddurl,
	databaseQueryurl,
	databaseUpdateurl,
	databaseDelurl,
	databaseAggregateurl
} = require('../../config/databaseapi.js')
const {
	getwxacodeunlimit
} = require('../../config/wxcodeapi.js')
const {
	checkRegister,
	checkShopInfo,
	checkDishType,
	checkDish,
	checkOrder,
	checkSales,
	checkWxcode,
	checkAd
} = require('../../config/check.js')
const {
	Auth
} = require('../../token/auth.js')
const {
	upload,
	cosFunc
} = require('../../cos/upload.js')
const config = require('../../config')
const moment = require('moment')
moment.locale('zh-cn')
const shop_info = config["database"]["shop"]["name"]
const img_folder = config["cos"]["file-folder"]["img"]["name"]
const menu_info = config["database"]["menu"]["name"]
const dish_type_info = config["database"]["dish"]["type"]["name"]
const dish_info = config["database"]["dish"]["dishes"]["name"]
const dishes_info = config["database"]["dish"]["dishes"]["name"]
const order_info = config["database"]["order"]["name"]
const wx_code_info = config["database"]["wx-code"]["name"]
const ad_info = config["database"]["ad"]["name"]
const admin_uid = '1636885361353'

// 后台menu接口
router.get('/getMenu', new Auth().v, async ctx => {
	let uid = ctx.auth.uid
	let query = ''
	let url = databaseQueryurl
	if (uid !== admin_uid) {
		query =
			`db.collection("${menu_info}").aggregate().project({children: $.filter({input: '$children',as: 'item',cond: $.eq(['$$item.level', "0"])})}).end()`
		url = databaseAggregateurl
	} else query = `db.collection("${menu_info}").get()`
	try {
		let res = await new Token().database(url, query)
		if (res.data.length > 0) {
			let data = JSON.parse(res.data[0])
			new bodymessage(ctx, 'success', 200, data).answer()
		} else return new bodymessage(ctx, '获取菜单失败', 500).answer()
	} catch (e) {
		console.log(e)
		new bodymessage(ctx, '服务器错误', 500).answer()
	}
})

// 图片上传接口
router.post('/upload', upload.single('file'), async ctx => {
	//接受前端上传的文件
	try {
		let res = await cosFunc(img_folder, ctx.file.filename, ctx.file.path)
		new bodymessage(ctx, 'success', 200, {
			imgurl: 'https://' + res
		}).answer()
	} catch (e) {
		console.log(e)
		new bodymessage(ctx, 'failed', 500, {
			errmsg: '上传失败'
		}).answer()
	}
})

// 商家信息上传接口
router.post('/uploadShopInfo', new Auth().v, async ctx => {
	let {
		id,
		shopName,
		shopAddress,
		logo,
		shop_begin_price,
		shop_post_price
	} = ctx.request.body
	let uid = ctx.auth.uid
	new checkShopInfo(ctx, shopName, shopAddress, logo).check()
	try {
		let query = `db.collection("${shop_info}").where({uid: "${uid}"}).get()`
		let res = await new Token().database(databaseQueryurl, query)
		if (res.data.length > 0) {
			new bodymessage(ctx, '商家信息已存在', 202, res.data).answer()
			return
		}
		let shopUid = ctx.auth.uid
		let data = {
			name: shopName,
			address: shopAddress,
			logo: logo,
			uid: shopUid,
			saleCount: 0,
			monthSale: 0,
			shop_begin_price: parseFloat(shop_begin_price),
			shop_post_price: parseFloat(shop_post_price)
		}

		query = `db.collection("${shop_info}").add({data:${JSON.stringify(data)}})`
		new Token().database(databaseAddurl, query)
		new bodymessage(ctx, '提交成功', 200).answer()
	} catch (e) {
		console.log(e)
		new bodymessage(ctx, '提交失败，服务器错误', 500).answer()
	}
})

// 获取商家信息接口
router.get('/queryShopInfo', new Auth().v, async ctx => {
	let uid = ctx.auth.uid
	const query = `db.collection("${shop_info}").where({uid:"${uid}"}).get()`
	try {
		let res = await new Token().database(databaseQueryurl, query)
		let data = res.data.map(item => {
			return JSON.parse(item)
		})
		new bodymessage(ctx, 'success', 200, data).answer()
	} catch (e) {
		new bodymessage(ctx, '服务器错误', 500).answer()
		console.log(e)
	}
})

// 修改商家信息
router.post('/updateShopInfo', new Auth().v, async ctx => {
	let {
		id,
		shopName,
		shopAddress,
		logo,
		shop_begin_price,
		shop_post_price
	} = ctx.request.body
	new checkShopInfo(ctx, shopName, shopAddress, logo).check()
	let data = {
		name: shopName,
		address: shopAddress,
		logo: logo,
		shop_begin_price: parseFloat(shop_begin_price),
		shop_post_price: parseFloat(shop_post_price)
	}
	const query = `db.collection("${shop_info}").doc("${id}").update({data:${JSON.stringify(data)}})`
	try {
		new Token().database(databaseUpdateurl, query)
		new bodymessage(ctx, '修改成功', 200).answer()
	} catch (e) {
		console.log(e)
		new bodymessage(ctx, '修改失败，服务器错误', 500).answer()
	}
})

// 添加菜品类目
router.post('/uploadDishType', new Auth().v, async ctx => {
	let {
		name,
		tags,
		desc
	} = ctx.request.body
	let cid = 'type' + moment().utcOffset(8).valueOf()
	let uid = ctx.auth.uid
	let data = {
		uid: uid,
		name: name,
		tags: tags,
		desc: desc,
		cid: cid,
		count: 0,
		select_count: 0
	}
	new checkDishType(ctx, name).check()
	const query = `db.collection("${dish_type_info}").where({name:"${name}", uid: "${uid}"}).get()`
	try {
		const types = await new Token().database(databaseQueryurl, query)
		if (types.data.length > 0) new bodymessage(ctx, '菜品类目重复', 202).answer()
		else {
			const query = `db.collection("${dish_type_info}").add({data:${JSON.stringify(data)}})`
			const res = await new Token().database(databaseAddurl, query)
			data['_id'] = res.id_list[0]
			new bodymessage(ctx, '添加成功', 200, data).answer()
		}
	} catch (e) {
		console.log(e)
		new bodymessage(ctx, '服务器错误', 500).answer()
	}
})

// 获取菜品类目
router.post('/queryDishType', new Auth().v, async ctx => {
	let uid = ctx.auth.uid
	let {
		page
	} = ctx.query
	let skip = (page - 1) * 10
	const query =
		`db.collection("${dish_type_info}").where({uid:"${uid}"}).orderBy('cid','desc').limit(10).skip(${skip}).get()`
	try {
		let res = await new Token().database(databaseQueryurl, query)
		const data = res.data.map(item => {
			return JSON.parse(item)
		})
		const types = {
			data: data,
			total: res.pager.Total
		}
		new bodymessage(ctx, 'success', 200, types).answer()
	} catch (e) {
		new bodymessage(ctx, '服务器错误', 500).answer()
		console.log(e)
	}
})

// 修改菜品类目
router.post('/updateDishType', new Auth().v, async ctx => {
	const {
		_id,
		name,
		tags,
		desc
	} = ctx.request.body
	const uid = ctx.auth.uid
	let data = {
		uid: uid,
		name: name,
		tags: tags,
		desc: desc
	}
	new checkDishType(ctx, name).check()
	const query = `db.collection("${dish_type_info}").where({name:"${name}", uid: "${uid}"}).get()`
	try {
		const types = await new Token().database(databaseQueryurl, query)
		if (types.data.length > 0 && JSON.parse(types.data[0])._id != _id) new bodymessage(ctx, '菜品类目重复',
			202).answer()
		else {
			const query =
				`db.collection("${dish_type_info}").doc("${_id}").update({data:${JSON.stringify(data)}})`
			new Token().database(databaseUpdateurl, query)
			new bodymessage(ctx, '修改成功', 200, data).answer()
		}
	} catch (e) {
		console.log(e)
		new bodymessage(ctx, '服务器错误', 500).answer()
	}
})

// 删除菜品类目
router.post('/delDishType', new Auth().v, async ctx => {
	const {
		_id
	} = ctx.request.body
	const query = `db.collection("${dish_type_info}").doc("${_id}").remove()`
	try {
		await new Token().database(databaseDelurl, query)
		new bodymessage(ctx, '删除成功', 200).answer()
	} catch (e) {
		new bodymessage(ctx, '服务器错误', 500).answer()
		console.log(e)
	}
})

// 添加菜品
router.post('/uploadDish', new Auth().v, async ctx => {
	let {
		name,
		tags,
		desc,
		img,
		price,
		type,
		unit,
		isOnSale
	} = ctx.request.body
	let cid = 'dish' + moment().utcOffset(8).valueOf()
	let uid = ctx.auth.uid
	let data = {
		uid: uid,
		name: name,
		tags: tags,
		desc: desc,
		img: img,
		price: parseFloat(price),
		type: type,
		unit: unit,
		cid: cid,
		monthSale: 0,
		saleCount: 0,
		isOnSale: isOnSale == 'true' ? true : false,
		upTime: moment().utcOffset(8).format('YYYY-MM-DD HH:mm:ss'),
		select_count: 0
	}
	new checkDish(ctx, name, img, price, type, unit).check()
	const query = `db.collection("${dish_info}").where({name:"${name}", uid: "${uid}"}).get()`
	try {
		const types = await new Token().database(databaseQueryurl, query)
		if (types.data.length > 0) new bodymessage(ctx, '菜品重复', 202).answer()
		else {
			let query = `db.collection("${dish_info}").add({data:${JSON.stringify(data)}})`
			const res = await new Token().database(databaseAddurl, query)
			data['_id'] = res.id_list[0]
			query =
				`db.collection("${dish_type_info}").where({uid:"${uid}",name:"${type}"}).update({data:{count: _.inc(1)}})`
			new Token().database(databaseUpdateurl, query)
			new bodymessage(ctx, '添加成功', 200, data).answer()
		}
	} catch (e) {
		console.log(e)
		new bodymessage(ctx, '服务器错误', 500).answer()
	}
})

// 获取菜品
router.post('/queryDish', new Auth().v, async ctx => {
	let uid = ctx.auth.uid
	let {
		page
	} = ctx.query
	let skip = (page - 1) * 10
	const query =
		`db.collection("${dish_info}").where({uid:"${uid}"}).orderBy('cid','desc').limit(10).skip(${skip}).get()`
	try {
		let res = await new Token().database(databaseQueryurl, query)
		const data = res.data.map(item => {
			return JSON.parse(item)
		})
		const types = {
			data: data,
			total: res.pager.Total
		}
		new bodymessage(ctx, 'success', 200, types).answer()
	} catch (e) {
		new bodymessage(ctx, '服务器错误', 500).answer()
		console.log(e)
	}
})

// 修改菜品
router.post('/updateDish', new Auth().v, async ctx => {
	const {
		_id,
		name,
		tags,
		desc,
		img,
		price,
		type,
		unit,
		isOnSale
	} = ctx.request.body
	const uid = ctx.auth.uid
	let data = {
		uid: uid,
		name: name,
		tags: tags,
		desc: desc,
		img: img,
		price: parseFloat(price),
		type: type,
		unit: unit,
		isOnSale: isOnSale == 'true' ? true : false
	}
	new checkDish(ctx, name, img, price, type, unit).check()
	const query = `db.collection("${dish_info}").where({name:"${name}", uid: "${uid}"}).get()`
	try {
		const types = await new Token().database(databaseQueryurl, query)
		if (types.data.length > 0 && JSON.parse(types.data[0])._id != _id) new bodymessage(ctx, '菜品重复', 202)
			.answer()
		else {
			const query =
				`db.collection("${dish_info}").doc("${_id}").update({data:${JSON.stringify(data)}})`
			new Token().database(databaseUpdateurl, query)
			new bodymessage(ctx, '修改成功', 200, data).answer()
		}
	} catch (e) {
		console.log(e)
		new bodymessage(ctx, '服务器错误', 500).answer()
	}
})

// 删除菜品
router.post('/delDish', new Auth().v, async ctx => {
	const {
		_id
	} = ctx.request.body
	const query = `db.collection("${dish_info}").doc("${_id}").remove()`
	try {
		new Token().database(databaseDelurl, query)
		new bodymessage(ctx, '删除成功', 200).answer()
	} catch (e) {
		new bodymessage(ctx, '服务器错误', 500).answer()
		console.log(e)
	}
})

// 获取菜品类目包含菜品
router.get('/queryDishInfo', new Auth().v, async ctx => {
	let uid = ctx.auth.uid
	let query =
		`db.collection('dish-type-info')
        .aggregate()
        .lookup({
            from: 'dish-info',
            let: {
                type_name: '$name',
                type_uid: '$uid'
            },
            pipeline: $.pipeline()
                .match(_.expr($.and([
                    $.eq(['$type', '$$type_name']),
                    $.eq(['${uid}', '$uid']),
                    $.eq(['${uid}', '$$type_uid'])
                ])))
                .done(),
            as: 'dishes',
        })
        .match({
            "dishes.0": _.exists(true)
        })
        .end()`
	console.log(query)
	try {
		let res = await new Token().database(databaseAggregateurl, query)
		if (res.data.length > 0) {
			const data = res.data.map(item => {
				return JSON.parse(item)
			})
			new bodymessage(ctx, 'success', 200, data).answer()
		} else return new bodymessage(ctx, '获取菜品类目和菜品失败', 500).answer()
	} catch (e) {
		console.log(e)
		new bodymessage(ctx, '服务器错误', 500).answer()
	}
})

// 生成订单
// router.post('/genOrder', new Auth().v, async ctx => {
// 	let {
// 		// uid      			string '用户帐号',
// 		// _id		            string '订单编号',
// 		// create_time          datetime '提交时间',
// 		// total_amount         number '订单总金额',
// 		// pay_type             int '支付方式：0->未支付；1->支付宝；2->微信',
// 		// status               int '订单状态：0->待发货；1->已发货；2->已完成；3->已关闭；4->无效订单',
// 		// receiver_name        string '收货人姓名',
// 		// receiver_phone       string '收货人电话',
// 		// receiver_carriage_num string '收货人车厢号',
// 		// receiver_seat_num    string '收货人座位号',
// 		// note                 string '订单备注',
// 		// confirm_status       int '确认收货状态：0->未确认；1->已确认',
// 		// delete_status        int '删除状态：0->未删除；1->已删除',
// 		// payment_time         datetime '支付时间',
// 		// delivery_time        datetime '发货时间',
// 		// receive_time         datetime '确认收货时间',
// 		// comment_time         datetime '评价时间',
// 		// close_time			datetime '订单关闭时间'
// 		// goods_info			array '商品信息' [{_id, count}]
// 		goods_info,
// 		receiver_name,
// 		receiver_phone,
// 		receiver_carriage_num,
// 		receiver_seat_num,
// 		note
// 	} = ctx.request.body
// 	new checkOrder(ctx, goods_info, receiver_name, receiver_phone, receiver_carriage_num,
// 		receiver_seat_num).check()
// 	let data = {
// 		uid: ctx.auth.uid,
// 		cid: 'order' + moment().utcOffset(8).valueOf(),
// 		create_time: moment().utcOffset(8).valueOf(),
// 		status: 0,
// 		receiver_name: receiver_name,
// 		receiver_phone: receiver_phone,
// 		receiver_carriage_num: receiver_carriage_num,
// 		receiver_seat_num: receiver_seat_num,
// 		note: note,
// 		confirm_status: 0,
// 		delete_status: 0
// 	}
// 	try {
// 		const id_arr = goods_info.map(obj => {
// 			return obj._id;
// 		})
// 		const query = `db.collection("${dish_info}").where({_id: _.or(${JSON.stringify(id_arr)})}).get()`
// 		const goods = await new Token().database(databaseQueryurl, query)
// 		let goods_json = []
// 		if (goods.data.length <= 0) new bodymessage(ctx, '订单商品不能为空', 202).answer()
// 		else {
// 			let total_amount = 0
// 			for (var index in goods.data) {
// 				var good = JSON.parse(goods.data[index])
// 				var count = parseInt(goods_info[index]['select_count'])
// 				total_amount += parseInt(good.price) * count
// 				good['count'] = count
// 				goods_json.push(good)
// 				let query =
// 					`db.collection("${dish_info}").doc("${good._id}").update({data:{saleCount: _.inc(${count}), monthSale: _.inc(${count})}})`
// 				new Token().database(databaseUpdateurl, query)

// 				query =
// 					`db.collection("${shop_info}").update({data:{saleCount: _.inc(${count}), monthSale: _.inc(${count})}})`
// 				new Token().database(databaseUpdateurl, query)
// 			}
// 			data['goods'] = goods_json
// 			data['total_amount'] = total_amount
// 			const query = `db.collection("${order_info}").add({data:${JSON.stringify(data)}})`
// 			const res = await new Token().database(databaseAddurl, query)
// 			data['_id'] = res.id_list[0]
// 			new bodymessage(ctx, '订单生成成功', 200, data).answer()
// 		}
// 	} catch (e) {
// 		console.log(e)
// 		new bodymessage(ctx, '服务器错误', 500).answer()
// 	}
// })

// 获取订单（商家）
router.post('/queryOrderByUid', new Auth().v, async ctx => {
	let uid = ctx.auth.uid
	let {
		page
	} = ctx.query
	let skip = (page - 1) * 10

	try {
		let query = `db.collection("${shop_info}").where({uid:"${uid}"}).get()`
		let shop = await new Token().database(databaseQueryurl, query)
		let shop_id = JSON.parse(shop.data[0])._id
		query =
			`db.collection("${order_info}").where({shop_info:{_id:"${shop_id}"}}).orderBy('cid','desc').limit(10).skip(${skip}).get()`
		let res = await new Token().database(databaseQueryurl, query)
		const data = res.data.map(item => {
			return JSON.parse(item)
		})
		const orders = {
			data: data,
			total: res.pager.Total
		}
		new bodymessage(ctx, 'success', 200, orders).answer()
	} catch (e) {
		new bodymessage(ctx, '服务器错误', 500).answer()
		console.log(e)
	}
})

// 修改订单
router.post('/updateOrder', new Auth().v, async ctx => {
	const {
		_id,
		status,
		touser,
		message
	} = ctx.request.body
	const uid = ctx.auth.uid
	let data = {
		status: parseInt(status)
	}
	new checkDishType(ctx, status).check()

	try {
		let text = ''
		if (status == 1) {
			text = '确认发货成功'
			data['delivery_time'] = moment().utcOffset(8).valueOf()
			let messageData =  { 
				"thing6": { "value": message.shop_name }, 
				"character_string1": { "value": message.order_id },
				"thing2": { "value": message.goods },
				"phrase5": { "value": message.status },
				"amount10": { "value": message.amount }
				}
			console.log(messageData)
			let res = await new Token().subscribe(touser, messageData)
			console.log(res)
		} else {
			return new bodymessage(ctx, '状态错误', 500).answer()
		}
		
		const query =
			`db.collection("${order_info}").doc("${_id}").update({data:${JSON.stringify(data)}})`
		new Token().database(databaseUpdateurl, query)
		data['_id'] = _id
		new bodymessage(ctx, text, 200, data).answer()
	} catch (e) {
		console.log(e)
		new bodymessage(ctx, '服务器错误', 500).answer()
	}
})

// 删除订单
router.post('/delOrder', new Auth().v, async ctx => {
	let uid = ctx.auth.uid
	if (uid !== admin_uid) return new bodymessage(ctx, '无权限', 202).answer()
})

// 生成微信小程序码
router.post('/genWxcode', new Auth().v, async ctx => {
	const {
		train_num,
		carriage_num,
		seat_num
	} = ctx.request.body
	const uid = ctx.auth.uid
	if (uid !== admin_uid) return new bodymessage(ctx, '无权限', 202).answer()
	new checkWxcode(train_num, carriage_num, seat_num).check()
	let data = {
		train_num: train_num,
		carriage_num: carriage_num,
		seat_num: seat_num,
		uid: uid,
		cid: 'wxcode' + moment().utcOffset(8).valueOf()
	}
	try {
		let res = await getwxacodeunlimit(train_num, carriage_num, seat_num)
		if (!res['imgUrl'])
			return new bodymessage(ctx, res['msg'], 500).answer()
		data['imgUrl'] = res['imgUrl']
		const query = `db.collection("${wx_code_info}").add({data:${JSON.stringify(data)}})`
		const wx_res = await new Token().database(databaseAddurl, query)
		data['_id'] = wx_res.id_list[0]
		new bodymessage(ctx, '生成小程序码成功', 200, data).answer()

	} catch (e) {
		console.log(e)
		new bodymessage(ctx, '服务器错误', 500).answer()
	}
})

// 获取微信小程序码
router.post('/queryWxcode', new Auth().v, async ctx => {
	let uid = ctx.auth.uid
	if (uid !== admin_uid) return new bodymessage(ctx, '无权限', 202).answer()
	let {
		page
	} = ctx.query
	let skip = (page - 1) * 10
	const query =
		`db.collection("${wx_code_info}").where({uid:"${uid}"}).orderBy('cid','desc').limit(10).skip(${skip}).get()`
	try {
		let res = await new Token().database(databaseQueryurl, query)
		const data = res.data.map(item => {
			return JSON.parse(item)
		})
		const wxcode_res = {
			data: data,
			total: res.pager.Total
		}
		new bodymessage(ctx, 'success', 200, wxcode_res).answer()
	} catch (e) {
		new bodymessage(ctx, '服务器错误', 500).answer()
		console.log(e)
	}
})

// 删除微信小程序码
router.post('/delWxcode', new Auth().v, async ctx => {
	let uid = ctx.auth.uid
	if (uid !== admin_uid) return new bodymessage(ctx, '无权限', 202).answer()

	const {
		_id
	} = ctx.request.body
	const query = `db.collection("${wx_code_info}").doc("${_id}").remove()`
	try {
		new Token().database(databaseDelurl, query)
		new bodymessage(ctx, '删除小程序码成功', 200).answer()
	} catch (e) {
		new bodymessage(ctx, '服务器错误', 500).answer()
		console.log(e)
	}
})

// 小程序广告图片生成
router.post('/genAd', new Auth().v, async ctx => {
	const {
		img,
		title,
		desc,
		url,
		isPlay
	} = ctx.request.body
	const uid = ctx.auth.uid
	if (uid !== admin_uid) return new bodymessage(ctx, '无权限', 202).answer()
	new checkAd(title, desc, url, img, isPlay).check()
	let data = {
		img: img,
		title: title,
		desc: desc,
		url: url,
		isPlay: isPlay == 'true' ? true : false,
		uid: uid,
		cid: 'ad' + moment().utcOffset(8).valueOf()
	}
	try {
		let query = `db.collection("${ad_info}").add({data:${JSON.stringify(data)}})`
		let res = await new Token().database(databaseAddurl, query)
		data['_id'] = res.id_list[0]
		new bodymessage(ctx, '广告提交成功', 200, data).answer()
	} catch (e) {
		console.log(e)
		new bodymessage(ctx, '服务器错误', 500).answer()
	}
})

// 获取广告信息接口
router.post('/queryAdInfo', new Auth().v, async ctx => {
	let uid = ctx.auth.uid
	let {
		page
	} = ctx.query
	let skip = (page - 1) * 10
	const query =
		`db.collection("${ad_info}").where({uid:"${uid}"}).orderBy('cid','desc').limit(10).skip(${skip}).get()`
	try {
		let res = await new Token().database(databaseQueryurl, query)
		let data = res.data.map(item => {
			return JSON.parse(item)
		})
		const ads = {
			data: data,
			total: res.pager.Total
		}
		new bodymessage(ctx, 'success', 200, ads).answer()
	} catch (e) {
		new bodymessage(ctx, '服务器错误', 500).answer()
		console.log(e)
	}
})

// 修改广告信息
router.post('/updateAdInfo', new Auth().v, async ctx => {
	let {
		_id,
		img,
		title,
		desc,
		url,
		isPlay
	} = ctx.request.body
	new checkAd(title, desc, url, img, isPlay).check()
	let data = {
		img: img,
		title: title,
		desc: desc,
		url: url,
		isPlay: isPlay == 'true' ? true : false,
	}
	const query = `db.collection("${ad_info}").doc("${_id}").update({data:${JSON.stringify(data)}})`
	try {
		let a = await new Token().database(databaseUpdateurl, query)
		new bodymessage(ctx, '修改成功', 200, data).answer()
	} catch (e) {
		console.log(e)
		new bodymessage(ctx, '修改失败，服务器错误', 500).answer()
	}
})

// 删除微广告信息
router.post('/delAd', new Auth().v, async ctx => {
	let uid = ctx.auth.uid
	if (uid !== admin_uid) return new bodymessage(ctx, '无权限', 202).answer()

	const {
		_id
	} = ctx.request.body
	const query = `db.collection("${ad_info}").doc("${_id}").remove()`
	try {
		new Token().database(databaseDelurl, query)
		new bodymessage(ctx, '删除广告成功', 200).answer()
	} catch (e) {
		new bodymessage(ctx, '服务器错误', 500).answer()
		console.log(e)
	}
})

// 获取分析数据
router.get('/queryMonthSale', new Auth().v, async ctx => {
	let uid = ctx.auth.uid
	try {
		let resData = {
			monthData: [],
			dayData: []
		}
		let query = `db.collection("${dish_info}")
		.where({uid: "${uid}", monthSale: _.gt(0)})
		.orderBy('monthSale', 'desc')
		.limit(5)
		.field({ 
			_id: true,
			img: true,
			isOnSale: true,
			name: true,
			price: true,
			monthSale: true,
			saleCount: true,
			type: true,
			unit: true
			}).get()`

		let res = await new Token().database(databaseQueryurl, query)
		if (res.data.length > 0) {
			let dayData = {
				data: res.data.map(item => {
					return JSON.parse(item)
				}),
				'total': res.pager.Total
			}
			resData['dayData'] = dayData
		}

		query = `db.collection("${order_info}")
				.where({shop_info: {uid: "${uid}"}})
				.orderBy('delivery_time','desc')
				.get()
				`
		res = await new Token().database(databaseQueryurl, query)
		var monthData = []
		let deliveryData = []
		let todayDelveryCount = 0
		let todayCount = 0
		let totalCount = 0
		res.data.map(item => {
			let itemJson = JSON.parse(item)
			let isToday = moment().format('L') === moment(itemJson.delivery_time).format('L')
			if(isToday)
				todayCount += 1
			if(itemJson.status > 0 && itemJson.status < 4){
				deliveryData.push(itemJson)
				totalCount += 1
				if(isToday)
					todayDelveryCount += 1
			}		
		})
		deliveryData.forEach(function(item, i) {
			var tmpDate = moment(item.delivery_time).format('L')
			if (i === 0) {
				var tmpObj = {}
				tmpObj.date = tmpDate
				tmpObj.count = 1
				monthData.push(tmpObj)
			} else {
				if (monthData[monthData.length - 1]['date'] === tmpDate) {
					monthData[monthData.length - 1]['count'] += 1
				} else {
					var tmpObj = {}
					tmpObj.date = tmpDate
					tmpObj.count = 1
					monthData.push(tmpObj)
				}
			}

		})
		resData['monthData'] = monthData
		resData['totalCount'] = totalCount
		resData['todayDelveryCount'] = todayDelveryCount
		resData['todayCount'] = todayCount
		new bodymessage(ctx, '获取数据成功', 200, resData).answer()
	} catch (e) {
		console.log(e)
		new bodymessage(ctx, '服务器错误', 500).answer()
	}
})


module.exports = router.routes()
