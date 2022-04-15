<template>
  <div class="container">
    <div class="modify-box">
    <el-button class="back" type="text" @click="$router.push('home')">&lt; 返回</el-button>
      <!-- 标题 -->
      <div class="modify-title"><span>设置商家店铺信息</span></div>
      <!-- 商家设置表单 -->
      <el-form label-position="top" ref="modifyFormRef" :model="modifyForm" :rules="modifyRules" class="modify-form">
        <!-- 用户名 -->
        <el-form-item prop="shopName" label="店铺名称"><el-input v-model="modifyForm.shopName"></el-input></el-form-item>
        <!-- 密码 -->
        <el-form-item prop="shopAddress" label="店铺地址"><el-input v-model="modifyForm.shopAddress"></el-input></el-form-item>
        <el-form-item prop="shopImg" label="店铺logo">
          <el-upload
            ref="imgUpload"
            :class="{ hide: hideUpload }"
            accept=".jpg,.png,.jpeg,.webp"
            name="file"
            list-type="picture-card"
            :auto-upload="false"
            :action="action"
            :limit="1"
            :multiple="false"
            :show-file-list="true"
            :on-success="handleSuccess"
            :before-upload="beforeUpload"
            :on-preview="handlePreview"
            :on-remove="handleRemove"
            :on-error="handleError"
            :file-list="modifyForm.logo"
            :on-progress="handleProgress"
            :on-change="handleChange"
          >
            <i class="el-icon-upload"></i>
          </el-upload>
          <el-dialog :visible.sync="dialogVisible" append-to-body><img width="100%" :src="dialogImageUrl" alt="" /></el-dialog>
        </el-form-item>
        <el-form-item label="起送价" prop="shop_begin_price">
          <el-input type="number" v-model="modifyForm.shop_begin_price"></el-input>
        </el-form-item>
        <el-form-item label="配送费" prop="shop_post_price">
          <el-input type="number" v-model="modifyForm.shop_post_price"></el-input>
        </el-form-item>
        <el-form-item class="modify-btns">
          <el-button type="success" @click="modify(btnT)" :loading="loading" :disabled="loading">{{ btnT }}</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
export default {
  data () {
    var validateImg = (rule, value, callback) => {
      if (value === undefined && this.modifyForm.logo.length === 0) {
        callback(new Error('请上传图片'))
      } else {
        callback()
      }
    }
    return {
      wether: false,
      btnT: '',
      loading: false,
      action: this.urls.upload,
      id: '',
      dialogVisible: false,
      dialogImageUrl: '',
      hideUpload: false,
      limitCount: 1,
      logoList: '',
      // 登录表单数据
      modifyForm: {
        shopName: '',
        shopAddress: '',
        logo: [],
        shop_post_price: 0,
        shop_begin_price: 0
      },

      // 表单验证
      modifyRules: {
        // 用户名验证
        shopName: [
          {
            required: true,
            message: '请输入店铺名称',
            trigger: 'blur'
          },
          {
            min: 1,
            max: 15,
            message: '请输入正确店铺名称',
            trigger: 'blur'
          }
        ],
        // 密码验证
        shopAddress: [
          {
            required: true,
            message: '请输入店铺地址',
            trigger: 'blur'
          }
        ],
        // 图片验证
        shopImg: [
          {
            validator: validateImg,
            trigger: 'change'
          }
        ],
        shop_post_price: [{
          required: true,
          message: '请输入配送费',
          trigger: 'blur'
        }],
        shop_begin_price: [{
          required: true,
          message: '请输入起送价',
          trigger: 'blur'
        }]
      }
    }
  },
  methods: {
    modify () {
      this.$refs.modifyFormRef.validate(async valid => {
        if (!valid) return false
        if (this.modifyForm.logo.length !== 0) {
          this.submitInfo()
        } else {
          this.$refs.imgUpload.submit()
        }
      })
    },
    submitInfo () {
      const data = { id: this.id }
      Object.assign(data, this.modifyForm)
      data.logo = data.logo[0]
      this.loading = true
      this.infoRequest(data)
    },
    handleSuccess (res, file) {
      this.loading = false
      this.modifyForm.logo.push({ url: res.data.imgurl, uid: file.uid })
      this.submitInfo()
    },
    beforeUpload (file) {
      const allowType = ['image/jpg', 'image/jpeg', 'image/png', 'image/webp']
      const isJPG = allowType.indexOf(file.type) !== -1
      if (!isJPG) {
        this.$message.error('上传文件必须是图片格式')
      }
      return isJPG
    },
    handleRemove (file, fileList) {
      this.modifyForm.logo = []
      if (fileList.length === 0) {
        this.modifyRules.shopImg = [
          {
            required: true,
            message: '请上传图片',
            trigger: 'change'
          }
        ]
      }
      this.hideCode = fileList.length >= this.limitCode
      this.hideUpload = fileList.length >= this.limitCount
    },
    handlePreview (file) {
      this.dialogImageUrl = file.url
      this.dialogVisible = true
    },
    handleError (err, file, fileList) {
      console.log(err)
      this.$message.error('图片上传失败！')
      this.loading = false
    },
    handleProgress (event, file, fileList) {
      this.loading = true
    },
    handleChange (file, fileList) {
      if (fileList.length === 1) {
        const { shopImg, ...data } = this.modifyRules
        this.modifyRules = data
      }
      this.$refs.modifyFormRef.clearValidate('shopImg')
      this.hideUpload = fileList.length >= this.limitCount
    },
    async infoRequest (data) {
      const url = this.btnT === '提交' ? this.urls.uploadShopInfo : this.urls.updateShopInfo
      try {
        const res = await this.$http.post(url, this.$qs.stringify(data))
        if (res.status !== 200) {
          this.$message.warning(res.data.msg)
        } else {
          this.$message.success(res.data.msg)
          await this.getShopInfo()
          this.$router.push(this.btnT === '提交' ? 'home' : 'home')
        }
      } catch (e) {
        console.log(e)
      }
      this.loading = false
    },
    async getShopInfo () {
      const { data: res, status } = await this.$http.get(this.urls.queryShopInfo)
      if (status !== 200) {
        console.log(res)
        return this.$message.error(res.msg)
      } else {
        localStorage.setItem('shopInfo', JSON.stringify(res.data[0]))
      }
    }
  },
  created () {
    const res = JSON.parse(localStorage.getItem('shopInfo'))
    if (!res) {
      this.wether = false
      this.btnT = '提交'
    } else {
      this.wether = true
      this.btnT = '修改'
      this.id = res._id
      this.modifyForm.shopName = res.name
      this.modifyForm.shopAddress = res.address
      this.modifyForm.logo = [res.logo]
      this.modifyForm.shop_post_price = res.shop_post_price
      this.modifyForm.shop_begin_price = res.shop_begin_price
      this.hideUpload = true
    }
  }
}
</script>

<style lang="less">
.container {
  background-color: #f7faf9;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}
.modify-box {
  width: 60%;
  height: 100%;
  background-color: #ffffff;
  border-radius: 3%;
  display: flex;
  flex-flow: column;
  align-items: center;
  justify-content: center;
}
.modify-title {
  font-size: 22px;
  font-weight: bold;
}
.modify-form {
  width: 80%;
}
.modify-btns {
  display: flex;
  justify-content: center;
}
.modify-title {
  margin-bottom: 10%;
}
.hide .el-upload--picture-card {
  display: none;
}
.back {
  position: absolute;
  left: 12.5rem;
  top: 3.125rem;
}
</style>
