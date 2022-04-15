<template>
  <div>
    <h3>菜单类目</h3>
    <div class="auto-refresh">
      <span>自动刷新：</span>
      <el-switch v-model="autoRefresh" @change="changeAutoRefresh" active-color="#13ce66" />
    </div>
    <el-table
      :data="tableData.filter(data => !search || data.receiver_name.toLowerCase().includes(search.toLowerCase()) || data.receiver_phone.includes(search))"
      style="width: 100%"
    >
      <el-table-column type="expand" prop="">
        <template slot-scope="props">
          <el-form label-position="left" inline class="goods-form">
            <el-form-item :key="good.name" v-for="good in props.row.goods" :label="good.name">
              <span>{{ good.select_count }} {{ good.unit }}</span>
            </el-form-item>
            <el-form-item label="总价格" style="color: red;">
              <span>￥{{ props.row.total_amount }}</span>
            </el-form-item>
          </el-form>
        </template>
      </el-table-column>
      <el-table-column label="#" type="index" align="center" :index="table_index"></el-table-column>
      <el-table-column label="订单号" prop="cid"></el-table-column>
      <el-table-column label="下单时间" prop="create_time"></el-table-column>
      <el-table-column label="车厢号" prop="receiver_carriage_num" align="center"></el-table-column>
      <el-table-column label="座位号" prop="receiver_seat_num" align="center"></el-table-column>
      <el-table-column label="顾客姓名" prop="receiver_name"></el-table-column>
      <el-table-column label="手机号" prop="receiver_phone"></el-table-column>
      <el-table-column label="备注" prop="note"></el-table-column>
      <el-table-column label="状态" :filters="status" :filter-method="filterTag" filter-placement="bottom-end">
        <template slot-scope="scope">
          <!-- 订单状态：0->待发货；1->已发货；2->已完成；3->已关闭；4->无效订单 -->
          <el-tag :type="status[scope.row.status].type">{{ status[scope.row.status].text }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column align="left">
        <template slot="header" slot-scope="{}">
          <el-input v-model="search" size="mini" placeholder="手机号/姓名" />
        </template>
        <template slot-scope="scope">
          <el-button size="mini" type="primary" @click="handleSend(scope.$index, scope.row)">{{ scope.row.status == 0 ? '发货' : '查看' }}</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination
      class="fy"
      :page-size="pageSize"
      background
      layout="prev, pager, next"
      :total="total"
      @current-page="currentPage"
      @current-change="handleCurrentChange"
    ></el-pagination>

    <el-dialog title="流程查看" :visible.sync="dialogFormVisible">
      <el-timeline>
          <el-timeline-item
            v-for="(activity, index) in activities"
            :key="index"
            :timestamp="activity.timestamp">
            {{activity.content}}
          </el-timeline-item>
        </el-timeline>
        <div slot="footer" class="dialog-footer">
          <el-button @click="dialogFormVisible = false" type="primary">确 认</el-button>
        </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data () {
    return {
      tableData: [],
      search: '',
      currentPage: 1,
      total: 0,
      pageSize: 10,
      autoRefresh: true,
      timer: null,
      dialogFormVisible: false,
      rowIndex: 0,
      // success/info/warning/danger
      status: [
        { text: '待发货', type: 'danger', value: 0 },
        { text: '已发货', type: 'success', value: 1 },
        { text: '已完成', type: 'info', value: 2 },
        { text: '已关闭', type: 'info', value: 3 },
        { text: '无效订单', type: 'info', value: 4 }
      ],
      activities: []
    }
  },
  watch: {
    tableData () {
      if (this.autoRefresh) {
        this.setTimer()
      }
    }
  },
  methods: {
    async handleSend (index, row) {
      this.rowIndex = index
      if (row.status === 0) {
        this.$confirm('确认发货 ?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
          .then(async () => {
            try {
              if (row.status === 0) {
                // 门店名称	{{thing6.DATA}}
                // 订单号码 {{character_string1.DATA}}
                // 点餐内容 {{thing2.DATA}}
                // 订单状态 {{phrase5.DATA}}
                // 消费金额 {{amount10.DATA}}
                let goodStr = ''
                row.goods.forEach(item => {
                  goodStr += item.name + 'X' + item.select_count + '\n'
                })
                if (goodStr.length > 10) {
                  goodStr = goodStr.substring(0, 16) + '...'
                }
                const message = {
                  shop_name: row.shop_info.name,
                  order_id: row.cid,
                  goods: goodStr,
                  status: this.status[row.status].text,
                  amount: row.total_amount + '元'
                }
                const orderinfo = await this.$http.post(this.urls.updateOrder, this.$qs.stringify({ _id: row._id, status: 1, touser: row.OPENID, message: message }))
                if (orderinfo.status !== 200) return this.$message.error(orderinfo.data.msg)
                row.status = orderinfo.data.data.status
                this.$message.success(orderinfo.data.msg)
              }
            } catch (e) {
              console.log(e)
            }
          })
          .catch(() => {})
      } else if (row.status !== 4) {
        this.activities = this.status.slice(0, row.status + 1)
        for (var i in this.activities) {
          switch (this.activities[i].value) {
            case 0: this.activities[i].timestamp = row.create_time; this.activities[i].content = '订单创建时间'; break
            case 1: this.activities[i].timestamp = this.dateFormat(row.delivery_time, 'Y-m-d H:i:s'); this.activities[i].content = '发货时间'; break
            case 2: this.activities[i].timestamp = this.dateFormat(row.receive_time, 'Y-m-d H:i:s'); this.activities[i].content = '收货时间'; break
            case 3: this.activities[i].timestamp = this.dateFormat(row.remark_time, 'Y-m-d H:i:s'); this.activities[i].content = '订单关闭时间'; break
          }
        }
        this.dialogFormVisible = true
      } else {
        this.activities = [this.status[0], this.status.slice(-1)]
        this.activities[0].timestamp = row.create_time; this.activities[0].content = '订单创建时间'
        this.activities[1].timestamp = this.dateFormat(row.cancel_time, 'Y-m-d H:i:s'); this.activities[1].content = '订单取消时间'
        this.dialogFormVisible = true
      }
    },
    handleCurrentChange (currentPage) {
      this.currentPage = currentPage
      this.queryOrderinfo()
    },
    async queryOrderinfo () {
      try {
        const orderinfo = await this.$http.post(this.urls.queryOrderByUid + '?page=' + this.currentPage, null, { showLoading: false })
        if (orderinfo.status !== 200) return this.$message.error(orderinfo.data.msg)
        this.tableData = orderinfo.data.data.data
        this.tableData.map(item => {
          item.create_time = this.dateFormat(item.create_time, 'Y-m-d H:i:s')
          return item
        })
        this.total = orderinfo.data.data.total
      } catch (e) {
        console.log(e)
      }
    },
    dateFormat (timestamp, formats) {
      // formats格式包括
      // 1. Y-m-d
      // 2. Y-m-d H:i:s
      // 3. Y年m月d日
      // 4. Y年m月d日 H时i分
      formats = formats || 'Y-m-d'

      var zero = function (value) {
        if (value < 10) {
          return '0' + value
        }
        return value
      }

      var myDate = timestamp ? new Date(timestamp) : new Date()

      var year = myDate.getFullYear()
      var month = zero(myDate.getMonth() + 1)
      var day = zero(myDate.getDate())

      var hour = zero(myDate.getHours())
      var minite = zero(myDate.getMinutes())
      var second = zero(myDate.getSeconds())

      return formats.replace(/Y|m|d|H|i|s/gi, function (matches) {
        return {
          Y: year,
          m: month,
          d: day,
          H: hour,
          i: minite,
          s: second
        }[matches]
      })
    },
    setTimer () {
      this.timer = setTimeout(() => {
        this.queryOrderinfo()
      }, 3000)
    },
    changeAutoRefresh (checked) {
      console.log(checked)
      if (checked) {
        this.setTimer()
      } else {
        clearTimeout(this.timer)
      }
    },
    filterTag (value, row) {
      return row.status === value
    },
    table_index (index) {
      return (this.currentPage - 1) * this.pageSize + index + 1
    }
  },
  mounted () {
    this.queryOrderinfo()
  },
  destroyed () {
    clearTimeout(this.timer)
  }
}
</script>

<style>
.fy {
  text-align: center;
  margin-top: 1.875rem;
}
goods-form {
  font-size: 0;
}
.goods-form label {
  width: 6.25rem;
  color: #000000;
  align-items: center;
  margin-left: 6.25rem;
}
.goods-form .el-form-item {
  margin-right: 0;
  margin-bottom: 0;
  width: 50%;
}
.auto-refresh {
  float: right;
  margin-bottom: 0.625rem;
  color: #99a9bf;
}
</style>
