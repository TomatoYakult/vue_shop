import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../components/Login.vue'
import Home from '../components/Home.vue'
import Welcome from '../components/Welcome.vue'
import Users from '../components/user/Users.vue'

Vue.use(VueRouter)

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', component: Login },
  {
    path: '/home',
    component: Home,
    redirect: '/welcome',
    children: [
      { path: '/welcome', component: Welcome },
      { path: '/users', component: Users, meta: { GuidePath: true, JumpPath: '/users' } }
    ]
  }
]

const router = new VueRouter({
  routes
})

// 为路由对象，添加 beforeEach 导航守卫，控制页面的访问权限，没有登录的话就不允许访问其他界面只能访问首页
router.beforeEach((to, from, next) => {
  // to: 将要访问的路径
  // from: 从哪个路径跳转而来
  // next: 是一个函数，表示放行操作
  //   next()：放行   next('/login')：强制跳转login页
  if (to.path === '/login') return next();
  // 获取token
  const tokenStr = window.sessionStorage.getItem('token');
  if (!tokenStr) return next('/login');
  next();
})

export default router
