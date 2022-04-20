// index.js
import Toast from '@vant/weapp/toast/toast'
const moment = require('../../utils/moment')
const app = getApp()
moment.locale('zh-cn')

Page({
  data: {
    formatDate: moment().format('MM月DD日 dddd'),
    show: false,
    train_num: '',
    carriage_num: '',
    seat_num: '',
    date: moment().format('YYYY年MM月DD日'),
    bannerImg: []
  },
  formSubmit(e) {
    Toast.loading({
      message: '加载中...',
      forbidClick: true,
    });
    let {
      train_num,
      carriage_num,
      seat_num
    } = ''
    if ('detail' in e) {
      train_num = e.detail.value.train_num
      carriage_num = e.detail.value.carriage_num
      seat_num = e.detail.value.seat_num
    } else if ('t' in e) {
      train_num = e.t
      carriage_num = e.c
      seat_num = e.s
    } else {
      Toast.fail('获取不到车次')
      return
    }
    let that = this
    wx.setStorageSync('train_num', train_num)
    wx.setStorageSync('carriage_num', carriage_num + '')
    wx.setStorageSync('seat_num', seat_num + '')
    wx.setStorageSync('date', this.data.date)

    wx.cloud.callFunction({
      name: 'trainQuery',
      data: {
        train_num: train_num
      },
      success: res => {
        if (res.result.status !== 0) {
          Toast.fail(res.result.msg)
          return
        }
        that.setData({
          train_num: train_num,
          carriage_num: carriage_num,
          seat_num: seat_num
        })
        wx.setStorageSync('train_startstation', res.result.result.startstation)
        wx.setStorageSync('train_endstation', res.result.result.endstation)
        wx.navigateTo({
          url: '../../pages/shopList/index?train_num=' + train_num + '&train_info=' + JSON.stringify(res.result.result)
        })
        Toast.clear()
      },
      fail: err => {
        Toast.clear()
        Toast.fail('获取数据失败');
        console.error(err)
      }
    });
  },
  onDisplay() {
    this.setData({
      show: true
    });
  },
  onClose() {
    this.setData({
      show: false
    });
  },
  onConfirm(event) {
    this.setData({
      show: false,
      formatDate: moment(event.detail).format('MM月DD日 dddd'),
      date: moment(event.detail).format('YYYY年MM月DD日')
    });
  },
  saoma() {
    let that = this
    wx.scanCode({
      success(res) {
        let scene = decodeURIComponent(res.path.split("?scene=")[1]);
        let codeRes = app.globalData.qs.parse(scene)
        that.formSubmit(codeRes)
      }
    });
  },
  onLoad(options) {
    let that = this
    if (options.scene) {
      let scene = decodeURIComponent(options.scene);
      let codeRes = app.globalData.qs.parse(scene)
      that.formSubmit(codeRes)
    } else {
      wx.getStorage({
        key: 'train_num',
        success(res) {
          that.setData({
            train_num: res.data
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

    }
    wx.cloud.callFunction({
      name: "bannerImgQuery",
      success: res => {
        that.setData({
          bannerImg: res.result.data
        })
      },
      fail: e => {
        that.setData({
          bannerImg: [{
              img: [{
                url: 'https://hbimg.huabanimg.com/9abd8e7d768e6bb070de86c09671b73c81de118d43df2-xahAjO_fw658'
              }]
            },
            {
              img: [{
                url: 'https://hbimg.huabanimg.com/9abd8e7d768e6bb070de86c09671b73c81de118d43df2-xahAjO_fw658'
              }]
            }, {
              img: [{
                url: 'https://hbimg.huabanimg.com/9abd8e7d768e6bb070de86c09671b73c81de118d43df2-xahAjO_fw658'
              }]
            }
          ]
        })
        console.error(e)
      }
    })
    console.log(this.data.train_num)
  }
});