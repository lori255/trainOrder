<template>
  <el-container>
    <!-- 头部 -->
    <el-header>
      <div>
        <img src="../assets/logo.png" alt="" />
        <span>火车移动点餐管理后台</span>
      </div>
      <el-button @click="logout" type="text">退出</el-button>
    </el-header>
    <!-- 主体 -->
    <el-container>
      <!-- 左侧菜单栏 -->
      <el-aside width="300px">
        <div class="shop-info-box">
          <el-avatar v-if="shopInfo.logo" shape="square" :size="50" fit="fill" :src="shopInfo.logo.url"></el-avatar>
          <h3 v-if="shopInfo.name" class="shop-name">{{ shopInfo.name }}</h3>
        </div>
        <el-menu active-text-color="#409bFF" text-color="#fff" background-color="#313743" router v-if="menuList[0]" :default-active="'/' + menuList[0].path">
          <el-menu-item :index="'/' + item.path" v-for="item in menuList" :key="item.id">
            <template solt="title">
              <i :class="iconObj[item.id]"></i>
              <span>{{ item.name }}</span>
            </template>
          </el-menu-item>
        </el-menu>
      </el-aside>
      <!-- 右侧展示 -->
      <el-main>
        <!-- 路由占位符  -->
        <keep-alive>     <!--使用keep-alive会将页面缓存-->
          <router-view v-if="$route.meta.keepAlive"></router-view>
        </keep-alive>
        <router-view v-if="!$route.meta.keepAlive"></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
export default {
  data () {
    return {
      // 左侧菜单列表
      menuList: [],
      iconObj: {
        101: 'el-icon-data-line',
        102: 'el-icon-document',
        103: 'el-icon-edit',
        104: 'el-icon-pie-chart',
        105: 'el-icon-truck',
        106: 'el-icon-user',
        107: 'el-icon-thumb'
      },
      shopInfo: {}
    }
  },
  methods: {
    logout () {
      localStorage.clear()
      this.$router.push('/login')
    },
    async getMenuList () {
      var temp = JSON.parse(localStorage.getItem('menu'))
      if (temp) this.menuList = temp
      else {
        const { data: res, status } = await this.$http.get(this.urls.getMenu)
        if (status !== 200) return this.$message.error(res.msg)
        else {
          this.menuList = res.data.children
          localStorage.setItem('menu', JSON.stringify(this.menuList))
        }
      }
    },
    async getShopInfo () {
      var temp = JSON.parse(localStorage.getItem('shopInfo'))
      if (temp) this.shopInfo = temp
      else this.$router.push('/modify')
    }
  },
  created () {
    this.getMenuList()
    this.getShopInfo()
  }
}
</script>

<style lang="less" scoped>
.el-header {
  background-color: #363d40;
  display: flex;
  justify-content: space-between;
  padding-left: 0px;
  align-items: center;
  img {
    width: 60px;
    height: 60px;
  }
  span {
    font-size: 20px;
    color: #fff;
  }
  div {
    display: flex;
    align-items: center;
    margin-left: 20px;
  }
}
.el-aside {
  background-color: #313743;
  .el-menu {
    margin-top: 30px;
    width: 100%;
  }
  .el-menu-item {
    height: 70px;
    line-height: 70px;
  }
  .shop-info-box {
    background-color: #495063;
    border-bottom: 0.5px #ccc solid;
    display: flex;
    height: 100px;
    flex-direction: row;
    align-items: center;
    .el-avatar {
      margin-left: 20px;
    }
    .shop-name {
      color: #fff;
      margin: 0 7%;
    }
  }
}
.el-main {
  background-color: #e9edf0;
}
.el-container {
  height: 100%;
}
</style>
