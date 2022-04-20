// pages/shop/index.js
const app = getApp()
import Toast from '@vant/weapp/toast/toast';
Page({
  data: {
    currentIndex: 0, //左边菜单的当前显示值
    toView: 'menu-0', //滚动到某个菜单元素
    foodListHeights: [], //菜单对应右边商品的元素高度列表
    scrollTop: 0, //右边商品滚动条滚动到哪
    goods: [],
    cart: false,
    detail: false,
    total_quantity: 0,
    shopping_cart: [],
    type_index: null,
    index: null,
    total_price: 0,
    shop_info: {},
    scrollHeight: 0
  },
  queryDishinfo() {
    let that = this
    wx.cloud.callFunction({
      name: 'queryDish',
      data:{
        uid: this.data.shop_info.uid
      },
      success: res => {
        that.setData({
          goods: res.result.list
        })
        if(res.result.list.length === 0) {
          Toast.fail('店铺暂无上架商品')
        }
      },
      fail: err => {
        console.error(err)
        Toast.fail('获取店铺数据失败')
      }
    });
  },
  change(e) {
    if (!('func' in e)) {
      e = e.currentTarget.dataset
    }
    let {
      type_index,
      index,
      func
    } = e
    console.log(e)
    let goods = this.data.goods
    let total_quantity = this.data.total_quantity
    let total_price = this.data.total_price
    if (func == 'add') {
      goods[type_index].dishes[index].select_count += 1
      goods[type_index].select_count += 1
      total_quantity += 1
      total_price += goods[type_index].dishes[index].price
    } else if (func == 'dec') {
      goods[type_index].dishes[index].select_count -= 1
      goods[type_index].select_count -= 1
      total_quantity -= 1
      total_price -= goods[type_index].dishes[index].price
    }
    let shopping_cart = this.data.shopping_cart
    let flag = true
    let sp_index = -1
    shopping_cart.forEach(item => {
      if (item.type_index == type_index && item.index == index) {
        item.select_count = goods[type_index].dishes[index].select_count
        sp_index = shopping_cart.indexOf(item)
        flag = false
      }
    })
    if (flag) {
      let dish = goods[type_index].dishes[index]
      dish.type_index = type_index
      dish.index = index
      shopping_cart.push(dish)
    } else if (shopping_cart[sp_index].select_count <= 0) {
      shopping_cart.splice(sp_index, 1)
      if (shopping_cart.length <= 0)
        this.setData({
          cart: false
        })
    }


    this.setData({
      goods: goods,
      shopping_cart: shopping_cart,
      total_quantity: total_quantity,
      total_price: total_price
    })
  },
  cleanCart(e) {
    let shopping_cart = this.data.shopping_cart
    let goods = this.data.goods
    shopping_cart.forEach(item=>{
      goods[item.type_index].dishes[item.index].select_count = 0
      goods[item.type_index].select_count = 0
    })
    shopping_cart = []
    this.setData({
      goods: goods,
      shopping_cart: shopping_cart,
      cart: false
    })
  },
  changeCart(e) {
    console.log(e.detail)
    let {
      func,
      good_id,
      type_name
    } = e.detail
    let type_index, index = null
    let goods = this.data.goods
    for (var i in goods) {
      if (goods[i].name == type_name) {
        type_index = i
        for (var j in goods[i].dishes) {
          if (goods[i].dishes[j]._id == good_id) {
            index = j
          }
        }
      }
    }
    this.change({
      type_index,
      index,
      func
    })
  },
  showCart(e) {
    if(this.data.shopping_cart.length<=0) return
    let {
      value
    } = e.currentTarget.dataset
    this.setData({
      cart: value
    })
  },
  showDetail(e) {
    let {
      value,
      type_index,
      index
    } = e.currentTarget.dataset
    this.setData({
      detail: value,
      type_index: type_index==undefined?null:type_index,
      index: index==undefined?null:index
    })
  },
  // 提交订单
  placean_order() {
    wx.navigateTo({
      url: '../../pages/orderInfo/index?cart='+ JSON.stringify(this.data.shopping_cart) + '&shop_info='+ JSON.stringify(this.data.shop_info)
    })
  },
  onClickLeft() {
    wx.navigateBack()
  },
  scrollToMenu: function (e) {
    var that = this;
    let current = e.currentTarget.dataset.current;
    let toViewString = 'menu-' + (current > 5 ? current - 5 : 0);
    that.setData({
      currentIndex: current,
      toView: toViewString,
      scrollTop: that.data.foodListHeights[current]
    });
  },
  scrollFoods: function (e) {
    var that = this;
    let currentY = e.detail.scrollTop;
    for (let i = 0; i < that.data.foodListHeights.length - 1; i++) {
      let heightBottom = that.data.foodListHeights[i];
      let heightTop = that.data.foodListHeights[i + 1];
      //对滑动后currentY值不足的情况进行修正
      let diff = Math.abs(currentY - heightTop);
      //判断currentY当前所在的区间
      if (currentY < heightTop && currentY >= heightBottom) {
        let toViewString = 'menu-' + (i > 5 ? i - 5 : 0);
        that.setData({
          currentIndex: i,
          toView: toViewString
        });
      }
    }
  },
  onLoad: function (options) {
    Toast.loading({
      message: '加载中...',
      forbidClick: true,
    });
    this.setData({
      shop_info: options     
    })
    this.queryDishinfo()
  },
  onReady: function (options) {
    setTimeout(()=>{
      this.caclHeight()
    },500)
    Toast.clear()
  },
  caclHeight(){
    const that = this
    let height = 0
    const _foodListHeights = []
    _foodListHeights.push(height)
    const query = wx.createSelectorQuery()
    query.select('.foods-wrapper').boundingClientRect()
    query.selectAll('.food-list-hook').boundingClientRect()
    query.exec(function (res) {
      //height = height - res[0].height; 
      for (let i = 0; i < res[1].length; i++) {
        height += res[1][i].height;
        _foodListHeights.push(height);
      }
      that.setData({
        foodListHeights: _foodListHeights
      })
    })
    this.setData({
      scrollHeight: 0.9*app.globalData.windowInfo.windowHeight
    })
    console.log(this.data.scrollHeight)
  }
})