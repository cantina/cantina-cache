var stow = require('stow')
  , options;

module.exports = function (app) {
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
    app.require('cantina-redis');
    app.require('cantina-amino');

    if (!options.nodes) {
      options.client = app.redis;
    }
    options.amino = app.amino;

    app.cacheBackend = app.require('./backend');
  }

  // Expose cache API.
  app.cache = stow.createCache(app.cacheBackend, options);

};