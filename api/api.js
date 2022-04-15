const host = 'http://localhost:3001/api/'
// const host = 'https://example.com:3001/api/'

const urls = {
  // 接口
  host: `${host}`,
  login: `${host}login/`,
  register: `${host}register/`,
  modify: `${host}modify/`,
  home: `${host}home`,
  upload: `${host}upload/`,
  uploadShopInfo: `${host}uploadShopInfo/`,
  queryShopInfo: `${host}queryShopInfo/`,
  updateShopInfo: `${host}updateShopInfo/`,
  getMenu: `${host}getMenu/`,
  uploadDishType: `${host}uploadDishType/`,
  queryDishType: `${host}queryDishType/`,
  updateDishType: `${host}updateDishType/`,
  delDishType: `${host}delDishType/`,
  uploadDish: `${host}uploadDish/`,
  queryDish: `${host}queryDish/`,
  updateDish: `${host}updateDish/`,
  delDish: `${host}delDish/`,
  queryOrderByUid: `${host}queryOrderByUid/`,
  updateOrder: `${host}updateOrder/`,
  genWxcode: `${host}genWxcode/`,
  queryWxcode: `${host}queryWxcode/`,
  delWxcode: `${host}delWxcode`,
  queryMonthSale: `${host}queryMonthSale/`,
  genAd: `${host}genAd/`,
  queryAdInfo: `${host}queryAdInfo/`,
  updateAdInfo: `${host}updateAdInfo/`,
  delAd: `${host}delAd/`
}

export default urls
