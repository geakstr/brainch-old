var path = require('path');

module.exports = {
  configs: {
    webpack: {
      web: {
        frontend: require('./webpack.web.frontend.js')
      }
    }
  },
  paths: {
    app: {
      web: {
        private: {
          backend: {
            js: {
              es6: path.join(process.cwd(), 'app/web/private/backend/js/es6'),
              es5: path.join(process.cwd(), 'app/web/private/backend/js/es5')
            },
            views: path.join(process.cwd(), 'app/web/private/backend/views')
          },
          frontend: {
            js: path.join(process.cwd(), 'app/web/private/frontend/js'),
            stylus: path.join(process.cwd(), 'app/web/private/frontend/stylus')
          }
        },
        public: {
          css: path.join(process.cwd(), 'app/web/public/css')
        }
      }
    }
  }
};