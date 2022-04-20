// pages/item/item.js
Page({
 
  /**
   * 页面的初始数据
   */
  data: {
    title: '',
    loading: true,
    name: '',
    goods: []
  },
 
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const _this = this;
    console.log(options)
    this.data.name = options.name
    wx.cloud.database().collection('goods').where({
      good_shop: options.id
    }).get()
    .then(res => {
      console.log("店铺列表请求成功", res.data)
      this.setData({
        goods: res.data,
        loading: false
      })
    })
    .catch(res =>{
      console.log("店铺列表请求失败", res)
      this.setData({
        loading: false
      })
    })
  },
 
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    // 修改导航栏标题
    wx.setNavigationBarTitle({
      title: this.data.name
    })
  }
})