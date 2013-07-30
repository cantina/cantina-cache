var app = require('cantina');

app.middleware.get('/fruit/:type', function (req, res, next) {
  app.cache.get(req.url, function (err, result) {
    if (err) return next(err);
    res.writeHead(200, {'Content-Type': 'application/json'});
    res.end(JSON.stringify(result, null, 2));
  });
});

app.middleware.put('/fruit/:type', function (req, res, next) {
  app.cache.set({key: req.url, data: req.params.type, tags: {fruit: [req.params.type]}}, function (err) {
    if (err) return next(err);
    res.writeHead(201);
    res.end('');
  });
});

app.middleware.post('/fruit/:type', function (req, res, next) {
  var data;
  app.cache.set({key: req.url, data: req.body.value, tags: {fruit: [req.params.type]}}, function (err) {
    if (err) return next(err);
    res.writeHead(201);
    res.end('');
  });
});

app.middleware.delete('/fruit/:type', function (req, res, next) {
  app.cache.invalidate({fruit: req.params.type}, function (err) {
    if (err) return next(err);
    res.writeHead(201);
    res.end('');
  });
});

app.on('cache', function (backend, key, type) {
  console.log('cache:', backend, key, type);
});

process.on('SIGTERM', function () {
  app.cache.clear('*', function (err) {
    if (err) throw err;
    process.exit();
  });
});