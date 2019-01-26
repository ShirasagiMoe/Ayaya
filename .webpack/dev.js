const extractTextPlugin = require("extract-text-webpack-plugin");
module.exports = function (options) {
    // delete options.entry.bundle;
    options.output.filename = '[name].[chunkhash:8].js';
    options.devtool = 'cheap-module-source-map';
    options.plugins[0] = new extractTextPlugin("[name].[chunkhash:8].css");
    return options;
};
