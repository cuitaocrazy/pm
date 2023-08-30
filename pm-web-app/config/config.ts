// https://umijs.org/config/
import { defineConfig } from 'umi';
import defaultSettings from './defaultSettings';
import proxy from './proxy';
import routes from './routes';

const { REACT_APP_ENV } = process.env;

export default defineConfig({
  publicPath: '/web/',
  outputPath: '/dist/web/',
  hash: true,
  antd: {},
  dva: {
    hmr: true,
  },
  layout: {
    name: 'Ant Design Pro',
    locale: true,
    siderWidth: 208,
    ...defaultSettings,
  },
  locale: {
    // default zh-CN
    default: 'zh-CN',
    antd: true,
    // default true, when it is true, will use `navigator.language` overwrite default
    baseNavigator: true,
  },
  dynamicImport: {
    loading: '@ant-design/pro-layout/es/PageLoading',
  },
  targets: {
    ie: 11,
  },
  // umi routes: https://umijs.org/docs/routing
  routes,
  // Theme for antd: https://ant.design/docs/react/customize-theme-cn
  theme: {
    'primary-color': defaultSettings.primaryColor,
  },
  esbuild: {},
  title: false,
  ignoreMomentLocale: true,
  proxy: proxy[REACT_APP_ENV || 'dev'],
  manifest: {
    basePath: '/',
  },
  // https://github.com/zthxxx/react-dev-inspector
  plugins: ['react-dev-inspector/plugins/umi/react-inspector'],
  inspectorConfig: {
    // loader options type and docs see below
    exclude: [],
    babelPlugins: [],
    babelOptions: {},
  },
  resolve: {
    includes: ['src/components'],
  },
  history: {
    type: 'hash',
  },
  chunks: process.env.NODE_ENV === 'production' ? ['vendors', 'umi'] : ['umi'],
  chainWebpack: function (config) {
    process.env.NODE_ENV === 'production' &&
    config.merge({
      optimization: {
        // https://webpack.docschina.org/plugins/split-chunks-plugin
        splitChunks: {
          chunks: 'all',
          // 生成块的最小大小（以字节为单位）
          minSize: 20000,
          // 最少共享次数
          minChunks: 3,
          // 生成名称的定界符
          automaticNameDelimiter: '.',
          cacheGroups: {
            vendor: {
              name: 'vendors',
              // `module.resource` contains the absolute path of the file on disk.
              test(module: any) {
                return /[\\/]node_modules[\\/]/.test(module.resource);
              },
              // 优先级
              priority: 10,
            },
          },
        },
      },
    });
  },
});
