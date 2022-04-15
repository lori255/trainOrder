const axios = require('axios')
const qs = require('querystring')
const handler = require('./handler.js')
const fs = require('fs')
const {
	cosFunc
} = require('../cos/upload.js')
const img_folder = require('../config')["cos"]["file-folder"]["img"]["name"]
const {
	Token
} = require('./databaseapi.js')

let wxacodeunlimiturl = 'https://api.weixin.qq.com/wxa/getwxacodeunlimit?access_token='

async function getwxacodeunlimit(train_num, carriage_num, seat_num) {
	try {
		let access_token = await new Token().getToken()
		let scene = qs.stringify({
			t: train_num,
			c: carriage_num,
			s: seat_num
		})
		let page = 'pages/shopList/index'
		let res = await axios({
			method: 'post',
			url: wxacodeunlimiturl + access_token,
			data: {
				scene: scene
			},
			arraybuffer: true,
			responseType: 'arraybuffer'
		})
		if (res.status == 200) {
			try {
				let filename = `${train_num}-${carriage_num}-${seat_num}.jpeg`
				let filepath = `./upload/image/${filename}`
				fs.writeFileSync(filepath, res.data)
				let data = {
					imgUrl: 'https://' + await cosFunc(img_folder, filename, filepath)
				}
				return data
			} catch (e) {
				return {
					msg: '上传小程序码错误'
				}
			}

		} else {
			throw '生成小程序码错误 ' + res.data.errmsg + ' errcode ' + res.data.errcode
		}
	} catch (e) {
		throw new handler(e, 500)
	}
}

module.exports = {
	getwxacodeunlimit
}
