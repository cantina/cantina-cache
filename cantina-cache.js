var app = require('cantina')
  , stow = require('stow')
  , options;

// Default conf.
app.conf.add({
  cache: {
    prefix: 'cache'
  }
});

// Get conf.
options = app.conf.get('cache');

// Expose overridable cache backend.
if (!app.cacheBackend) {
  require('cantina-redis');
  require('cantina-amino');

  options.prefix = app.redisKey(options.prefix);
  if (!options.nodes) {
    options.client = app.redis;
  }
  options.amino = app.amino;

  app.cacheBackend = require('./backend');
}

// Expose cache API.
app.cache = stow.createCache(app.cacheBackend, options);
