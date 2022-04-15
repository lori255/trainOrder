<template>
  <div class="container">
    <div class="row">
      <div class="col" style="width: 30%;"><h3>数据分析</h3></div>
      <div class="col" style="flex: auto;">
        <div class="info-box weather-info-box">
          <p v-if="weather.city" style="flex: auto; margin-left: 5%;">现在 {{weather.city}}，{{weather.weather}}，气温{{weather.temperature}}°，湿度{{weather.humidity}}，{{weather.winddirection}}风{{weather.windpower}}级</p>
          <span style="color: #CCCCCC; font-size: 5px; align-self: flex-end;">更新时间：{{weather.reporttime}}</span>
        </div>
      </div>
    </div>

    <div class="row">
      <div class="col" style="width: 30%;">
        <div class="info-box shop-info-box">
          <div class="title">门店基本信息</div>
          <table>
            <tr>
              <td>
                <div class="shop-name">{{ shopInfo.name }}</div>
              </td>
            </tr>
            <tr>
              <td><img src="../assets/images/device-gray.png" /></td>
              <td><img src="../assets/images/device-green.png" /></td>
              <td><img src="../assets/images/ding-dan.png" /></td>
            </tr>
            <tr>
              <td>
                <div class="liang-shu-zhi">{{ shopData.order.total }}</div>
              </td>
              <td>
                <div class="liang-shu-zhi">{{ shopData.order.today }}</div>
              </td>
              <td>
                <div class="liang-shu-zhi">{{ shopData.delivery.today }}</div>
              </td>
            </tr>
            <tr class="td-shu-zhi">
              <td>总订单量</td>
              <td>今日订单量</td>
              <td>今日发货量</td>
            </tr>
          </table>
        </div>
        <div class="info-box daily-info-box">
          <div class="title">本日热门菜品</div>
          <div id="daily-chart-box"></div>
        </div>
      </div>
      <div class="col" style="flex: auto;">
        <div class="info-box month-info-box">
          <div class="title">本月订单量变化</div>
          <div id="month-chart-box"></div>
        </div>
      </div>
    </div>

  </div>
