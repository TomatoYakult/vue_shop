<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item :to="{ path: '/goods' }" class="myBreadCrumbItem">商品列表</el-breadcrumb-item>
      <el-breadcrumb-item>修改商品</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <el-alert title="修改商品信息" type="info" show-icon center :closable="false"></el-alert>
      <el-steps align-center :active="activeIndex - 0" finish-status="success">
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>
      <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="100px" label-position="top">
        <el-tabs :tab-position="'left'" v-model="activeIndex" :before-leave="beforeTabLeave" @tab-click="tabClicked">
          <el-tab-pane label="基本信息" name="0">
            <el-form-item label="商品分类" prop="goods_cat">
              <el-cascader v-model="editForm.goods_cat" :options="cateList" :props="cateProps" @change="handleChange" disabled></el-cascader>
            </el-form-item>
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="editForm.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格" prop="goods_price">
              <el-input type="number" v-model="editForm.goods_price"></el-input>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weight">
              <el-input type="number" v-model="editForm.goods_weight"></el-input>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_number">
              <el-input type="number" v-model="editForm.goods_number"></el-input>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品参数" name="1">
            <el-form-item v-for="item in manyTableData" :key="item.attr_id" :label="item.attr_name">
              <el-checkbox-group v-model="item.attr_value">
                <el-checkbox v-for="(cb, index) in item.attr_vals" :key="index" :label="cb" border></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品属性" name="2">
            <el-form-item v-for="item in onlyTableData" :key="item.attr_id" :label="item.attr_name">
              <el-input v-model="item.attr_value"></el-input>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品图片" name="3">
            <el-upload :action="uoloadURL" :on-preview="handlePreview" :on-remove="handleRemove" :on-success="handleSuccess" list-type="picture" :headers="headerObj" :file-list="picList">
              <el-button size="small" type="primary">点击上传</el-button>
              <div slot="tip" class="el-upload__tip">只能上传jpg/png文件，且不超过500kb</div>
            </el-upload>
          </el-tab-pane>
          <el-tab-pane label="商品内容" name="4">
            <quill-editor v-model="editForm.goods_introduce"></quill-editor>
            <el-button type="primary" class="btnEdit" @click="edit">修改商品</el-button>
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>
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
  // import _ from 'lodash';
  export default {
    data() {
      return {
        goods_id: 0,
        activeIndex: '0',
        editForm: {},
        editFormRules: {
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
        picList: [],
        uoloadURL: 'http://127.0.0.1:8888/api/private/v1/upload',
        headerObj: { Authorization: window.sessionStorage.getItem('token') },
        previewPath: '',
        previewVisible: false,
        form: {
          id: '',
          goods_name: '',
          goods_price: 0,
          goods_number: 0,
          goods_weight: 0,
          goods_introduce: '',
          pics: [],
          attrs: [],
          goods_cat: ''
        }
      }
    },
    created() {
      this.goods_id = this.$route.query.id;
      this.getGoodInfo();
      this.getCateList();
    },
    methods: {
      async getGoodInfo() {
        const { data: res } = await this.$http.get('goods/' + this.goods_id);
        if (res.meta.status !== 200) return this.$message.error('获取商品信息失败，请重试！');
        res.data.goods_cat = res.data.goods_cat.split(',').map(item => Number(item));
        this.editForm = res.data;
        this.picList = this.editForm.pics.map(item => {
          return { name: item.goods_id, url: item.pics_sma_url };
        });
      },
      async getCateList() {
        const { data: res } = await this.$http.get('categories');
        if (res.meta.status !== 200) return this.$message.error('获取商品分类失败');
        this.cateList = res.data;
      },
      handleChange() {
        if (this.editForm.goods_cat.length !== 3) {
          this.editForm.goods_cat = [];
        }
      },
      beforeTabLeave(activeName, oldActiveName) {
        if (oldActiveName === '0' && this.editForm.goods_cat.length !== 3) {
          this.$message.error('请先选择商品分类！');
          return false;
        };
      },
      tabClicked() {
        if (this.activeIndex === '1') {
          this.manyTableData = this.editForm.attrs.filter(item => {
            return item.attr_sel === 'many';
          });
          this.manyTableData.forEach(item => {
            item.attr_vals = item.attr_vals.length === 0 ? null : item.attr_vals.split(' ');
            item.attr_value = item.attr_value.length === 0 ? null : item.attr_value.split(' ');
          });
        } else if (this.activeIndex === '2') {
          this.onlyTableData = this.editForm.attrs.filter(item => {
            return item.attr_sel === 'only';
          });
        }
      },
      handlePreview(file) {
        this.previewPath = file.url;
        this.previewVisible = true;
      },
      handleRemove(file) {
        if (file.response) {
          const filePath = file.response.data.tmp_path;
          const i = this.editForm.pics.findIndex(x => x.pic === filePath);
          this.editForm.pics.splice(i, 1);
        } else {
          const filePath = file.url;
          const i = this.editForm.pics.findIndex(x => x.pics_sma_url === filePath);
          this.editForm.pics.splice(i, 1);
        }
      },
      handleSuccess(response) {
        const picInfo = { pic: response.data.tmp_path };
        this.editForm.pics.push(picInfo);
      },
      async edit() {
        this.form.id = this.editForm.goods_id;
        this.form.goods_name = this.editForm.goods_name;
        this.form.goods_price = this.editForm.goods_price;
        this.form.goods_number = this.editForm.goods_number;
        this.form.goods_weight = this.editForm.goods_weight;
        this.form.goods_introduce = this.editForm.goods_introduce;
        this.manyTableData.forEach(item => {
          const newInfo = {
            attr_id: item.attr_id,
            attr_value: item.attr_value.join(' ')
          };
          this.form.attrs.push(newInfo);
        });
        this.onlyTableData.forEach(item => {
          const newInfo = {
            attr_id: item.attr_id,
            attr_value: item.attr_value
          };
          this.form.attrs.push(newInfo);
        });
        this.form.pics = this.editForm.pics.filter(item => {
          return item.pic;
        });
        this.form.goods_cat = this.editForm.goods_cat.join(',');
        const { data: res } = await this.$http.put('goods/' + this.form.id, this.form);
        if (res.meta.status !== 200) return this.$message.error('修改商品信息失败！');
        this.$message.success('修改商品信息成功！');
        this.$route.push('/goods');
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

  .btnEdit {
    margin-top: 15px;
  }
</style>
