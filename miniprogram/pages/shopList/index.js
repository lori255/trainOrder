// pages/shopList/index.js
import Toast from '@vant/weapp/toast/toast';
Page({
    data: {
        activeKey: 0,
        currentIndex: 0, //左边菜单的当前显示值
        shopList: [],
        menuList: [],
        title: ''
    },
    onClickLeft() {
        wx.navigateBack()
    },

    clickMenu: function (e) {
        let current = e.currentTarget.dataset.current;
        if (this.data.currentIndex == current) return
        this.setData({
            currentIndex: current
        })
        console.log(current)
    },
    
    onLoad: function (options) {
        Toast.loading({
            message: '加载中...',
            forbidClick: true,
          });
        let train_info = JSON.parse(options.train_info);
        let train_list = train_info.list.map(item => {
            return item.station
        })
        this.setData({
            title: options.train_num
        });
        let that = this
        wx.cloud.callFunction({
            name: 'shopQuery',
            data: {
                train_list: train_list
            },
            success: res => {
                console.log(res)
                Toast.clear()
                if (res.result.data.length <= 0) {
                    Toast.fail('还没有商家在本次列车途经站点')
                    return
                }
                let menuList = []
                let shopList = []
                res.result.data.forEach(item =>{
                    let index = menuList.indexOf(item.address)
                    if(index === -1) {
                        menuList.push(item.address)
                        shopList.push([item])
                    }else {
                        shopList[index].push(item)
                    }
                })
                that.setData({
                    menuList: menuList,
                    shopList: shopList                    
                })
            },
            fail: err => {
                Toast.clear()
                console.error(err)
            }
        })
    },

})