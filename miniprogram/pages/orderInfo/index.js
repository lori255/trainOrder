// pages/orderInfo/index.js
import Toast from '@vant/weapp/toast/toast';
const app = getApp()
Page({
	data: {
		goods_info: [],
		train_endstation: '',
		train_startstation: '',
		train_num: '',
		date: '',
		carriage_num: '',
		seat_num: '',
		name: '',
		phone: '',
		shop_info: {},
		total_price: 0,
		note: '',
		tmplIds: '', // 微信提醒订阅模板
		isFromOrder: false,
		height: 0
	},
	bindinput(e) {
		let name = e.currentTarget.dataset.name
		let value = e.detail.value
		this.data[name] = value
		this.setData({
			[name]: this.data[name]
		})
	},
	// 弹出订阅消息弹窗
	placean_order() {
		if (this.data.total_quantity <= 0) return
		let that = this
		// 消息弹窗
		wx.requestSubscribeMessage({
			tmplIds: [that.data.tmplIds],
			fail: (err) => {
				console.log(err)
				Toast.fail('取消订阅信息，可能收不到信息')
			},
			complete: () => {
				wx.switchTab({
					url: '../../pages/orderList/index'
				})
			}
		})
	},
	onSubmit() {
		if (this.data.name == '') {
			Toast.fail('请输入姓名')
			return
		} else if (this.data.carriage_num == '') {
			Toast.fail('请输入车厢号')
			return
		} else if (this.data.seat_num == '') {
			Toast.fail('请输入座位号')
			return
		} else if (this.data.phone == '') {
			Toast.fail('请输入手机号')
			return
		}
		let order_info = {
			receiver_name: this.data.name,
			receiver_phone: this.data.phone,
			receiver_carriage_num: this.data.carriage_num,
			receiver_seat_num: this.data.seat_num,
			note: this.data.note,
			shop_id: this.data.shop_info._id,
			goods_info: this.data.goods_info
		}

		console.log(order_info)

		wx.showModal({
			title: '提示',
			content: '是否确认下单',
			success: (res) => {
				if (res.confirm) {
					console.log('用户点击确定')
					this.placean_order()
					wx.setStorageSync('name', this.data.name)
					wx.setStorageSync('carriage_num', this.data.carriage_num + '')
					wx.setStorageSync('seat_num', this.data.seat_num + '')
					wx.setStorageSync('phone', this.data.phone)
					wx.setStorageSync('note', this.data.note)
					Toast.loading({
						message: '提交中',
						forbidClick: true,
					});
					wx.cloud.callFunction({
						name: 'genOrder',
						data: order_info,
						success: res => {
							console.log(res)
							Toast.clear()
							Toast.success('支付成功');
						},
						fail: res => {
							console.error(res)
							Toast.clear()
							Toast.fail('支付失败');
						}
					})
				} else if (res.cancel) {
					Toast.fail('取消支付')
				}
			}
		})
	},
	onClickLeft() {
		wx.navigateBack()
	},
	onLoad: function (options) {
		this.setData({
			height: 0.9*app.globalData.windowInfo.windowHeight - 84
		  })
		if ('orderInfo' in options) {
			let orderInfo = JSON.parse(options.orderInfo)
			this.setData({
				isFromOrder: true,
				name: orderInfo.receiver_name,
				carriage_num: orderInfo.receiver_carriage_num,
				seat_num: orderInfo.receiver_seat_num,
				phone: orderInfo.receiver_phone,
				note: orderInfo.note,
				shop_info: orderInfo.shop_info,
				total_price: orderInfo.total_amount,
				note: orderInfo.note,
				goods_info: orderInfo.goods
			})
			console.log(orderInfo)
		} else {
			this.initFromShop(options)
		}
	},
	initFromShop(options) {
		let {
			cart,
			shop_info
		} = options
		let that = this
		wx.getStorage({
			key: 'train_num',
			success(res) {
				that.setData({
					train_num: res.data
				})
			}
		})
		wx.getStorage({
			key: 'train_endstation',
			success(res) {
				that.setData({
					train_endstation: res.data
				})
			}
		})
		wx.getStorage({
			key: 'train_startstation',
			success(res) {
				that.setData({
					train_startstation: res.data
				})
			}
		})
		wx.getStorage({
			key: 'date',
			success(res) {
				that.setData({
					date: res.data
				})
			}
		})
		wx.getStorage({
			key: 'carriage_num',
			success(res) {
				that.setData({
					carriage_num: res.data
				})
			}
		})
		wx.getStorage({
			key: 'seat_num',
			success(res) {
				that.setData({
					seat_num: res.data
				})
			}
		})
		wx.getStorage({
			key: 'train_num',
			success(res) {
				that.setData({
					train_num: res.data
				})
			}
		})
		wx.getStorage({
			key: 'train_endstation',
			success(res) {
				that.setData({
					train_endstation: res.data
				})
			}
		})
		wx.getStorage({
			key: 'name',
			success(res) {
				that.setData({
					name: res.data
				})
			}
		})
		wx.getStorage({
			key: 'phone',
			success(res) {
				that.setData({
					phone: res.data
				})
			}
		})
		cart = JSON.parse(cart)
		shop_info = JSON.parse(shop_info)
		let total_price = 0
		cart.forEach(item => {
			total_price += item.price * item.select_count
		})

		this.setData({
			shop_info: shop_info,
			total_price: total_price,
			goods_info: cart
		})
	},
	heidPayButton() {
		const query = wx.createSelectorQuery()
		query.select('.button-class')
	}

})