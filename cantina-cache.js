var app = require('cantina')
  , stow = require('stow')
  , CantinaBackend = require('./backend')
  , options;

require('cantina-redis');
require('cantina-amino');

// Default conf.
app.conf.add({
  cache: {
    prefix: 'cache'
  }
});

// Get conf.
options = app.conf.get('cache');
options.prefix = app.redisKey(options.prefix);
if (!options.nodes) {
  options.client = app.redis;
}
options.amino = app.amino;

// Expose cache API.
app.cache = stow.createCache(CantinaBackend, options);
