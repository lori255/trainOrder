<template>
  <div>
    <h3>菜品管理</h3>
    <el-table :data="tableData">
      <el-table-column label="#" type="index" align="center" :index="table_index"></el-table-column>
      <el-table-column label="菜品图片">
        <template slot-scope="scope">
          <el-image
            shape="square"
            class="dish-img"
            v-if="scope.row.img"
            :src="scope.row.img[0].url"
            :preview-src-list="[scope.row.img[0].url]"
          ></el-image>
        </template>
      </el-table-column>
      <el-table-column label="菜品名称" prop="name"></el-table-column>
      <el-table-column label="菜品价格" prop="price"></el-table-column>
      <el-table-column label="菜品类目" prop="type"></el-table-column>
      <el-table-column label="菜品单位" prop="unit"></el-table-column>
      <el-table-column label="菜品标签">
        <template slot-scope="scope">
          <el-tag :key="tag" v-for="tag in scope.row.tags">{{ tag }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="菜品描述" prop="desc"></el-table-column>
      <el-table-column label="上架情况"
      :filters="[{ text: '已上架', value: true }, { text: '未上架', value: false }]"
      :filter-method="filterTag"
      filter-placement="bottom-end">
        <template slot-scope="scope">
          <el-tag
          :type='scope.row.isOnSale?"success":"danger"'>
          {{ scope.row.isOnSale?'已上架':'未上架' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column align="right">
        <template slot="header">
          <el-button type="primary" size="small" @click="dialogFormVisible = true">添加菜品</el-button>
        </template>
        <template slot-scope="scope">
          <el-button size="mini" @click="handleEdit(scope.$index, scope.row)">编辑</el-button>
          <el-button size="mini" type="danger" @click="handleDelete(scope.$index, scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog @open="handleOpen" title="菜品管理" :visible.sync="dialogFormVisible" @close="handlerClosed">
      <el-form :model="form" :rules="rules" ref="ruleFormRef">
        <el-form-item label="名称" :label-width="formLabelWidth" prop="name"><el-input v-model="form.name" autocomplete="off"></el-input></el-form-item>
        <el-form-item label="价格" :label-width="formLabelWidth" prop="price">
          <el-input style="width: 30%; min-width: 3.125rem;" v-model="form.price" placeholder="价格" autocomplete="off"></el-input>
          /
          <el-input style="width: 20%; min-width: 3.125rem;" v-model="form.unit" placeholder="单位" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="类目" :label-width="formLabelWidth" prop="type">
          <el-select v-model="form.type" placeholder="请选择类目">
            <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value"></el-option>
          </el-select>
        </el-form-item>
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
        <el-form-item label="图片" :label-width="formLabelWidth" prop="dishImg">
          <el-upload
            ref="imgUpload"
            accept=".jpg,.png,.jpeg,.webp"
            name="file"
            list-type="picture-card"
            :auto-upload="false"
            :action="urls.upload"
            :multiple="false"
            :show-file-list="true"
            :on-success="handleSuccess"
            :before-upload="beforeUpload"
            :on-preview="handlePreview"
            :on-remove="handleRemove"
            :on-error="handleError"
            :on-change="handleChange"
            :file-list="form.img"
            :on-progress="handleProgress"
          >
            <i class="el-icon-upload"></i>
          </el-upload>
        </el-form-item>
        <el-form-item label="是否上架" :label-width="formLabelWidth">
          <el-switch
            v-model="form.isOnSale">
          </el-switch>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取 消</el-button>
        <el-button type="primary" @click="handleSave" :loading="loading">确 定</el-button>
      </div>
    </el-dialog>
    <el-pagination class="fy" :page-size="pageSize" background layout="prev, pager, next" :total="total" @current-page="currentPage" @current-change="handleCurrentChange"></el-pagination>
  </div>
</template>

<script>
export default {
  data () {
    var validateImg = (rule, value, callback) => {
      if (value === undefined && this.form.img.length === 0) {
        callback(new Error('请上传图片'))
      } else {
        callback()
      }
    }
    return {
      loading: false,
      inputVisible: false,
      inputValue: '',
      tableData: [],
      dialogFormVisible: false,
      form: {
        name: '',
        price: '',
        type: '',
        unit: '',
        img: [],
        tags: [],
        desc: '',
        isOnSale: true
      },
      formLabelWidth: '100px',
      rules: {
        name: [{ required: true, message: '请输入菜品名称', trigger: 'blur' }],
        price: [{ required: true, message: '请输入菜品价格和单位', trigger: 'blur' }],
        unit: [{ required: true, message: '请输入菜品单位', trigger: 'blur' }],
        type: [{ required: true, message: '请选择菜品类型', trigger: ['change'] }],
        dishImg: [{ validator: validateImg, trigger: 'change' }]
      },
      currentPage: 1,
      total: 0,
      pageSize: 10,
      options: [],
      value: ''
    }
  },
  methods: {
    async add () {
      this.loading = true
      let url = this.urls.uploadDish
      const index = this.tableData
        .map(obj => {
          return obj._id
        })
        .indexOf(this.form._id)
      if (index !== -1) {
        url = this.urls.updateDish
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
        this.$message.error('服务器开小差了，请稍后再试！')
      }
      this.dialogFormVisible = false
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
      this.$refs.ruleFormRef.validate(async valid => {
        if (valid) {
          if (this.form.img.length === 0) this.$refs.imgUpload.submit()
          else this.add()
        } else { return false }
      })
    },
    handlerClosed () {
      this.form = {
        name: '',
        price: '',
        type: '',
        unit: '',
        img: [],
        tags: [],
        desc: '',
        isOnSale: true
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
            const res = await this.$http.post(this.urls.delDish, this.$qs.stringify({ _id: row._id }))
            if (res.status !== 200) return this.$message.error(res.data.msg)
            this.$message.success(res.data.msg)
            this.tableData.splice(index, 1)
          } catch (e) {
            console.log(e)
            this.$message.error('服务器开小差了，请稍后再试！')
          }
        })
        .catch(() => {})
    },
    async queryDishInfo () {
      try {
        const dishInfo = await this.$http.post(this.urls.queryDish + '?page=' + this.currentPage)
        this.tableData = dishInfo.data.data.data
        this.total = dishInfo.data.data.total
      } catch (e) {
        console.log(e)
        this.$message.error('服务器开小差了，请稍后再试！')
      }
    },
    cloneObjectFn (obj) {
      return JSON.parse(JSON.stringify(obj))
    },
    handleSuccess (res, file) {
      this.loading = false
      this.form.img.push({ url: res.data.imgurl, uid: file.uid })
      this.add()
    },
    beforeUpload (file) {
      const allowType = ['image/jpg', 'image/jpeg', 'image/png', 'image/webp']
      const isJPG = allowType.indexOf(file.type) !== -1
      if (!isJPG) {
        this.$message.error('上传文件必须是图片格式')
      }
      return isJPG
    },
    handleRemove (file, fileList) {
      this.form.img = []
      if (fileList.length === 0) {
        this.rules.dishImg = [{ required: true, message: '请上传图片', trigger: 'change' }]
      }
    },
    handleChange (file, fileList) {
      if (fileList.length === 1) {
        const { dishImg, ...data } = this.rules
        this.rules = data
      }
      this.$refs.ruleFormRef.clearValidate('dishImg')
    },
    handlePreview (file) {
      this.dialogImageUrl = file.url
      this.dialogVisible = true
    },
    handleError (err, file, fileList) {
      console.log(err)
      this.$message.error('图片上传失败！')
      this.loading = false
    },
    handleProgress (event, file, fileList) {
      this.loading = true
    },
    handleOpen () {
      this.queryDishType()
    },
    async queryDishType () {
      try {
        const dishTypeInfo = await this.$http.post(this.urls.queryDishType + '?page=' + this.currentPage)
        var options = []
        dishTypeInfo.data.data.data.forEach(function (type) {
          options.push({ value: type.name, label: type.name })
        })
        this.options = options
      } catch (e) {
        console.log(e)
        this.$message.error('服务器开小差了，请稍后再试！')
      }
    },
    handleCurrentChange (currentPage) {
      this.currentPage = currentPage
      this.queryDishInfo()
    },
    filterTag (value, row) {
      return row.isOnSale === value
    },
    table_index (index) {
      return (this.currentPage - 1) * this.pageSize + index + 1
    }
  },
  created () {
    this.queryDishInfo()
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
.dish-img {
  max-width: 70px;
  myimg: expression_r(onload=function(){this.style.width=(this.offsetWidth > 70) ? '70px': 'auto'});
}
</style>
