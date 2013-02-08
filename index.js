var app = require('cantina')
  , stow = require('stow');

require('cantina-redis');

app.conf.add({
  cache: {
    prefix: 'cantina:cache:'
  }
});

app.on('init', function () {
  var conf = app.conf.get('cache');
  if (!conf.nodes) {
    conf.client = app.redis;
  }
  app.cache = stow.createCache(stow.backends.Redis, conf);
});