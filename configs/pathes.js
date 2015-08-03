var path = require('path');

module.exports = {
  configs: {
    web: {
      frontend: {
        dev: {
          webpack: require('./web/frontend/webpack.dev.js')
        },
        prod: {
          webpack: require('./web/frontend/webpack.prod.js')
        }
      }
    }
  },
  app: {
    common: {
      js: path.join(process.cwd(), 'app/common/js')
    },
    api: {
      js: path.join(process.cwd(), 'app/api/js')
    },
    web: {
      private: {
        backend: {
          js: path.join(process.cwd(), 'app/web/private/backend/js'),
          views: path.join(process.cwd(), 'app/web/private/backend/views'),
          tests: path.join(process.cwd(), 'app/web/private/backend/tests')
        },
        frontend: {
          js: path.join(process.cwd(), 'app/web/private/frontend/js'),
          stylus: path.join(process.cwd(), 'app/web/private/frontend/stylus'),
          tests: path.join(process.cwd(), 'app/web/private/frontend/tests')
        }
      },
      public: {
        css: path.join(process.cwd(), 'app/web/public/css')
      }
    }
  }
};