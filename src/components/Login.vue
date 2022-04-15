<template>
  <div class="container">
    <div class="login-box">
      <!-- 头像 -->
      <div class="avatar-box"><img src="../assets/logo.png" alt="" /></div>
      <!-- 登录表单 -->
      <el-form ref="loginFormRef" :model="loginForm" :rules="loginRules" class="login-form">
        <!-- 用户名 -->
        <el-form-item prop="username" label="手机号:"><el-input v-model="loginForm.username" prefix-icon="el-icon-user"></el-input></el-form-item>
        <!-- 密码 -->
        <el-form-item prop="password" label="密码:"><el-input type="password" v-model="loginForm.password" prefix-icon="el-icon-lock"></el-input></el-form-item>
        <el-form-item class="login-btns">
          <el-button type="primary" @click="login">登录</el-button>
          <el-button type="info" @click="register">注册</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
export default {
  data () {
    return {
      // 登录表单数据
      loginForm: {
        username: '',
        password: ''
      },
      // 表单验证
      loginRules: {
        // 用户名验证
        username: [
          {
            required: true,
            message: '请输入用户名',
            trigger: 'blur'
          },
          {
            min: 11,
            max: 11,
            message: '请输入正确的手机号',
            trigger: 'blur'
          }
        ],
        // 密码验证
        password: [
          {
            required: true,
            message: '请输入密码',
            trigger: 'blur'
          },
          {
            min: 6,
            max: 20,
            message: '密码在6-20个字符之间',
            trigger: 'blur'
          }
        ]
      }
    }
  },
  methods: {
    // 注册
    register () {
      this.$router.push('/register')
    },
    login () {
      this.$refs.loginFormRef.validate(async valid => {
        if (!valid) return false
        const res = await this.$http.post(this.urls.login, this.loginForm)
        if (res.status !== 200) return this.$message.error(res.data.msg)
        this.$message.success(res.data.msg)
        // 保存token
        localStorage.setItem('token', res.data.data.token)
        this.jump()
      })
    },
    async jump () {
      const shopInfo = await this.$http.get(this.urls.queryShopInfo)
      localStorage.removeItem('shopInfo')
      if (shopInfo.data.data.length === 0) {
        this.$router.push('/modify')
      } else {
        localStorage.setItem('shopInfo', JSON.stringify(shopInfo.data.data[0]))
        this.$router.push('/home')
      }
    }
  },
  created () {
    if (localStorage.getItem('token')) {
      this.jump()
    }
  }
}
</script>

<style lang="less" scoped>
.container {
  background-color: #666666;
  height: 100%;
}
.login-box {
  width: 550px;
  height: 400px;
  background-color: #ffffff;
  border-radius: 3px;
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
}
.avatar-box {
  width: 150px;
  height: 150px;
  border: 1px solid #eee;
  border-radius: 50%;
  padding: 10px;
  box-shadow: 0 0 10px #ddd;
  position: absolute;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: #fff;
  img {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    background-color: #eee;
  }
}
.login-form {
  width: 80%;
  position: absolute;
  bottom: 50px;
  padding: 0 20px;
  box-sizing: border-box;
  left: 50%;
  transform: translate(-50%);
}
.login-btns {
  display: flex;
  justify-content: center;
}
</style>
