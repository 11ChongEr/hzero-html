const path = require('path');
const webpack = require('webpack');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const FriendlyErrorsWebpackPlugin = require('friendly-errors-webpack-plugin');
const WebpackBar = require('webpackbar');
const paths = require('./paths');

const theme = require('./theme');

const common = [
  'react',
  'react-dom',
  'dva',
  'dva/router',
  'dva/saga',
  'dva/fetch',
  'hzero-ui',
  '@babel/polyfill',
  'core-js',
];

const vendors = [
  'lodash',
  'lodash-decorators',
  'react-intl-universal',
  'uuid/v4',
  'numeral',
  'react-cropper',
  'cropperjs',
  'codemirror',
  'jsplumb',
  'react-codemirror2',
  'react-dnd',
  'react-dnd-html5-backend',
  'react-viewer',
  '@tinymce/tinymce-react',
];

const vendorsGraph = [
  'bizcharts',
  '@antv/data-set',
];

const vendersTinymcePlugins = [
  'tinymce/plugins/paste',
  'tinymce/plugins/link',
  'tinymce/plugins/table',
  'tinymce/plugins/image',
  'tinymce/plugins/imagetools',
  'tinymce/plugins/preview',
  'tinymce/plugins/code',
  'tinymce/plugins/codesample',
  'tinymce/plugins/textcolor',
  'tinymce/plugins/fullscreen',
  'tinymce/plugins/lists',
  'tinymce/plugins/template',
  'tinymce/plugins/searchreplace',
  'tinymce/plugins/print',
];

module.exports = {
  mode: 'production',
  performance: {
    hints: false,
  },
  output: {
    path: paths.appDll,
    publicPath: paths.servedPath,
    filename: '[name].[hash].dll.js',
    library: '[name]_[hash]',
  },
  entry: {
    common,
    vendors,
    vendors_graph: vendorsGraph,
    venders_tinymce_plugins: vendersTinymcePlugins,
  },
  module: {
    strictExportPresence: true,
    rules: [
      {
        test: /\.less$/,
        use: [
          {
            loader: "style-loader"
          },
          {
            loader: "css-loader",
            options: {
              importLoaders: 1
            }
          },
          {
            loader: "less-loader",
            options: {
              modifyVars: theme,
              javascriptEnabled: true
            }
          }
        ]
      },
      {
        test: /\.(js|mjs|jsx|ts|tsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            'presets': [
              'react-app'
            ],
            'plugins': [
              [
                'import',
                {
                  'libraryName': 'hzero-ui',
                  'libraryDirectory': 'es',
                  'style': true
                },
                'ant'
              ],
              [
                '@babel/plugin-proposal-decorators', // 启用装饰器
                {
                  'legacy': true
                }
              ],
              [
                '@babel/plugin-proposal-class-properties',
                {
                  'loose': true
                }
              ],
            ]
          },
        },
      },
    ],
  },
  plugins: [
    new CleanWebpackPlugin([paths.appDll], {
      root: paths.appPath, // 根目录
      verbose: true, // 开启在控制台输出信息
      dry: false, // 启用删除文件
    }),
    new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
    new FriendlyErrorsWebpackPlugin(),
    new WebpackBar(),
    new webpack.DllPlugin({
      path: path.join(paths.appDll, '[name].manifest.json'),
      name: '[name]_[hash]',
    }),
  ],
};
