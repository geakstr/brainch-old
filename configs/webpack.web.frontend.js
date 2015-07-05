module.exports = {
  context: __dirname + '/../app/web/private/frontend/js',
  entry: __dirname + '/../app/web/private/frontend/js/index.js',
  output: {
    path: __dirname + '/../app/web/public/bundles',
    publicPath: '/static/bundles/',
    filename: 'bundle.js'
  },
  resolve: {
    alias: {}
  },
  module: {
    loaders: [{
      test: /\.jsx?$/,
      exclude: /(node_modules|bower_components)/,
      loader: 'babel'
    }],
  },
  plugins: []
};