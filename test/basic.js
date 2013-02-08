describe('cache', function () {
  var app;

  before(function (done) {
    app = require('cantina');
    app.load(function (err) {
      if (err) return done(err);
      require('../');
      app.init(done);
    });
  });

  after(function (done) {
    app.cache.clear(done);
  });

  it('can set and get from cache', function (done) {
    app.cache.set('test', 'data', function (err) {
      assert.ifError(err);
      app.cache.get('test', function (err, result) {
        assert.ifError(err);
        assert.equal(result.data, 'data');
        done();
      });
    });
  });
});