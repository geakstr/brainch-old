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
  node: {
    process: false,
    global: false
  },
  resolve: {
    alias: {}
  },
  module: {
    loaders: []
  },
  plugins: [
    new webpack.optimize.DedupePlugin()
  ],
  devtool: 'sourcemap'
};