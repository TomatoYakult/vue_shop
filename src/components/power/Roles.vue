<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <el-row>
        <el-col>
          <el-button type="primary" @click="addDialogVisible = true">添加角色</el-button>
        </el-col>
      </el-row>
      <el-table border stripe :data="rolesList">
        <el-table-column type="expand">
          <template slot-scope="scope">
            <el-row v-for="item1 in scope.row.children" :key="item1.id" class="bdbottom vcenter">
              <el-col :span="5">
                <el-tag closable @close="removeRightById(scope.row, item1.id)">{{item1.authName}}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <el-col :span="19">
                <el-row v-for="item2 in item1.children" :key="item2.id" class="bdtop vcenter">
                  <el-col :span="6">
                    <el-tag type="success" closable @close="removeRightById(scope.row, item2.id)">{{item2.authName}}</el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <el-col :span="18">
                    <el-tag type="warning" v-for="item3 in item2.children" :key="item3.id" closable @close="removeRightById(scope.row, item3.id)" class="bdtop">
                      {{item3.authName}}
                    </el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <el-table-column type="index" label="序号" width="70" align="center"></el-table-column>
        <el-table-column prop="roleName" label="角色名称"></el-table-column>
        <el-table-column prop="roleDesc" label="角色描述"></el-table-column>
        <el-table-column label="操作" width="350" align="center">
          <template slot-scope="scope">
            <el-button type="primary" icon="el-icon-edit" size="small" @click="showEditDialog(scope.row.id)">编辑</el-button>
            <el-button type="danger" icon="el-icon-delete" size="small" @click="removeRoleById(scope.row.id)">删除</el-button>
            <el-button type="warning" icon="el-icon-setting" size="small" @click="showSetRightDialog(scope.row)">分配权限</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <!-- 添加角色的对话框 -->
    <el-dialog title="添加角色" :visible.sync="addDialogVisible" width="50%" @close="addDialogClosed">
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="addForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="addForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addRole">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 编辑角色的对话框 -->
    <el-dialog title="编辑角色" :visible.sync="editDialogVisible" width="50%" @close="editDialogClosed">
      <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="100px">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="editForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="editForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editRoleInfo">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 分配权限的对话框 -->
    <el-dialog title="分配权限" :visible.sync="setDialogVisible" width="50%" @close="setDialogClosed">
      <el-tree :data="rightsList" :props="treeProps" show-checkbox node-key="id" default-expand-all :default-checked-keys="defKeys" ref="treeRef"></el-tree>
      <span slot="footer">
        <el-button @click="setDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="allotRights">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
  export default {
    data() {
      return {
        rolesList: [],
        // 添加角色对话框
        addDialogVisible: false,
        addForm: {
          roleName: '',
          roleDesc: ''
        },
        addFormRules: {
          roleName: [
            { required: true, message: '请输入角色名称', trigger: 'blur' }
          ],
          roleDesc: [
            { required: true, message: '请输入角色描述', trigger: 'blur' }
          ]
        },
        // 编辑角色对话框
        editDialogVisible: false,
        editForm: {},
        editFormRules: {
          roleName: [
            { required: true, message: '请输入角色名称', trigger: 'blur' }
          ],
          roleDesc: [
            { required: true, message: '请输入角色描述', trigger: 'blur' }
          ]
        },
        // 所有数据权限列表
        rightsList: [],
        // 分配权限对话框
        setDialogVisible: false,
        // 树形控件的属性绑定对象
        treeProps: {
          label: 'authName',
          children: 'children'
        },
        // 默认选中的节点id值数组
        defKeys: [],
        // 当前即将分配权限的角色id
        roleId: ''
      }
    },
    created() {
      this.getRolesList();
    },
    methods: {
      async getRolesList() {
        const { data: res } = await this.$http.get('roles');
        if (res.meta.status !== 200) return this.$message.error('获取角色列表失败，请尝试刷新页面！');
        this.rolesList = res.data;
      },
      // 添加角色相关
      addDialogClosed() {
        this.$refs.addFormRef.resetFields();
      },
      addRole() {
        this.$refs.addFormRef.validate(async valid => {
          if (!valid) return;
          const { data: res } = await this.$http.post('roles', this.addForm);
          if (res.meta.status !== 201) return this.$message.error('添加角色失败，请重试！');
          this.$message.success('添加角色成功！');
          this.getRolesList();
          this.addDialogVisible = false
        })
      },
      // 编辑角色相关
      async showEditDialog(id) {
        const { data: res } = await this.$http.get('roles/' + id);
        if (res.meta.status !== 200) return this.$message.error('获取角色信息失败，请重试！');
        this.editForm = res.data;
        this.editDialogVisible = true;
      },
      editDialogClosed() {
        this.$refs.editFormRef.resetFields();
      },
      editRoleInfo() {
        this.$refs.editFormRef.validate(async valid => {
          if (!valid) return;
          const { data: res } = await this.$http.put('roles/' + this.editForm.roleId, {
            roleName: this.editForm.roleName,
            roleDesc: this.editForm.roleDesc
          });
          if (res.meta.status !== 200) return this.$message.error('更新角色信息失败，请重试！');
          this.$message.success('更新角色信息成功！');
          this.getRolesList();
          this.editDialogVisible = false;
        })
      },
      // 删除角色相关
      removeRoleById(id) {
        this.$confirm('此操作将永久删除该角色, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'error'
        }).then(async () => {
          const { data: res } = await this.$http.delete('roles/' + id);
          if (res.meta.status !== 200) return this.$message.error('删除失败，请重试！');
          this.getRolesList();
          this.$message.success('删除成功!');
        }).catch(() => {
          this.$message.info('已取消删除');
        });
      },
      // 删除权限相关
      removeRightById(role, rightId) {
        this.$confirm('此操作将永久删除该权限, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'error'
        }).then(async () => {
          const { data: res } = await this.$http.delete(`roles/${role.id}/rights/${rightId}`);
          if (res.meta.status !== 200) return this.$message.error('删除失败，请重试！');
          role.children = res.data;
          this.$message.success('删除成功!');
        }).catch(() => {
          this.$message.info('已取消删除');
        });
      },
      // 设置角色权限相关
      // 展示设置对话框
      async showSetRightDialog(role) {
        const { data: res } = await this.$http.get('rights/tree');
        if (res.meta.status !== 200) return this.$message.error('获取权限列表失败，请重试！');
        this.roleId = role.id;
        this.rightsList = res.data;
        this.getLeafKeys(role, this.defKeys);
        this.setDialogVisible = true;
      },
      // 通过递归，获取当前角色下所有三级权限的id，并保存到defKeys数组中
      getLeafKeys(node, arr) {
        if (!node.children) return arr.push(node.id);
        node.children.forEach(item => {
          this.getLeafKeys(item, arr);
        });
      },
      // 关闭设置对话框时清空数据
      setDialogClosed() {
        this.defKeys = [];
      },
      // 分配权限
      async allotRights() {
        const keys = [
          ...this.$refs.treeRef.getCheckedKeys(),
          ...this.$refs.treeRef.getHalfCheckedKeys()
        ];
        const idStr = keys.join(',');
        const { data: res } = await this.$http.post(`roles/${this.roleId}/rights`, { rids: idStr });
        if (res.meta.status !== 200) return this.$message.error('分配权限失败，请重试！');
        this.$message.success('分配权限成功！');
        this.getRolesList();
        this.setDialogVisible = false;
      }
    }
  }
</script>

<style lang="less" scoped>
  .el-tag {
    margin: 7px;
  }

  .bdbottom:nth-child(1) {
    border-top: 1px solid #eee;
  }

  .bdbottom {
    border-bottom: 1px solid #eee;
  }

  .bdtop:nth-child(1) {
    border-top: 0px solid #eee;
  }

  .bdtop {
    border-top: 1px solid #eee;
  }

  .vcenter {
    display: flex;
    align-items: center;
  }
</style>
