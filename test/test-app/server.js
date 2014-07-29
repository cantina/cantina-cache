var app = require('cantina').createApp();

app.boot(function (err) {
  if (err) throw err;

  app.conf.set('cache:prefix', process.env.TEST_PREFIX);

  app.require('cantina-web');
  app.require('../../');
  app.require('./test');

  app.start();
});
