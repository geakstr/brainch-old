'use strict';

var utils = require('common/utils');

module.exports = utils.is.browser() ? require('frontend/app') : require('api/app');