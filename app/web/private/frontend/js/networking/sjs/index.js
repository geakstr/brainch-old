'use strict';

require('script!browserchannel/dist/bcsocket');
var app = require('frontend/app');
var config = require('frontend/configs');
var sharejs = require('share/lib/client');

/*global BCSocket*/
module.exports = function(oninit, onopen) {
  app.api.sjs = new sharejs.Connection(new BCSocket(config.api.ws.url, {
    origin: '*',
    crossdomainXhr: true,
    reconnect: true
  }));
  oninit(onopen);
};