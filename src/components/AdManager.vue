<template>
  <div>
    <h3>广告管理</h3>
    <el-table :data="tableData">
      <el-table-column label="#" type="index" align="center" :index="table_index"></el-table-column>
      <el-table-column label="广告标题" prop="title"></el-table-column>
      <el-table-column label="广告描述" prop="desc"></el-table-column>
      <el-table-column label="广告链接" prop="url"></el-table-column>
      <el-table-column label="广告图片">
        <template slot-scope="scope">
       <el-image
            shape="square"
            class="img"
            v-if="scope.row.img"
            :src="scope.row.img[0].url"
            :preview-src-list="scope.row.img.map(item=>{return item.url})"
          ></el-image>
        </template>
      </el-table-column>
      <el-table-column label="启动情况"
      :filters="[{ text: '已启动', value: true }, { text: '未启动', value: false }]"
      :filter-method="filterTag"
      filter-placement="bottom-end">
        <template slot-scope="scope">
          <el-tag
          :type='scope.row.isPlay?"success":"danger"'>
          {{ scope.row.isPlay?'已启动':'未启动' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column align="right">
        <template slot="header">
          <el-button type="primary" size="small" @click="dialogFormVisible = true">添加广告</el-button>
        </template>
        <template slot-scope="scope">
          <el-button size="mini" @click="handleEdit(scope.$index, scope.row)">编辑</el-button>
          <el-button size="mini" type="danger" @click="handleDelete(scope.$index, scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog title="广告管理" :visible.sync="dialogFormVisible" @close="handlerClosed">
      <el-form :model="form" :rules="rules" ref="ruleFormRef">
        <el-form-item label="标题" :label-width="formLabelWidth" prop="title"><el-input v-model="form.title" autocomplete="off"></el-input></el-form-item>
        <el-form-item label="描述" :label-width="formLabelWidth" prop="desc">
          <el-input v-model="form.desc" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="链接" :label-width="formLabelWidth" prop="url">
          <el-input v-model="form.url" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="图片" :label-width="formLabelWidth" prop="adImg">
          <el-upload
            ref="imgUpload"
            accept=".jpg,.png,.jpeg,.webp"
            name="file"
            list-type="picture-card"
            :auto-upload="false"
            :action="urls.upload"
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
        <el-form-item label="是否启动" :label-width="formLabelWidth">
          <el-switch
            v-model="form.isPlay">
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
        title: '',
        desc: '',
        url: '',
        img: [],
        isPlay: true
      },
      formLabelWidth: '100px',
      rules: {
        title: [{ required: true, message: '请输入广告标题', trigger: 'blur' }],
        desc: [{ required: true, message: '请输入广告描述', trigger: 'blur' }],
        url: [{ required: true, message: '请选择广告链接', trigger: 'blur' }],
        adImg: [{ validator: validateImg, trigger: 'change' }]
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
      let url = this.urls.genAd
      const index = this.tableData
        .map(obj => {
          return obj._id
        })
        .indexOf(this.form._id)
      if (index !== -1) {
        url = this.urls.updateAdInfo
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
        title: '',
        desc: '',
        url: '',
        img: [],
        isPlay: true
      }
      this.loading = false
    },
    handleEdit (index, row) {
      this.form = this.cloneObjectFn(row)
      this.dialogFormVisible = true
    },
    handleDelete (index, row) {
      this.$confirm('确认删除 ' + row.title + ' ?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(async () => {
          try {
            const res = await this.$http.post(this.urls.delAd, this.$qs.stringify({ _id: row._id }))
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
    async queryAdInfo () {
      try {
        const dishInfo = await this.$http.post(this.urls.queryAdInfo + '?page=' + this.currentPage)
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
        this.rules.adImg = [{ required: true, message: '请上传图片', trigger: 'change' }]
      }
    },
    handleChange (file, fileList) {
      if (fileList.length >= 1) {
        const { adImg, ...data } = this.rules
        this.rules = data
      }
      this.$refs.ruleFormRef.clearValidate('adImg')
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
    handleCurrentChange (currentPage) {
      this.currentPage = currentPage
      this.queryAdInfo()
    },
    filterTag (value, row) {
      return row.isPlay === value
    },
    table_index (index) {
      return (this.currentPage - 1) * this.pageSize + index + 1
    }
  },
  created () {
    this.queryAdInfo()
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
.img {
  max-width: 70px;
  myimg: expression_r(onload=function(){this.style.width=(this.offsetWidth > 70) ? '70px': 'auto'});
}
</style>
