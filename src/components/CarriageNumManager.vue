<template>
  <div>
    <h3>车厢号管理</h3>
    <el-table :data="tableData">
      <el-table-column label="#" type="index" align="center" :index="table_index"></el-table-column>
      <el-table-column label="车次号" prop="train_num" align="center"></el-table-column>
      <el-table-column label="车厢号" prop="carriage_num" align="center"></el-table-column>
      <el-table-column label="座位号" prop="seat_num" align="center"></el-table-column>
      <el-table-column label="小程序码">
        <template slot-scope="scope">
          <el-image
            shape="square"
            class="dish-img"
            v-if="tableData[scope.$index].imgUrl"
            :src="tableData[scope.$index].imgUrl"
            :preview-src-list="[tableData[scope.$index].imgUrl]"
          ></el-image>
        </template>
      </el-table-column>

      <el-table-column align="right">
        <template slot="header">
          <el-button type="primary" size="small" @click="dialogFormVisible = true">生成小程序码</el-button>
        </template>
        <template slot-scope="scope">
          <el-button size="mini" type="danger" @click="handleDelete(scope.$index, scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog title="小程序生成" :visible.sync="dialogFormVisible" @close="handlerClosed">
      <el-form :model="form" :rules="rules" ref="ruleFormRef">
        <el-form-item label="车次号" :label-width="formLabelWidth" prop="train_num">
          <el-input v-model="form.train_num" placeholder="车次号" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="车厢号" :label-width="formLabelWidth" prop="carriage_num">
          <el-input v-model="form.carriage_num" placeholder="车厢号" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="座位号" :label-width="formLabelWidth" prop="seat_num">
          <el-input v-model="form.seat_num" placeholder="座位号" autocomplete="off"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取 消</el-button>
        <el-button type="primary" @click="genPic">确 定</el-button>
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
      tableData: [],
      currentPage: 1,
      formLabelWidth: '100px',
      dialogFormVisible: false,
      form: {
        carriage_num: '',
        seat_num: '',
        train_num: ''
      },
      rules: {
        carriage_num: [{ required: true, message: '请输入车厢号', trigger: 'blur' }],
        seat_num: [{ required: true, message: '请输入座位号', trigger: 'blur' }],
        train_num: [{ required: true, message: '请输入车次号', trigger: 'blur' }]
      },
      total: 0,
      pageSize: 10
    }
  },
  methods: {
    async genPic () {
      try {
        const res = await this.$http.post(this.urls.genWxcode, this.$qs.stringify(this.form))
        console.log(res.data)
        if (res.status !== 200) return this.$message.error(res.data.msg)
        this.tableData.unshift(res.data.data)
        this.$message.success(res.data.msg)
      } catch (e) {
        console.log(e)
      }
      this.dialogFormVisible = false
    },
    handleCurrentChange (currentPage) {
      this.currentPage = currentPage
      this.queryPic()
    },
    async queryPic () {
      try {
        const res = await this.$http.post(this.urls.queryWxcode + '?page=' + this.currentPage)
        if (res.status !== 200) return this.$message.error(res.data.msg)
        this.tableData = res.data.data.data
        this.total = res.data.data.total
      } catch (e) {
        console.log(e)
      }
    },
    handlerClosed () {
      this.form = {
        carriage_num: '',
        seat_num: '',
        train_num: ''
      }
    },
    handleDelete (index, row) {
      this.$confirm(`确认删除 "${row.carriage_num}" 车厢 "${row.seat_num}" 座位号的小程序码?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(async () => {
          try {
            const res = await this.$http.post(this.urls.delWxcode, this.$qs.stringify({ _id: row._id }))
            if (res.status !== 200) return this.$message.error(res.data.msg)
            this.$message.success(res.data.msg)
            // this.queryPic()
            this.tableData.splice(index, 1)
          } catch (e) {
            console.log(e)
            this.$message.error('服务器开小差了，请稍后再试！')
          }
        })
        .catch(() => {})
    },
    table_index (index) {
      return (this.currentPage - 1) * this.pageSize + index + 1
    }
  },
  created () {
    this.queryPic()
  }
}
</script>

<style>
</style>
