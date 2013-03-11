var stow = require('stow');

function CantinaBackend (options) {
  var self = this;

  // Setup
  this.amino = options.amino;
  this.backends = {
    redis: new stow.backends.Redis(options),
    memory: new stow.backends.Memory(options)
  };

  // Subscriptions
  this.amino.subscribe(this.key('memory', 'clear'), function (key, specId) {
    if (specId !== self.amino.id) {
      self.backends.memory.clear(key, self.handleError.bind(self));
    }
  });
  this.amino.subscribe(this.key('memory', 'invalidate'), function (tags, specId) {
    if (specId !== self.amino.id) {
      self.backends.memory.invalidate(tags, self.handleError.bind(self));
    }
  });
}

CantinaBackend.prototype.key = function () {
  return this.prefix + Array.prototype.slice.call(arguments, 0 ).join(':');
};

CantinaBackend.prototype.set = function (options, cb) {
  var self = this;
  self.backends.memory.set(options, function (err) {
    if (err) return cb(err);
    self.backends.redis.set(options, function (err) {
      if (err) return cb(err);
      self.amino.publish(self.key('memory', 'clear'), options.key, self.amino.id);
      cb();
    });
  });
};

CantinaBackend.prototype.get = function (key, cb) {
  var self = this;
  self.backends.memory.get(key, function (err, result) {
    if (err) return cb(err);
    if (result) return cb(null, result);
    self.backends.redis.get(key, function (err, result) {
      if (err) return cb(err);
      if (!result) return cb(null, null);
      self.backends.memory.set(result, function (err) {
        cb(err, result);
      });
    });
  });
};

CantinaBackend.prototype.invalidate = function (tags, cb) {
  var self = this;
  self.backends.memory.invalidate(tags, function (err) {
    if (err) return cb(err);
    self.backends.redis.invalidate(tags, function (err) {
      if (err) return cb(err);
      self.amino.publish(self.key('memory', 'invalidate'), tags, self.amino.id);
      cb();
    });
  });
};

CantinaBackend.prototype.clear = function (pattern, cb) {
  var self = this;
  self.backends.memory.clear(pattern, function (err) {
    if (err) return cb(err);
    self.backends.redis.clear(pattern, function (err) {
      if (err) return cb(err);
      self.amino.publish(self.key('memory', 'clear'), pattern, self.amino.id);
      cb();
    });
  });
};

CantinaBackend.prototype.handleError = function (err) {
  if (err) this.amino.emit('error', err);
};

module.exports = CantinaBackend;