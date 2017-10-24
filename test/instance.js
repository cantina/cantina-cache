describe('instance', function () {
  var app;

  before(function (done) {
    app = require('cantina');
    app.boot(function (err) {
      if (err) return done(err);
      app.conf.set('web:server:listen', false);
      app.silence();
      require('cantina-web');
      require('../');
      app.start(done);
    });
  });

  after(function (done) {
    app.cache.clear(done);
  });
  after(function (done) {
    app.destroy(done);
  });

  function CustomClass (values) {
    this.id = (Math.random()).toString(24).split('.')[1];
    this.values = {};
    var self = this;
    Object.keys(values || {}).forEach(function (k) {
      self.values[k] = values[k];
    });
  }
  CustomClass.prototype.toJSON = function () {
    var ret = {}, self = this;
    Object.keys(this.values).forEach(function (k) {
      ret[k] = self.values[k];
    });
    return ret;
  };

  var key = '123';
  var data = new CustomClass({foo: 'foo', bar: 2});
  assert(data.id);

  it('should use toJSON from a custom Class', function (done) {
    app.cache.set(key, data, function (err) {
      assert.ifError(err);
      app.cache.get(key, function (err, result) {
        assert.ifError(err);
        assert.deepEqual(result.data, data.toJSON());
        done();
      });
    });
  });

  it('clear memory', function (done) {
    app.cache.backend.backends.memory.clear('*', done);
  });

  it('should return cached values from redis', function (done) {
    app.cache.get(key, function (err, result) {
      assert.ifError(err);
      // re-hydrate.
      if (!(result.data instanceof CustomClass)) {
        result.data = new CustomClass(result.data);
      }
      assert(result.data.id);
      assert.notEqual(result.data.id, data.id);
      assert.deepEqual(result.data.values, data.values);
      done();
    });
  });
});