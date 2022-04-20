// pages/orderList/index.js
import Toast from '@vant/weapp/toast/toast'
const moment = require('../../utils/moment')
moment.locale('zh-cn')

Page({

    data: {
        active: 0,
        statusStr: ['待发货', '待收货', '待评价', '已完成', '已取消'],
        tabList: [{
            name: '待收货',
            orderList: []
        }, {
            name: '待评价',
            orderList: []
        }, {
            name: '已完成',
            orderList: []
        }, {
            name: '已取消',
            orderList: []
        }, ],
        dialogShow: false,
        _id: '',
        comment: '',
        func: ''
    },
    onChange(e) {
        this.setData({
            active: e.detail.name
        })
        this.getOrderList()
    },
    onBtnTap(e) {
        let {
            _id,
            func
        } = e.currentTarget.dataset
        this.setData({
            _id: _id,
            func: func,
        })
        if(func == 'remark') {
            this.setData({
                dialogShow: true
            })
        } else {
            this.updateInfo()
        }
        this.getOrderList()
     },
     remark() {
        this.updateInfo()
        this.onClose()
     },
     bindComment(e){
         this.setData({
             comment: e.detail.value
         })
     },
     onClose() {
       this.setData({ dialogShow: false });
     },
     updateInfo() {
        Toast.loading({
            message: '加载中...',
            forbidClick: true,
        })
        let that = this
        wx.cloud.callFunction({
            name: 'updateOrder',
            data: {
                _id: that.data._id,
                func: that.data.func,
                comment: that.data.comment
            },
            success: res => {
                Toast.success('成功')
                that.getOrderList()
            },
            fail: e => {
                console.log(e)
                Toast.fail('失败')
            }
        })
     },
    getOrderList() {
        let key = this.data.active
        let that = this
        // 根据status调用云函数获取订单
        Toast.loading({
            message: '加载中...',
            forbidClick: true,
        });
        wx.cloud.callFunction({
            name: 'queryOrder',
            data: {
                status: key
            },
            success: res => {
                console.log(res)
                Toast.clear()
                let tabList = that.data.tabList
                tabList[key].orderList = res.result.data 
                that.setData({
                    tabList: tabList
                })             
            },
            fail: e => {
                Toast.fail('订单获取失败')
            }
        })

    },
    onShow: function (options) {
        this.getOrderList()
    },
    jump(res) {
        let order = res.currentTarget.dataset.order
        console.log(order)
        wx.navigateTo({
          url: '../../pages/orderInfo/index?orderInfo=' + JSON.stringify(order)
        })
    }

})