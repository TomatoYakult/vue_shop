<template>
  <div class="login_container">
    <div class="login_box">
      <div class="avatar_box">
        <img src="../assets/img/logo.png">
      </div>
      <el-form :model="loginForm" :rules="loginFormRules" ref="loginFormRef" class="login_form">
        <el-form-item prop="username">
          <el-input ref="inputRef" placeholder="请输入帐号" prefix-icon="iconfont icon-user" v-model="loginForm.username" clearable></el-input>
        </el-form-item>
        <el-form-item prop="password">
          <el-input placeholder="请输入密码" v-model="loginForm.password" show-password @keyup.enter.native="login">
            <i slot="prefix" class="iconfont icon-3702mima"></i>
          </el-input>
        </el-form-item>
        <el-form-item class="btns">
          <el-button type="primary" @click="login">登录</el-button>
          <el-button type="info" @click="resetLoginForm">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
  export default {
    data() {
      return {
        // 这是登录表单的数据绑定对象
        loginForm: {
          username: '',
          password: ''
        },
        loginFormRules: {
          username: [
            { required: true, message: '请输入用户名', trigger: 'blur' },
            { min: 2, max: 10, message: '长度在 2 到 10 个字符', trigger: 'blur' }
          ],
          password: [
            { required: true, message: '请输入密码', trigger: 'blur' },
            { min: 6, max: 15, message: '长度在 6 到 15 个字符', trigger: 'blur' }
          ]
        },
        date: new Date(),
        dateMsg: '',
        dateIcon: ''
      }
    },
    created() {
      const y = this.date.getFullYear();
      const m = (this.date.getMonth() + 1).toString().padStart(2, '0');
      const d = (this.date.getDate()).toString().padStart(2, '0');
      const hh = (this.date.getHours()).toString().padStart(2, '0');
      switch (hh) {
      case 6:
      case 7:
      case 19:
      case 20:
      case 21:
        this.dateIcon = 'el-icon-sunrise-1';
        break;
      case 8:
      case 9:
      case 10:
      case 11:
      case 12:
      case 13:
      case 14:
      case 15:
      case 16:
      case 17:
      case 18:
        this.dateIcon = 'el-icon-sunny';
        break;
      default:
        this.dateIcon = 'el-icon-moon';
        break;
      }
      this.dateMsg = `${y}年${m}月${d}日`
    },
    methods: {
      // 重置方法
      resetLoginForm() {
        this.$refs.loginFormRef.resetFields();
      },
      login() {
        // validate() 对整个表单进行校验的方法，参数为一个回调函数。该回调函数会在校验结束后被调用
        this.$refs.loginFormRef.validate(async valid => {
          // 预验证操作
          if (!valid) return;
          // 通过axios发送ajax请求，验证帐号密码是否正确
          const { data: res } = await this.$http.post('login', this.loginForm);
          // 如果状态码不为200，则帐号密码错误，给出message提示
          if (res.meta.status !== 200) return this.$message.error('用户名或密码错误，请重试！');
          // 登录成功message提示
          this.$message.success('登录成功！');
          console.log('this.dateMsg :>> ', this.dateMsg);
          // 登录成功notification提示
          this.$notify({
            title: `${res.data.username} 您好`,
            iconClass: this.dateIcon,
            dangerouslyUseHTMLString: true,
            message: `<span>今天是${this.dateMsg}，希望您今天的工作能有个好心情哦~</span>`
          });
          // 1. 将后台传递过来的token值存放到客户端的sessionStorage中
          //   1.1 项目中除了登录的API接口都需要在成功登录之后才能访问
          //   1.2 token只在当前网站打开期间生效，所以存放在sessionStorage中
          window.sessionStorage.setItem('token', res.data.token);
          // 2. 通过编程式导航跳转到后台主页，路由地址是 /home
          this.$router.push('/home');
        })
      }
    },
    mounted() {
      this.$refs.inputRef.focus();
    }
  }
</script>

<style lang="less" scoped>
  .login_container {
    background-color: #2b4b6b;
    height: 100%;
  }

  .login_box {
    width: 450px;
    height: 300px;
    background-color: #fff;
    border-radius: 3px;
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);

    .avatar_box {
      width: 130px;
      height: 130px;
      border: 1px solid #eee;
      border-radius: 50%;
      padding: 10px;
      box-shadow: 0 0 8px #ddd;
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
  }

  .login_form {
    width: 100%;
    padding: 0 20px;
    box-sizing: border-box;
    position: absolute;
    bottom: 0;
  }

  .btns {
    display: flex;
    justify-content: flex-end;
  }
</style>
