const path = require('path'),
    webpack = require('webpack'),
    htmlWebpackPlugin = require('html-withimg-loader'),
    extractTextPlugin = require('extract-text-webpack-plugin');

const options = {
    entry: {
        'MPlayer': './src/player.js'
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
                test: /\.(png|jpg|gif|jpeg)$/,
                loader: 'file-loader',
                query: {
                    name: 'assets/images/[name].[ext]'
                }
            }, {
                test: /\.(woff|woff2|svg|eot|ttf)\??.*$/,
                use: ['file-loader?name=/assets/fonts/[name].[ext]&']
            }
        ]
    },
    resolve: {
        modules: ['node_modules'],
        extensions: ['.js', '.scss']
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: '[name].[chunkhash:8].js',
        library: '[name]',
        libraryTarget: 'umd',
        umdNamedDefine: true,
        libraryExport: "default",
        publicPath: '/'
    },
    plugins: [
        new webpack.HotModuleReplacementPlugin(),
    ],
    devServer: {
        contentBase: path.join(__dirname, 'dist/'),
        compress: true,
        port: 9000,
        hot: true,
        open: true,
        inline:true,
        progress:true,
    }
};

module.exports = function (env) {
    return require('./.webpack/' + (env === 'prod' ? 'prod' : 'dev') + '.js')(options);
};