</template>
<script>
const echarts = require('echarts')
export default {
  data () {
    return {
      monthEchart: null,
      dailyEchart: null,
      monthOption: {
        legend: {
          data: ['每日订单量'],
          textStyle: { fontSize: 12, color: '#fff' }
        },
        xAxis: {
          data: [],
          axisLabel: { margin: 10, interval: 0, textStyle: { fontSize: 12, color: '#fff' }, rotate: 40 }
        },
        yAxis: { axisLabel: { margin: 10, interval: 0, textStyle: { fontSize: 12, color: '#fff' } } },
        series: [
          {
            name: '每日订单量',
            type: 'line',
            data: []
          }
        ]
      },
      dailyOption: {
        legend: {
          data: ['日销量'],
          textStyle: { fontSize: 12, color: '#fff' }
        },
        xAxis: {
          axisLabel: { margin: 10, interval: 0, textStyle: { fontSize: 12, color: '#fff' } }
        },
        yAxis: {
          data: [],
          axisLabel: { margin: 10, interval: 0, textStyle: { fontSize: 12, color: '#fff' } }
        },
        series: [
          {
            name: '日销量',
            type: 'bar',
            data: []
          }
        ],
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        }
      },
      shopInfo: {},
      shopData: { order: { today: 0, total: 0 }, delivery: { today: 0 } },
      todayData: { todaySale: 0 },
      weather: {}
    }
  },
  methods: {
    initEchart () {
      // 1. 基于准备好的dom，初始化echarts实例
      this.monthEchart = echarts.init(document.getElementById('month-chart-box'))
      this.monthEchart.setOption(this.monthOption)

      this.dailyEchart = echarts.init(document.getElementById('daily-chart-box'))
      this.dailyEchart.setOption(this.dailyOption)
      this.getAnasData()
    },
    async getAnasData () {
      const res = await this.$http.get(this.urls.queryMonthSale)
      if (res.status !== 200) { return this.$message.err('服务器开小差了') }
      const anasData = res.data.data
      this.shopData.order.total = anasData.totalCount
      this.shopData.order.today = anasData.todayCount
      this.shopData.delivery.today = anasData.todayDelveryCount
      this.genDailyData(anasData.dayData.data)
      this.genMonthData(anasData.monthData)
    },

    genMonthData (data) {
      this.monthOption.xAxis.data = data.map(item => {
        return item.date
      })
      this.monthOption.series[0].data = data.map(item => {
        return item.count
      })
      this.monthEchart.setOption(this.monthOption)
    },

    genDailyData (data) {
      this.dailyOption.yAxis.data = data.map(item => {
        return item.name
      })
      this.dailyOption.series[0].data = data.map(item => {
        return item.monthSale
      })
      this.dailyEchart.setOption(this.dailyOption)
    },

    queryShopInfo () {
      this.shopInfo = JSON.parse(localStorage.getItem('shopInfo'))
    },
    async queryWeather () {
      try {
        var { data: ip } = await this.$http.get('/ip')
        ip = ip.match(/((2(5[0-5]|[0-4]\d))|[0-1]?\d{1,2})(\.((2(5[0-5]|[0-4]\d))|[0-1]?\d{1,2})){3}/g)[0]
        console.log(ip)
        var { data: res } = await this.$http.get('/city/ip?key=c9db43ca73f08b60603dcecd76d714df&ip=' + ip + '&type=4')
        console.log(res)
        var { data: weather } = await this.$http.get('/weather?key=c9db43ca73f08b60603dcecd76d714df&extensions=base&city=' + res.adcode)
        console.log(weather)
        this.weather = weather.lives[0]
      } catch (e) {
        console.log(e)
      }
    }
  },
  // DOM 渲染完成触发
  mounted () {
    this.initEchart()
    this.queryWeather()
  },
  created () {
    this.queryShopInfo()
  }
}
</script>

<style>
.container {
  color: #fffdef;
  background-color: #22284a;
  flex-direction: column;
  padding: 1.25rem;
  align-items: flex-start;
  justify-content: flex-start;
  box-sizing: border-box;
}
.col {
  height: 100%;
  display: flex;
  flex-direction: column;
}
.row {
  width: 100%;
  display: inline-flex;
}

#month-chart-box {
  width: 100%;
  height: 100%;
}
#daily-chart-box {
  width: 100%;
  height: 12.5rem;
}
.shop-info-box, .daily-info-box, .month-info-box , .sale-info-box, .weather-info-box{
  flex: auto;
}
.weather-info-box {
  display: flex;
  justify-content: center;
  align-items: center;
}
.container .info-box {
  padding: 0.3125rem;
  background-color: #181c41;
  border-radius: 0.5rem;
  margin: 0px 10px 20px 10px;
}
.container .info-box .title {
  color: #03c2ec;
  height: 4rem;
  line-height: 4rem;
  vertical-align: middle;
  padding-left: 10px;
  font-size: 16px;
  font-weight: 600;
  text-align: left;
}
.container .info-box table {
  width: 100%;
  padding: 0.625rem;
}
.container .info-box table td {
  width: 33.3%;
  text-align: center;
}
.container .info-box table td img {
  max-width: 85px;
  margin: 0 auto;
}
.container .info-box table td .shop-name {
  margin-bottom: 1.25rem;
  max-width: 360px;
  color: #fff;
  font-size: 18px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.container .info-box .td-shu-zhi {
  color: #fff;
  text-align: center;
  height: 20px;
  font-size: 15px;
}
.liang-shu-zhi {
  height: 3rem;
  line-height: 3rem;
  vertical-align: middle;
  color: #00a8fe;
  text-align: center;
  font-size: 25px;
  font-weight: 600;
}
</style>
