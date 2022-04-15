const multer = require('@koa/multer')
const COS = require('cos-nodejs-sdk-v5')

// 初始化cos
var cos = new COS({
    SecretId: '腾讯云cos SecretId',
    SecretKey: '腾讯云cos SecretKey',
	Protocol: 'https:'
})

let cosFunc = function (fileFolder, filename, filePath) {
	return new Promise((resolve, reject) => {
		cos.uploadFile({
			Bucket: '腾讯云cos bucket', 			/* 必须 */
			Region: '腾讯云cos region',     		/* 存储桶所在地域，必须字段 */
			Key: fileFolder + '/' + filename,	/* 必须 */
			FilePath: filePath,             	/* 必须 */
			SliceSize: 1024 * 1024 * 20,     	/* 触发分块上传的阈值，超过5MB使用分块上传，非必须 */			
		})
		.then(res => {
			resolve(res.Location)
		})
		.catch(e =>{
			resolve(e)
		})
	})
}


// 配置上传文件所在目录和更改文件名
const storage = multer.diskStorage({ // 磁盘存储方法
	destination: (req, file, cb) => { // 存储前端传来的文件
		cb(null, './upload/image')
	},
	filename: (req, file, cb) => {
		// 修改文件名
		let fileFormat = (file.originalname).split('.')
		let name = `${Date.now()}${Math.floor(Math.random(0, 1) * 1000000)}${"."}${fileFormat[fileFormat.length - 1]}`
		cb(null, name)
	}
})

const upload = multer({
	storage
})

module.exports = {
	upload,
	cosFunc
}
