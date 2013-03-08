var app = require('cantina')
  , stow = require('stow')
  , CantinaBackend = require('./backend');

require('cantina-redis');
require('cantina-amino');

app.conf.add({
  cache: {
    prefix: [app.conf.get('redis:prefix') || 'cantina', 'cache'].join(':') + ':'
  }
});

app.on('init', function () {
  var options = app.conf.get('cache');
  if (!options.nodes) {
    options.client = app.redis;
  }
  options.amino = app.amino;
  app.cache = stow.createCache(CantinaBackend, options);
});