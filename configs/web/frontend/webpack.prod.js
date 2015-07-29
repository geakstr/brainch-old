var path = require('path');
var webpack = require('webpack');

module.exports = {
  context: path.join(process.cwd(), 'app/web/private/frontend/js'),
  entry: path.join(process.cwd(), 'app/web/private/frontend/js/index.js'),
  output: {
    path: path.join(process.cwd(), 'app/web/public/bundles'),
    publicPath: '/static/bundles/',
    filename: 'bundle.js'
  },
  resolve: {
    alias: {}
  },
  module: {
    loaders: []
  },
  plugins: [
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: true
      },
      sourceMap: false,
      mangle: true
    }),
    new webpack.optimize.DedupePlugin()
  ]
};