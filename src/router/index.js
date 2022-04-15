import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../components/Login.vue'
import Register from '../components/Register.vue'
import Home from '../components/Home.vue'
import Modify from '../components/Modify.vue'
import ShopManager from '../components/ShopManager.vue'
import CarriageNumManager from '../components/CarriageNumManager.vue'
import DataAnas from '../components/DataAnas.vue'
import DishManager from '../components/DishManager.vue'
import DishType from '../components/DishType.vue'
import OrderManager from '../components/OrderManager.vue'
import AdManager from '../components/AdManager.vue'

Vue.use(VueRouter)

const routes = [{
  path: '/',
  redirect: '/login'
},
{
  name: 'Login',
  path: '/login',
  component: Login
},
{
  name: 'Register',
  path: '/register',
  component: Register
},
{
  name: 'Home',
  path: '/home',
  component: Home,
  redirect: '/DataAnas',
  children: [{
    name: 'ShopManager',
    path: '/shopManager',
    component: ShopManager
  },
  {
    name: 'CarriageNumManager',
    path: '/carriageNumManager',
    component: CarriageNumManager,
    meta: {
      keepAlive: true
    }
  },
  {
    name: 'DataAnas',
    path: '/dataAnas',
    component: DataAnas,
    meta: {
      keepAlive: true
    }
  },
  {
    name: 'DishManager',
    path: '/dishManager',
    component: DishManager,
    meta: {
      keepAlive: true
    }
  },
  {
    name: 'DishType',
    path: '/dishType',
    component: DishType,
    meta: {
      keepAlive: true
    }
  },
  {
    name: 'OrderManager',
    path: '/orderManager',
    component: OrderManager,
    meta: {
      keepAlive: true
    }
  },
  {
    name: 'AdManager',
    path: '/adManager',
    component: AdManager,
    meta: {
      keepAlive: true
    }
  }]
},
{
  name: 'Modify',  path: '/modify',  component: Modify}
]

const router = new VueRouter({
  routes
})

// 挂载路由导航守卫
router.beforeEach((to, from, next) => {
  // to 将要访问的路径
  // from 从哪个路径跳转来
  // next 放行
  if (to.path === '/login' || to.path === '/register') return next()
  const token = localStorage.getItem('token')
  if (!token) {
    return next('/login')
  }
  next()
})

export default router
