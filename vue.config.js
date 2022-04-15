module.exports = {
  publicPath: './',
  outputDir: 'dist',
  lintOnSave: true,
  runtimeCompiler: true, // 关键点在这
  // 调整内部的 webpack 配置。
  // 查阅 https://github.com/vuejs/vue-doc-zh-cn/vue-cli/webpack.md
  chainWebpack: () => {},
  configureWebpack: () => {},
  // 配置 webpack-dev-server 行为。
  devServer: {
    open: process.platform === 'darwin',
    host: '0.0.0.0',
    port: 8080,
    https: false,
    hotOnly: false,
    // 查阅 https://github.com/vuejs/vue-doc-zh-cn/vue-cli/cli-service.md#配置代理
    proxy: {
        '/city': {
          target:'https://restapi.amap.com/v3', // 你请求的第三方接口
          changeOrigin:true, // 在本地会创建一个虚拟服务端，然后发送请求的数据，并同时接收请求的数据，这样服务端和服务端进行数据的交互就不会有跨域问题
          pathRewrite:{
            '^/city': ''  // 替换target中的请求地址，也就是说以后你在请求http://api.weatherdt.com/common/XXXXX这个地址的时候直接写成/api即可。
          }
        },
        '/ip': {
          target:'https://www.taobao.com/help/getip.php', // 你请求的第三方接口
          changeOrigin:true, // 在本地会创建一个虚拟服务端，然后发送请求的数据，并同时接收请求的数据，这样服务端和服务端进行数据的交互就不会有跨域问题
          pathRewrite:{
            '^/ip': ''  // 替换target中的请求地址，也就是说以后你在请求http://api.weatherdt.com/common/XXXXX这个地址的时候直接写成/api即可。
          }
        },
        '/weather': {
          target:'https://restapi.amap.com/v3/weather/weatherInfo', // 你请求的第三方接口
          changeOrigin:true, // 在本地会创建一个虚拟服务端，然后发送请求的数据，并同时接收请求的数据，这样服务端和服务端进行数据的交互就不会有跨域问题
          pathRewrite:{
            '^/weather': ''  // 替换target中的请求地址，也就是说以后你在请求http://api.weatherdt.com/common/XXXXX这个地址的时候直接写成/api即可。
          }
        }
        
      },
    before: app => {}
  }
}
