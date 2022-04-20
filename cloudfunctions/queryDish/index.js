// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
    env: cloud.DYNAMIC_CURRENT_ENV
})
const db = cloud.database()
const $ = db.command.aggregate
const _ = db.command

// 云函数入口函数
exports.main = async (event, context) => {
    let uid = String(event.uid)
    return db.collection('dish-type-info')
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
                    $.eq(['$uid', uid]),
                    $.eq(['$$type_uid', uid]),
                    $.eq(['$isOnSale', true])
                ])))
                .done(),
            as: 'dishes',
        })
        .match({
            "dishes.0": _.exists(true)
        })
        .end()
}