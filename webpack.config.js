/* eslint-disable */
const path = require('path'),
  webpack = require('webpack'),
  htmlWebpackPlugin = require('html-withimg-loader'),
  extractTextPlugin = require('extract-text-webpack-plugin'),
  GitRevisionPlugin = require('git-revision-webpack-plugin');
const colors = require('colors');
const GitRevision = new GitRevisionPlugin();

const options = {
  entry: {
    'Ayaya': './src/Ayaya.js',
    'bundle': './src/index.js'
  },
  module: {
    rules: [
      {
        test: /\.(sa|sc|c)ss$/,
        use: extractTextPlugin.extract({
          fallback: "style-loader",
          use: [
            "css-loader",
            {
              loader: "postcss-loader",
              options: {
                plugins: [
                  require("autoprefixer")({browsers: ["ie >= 9", "> 2%", "last 1 version"]})
                ]
              }
            },
            "sass-loader"
          ]
        })
      }, {
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        loader: require.resolve('babel-loader'),
        query: {
          presets: [
            'es2015'
          ]
        }
      }, {
        test: /\.(js|jsx)$/,
        loader: 'eslint-loader',
        exclude: /node_modules/,
        enforce: 'pre'
      }, {
        test: /\.(png|jpg|gif|jpeg)$/,
        loader: 'file-loader',
        query: {
          name: 'assets/images/[name].[ext]'
        }
      }, {
        test: /\.(woff|woff2s|eot|ttf)\??.*$/,
        use: ['file-loader?name=/assets/fonts/[name].[ext]&']
      }, {
        test: /\.svg$/,
        loader: 'svg-inline-loader'
      }, {
        test: /\.hbs$/,
        loader: "handlebars-loader"
      }
    ]
  },
  resolve: {
    modules: ['node_modules'],
    extensions: ['.js', '.scss']
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',
    library: '[name]',
    libraryTarget: 'umd',
    umdNamedDefine: true,
    libraryExport: "default",
    publicPath: '/'
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new webpack.DefinePlugin({
      AYAYA_VERSION: `"${require('./package.json').version}"`,
      GIT_HASH: JSON.stringify(GitRevision.version())
    })
  ],
  devServer: {
    after: function (app, server) {
      console.clear()
      console.log(':: Ayaya dev mode ::')
      console.log('[Command] -> System call: generate Ayaya element: #player')
      console.log('[Command] -> Call reply: object ID #01')
      console.log('[Command] -> System call: connect MediaSourceServer ..')
      console.log('[Command] -> System call: decode video codec/ac ...')
      console.log('[Command] -> System call: decode audio acc plist ...')
      console.log('[Command] -> System call: generate Ayaya UI Box arrow shape ...')
      console.log('[Generate] -> host: ', `http://${this.host}:${this.port}`.green)
      console.log('[Generate] -> ok')
    },
    noInfo: true,
    // clientLogLevel: 'none',
    contentBase: path.join(__dirname, ''),
    compress: true,
    port: 9000,
    open: false,
    // It's a required option.
    publicPath: "/assets",
    watchOptions: {
      aggregateTimeout: 300,
      poll: 1000,
    }
  }
};

module.exports = function (env) {
  return require('./.webpack/' + (env || 'prod') + '.js')(options);
};
