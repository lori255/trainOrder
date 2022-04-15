import Vue from 'vue'
import App from './App.vue'
import router from './router'
import qs from 'qs'
import './plugins/element.js'
import { Loading } from 'element-ui'
// 图标样式表
import './assets/fonts/iconfont.css'
// 全局样式表
import './assets/css/global.css'
import axios from 'axios'
// 请求接口
import Urls from '../api/api.js'

/* 当页面有两个接口时，第一个接口loading的close事件会直接将第二个接口的loading实例也close */
let loadingInstance = null
function startLoading () {
  loadingInstance = Loading.service({
    fullscreen: true,
    text: '拼命加载中...',
    background: 'rgba(0, 0, 0, 0.8)'
  })
}
function endLoading () {
  loadingInstance.close()
}
let needLoadingRequestCount = 0
function showFullScreenLoading () {
  if (needLoadingRequestCount === 0) {
    startLoading()
  }
  needLoadingRequestCount++
}
function tryHideFullScreenLoading () {
  if (needLoadingRequestCount <= 0) return
  needLoadingRequestCount--
  if (needLoadingRequestCount === 0) {
    endLoading()
  }
}

// axios.defaults.baseURL = Urls.host
axios.interceptors.request.use(config => {
  if (config.showLoading === true || config.showLoading === undefined) { showFullScreenLoading() }
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = 'Basic ' + Buffer.from(token + ':').toString('base64')
  }
  return config
},
error => {
  tryHideFullScreenLoading()
  Promise.reject(error)
})

axios.interceptors.response.use(
  response => {
    tryHideFullScreenLoading()
    return response
  },
  error => {
    tryHideFullScreenLoading()
    if (error.response.status === 401) {
      window.localStorage.clear()
      window.location.href = '/'
    }
    return Promise.reject(error)
  }
)

Vue.prototype.$http = axios
Vue.prototype.urls = Urls
Vue.prototype.$qs = qs
Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
