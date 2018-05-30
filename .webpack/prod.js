// env: node
var webpack = require("webpack");
const extractTextPlugin = require("extract-text-webpack-plugin");

module.exports = function (options) {
    delete options.entry.bundle;
    options.devtool = 'cheap-module-source-map';
    options.plugins = [
        new extractTextPlugin("[name].css"),
    ];
    options.plugins.unshift(new webpack.LoaderOptionsPlugin({
        minimize: true,
        debug: false
    }));
    options.plugins.unshift(new webpack.optimize.UglifyJsPlugin({
        beautify: false,
        mangle: { screw_ie8: true },
        compress: { screw_ie8: true, warnings: false },
        comments: false,
        ascii_only: true,
        sourceMap: true
    }));
    return options;
};
