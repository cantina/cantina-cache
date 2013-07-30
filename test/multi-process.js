describe('multi-process', function () {
  var procs = {};

  process.env.TEST_PREFIX = 'cantina-cache-test-' + Date.now();

  function handleProc (name) {
    return function (done) {
      procs[name] = child_process.spawn('node', [__dirname + '/test-app/server.js']);
      procs[name].stdout.on('data', function (data) {
        var body = data.toString();
        var match = body.match(/\:(\d+) started/);
        if (body.match(/\:(\d+) started/)) {
          procs[name].baseUrl = 'http://127.0.0.1:' + match[1];
          done();
        }
        else {
          match = body.match(/^cache\: (memory|redis) (.*) (hit|miss)/);
          if (match) {
            procs[name].emit('cache', match[1], match[2], match[3]);
          }
        }
      });
      procs[name].stderr.pipe(process.stderr);
      process.on('exit', function () {
        procs[name].kill();
      });
    };
  }

  before(handleProc('proc1'));
  before(handleProc('proc2'));

  it('proc1 cache is empty', function (done) {
    request({url: procs['proc1'].baseUrl + '/fruit/apple', json: true}, function (err, resp, body) {
      assert.ifError(err);
      assert.equal(body, null);
      done();
    });
  });

  it('proc2 cache is empty', function (done) {
    request({url: procs['proc2'].baseUrl + '/fruit/apple', json: true}, function (err, resp, body) {
      assert.ifError(err);
      assert.equal(body, null);
      done();
    });
  });

  it('set cache on proc1', function (done) {
    request({method: 'put', url: procs['proc1'].baseUrl + '/fruit/apple'}, function (err, resp, body) {
      assert.ifError(err);
      done();
    });
  });

  it('proc1 mem hit', function (done) {
    var tasks = 2, p ='/fruit/apple';
    procs['proc1'].once('cache', function (backend, key, type) {
      assert.equal(backend, 'memory');
      assert.equal(key, p);
      assert.equal(type, 'hit');
      !--tasks && done();
    });
    request({url: procs['proc1'].baseUrl + p, json: true}, function (err, resp, body) {
      assert.ifError(err);
      assert.equal(body.data, 'apple');
      !--tasks && done();
    });
  });

  it('proc2 redis hit', function (done) {
    var tasks = 3, p = '/fruit/apple';

    function finish () {
      procs['proc2'].removeListener('cache', probe);
      done();
    }

    function probe (backend, key, type) {
      if (backend === 'memory') {
        assert.equal(type, 'miss');
        !--tasks && finish();
      }
      if (backend === 'redis') {
        assert.equal(type, 'hit');
        !--tasks && finish();
      }
    }
    procs['proc2'].on('cache', probe);

    request({url: procs['proc2'].baseUrl + p, json: true}, function (err, resp, body) {
      assert.ifError(err);
      assert.equal(body.data, 'apple');
      !--tasks && finish();
    });
  });

  it('proc2 mem hit', function (done) {
    var tasks = 2, p = '/fruit/apple';

    function probe (backend, key, type) {
      if (backend === 'memory') {
        assert.equal(type, 'hit');
        !--tasks && done();
      }
    }
    procs['proc2'].once('cache', probe);

    request({url: procs['proc2'].baseUrl + p, json: true}, function (err, resp, body) {
      assert.ifError(err);
      assert.equal(body.data, 'apple');
      !--tasks && done();
    });
  });

  it('set cache on proc2', function (done) {
    request({method: 'post', url: procs['proc2'].baseUrl + '/fruit/apple', json: {value: 'fuji'}}, function (err, resp, body) {
      assert.ifError(err);
      done();
    });
  });

  it('proc2 mem hit', function (done) {
    var tasks = 2, p = '/fruit/apple';

    function probe (backend, key, type) {
      if (backend === 'memory') {
        assert.equal(type, 'hit');
        !--tasks && done();
      }
    }
    procs['proc2'].once('cache', probe);

    request({url: procs['proc2'].baseUrl + p, json: true}, function (err, resp, body) {
      assert.ifError(err);
      assert.equal(body.data, 'fuji');
      !--tasks && done();
    });
  });

  it('proc1 redis hit', function (done) {
    var tasks = 3, p = '/fruit/apple';

    function finish () {
      procs['proc1'].removeListener('cache', probe);
      done();
    }

    function probe (backend, key, type) {
      if (backend === 'memory') {
        assert.equal(type, 'miss');
        !--tasks && finish();
      }
      if (backend === 'redis') {
        assert.equal(type, 'hit');
        !--tasks && finish();
      }
    }
    procs['proc1'].on('cache', probe);

    request({url: procs['proc1'].baseUrl + p, json: true}, function (err, resp, body) {
      assert.ifError(err);
      assert.equal(body.data, 'fuji');
      !--tasks && finish();
    });
  });

  it('proc1 mem hit', function (done) {
    var tasks = 2, p = '/fruit/apple';

    function probe (backend, key, type) {
      if (backend === 'memory') {
        assert.equal(type, 'hit');
        !--tasks && done();
      }
    }
    procs['proc1'].once('cache', probe);

    request({url: procs['proc1'].baseUrl + p, json: true}, function (err, resp, body) {
      assert.ifError(err);
      assert.equal(body.data, 'fuji');
      !--tasks && done();
    });
  });

  it('set invalidate on proc1', function (done) {
    request({method: 'delete', url: procs['proc1'].baseUrl + '/fruit/apple'}, function (err, resp, body) {
      assert.ifError(err);
      done();
    });
  });

  it('proc1 cache is empty', function (done) {
    request({url: procs['proc1'].baseUrl + '/fruit/apple', json: true}, function (err, resp, body) {
      assert.ifError(err);
      assert.equal(body, null);
      done();
    });
  });

  it('proc2 cache is empty', function (done) {
    request({url: procs['proc2'].baseUrl + '/fruit/apple', json: true}, function (err, resp, body) {
      assert.ifError(err);
      assert.equal(body, null);
      done();
    });
  });
});