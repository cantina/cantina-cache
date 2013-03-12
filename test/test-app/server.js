var app = require('cantina');

app.load(function (err) {
  if (err) throw err;

  // Core plugins
  require(app.plugins.http);
  require(app.plugins.middleware);

  app.conf.set('cache:prefix', process.env.TEST_PREFIX);

  // External plugins
  require('cantina-amino');

  // Our plugin
  require('../../');

  // test
  require('./test');

  app.init();
});