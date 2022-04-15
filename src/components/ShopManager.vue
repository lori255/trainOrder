<template>
  <div>
    <el-descriptions class="margin-top" title="店铺设置" :column="1" size="big" border>
        <template slot="extra">
          <el-button type="primary" size="small" @click="modify">修改</el-button>
        </template>
        <el-descriptions-item>
          <template slot="label">
            <i class="el-icon-user"></i>
            店铺名称
          </template>
          {{shopInfo.name}}
        </el-descriptions-item>
        <el-descriptions-item>
          <template slot="label">
            <i class="el-icon-location-outline"></i>
            店铺地址
          </template>
          {{shopInfo.address}}
        </el-descriptions-item>
        <el-descriptions-item>
          <template slot="label">
            <i class="el-icon-location-outline"></i>
            起送价
          </template>
          {{shopInfo.shop_begin_price}}
        </el-descriptions-item>
        <el-descriptions-item>
          <template slot="label">
            <i class="el-icon-location-outline"></i>
            配送费
          </template>
          {{shopInfo.shop_post_price}}
        </el-descriptions-item>
        <el-descriptions-item>
          <template slot="label">
            <i class="el-icon-picture"></i>
            店铺图片
          </template>
          <el-image
              v-if="shopInfo.logo"
              :src="shopInfo.logo.url"
              :preview-src-list="[shopInfo.logo.url]">
            </el-image>
        </el-descriptions-item>
      </el-descriptions>
  </div>
</template>
<script>
export default {
  data () {
    return {
      shopInfo: {}
    }
  },
  methods: {
    async getShopInfo () {
      this.shopInfo = JSON.parse(localStorage.getItem('shopInfo'))
    },
    modify () {
      this.$router.push('/modify')
    }
  },
  created () {
    this.getShopInfo()
  }
}
</script>

<style>
  .el-descriptions-row{
    height: 100px;
  }
  .el-descriptions-item__label{
    width: 20%;
  }
  .el-descriptions-item__content{
    width: 80%;
  }
</style>
