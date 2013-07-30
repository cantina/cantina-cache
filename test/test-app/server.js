var app = require('cantina');

app.boot(function (err) {
  if (err) throw err;

  app.conf.set('cache:prefix', process.env.TEST_PREFIX);

  require('cantina-web');
  require('../../');
  require('./test');

  app.start();
});
