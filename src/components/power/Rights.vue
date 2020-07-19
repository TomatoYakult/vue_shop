<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>权限列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <el-table :data="rightsList" stripe border height="516" :default-sort="{prop: 'level', order: 'ascending'}">
        <el-table-column align="center" label="序号" type="index" width="200"></el-table-column>
        <el-table-column align="center" prop="authName" label="权限名称"></el-table-column>
        <el-table-column align="center" prop="path" label="路径"></el-table-column>
        <el-table-column prop="level" label="权限等级" sortable :filters="filtersArr" :filter-method="filterLevel">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.level === '0'">一级</el-tag>
            <el-tag v-else-if="scope.row.level === '1'" type="success">二级</el-tag>
            <el-tag v-else type="warning">三级</el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script>
  export default {
    data() {
      return {
        // 权限列表数据
        rightsList: [],
        filtersArr: [
          { text: '一级', value: '0' }, { text: '二级', value: '1' }, { text: '三级', value: '2' }
        ]
      }
    },
    created() {
      // 调用获取权限列表方法
      this.getRightsList();
    },
    methods: {
      // 获取权限列表
      async getRightsList() {
        const { data: res } = await this.$http.get('rights/list');
        if (res.meta.status !== 200) return this.$message.error('获取权限列表失败，请尝试刷新页面！');
        this.rightsList = res.data;
      },
      filterLevel(value, row) {
        return row.level === value;
      }
    }
  }
</script>

<style lang="less" scoped>

</style>
