<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item :to="{ path: '/goods' }" class="myBreadCrumbItem">商品列表</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <el-alert title="添加商品信息" type="info" show-icon center :closable="false"></el-alert>
      <el-steps align-center :active="activeIndex - 0" finish-status="success">
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px" label-position="top">
        <el-tabs v-model="activeIndex" :tab-position="'left'" :before-leave="beforeTabLeave" @tab-click="tabClicked">
          <el-tab-pane label="基本信息" name="0">
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="addForm.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格" prop="goods_price">
              <el-input type="number" v-model="addForm.goods_price"></el-input>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weight">
              <el-input type="number" v-model="addForm.goods_weight"></el-input>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_number">
              <el-input type="number" v-model="addForm.goods_number"></el-input>
            </el-form-item>
            <el-form-item label="商品分类" prop="goods_cat">
              <el-cascader v-model="addForm.goods_cat" :options="cateList" :props="cateProps" @change="handleChange" clearable></el-cascader>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品参数" name="1">
            <el-form-item v-for="item in manyTableData" :key="item.attr_id" :label="item.attr_name">
              <el-checkbox-group v-model="item.attr_vals">
                <el-checkbox v-for="(cb, index) in item.attr_vals" :key="index" :label="cb" border></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品属性" name="2">
            <el-form-item v-for="item in onlyTableData" :key="item.attr_id" :label="item.attr_name">
              <el-input v-model="item.attr_vals"></el-input>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品图片" name="3">
            <!-- action表示图片要上传到后台的api地址 -->
            <el-upload :action="uoloadURL" :on-preview="handlePreview" :on-remove="handleRemove" :on-success="handleSuccess" list-type="picture" :headers="headerObj">
              <el-button size="small" type="primary">点击上传</el-button>
              <div slot="tip" class="el-upload__tip">只能上传jpg/png文件，且不超过500kb</div>
            </el-upload>
          </el-tab-pane>
          <el-tab-pane label="商品内容" name="4">
            <quill-editor v-model="addForm.goods_introduce"></quill-editor>
            <el-button type="primary" class="btnAdd" @click="add">添加商品</el-button>
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>
    <!-- 预览图片对话框 -->
    <el-dialog title="预览图片" :visible.sync="previewVisible" width="30%">
      <el-image :src="previewPath">
        <div slot="placeholder" class="image-slot">
          加载中<span class="dot">...</span>
        </div>
      </el-image>
    </el-dialog>
  </div>
</template>

<script>
  import _ from 'lodash';
  export default {
    data() {
      return {
        activeIndex: '0',
        addForm: {
          goods_name: '',
          goods_price: 0,
          goods_number: 0,
          goods_weight: 0,
          goods_cat: [],
          pics: [],
          goods_introduce: '',
          attrs: []
        },
        addFormRules: {
          goods_name: [
            { required: true, message: '请输入商品名称', trigger: 'blur' }
          ],
          goods_price: [
            { required: true, message: '请输入商品价格', trigger: 'blur' }
          ],
          goods_number: [
            { required: true, message: '请输入商品数量', trigger: 'blur' }
          ],
          goods_weight: [
            { required: true, message: '请输入商品重量', trigger: 'blur' }
          ],
          goods_cat: [
            { required: true, message: '请选择商品分类', trigger: 'blur' }
          ]
        },
        cateList: [],
        cateProps: {
          expandTrigger: 'hover',
          value: 'cat_id',
          label: 'cat_name',
          children: 'children'
        },
        manyTableData: [],
        onlyTableData: [],
        uoloadURL: 'http://127.0.0.1:8888/api/private/v1/upload',
        headerObj: {
          Authorization: window.sessionStorage.getItem('token')
        },
        previewPath: '',
        previewVisible: false
      }
    },
    created() {
      this.getCateList();
    },
    methods: {
      async getCateList() {
        const { data: res } = await this.$http.get('categories');
        if (res.meta.status !== 200) return this.$message.error('获取商品分类失败');
        this.cateList = res.data;
      },
      handleChange() {
        if (this.addForm.goods_cat.length !== 3) {
          this.addForm.goods_cat = [];
        }
      },
      beforeTabLeave(activeName, oldActiveName) {
        if (oldActiveName === '0' && this.addForm.goods_cat.length !== 3) {
          this.$message.error('请先选择商品分类！');
          return false;
        };
      },
      async tabClicked() {
        if (this.activeIndex === '1') {
          const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes`, { params: { sel: 'many' } })
          if (res.meta.status !== 200) return this.$message.error('获取动态参数失败，请重试！');
          res.data.forEach(item => {
            item.attr_vals = item.attr_vals.length === 0 ? null : item.attr_vals.split(' ');
          })
          this.manyTableData = res.data;
        } else if (this.activeIndex === '2') {
          const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes`, { params: { sel: 'only' } })
          if (res.meta.status !== 200) return this.$message.error('获取静态属性失败，请重试！');
          this.onlyTableData = res.data;
        }
      },
      // 处理图片预览操作
      handlePreview(file) {
        this.previewPath = file.response.data.url;
        this.previewVisible = true;
      },
      // 处理移除图片操作
      handleRemove(file) {
        const filePath = file.response.data.tmp_path;
        const i = this.addForm.pics.findIndex(x => x.pic === filePath);
        this.addForm.pics.splice(i, 1);
      },
      // 监听图片上传成功的事件
      handleSuccess(response) {
        const picInfo = { pic: response.data.tmp_path };
        this.addForm.pics.push(picInfo);
      },
      add() {
        this.$refs.addFormRef.validate(async valid => {
          if (!valid) return this.$message.error('请填写必要的表单项！');
          // 处理动态参数和静态属性
          this.manyTableData.forEach(item => {
            const newInfo = {
              attr_id: item.attr_id,
              attr_value: item.attr_vals.join(' ')
            };
            this.addForm.attrs.push(newInfo);
          });
          this.onlyTableData.forEach(item => {
            const newInfo = {
              attr_id: item.attr_id,
              attr_value: item.attr_vals
            };
            this.addForm.attrs.push(newInfo);
          });
          const form = _.cloneDeep(this.addForm);
          form.goods_cat = form.goods_cat.join(',');
          const { data: res } = await this.$http.post('goods', form);
          if (res.meta.status !== 201) return this.$message.error('添加商品失败，请重试！');
          this.$message.success('添加商品成功！');
          this.$router.push('/goods');
        });
      }
    },
    computed: {
      cateId() {
        return this.addForm.goods_cat.length === 3 ? this.addForm.goods_cat[2] : null;
      }
    }
  }
</script>

<style lang='less' scoped>
  .el-checkbox {
    margin: 0 10px 0 0 !important;
  }

  .el-image {
    box-shadow: 2px 2px 10px 4px rgba(0, 0, 0, 0.15);
  }

  .btnAdd {
    margin-top: 15px;
  }
</style>
