var path = require('path');

module.exports = {
  context: path.join(__dirname, '../app/web/private/frontend/js'),
  entry: path.join(__dirname, '../app/web/private/frontend/js/index.js'),
  output: {
    path: path.join(__dirname, '../app/web/public/bundles'),
    publicPath: '/static/bundles/',
    filename: 'bundle.js'
  },
  resolve: {
    alias: {}
  },
  module: {
    loaders: []
  },
  plugins: []
};