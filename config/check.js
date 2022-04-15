const appError = require('./handler.js')

class Check {
	constructor(ctx, ...obj) {
		this.ctx = ctx
		this.obj = obj
	}

	// 校验参数是否完整
	checkUndefined() {
		let bvc = this.obj.indexOf(undefined)
		if (bvc != -1) {
			console.log(bvc)
			throw new appError('参数不完整', 400)
		}
	}

	// 校验手机号码
	checkPhone(msg, phoneIndex) {
		let phonePattern =
			/(13[\d]|14[0|5|6|7|9]|15[0|1|2|3|5|6|7|8|9]|16[2|5|6|7]|17[0|1|2|3|5|6|7|8]|18[\d]|19[1|3|5|6|7|8|9])\d{8}$/
		if (!phonePattern.test(this.obj[phoneIndex])) {
			throw new appError(msg, 202)
		}
	}

	// 校验密码
	checkPassword(msg, passwordIndex) {
		let passwordPattern = /^(?![\d]+$)(?![a-zA-Z]+$)[\dA-Za-z]{6,20}$/
		if (!passwordPattern.test(this.obj[passwordIndex])) {
			throw new appError(msg, 202)
		}
	}

	// 校验空数组
	checkArray(msg, arrIndex) {
		if (JSON.parse(this.obj[arrIndex]).length === 0) {
			throw new appError(msg, 202)
		}
	}

	// 校验为空值
	checkNull(msgArr) {
		let nullIndex = this.obj.indexOf('')
		if (nullIndex != -1) {
			throw new appError(msgArr[nullIndex], 202)
		}
	}
	//  校验空格符
	checkBlock(msgArr) {
		let block = this.obj.filter(item => {
			if (typeof item == 'string')
				return item.split(' ').join('').length === 0
		})
		let blockIndex = this.obj.indexOf(block[0])
		if (blockIndex != -1) {
			throw new appError(msgArr[blockIndex], 202)
		}
	}

	// 校验数字
	checkNum(index, start, end, cs) {
		for (var i in this.obj[index]) {
			if (start === null && end === null)
				return
			if (!(cs in this.obj[index][i]))
				throw new appError('缺少商品销售量', 202)
			else if (start === null && parseInt(this.obj[index][i][cs]) > end)
				throw new appError('销售量必须小于' + end, 202)
			else if (end === null && parseInt(this.obj[index][i][cs]) <= start)
				throw new appError('销售量必须大于' + start, 202)
		}
	}
}

// 校验注册
class checkRegister extends Check {
	check() {
		super.checkUndefined()
		super.checkPhone('请填写正确的手机号码', 0)
		super.checkPassword('密码必须是包含6-20位的字母和数字组合', 1)
	}
}


// 校验商家信息
class checkShopInfo extends Check {
	check() {
		let msgArr = ['请输入店铺名称', '请输入店铺地址', '请上传店铺图片']
		super.checkUndefined()
		super.checkNull(msgArr)
		super.checkBlock(msgArr)
	}
}


// 校验菜品类目
class checkDishType extends Check {
	check() {
		let msgArr = ['请输入类目名称']
		super.checkUndefined()
		super.checkNull(msgArr)
		super.checkBlock(msgArr)
	}
}

// 校验菜品
class checkDish extends Check {
	check() {
		let msgArr = ['请输入菜品名称', '请上传菜品图片', '请输入菜品价格', '请选择菜品类目', '请输入菜品单位']
		super.checkUndefined()
		super.checkNull(msgArr)
		super.checkBlock(msgArr)
	}
}

// 校验订单
class checkOrder extends Check {
	check() {
		let msgArr = ['缺少商品信息', '缺少收货人', '缺少取件号码', '缺少收货车厢号', '缺少收货座位号']
		super.checkUndefined()
		super.checkNull(msgArr)
		super.checkBlock(msgArr)
		super.checkPhone('请填写正确的手机号码', 2)
		super.checkNum(0, 0, null, 'count')
	}
}

// 校验数量
class checkSales extends Check {
	check() {
		let msgArr = ['缺少商品销售信息']
		super.checkUndefined()
		super.checkNull(msgArr)
		super.checkBlock(msgArr)
		super.checkNum(0, 0, null, 'count')
	}
}

// 校验微信小程序码参数
class checkWxcode extends Check {
	check() {
		let msgArr = ['请输入车次号', '请输入车厢号', '请输入座位号']
		super.checkUndefined()
		super.checkNull(msgArr)
		super.checkBlock(msgArr)
	}
}

// 校验广告参数
class checkAd extends Check {
	check() {
		let msgArr = ['请输入标题', '请输入描述', '请输入广告链接', '请上传广告图片', '请确认是否播放']
		super.checkUndefined()
		super.checkNull(msgArr)
		super.checkBlock(msgArr)
	}
}

module.exports = {
	checkRegister,
	checkShopInfo,
	checkDishType,
	checkDish,
	checkOrder,
	checkSales,
	checkWxcode,
	checkAd
}
