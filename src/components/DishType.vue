<template>
  <div>
    <h3>菜单类目</h3>
    <el-table :data="tableData">
      <el-table-column label="#" type="index" align="center" :index="table_index"></el-table-column>
      <el-table-column label="类目名称" prop="name"></el-table-column>
      <el-table-column label="类目标签">
        <template slot-scope="scope">
          <el-tag :key="tag" v-for="tag in scope.row.tags">{{ tag }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="类目描述" prop="desc"></el-table-column>
      <el-table-column align="right">
        <template slot="header">
          <el-button type="primary" size="small" @click="dialogFormVisible = true">添加类目</el-button>
        </template>
        <template slot-scope="scope">
          <el-button size="mini" @click="handleEdit(scope.$index, scope.row)">编辑</el-button>
          <el-button size="mini" type="danger" @click="handleDelete(scope.$index, scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog title="菜单类目修改" :visible.sync="dialogFormVisible" @close="handlerClosed">
      <el-form :model="form" :rules="rules" ref="ruleForm">
        <el-form-item label="名称" :label-width="formLabelWidth" prop="name"><el-input v-model="form.name" autocomplete="off"></el-input></el-form-item>
        <el-form-item label="标签" :label-width="formLabelWidth">
          <el-tag :key="tag" v-for="tag in form.tags" closable :disable-transitions="false" @close="handleClose(tag)">{{ tag }}</el-tag>
          <el-input
            class="input-new-tag"
            v-if="inputVisible"
            v-model="inputValue"
            ref="saveTagInput"
            size="small"
            @keyup.enter.native="handleInputConfirm"
            @blur="handleInputConfirm"
          ></el-input>
          <el-button v-else class="button-new-tag" size="small" @click="showInput">+ 添加标签</el-button>
        </el-form-item>
        <el-form-item label="描述" :label-width="formLabelWidth"><el-input v-model="form.desc" autocomplete="off"></el-input></el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取 消</el-button>
        <el-button type="primary" @click="handleSave" :loading="loading">确 定</el-button>
      </div>
    </el-dialog>
    <el-pagination
      class="fy"
      :page-size="pageSize"
      background
      layout="prev, pager, next"
      :total="total"
      @current-page="currentPage"
      @current-change="handleCurrentChange"
    ></el-pagination>
  </div>
</template>

<script>
export default {
  data () {
    return {
      loading: false,
      inputVisible: false,
      inputValue: '',
      tableData: [],
      tempData: [],
      dialogFormVisible: false,
      form: {
        name: '',
        tags: [],
        desc: ''
      },
      formLabelWidth: '60px',
      rules: {
        name: [{ required: true, message: '请输入菜品类目', trigger: 'blur' }]
      },
      currentPage: 1,
      total: 0,
      pageSize: 10
    }
  },
  methods: {
    async add () {
      this.loading = true
      let url = this.urls.uploadDishType
      const index = this.tableData
        .map(obj => {
          return obj._id
        })
        .indexOf(this.form._id)
      if (index !== -1) {
        url = this.urls.updateDishType
      }
      try {
        const res = await this.$http.post(url, this.$qs.stringify(this.form))
        if (res.status !== 200) return this.$message.error(res.data.msg)
        this.$message.success(res.data.msg)
        if (index === -1) this.tableData.unshift(res.data.data)
        else {
          for (var key in res.data.data) {
            this.tableData[index][key] = res.data.data[key]
          }
        }
      } catch (e) {
        console.log(e)
      }
    },
    handleClose (tag) {
      this.form.tags.splice(this.form.tags.indexOf(tag), 1)
    },
    showInput () {
      this.inputVisible = true
      this.$nextTick(_ => {
        this.$refs.saveTagInput.$refs.input.focus()
      })
    },
    handleInputConfirm () {
      const inputValue = this.inputValue
      if (inputValue) {
        this.form.tags.push(inputValue)
      }
      this.inputVisible = false
      this.inputValue = ''
    },
    handleSave () {
      this.$refs.ruleForm.validate(async valid => {
        if (valid) {
          await this.add()
          this.dialogFormVisible = false
        }
      })
    },
    handlerClosed () {
      this.form = {
        name: '',
        tags: [],
        desc: ''
      }
      this.loading = false
    },
    handleEdit (index, row) {
      this.form = this.cloneObjectFn(row)
      this.dialogFormVisible = true
    },
    handleDelete (index, row) {
      this.$confirm('确认删除 ' + row.name + ' ?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(async () => {
          try {
            const res = await this.$http.post(this.urls.delDishType, this.$qs.stringify({ _id: row._id }))
            if (res.status !== 200) return this.$message.error(res.data.msg)
            this.$message.success(res.data.msg)
            this.tableData.splice(this.tableData.indexOf(row), 1)
          } catch (e) {
            console.log(e)
          }
        })
        .catch(() => {})
    },
    handleCurrentChange (currentPage) {
      this.currentPage = currentPage
      this.queryTypeInfo()
    },
    async queryTypeInfo () {
      if (Math.ceil(this.tempData.length / this.pageSize) >= this.currentPage && this.tempData.length !== 0) {
        this.tableData = this.tempData.slice((this.currentPage - 1) * this.pageSize, this.currentPage * this.pageSize)
        return
      }
      try {
        const dishTypeInfo = await this.$http.post(this.urls.queryDishType + '?page=' + this.currentPage)
        this.tableData = dishTypeInfo.data.data.data
        this.total = dishTypeInfo.data.data.total
      } catch (e) {
        console.log(e)
      }
    },
    cloneObjectFn (obj) {
      return JSON.parse(JSON.stringify(obj))
    },
    table_index (index) {
      return (this.currentPage - 1) * this.pageSize + index + 1
    }
  },
  created () {
    this.queryTypeInfo()
  }
}
</script>

<style>
.el-tag + .el-tag {
  margin-left: 10px;
}
.button-new-tag {
  margin-left: 10px;
  height: 32px;
  line-height: 30px;
  padding-top: 0;
  padding-bottom: 0;
}
.input-new-tag {
  width: 90px;
  margin-left: 10px;
  vertical-align: bottom;
}
.fy {
  text-align: center;
  margin-top: 30px;
}
</style>
