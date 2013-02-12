var app = require('cantina')
  , stow = require('stow');

require('cantina-redis');

app.conf.add({
  cache: {
    prefix: [app.conf.get('redis:prefix') || 'cantina', 'cache'].join(':') + ':'
  }
});

app.on('init', function () {
  var conf = app.conf.get('cache');
  if (!conf.nodes) {
    conf.client = app.redis;
  }
  app.cache = stow.createCache(stow.backends.Redis, conf);
});