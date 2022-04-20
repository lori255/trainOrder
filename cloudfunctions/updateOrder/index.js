// 云函数入口文件
const cloud = require('wx-server-sdk')
const moment = require('moment')
moment.locale('zh-cn')
cloud.init()

const db = cloud.database()
// uid      			string '用户帐号',
// _id		            string '订单编号',
// create_time          datetime '提交时间',
// total_amount         number '订单总金额',
// pay_type             int '支付方式：0->未支付；1->支付宝；2->微信',
// status               int '订单状态：0->待发货；1->已发货；2->已完成；3->已关闭；4->无效订单',
// receiver_name        string '收货人姓名',
// receiver_phone       string '收货人电话',
// receiver_carriage_num string '收货人车厢号',
// receiver_seat_num    string '收货人座位号',
// note                 string '订单备注',
// confirm_status       int '确认收货状态：0->未确认；1->已确认',
// delete_status        int '删除状态：0->未删除；1->已删除',
// payment_time         datetime '支付时间',
// delivery_time        datetime '发货时间',
// receive_time         datetime '确认收货时间',
// comment_time         datetime '评价时间',
// close_time			datetime '订单关闭时间'
// goods_info			array '商品信息' [{_id, count}]
// cancel_time			datetime '取消订单时间'
// remark_time			datetime '评论时间'
// comment				string	 '评论'
exports.main = async (event, context) => {
	let {
		func,
		_id,
		comment
	} = event
	let data = {}
	if (func == "confirm") {
		data = {
			pay_type: 2,
			status: 2,
			confirm_status: 1,
			receive_time: moment().utcOffset(8).valueOf()
		}
	} else if (func == "cancel") {
		data = {
			status: 4,
			cancel_time: moment().utcOffset(8).valueOf()
		}
	} else if (func == "remark") {
		data = {
			status: 3,
			remark_time: moment().utcOffset(8).valueOf(),
			comment: comment + ''
		}
	}
	return db.collection('order-info')
		.doc(_id)
		.update({
			data: data
		})

}