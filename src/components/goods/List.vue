<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getGoodsList" @keyup.enter.native="getGoodsList">
            <el-button slot="append" icon="el-icon-search" @click="getGoodsList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="16">
          <el-button type="primary" @click="goAddPage">添加商品</el-button>
        </el-col>
      </el-row>
      <el-table border stripe :data="goodsList">
        <el-table-column align="center" type="index" label="序号" width="60"></el-table-column>
        <el-table-column header-align="center" prop="goods_name" label="商品名称" show-overflow-tooltip></el-table-column>
        <el-table-column align="center" prop="goods_price" label="商品价格(元)" width="95"></el-table-column>
        <el-table-column align="center" prop="goods_weight" label="商品重量" width="80"></el-table-column>
        <el-table-column align="center" prop="add_time" label="创建时间" width="140">
          <template slot-scope="scope">
            {{scope.row.add_time | dateFormat}}
          </template>
        </el-table-column>
        <el-table-column align="center" label="操作" width="120">
          <template slot-scope="scope">
            <el-button size="mini" type="primary" icon="el-icon-edit" @click="goEditPage(scope.row.goods_id)"></el-button>
            <el-button size="mini" type="danger" icon="el-icon-delete" @click="removeById(scope.row.goods_id)"></el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="queryInfo.pagenum" :page-sizes="[5, 10, 15]" :page-size="queryInfo.pagesize" layout="total, sizes, prev, pager, next, jumper" :total="total" background>
      </el-pagination>
    </el-card>
  </div>
</template>

<script>
  export default {
    data() {
      return {
        // 查询请求的参数
        queryInfo: {
          query: '',
          pagenum: 1,
          pagesize: 5
        },
        // 总页数
        total: 0,
        // 商品列表
        goodsList: []
      }
    },
    created() {
      this.getGoodsList();
    },
    methods: {
      async getGoodsList() {
        const { data: res } = await this.$http.get('goods', { params: this.queryInfo });
        if (res.meta.status !== 200) return this.$message.error('获取商品列表失败，请尝试刷新页面！');
        this.goodsList = res.data.goods;
        this.total = res.data.total;
      },
      handleSizeChange(newSize) {
        this.queryInfo.pagesize = newSize;
        this.getGoodsList();
      },
      handleCurrentChange(newPage) {
        this.queryInfo.pagenum = newPage;
        this.getGoodsList();
      },
      removeById(goodsId) {
        this.$confirm('此操作将永久删除该商品, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'error'
        }).then(async () => {
          const { data: res } = await this.$http.delete('goods/' + goodsId);
          if (res.meta.status !== 200) return this.$message.error('删除失败，请重试！');
          const totalPage = Math.ceil((this.total - 1) / this.queryInfo.pagesize);
          const pagenum = this.queryInfo.pagenum > totalPage ? totalPage : this.queryInfo.pagenum;
          this.queryInfo.pagenum = pagenum < 1 ? 1 : pagenum;
          this.getGoodsList();
          this.$message.success('删除成功!');
        }).catch(() => {
          this.$message.info('已取消删除');
        });
      },
      goAddPage() {
        this.$router.push('/goods/add');
      },
      goEditPage(id) {
        this.$router.push({ name: 'edit', query: { id: id } })
      }
    }
  }
</script>

<style lang='less' scoped>
</style>
