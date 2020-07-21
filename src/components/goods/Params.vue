<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>参数列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <el-alert title="注意：只允许为第三级分类设置相关参数！" type="warning" show-icon :closable="false"></el-alert>
      <el-row class="cat_opt">
        <el-col>
          <span>选择商品分类：</span>
          <el-cascader v-model="selectedCateKeys" :options="cateList" :props="cateProps" @change="handleChange" clearable></el-cascader>
        </el-col>
      </el-row>
      <!-- tabs页签区域 -->
      <el-tabs v-model="activeName" @tab-click="handleClick">
        <!-- 动态参数区域 -->
        <el-tab-pane label="动态参数" name="many">
          <!-- 按钮 -->
          <el-button type="primary" :disabled="isBtnDisabled" size="small" @click="addDialogVisible = true">添加参数</el-button>
          <!-- 表格 -->
          <el-table :data="manyTableData" border stripe>
            <el-table-column align="center" type="expand">
              <template slot-scope="scope">
                <el-tag v-for="(item, index) in scope.row.attr_vals" :key="index" closable @close="handleClose(index, scope.row)">{{item}}</el-tag>
                <el-input class="input-new-tag" v-if="scope.row.inputVisible" v-model="scope.row.inputValue" ref="saveTagInput" size="small" @keyup.enter.native="handleInputConfirm(scope.row)" @blur="handleInputConfirm(scope.row)">
                </el-input>
                <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
              </template>
            </el-table-column>
            <el-table-column align="center" type="index" label="序号" width="120"></el-table-column>
            <el-table-column prop="attr_name" label="参数名称"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button size="small" type="primary" icon="el-icon-edit" @click="showEditDialog(scope.row.attr_id)">编辑</el-button>
                <el-button size="small" type="danger" icon="el-icon-delete" @click="removeParams(scope.row.attr_id)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <!-- 静态属性区域 -->
        <el-tab-pane label="静态属性" name="only">
          <!-- 按钮 -->
          <el-button type="primary" :disabled="isBtnDisabled" size="small" @click="addDialogVisible = true">添加属性</el-button>
          <!-- 表格 -->
          <el-table :data="onlyTableData" border stripe>
            <el-table-column align="center" type="expand">
              <template slot-scope="scope">
                <el-tag v-for="(item, index) in scope.row.attr_vals" :key="index" closable @close="handleClose(index, scope.row)">{{item}}</el-tag>
                <el-input class="input-new-tag" v-if="scope.row.inputVisible" v-model="scope.row.inputValue" ref="saveTagInput" size="small" @keyup.enter.native="handleInputConfirm(scope.row)" @blur="handleInputConfirm(scope.row)">
                </el-input>
                <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
              </template>
            </el-table-column>
            <el-table-column align="center" type="index" label="序号" width="120"></el-table-column>
            <el-table-column prop="attr_name" label="属性名称"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button size="small" type="primary" icon="el-icon-edit" @click="showEditDialog(scope.row.attr_id)">编辑</el-button>
                <el-button size="small" type="danger" icon="el-icon-delete" @click="removeParams(scope.row.attr_id)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>
    <!-- 添加参数对话框 -->
    <el-dialog :title="'添加' + titleText" :visible.sync="addDialogVisible" width="50%" @close="addDialogClosed">
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px" @submit.native.prevent>
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="addForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addParams">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 修改参数对话框 -->
    <el-dialog :title="'修改' + titleText" :visible.sync="editDialogVisible" width="50%" @close="editDialogClosed">
      <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="100px" @submit.native.prevent>
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="editForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editParams">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
  export default {
    data() {
      return {
        cateList: [],
        cateProps: {
          expandTrigger: 'hover',
          value: 'cat_id',
          label: 'cat_name',
          children: 'children'
        },
        selectedCateKeys: [],
        // 被激活的页签的名称
        activeName: 'many',
        // 动态参数表格的数据
        manyTableData: [],
        // 静态属性表格的数据
        onlyTableData: [],
        // 添加对话框相关
        addDialogVisible: false,
        addForm: {},
        addFormRules: {
          attr_name: [
            { required: true, message: '请输入参数名称', trigger: 'blur' }
          ]
        },
        // 编辑对话框相关
        editDialogVisible: false,
        editForm: {},
        editFormRules: {
          attr_name: [
            { required: true, message: '请输入参数名称', trigger: 'blur' }
          ]
        }
        // 可编辑标签相关
      }
    },
    created() {
      this.getCateList();
    },
    methods: {
      async getCateList() {
        const { data: res } = await this.$http.get('categories');
        if (res.meta.status !== 200) return this.$message.error('获取商品分类失败，请尝试刷新页面！');
        this.cateList = res.data;
      },
      // 级联选择框选中项变化，会触发该函数
      handleChange() {
        if (this.selectedCateKeys.length !== 3) {
          this.selectedCateKeys = [];
          this.manyTableData = [];
          this.onlyTableData = [];
        }
        if (this.cateId !== null) this.getParamsData();
      },
      // tabs页签点击事件处理函数
      handleClick() {
        if (this.cateId !== null) this.getParamsData();
      },
      async getParamsData() {
        const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes`, { params: { sel: this.activeName } });
        if (res.meta.status !== 200) return this.$message.error('获取参数列表失败');
        res.data.forEach(item => {
          item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : [];
          item.inputVisible = false;
          item.inputValue = '';
        });
        this.activeName === 'many' ? this.manyTableData = res.data : this.onlyTableData = res.data;
      },
      // 添加属性相关
      addDialogClosed() {
        this.$refs.addFormRef.resetFields();
      },
      addParams() {
        this.$refs.addFormRef.validate(async valid => {
          if (!valid) return;
          const { data: res } = await this.$http.post(`categories/${this.cateId}/attributes`, {
            attr_name: this.addForm.attr_name,
            attr_sel: this.activeName
          });
          if (res.meta.status !== 201) return this.$message.error('添加参数失败，请重试！');
          this.$message.success('添加参数成功！');
          this.getParamsData();
          this.addDialogVisible = false;
        });
      },
      // 修改属性相关
      async showEditDialog(attrId) {
        const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes/${attrId}`, { params: { attr_sel: this.activeName } });
        if (res.meta.status !== 200) return this.$message.error('获取参数信息失败，请重试！');
        this.editForm = res.data;
        this.editDialogVisible = true;
      },
      editDialogClosed() {
        this.$refs.editFormRef.resetFields();
      },
      editParams() {
        this.$refs.editFormRef.validate(async valid => {
          if (!valid) return;
          const { data: res } = await this.$http.put(`categories/${this.cateId}/attributes/${this.editForm.attr_id}`, {
            attr_name: this.editForm.attr_name,
            attr_sel: this.activeName
          });
          if (res.meta.status !== 200) return this.$message.error('修改参数失败，请重试！');
          this.$message.success('修改参数成功！');
          this.getParamsData();
          this.editDialogVisible = false;
        })
      },
      // 删除属性相关
      removeParams(attrId) {
        this.$confirm('此操作将永久删除该分类, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'error'
        }).then(async () => {
          const { data: res } = await this.$http.delete(`categories/${this.cateId}/attributes/${attrId}`);
          if (res.meta.status !== 200) return this.$message.error('删除失败，请重试！');
          this.getParamsData();
          this.$message.success('删除成功！');
        }).catch(() => {
          this.$message.info('已取消删除');
        });
      },
      // 可编辑标签相关
      async handleInputConfirm(row) {
        if (row.inputValue.trim().length === 0) {
          row.inputValue = '';
          row.inputVisible = false;
          return;
        }
        row.attr_vals.push(row.inputValue.trim());
        row.inputValue = '';
        row.inputVisible = false;
        this.saveAttrVals(row);
      },
      showInput(row) {
        row.inputVisible = true;
        // 文本框自动获取焦点
        // $nextTick()：当页面上的元素被重新渲染之后，才会指定回调函数中的代码
        this.$nextTick(_ => {
          this.$refs.saveTagInput.$refs.input.focus();
        });
      },
      handleClose(index, row) {
        row.attr_vals.splice(index, 1);
        this.saveAttrVals(row);
      },
      async saveAttrVals(row) {
        const { data: res } = await this.$http.put(`categories/${this.cateId}/attributes/${row.attr_id}`, {
          attr_name: row.attr_name,
          attr_sel: row.attr_sel,
          attr_vals: row.attr_vals.join(' ')
        });
        if (res.meta.status !== 200) return this.$message.error('修改参数项失败，请重试');
        this.$message.success('修改参数项成功！');
      }
    },
    computed: {
      // 如果按钮需要被禁用，则返回true，否则返回false
      isBtnDisabled() {
        return this.selectedCateKeys.length !== 3;
      },
      // 当前选中的三级分类的Id
      cateId() {
        return this.selectedCateKeys.length === 3 ? this.selectedCateKeys[2] : null;
      },
      titleText() {
        return this.activeName === 'many' ? '动态参数' : '静态属性';
      }
    }
  }
</script>

<style lang='less' scoped>
  .cat_opt {
    margin: 20px 0;
  }

  .el-tag {
    margin: 5px 10px;
  }

  .input-new-tag {
    width: 120px;
  }
</style>
