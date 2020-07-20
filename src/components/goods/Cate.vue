<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <el-row>
        <el-col>
          <el-button type="primary" @click="showAddDialog">添加分类</el-button>
        </el-col>
      </el-row>
      <tree-table class="treeTable" :data="cateList" :columns="columns" :selection-type="false" :expand-type="false" show-index border :show-row-hover="false">
        <template slot="isok" slot-scope="scope">
          <i v-if="!scope.row.cat_deleted" class="el-icon-success" style="color: #67C23A"></i>
          <i v-else class="el-icon-error" style="color: #F56C6C"></i>
        </template>
        <template slot="order" slot-scope="scope">
          <el-tag size="mini" v-if="scope.row.cat_level === 0">一级</el-tag>
          <el-tag size="mini" v-else-if="scope.row.cat_level === 1" type="success">二级</el-tag>
          <el-tag size="mini" v-else type="warning">三级</el-tag>
        </template>
        <template slot="opt" slot-scope="scope">
          <el-button size="mini" type="primary" icon="el-icon-edit" @click="showEditDialog(scope.row.cat_id)">编辑</el-button>
          <el-button size="mini" type="danger" icon="el-icon-delete" @click="removeCateById(scope.row.cat_id)">删除</el-button>
        </template>
      </tree-table>
      <!-- 分页区域 -->
      <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="queryInfo.pagenum" :page-sizes="[3, 5, 10]" :page-size="queryInfo.pagesize" layout="total, sizes, prev, pager, next, jumper" :total="total">
      </el-pagination>
    </el-card>
    <!-- 添加分类对话框 -->
    <el-dialog title="添加分类" :visible.sync="addDialogVisible" width="50%" @close="addDialogClosed">
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px">
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="addForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级分类">
          <el-cascader v-model="selectedKeys" :options="parentCateList" :props="cascaderProps" @change="parentCateChange" clearable></el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCate">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 编辑分类对话框 -->
    <el-dialog title="修改分类" :visible.sync="editDialogVisible" width="50%" @close="editDialogClosed">
      <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="100px" @submit.native.prevent>
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="editForm.cat_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editCateInfo">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
  export default {
    data() {
      return {
        // 查询条件
        queryInfo: {
          type: 3,
          pagenum: 1,
          pagesize: 5
        },
        cateList: [],
        // 总数据条数
        total: 0,
        columns: [{
          label: '分类名称',
          prop: 'cat_name'
        }, {
          label: '是否有效',
          // 表示当前列使用模板列
          type: 'template',
          // 使用的模板名称
          template: 'isok'
        }, {
          label: '排序',
          type: 'template',
          template: 'order'
        }, {
          label: '操作',
          type: 'template',
          template: 'opt'
        }],
        addDialogVisible: false,
        addForm: {
          cat_pid: 0,
          cat_name: '',
          cat_level: 0
        },
        addFormRules: {
          cat_name: [
            { required: true, message: '请输入分类名称', trigger: 'blur' }
          ]
        },
        parentCateList: [],
        // 指定级联选择器的配置对象
        cascaderProps: {
          expandTrigger: 'hover',
          checkStrictly: true,
          value: 'cat_id',
          label: 'cat_name',
          children: 'children'
        },
        // 选中的父级分类的id数组
        selectedKeys: [],
        editDialogVisible: false,
        editForm: {},
        editFormRules: {
          cat_name: [
            { required: true, message: '请输入分类名称', trigger: 'blur' }
          ]
        }
      }
    },
    created() {
      this.getCateList();
    },
    methods: {
      async getCateList() {
        const { data: res } = await this.$http.get('categories', { params: this.queryInfo });
        if (res.meta.status !== 200) return this.$message.error('获取商品分类失败，请尝试刷新页面！');
        this.cateList = res.data.result;
        this.total = res.data.total;
      },
      // 监听pagesize改变
      handleSizeChange(newSize) {
        this.queryInfo.pagesize = newSize;
        this.getCateList();
      },
      // 监听pagenum改变
      handleCurrentChange(newPage) {
        this.queryInfo.pagenum = newPage;
        this.getCateList();
      },
      // 添加分类相关
      showAddDialog() {
        this.getParentCateList();
        this.addDialogVisible = true;
      },
      addDialogClosed() {
        this.$refs.addFormRef.resetFields();
        this.selectedKeys = [];
        this.addForm.cat_level = 0;
        this.addForm.cat_pid = 0;
      },
      async getParentCateList() {
        const { data: res } = await this.$http.get('categories', { params: { type: 2 } });
        if (res.meta.status !== 200) return this.$message.error('获取父级分类数据失败！');
        this.parentCateList = res.data;
      },
      // 选择项发生变化触发此函数
      parentCateChange() {
        if (this.selectedKeys.length > 0) {
          // 父级分类的id
          this.addForm.cat_pid = this.selectedKeys[this.selectedKeys.length - 1];
          // 当前分类的等级
          this.addForm.cat_level = this.selectedKeys.length;
          return
        } else {
          this.addForm.cat_pid = 0;
          this.addForm.cat_level = 0;
        }
      },
      addCate() {
        this.$refs.addFormRef.validate(async valid => {
          if (!valid) return;
          const { data: res } = await this.$http.post('categories', this.addForm);
          if (res.meta.status !== 201) return this.$message.error('添加分类失败，请重试！');
          this.$message.success('添加分类成功！');
          this.getCateList();
          this.addDialogVisible = false;
        });
      },
      // 编辑分类相关
      async showEditDialog(id) {
        const { data: res } = await this.$http.get('categories/' + id);
        if (res.meta.status !== 200) return this.$message.error('获取分类信息失败，请重试！');
        this.editForm = res.data;
        this.editDialogVisible = true;
      },
      editDialogClosed() {
        this.$refs.editFormRef.resetFields();
      },
      editCateInfo() {
        this.$refs.editFormRef.validate(async valid => {
          if (!valid) return;
          const { data: res } = await this.$http.put('categories/' + this.editForm.cat_id, { cat_name: this.editForm.cat_name });
          if (res.meta.status !== 200) return this.$message.error('编辑分类失败，请重试！');
          this.$message.success('编辑分类成功！');
          this.getCateList();
          this.editDialogVisible = false;
        })
      },
      // 删除分类相关
      removeCateById(id) {
        this.$confirm('此操作将永久删除该分类, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'error'
        }).then(async () => {
          const { data: res } = await this.$http.delete('categories/' + id);
          if (res.meta.status !== 200) return this.$message.error('删除失败，请重试！');
          const totalPage = Math.ceil((this.total - 1) / this.queryInfo.pagesize);
          const pagenum = this.queryInfo.pagenum > totalPage ? totalPage : this.queryInfo.pagenum;
          this.queryInfo.pagenum = pagenum < 1 ? 1 : pagenum;
          this.getCateList();
          this.$message.success('删除成功!');
        }).catch(() => {
          this.$message.info('已取消删除');
        });
      }
    }
  }
</script>

<style lang="less" scoped>
  .treeTable {
    margin-top: 20px;
  }

  .el-cascader {
    width: 100%;
  }
</style>
