<template>
  <el-container class="home-container">
    <!-- 头部区域 -->
    <el-header>
      <div>
        <img src="../assets/img/heima.png">
        <span>电商后台管理系统</span>
      </div>
      <el-button type="info" @click="logout">退出</el-button>
    </el-header>
    <!-- 页面主体区域 -->
    <el-container>
      <!-- 侧边栏 -->
      <el-aside :width="isCollapse ? '64px' : '200px'">
        <div class="fold" @click="foldCollapse">
          <i :class="foldClass"></i>
        </div>
        <!-- 侧边栏菜单区域 -->
        <el-menu background-color="#333744" text-color="#fff" active-text-color="#409eff" unique-opened :collapse="isCollapse" :collapse-transition="false" router :default-active="$route.path">
          <!-- 一级菜单 -->
          <el-submenu :index="item.id + ''" v-for="item in menuList" :key="item.id">
            <!-- 一级菜单模板区域 -->
            <template slot="title">
              <!-- 图标 -->
              <i :class="iconObj[item.id]"></i>
              <!-- 文本 -->
              <span>{{item.authName}}</span>
            </template>
            <!-- 二级菜单 -->
            <el-menu-item :index="'/' + subitem.path" v-for="subitem in item.children" :key="subitem.id">
              <template slot="title">
                <!-- 图标 -->
                <i class="el-icon-menu"></i>
                <!-- 文本 -->
                <span>{{subitem.authName}}</span>
              </template>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>
      <!-- 右侧内容主体 -->
      <el-main>
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
  export default {
    data() {
      return {
        menuList: [],
        iconObj: {
          125: 'iconfont icon-users',
          103: 'iconfont icon-tijikongjian',
          101: 'iconfont icon-shangpin',
          102: 'iconfont icon-danju',
          145: 'iconfont icon-baobiao'
        },
        // 是否折叠
        isCollapse: false,
        // 折叠图标样式
        foldClass: 'el-icon-s-fold'
      }
    },
    created() {
      this.getMenuList();
    },
    methods: {
      logout() {
        window.sessionStorage.clear();
        this.$router.push('/login');
      },
      // 获取菜单列表
      async getMenuList() {
        const { data: res } = await this.$http.get('menus');
        if (res.meta.status !== 200) return this.$message.error(res.meta.msg);
        this.menuList = res.data;
        return res;
      },
      // 菜单的折叠展开功能
      foldCollapse() {
        this.isCollapse = !this.isCollapse
        if (this.isCollapse === true) {
          this.foldClass = 'el-icon-s-unfold'
        } else {
          this.foldClass = 'el-icon-s-fold'
        }
      }
    }
  }
</script>

<style lang="less" scoped>
  .home-container {
    height: 100%;
  }

  .el-header {
    background-color: #373d41;
    display: flex;
    justify-content: space-between;
    padding-left: 0;
    align-items: center;
    color: #fff;
    font-size: 20px;

    >div {
      display: flex;
      align-items: center;

      >span {
        margin-left: 15px;
      }
    }
  }

  .el-aside {
    background-color: #333744;

    .el-menu {
      border-right: 0;
    }
  }

  .el-main {
    background-color: #eaedf1;
  }

  .iconfont {
    margin-right: 10px;
  }

  .fold {
    background-color: #333744;
    font-size: 24px;
    color: #909399;
    text-align: center;
    cursor: pointer;
  }
</style>
