var path = require('path');

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
  plugins: [],
  devtool: 'sourcemap'
};