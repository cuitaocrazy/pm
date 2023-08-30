module.exports = {
  outputDir: '../pm-web-app/dist/mini',
  publicPath: '/mini/',
	productionSourceMap: false, //加速生产环境构建
  chainWebpack: config => {
    config
      .plugin('html')
      .tap(args => {
        args[0].title= '项目管理'
        return args
      })
  }
};