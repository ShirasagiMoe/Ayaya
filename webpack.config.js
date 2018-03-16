const path = require('path');
const webpack = require('webpack');
const ExtractTextPlugin = require("extract-text-webpack-plugin");

const options = {
    entry: {
        'MPlayer': './src/ayaya.js'
    },
    module: {
        rules: [
            {
                test: /\.(sa|sc|c)ss$/,
                use: ExtractTextPlugin.extract({
                    fallback: "style-loader",
                    use: [
                        "css-loader",
                        {
                            loader: "postcss-loader",
                            options: {
                                plugins: [
                                    require("autoprefixer")({ browsers: ["ie >= 9", "> 2%", "last 1 version"] })
                                ]
                            }
                        },
                        "sass-loader"
                    ]
                })
            }, {
                test: /\.js$/,
                exclude: /(node_modules|bower_components)/,
                loader: "babel-loader",
                options: {
                    cacheDirectory: true,
                    presets: ['env']
                }
            }, {
                test: /\.svg$/,
                loader: 'svg-inline-loader'
            }
        ]
    },
    resolve: {
        modules: ['node_modules'],
        extensions: ['.js', '.scss']
    },
    output: {
        path: path.resolve(__dirname, './dist'),
        filename: '[name].[chunkhash:8].js',
        library: '[name]',
        libraryTarget: 'umd',
        libraryExport: 'default',
        umdNamedDefine: true,
        publicPath: '/'
    },
    plugins: [
        new ExtractTextPlugin("[name].[contenthash:8].css")
    ],
    devServer: {
        compress: true,
        contentBase: path.resolve(__dirname, '..', 'demo'),
        clientLogLevel: 'none',
        quiet: false,
        open: true,
        historyApiFallback: {
            disableDotRule: true
        },
        watchOptions: {
            ignored: /node_modules/
        }
    },
};

module.exports = function (env) {
    return require('./.webpack/' + (env === 'prod' ? 'prod' : 'dev') + '.js')(options);
};