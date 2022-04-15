<template>
  <div class="container">
    <div class="register-box">
      <!-- 头像 -->
      <div class="avatar-box"><img src="../assets/logo.png" alt="" /></div>
      <!-- 登录表单 -->
      <el-form ref="registerFormRef" :model="registerForm" :rules="registerRules" class="register-form">
        <!-- 用户名 -->
        <el-form-item prop="username" label="手机号:"><el-input v-model="registerForm.username" prefix-icon="el-icon-user"></el-input></el-form-item>
        <!-- 密码 -->
        <el-form-item prop="password" label="密码:"><el-input type="password" v-model="registerForm.password" prefix-icon="el-icon-lock"></el-input></el-form-item>
        <el-form-item prop="con_password" label="确认密码:"><el-input type="password" v-model="registerForm.con_password" prefix-icon="el-icon-lock"></el-input></el-form-item>
        <el-form-item class="register-btns">
          <el-button type="primary" @click="register">注册</el-button>
          <el-button type="info" @click="back">去登录</el-button>
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
      registerForm: {
        username: '',
        password: ''
      },
      // 表单验证
      registerRules: {
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
        ],
        // 确认密码
        con_password: [
          {
            required: true,
            message: '请输入确认密码',
            trigger: 'blur'
          },
          {
            validator: (rule, value, callback) => {
              if (value === '') {
                callback(new Error('请再次输入密码'))
              } else if (value !== this.registerForm.password) {
                callback(new Error('两次输入密码不一致'))
              } else {
                callback()
              }
            },
            trigger: 'blur'
          }
        ]
      }
    }
  },
  methods: {
    register () {
      this.$refs.registerFormRef.validate(async valid => {
        if (!valid) return false
        const res = await this.$http.post(this.urls.register, this.registerForm)
        if (res.status !== 200) return this.$message.error(res.data.msg)
        this.$message.success(res.data.msg)
        this.$router.push('/login')
      })
    },
    back () {
      this.$router.push('/login')
    }
  }
}
</script>

<style lang="less" scoped>
.container {
  background-color: #666666;
  height: 100%;
}
.register-box {
  width: 550px;
  height: 500px;
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
.register-form {
  width: 80%;
  position: absolute;
  bottom: 50px;
  padding: 0 20px;
  box-sizing: border-box;
  left: 50%;
  transform: translate(-50%);
}
.register-btns {
  display: flex;
  justify-content: center;
}
</style>
