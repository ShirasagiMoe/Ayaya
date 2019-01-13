// env: node
var webpack = require("webpack");
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const extractTextPlugin = require("extract-text-webpack-plugin");
const GitRevisionPlugin = require('git-revision-webpack-plugin');
const GitRevision = new GitRevisionPlugin();

module.exports = function (options) {
    delete options.entry.bundle;
    options.devtool = 'cheap-module-source-map';
    options.plugins = [
        new extractTextPlugin("[name].css"),
        new webpack.DefinePlugin({
            AYAYA_VERSION: `"${require('../package.json').version}"`,
            GIT_HASH: JSON.stringify(GitRevision.version())
        })
    ];
    options.plugins.unshift(new webpack.LoaderOptionsPlugin({
        minimize: true,
        debug: false
    }));
    options.optimization = {
        minimizer: [
            // we specify a custom UglifyJsPlugin here to get source maps in production
            new UglifyJsPlugin({
                cache: true,
                parallel: true,
                uglifyOptions: {
                    compress: false,
                    ecma: 6,
                    mangle: true
                },
                sourceMap: true
            })
        ]
    };
    return options;
};
