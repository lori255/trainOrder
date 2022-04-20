// 云函数入口文件
const axios = require('axios')


// 云函数入口函数
exports.main = async (event, context) => {
	let c = await axios.get('https://binstd.apistd.com/train/line?key=5AQHi5oYCuR2JVJKTmuxsriSG&trainno='+event.train_num)
	return c.data
}