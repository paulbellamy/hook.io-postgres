/*

   hook.io hook for interfacing with postgres

*/


var Hook = require('hook.io').Hook,
    pg = require('pg'),
    util = require('util');

var PostgresHook = exports.PostgresHook = function(options){
  var self = this;

  Hook.call(this, options);

  self.options = options;

  // We force the database config to be an object here
  // because hook.io json-ifies it either way, and we
  // have no way of reliably telling which it is
  // (json-ified object or database string).
  // We could try to parse it, but I thought it
  // better to just be more specific instead of
  // guessing what the user meant.
  if (typeof(self.options.database) === 'string') self.options.database = JSON.parse(self.options.database);

  self.on('hook::ready', function(){
    self._start();
  });
};

// Postgres inherits from Hook
util.inherits(PostgresHook, Hook);

PostgresHook.prototype._start = function() {
  var self = this;

  // Try to connect (just to make sure we can)
  pg.connect(self.options.database, function(err, client) {
    if (err) {
      self._error(err);
      return;
    }

    self.emit('postgres::connected');
  });

  self.on('*::postgres::query', function(sql, callback) {
    self._query(sql, callback);
  });
};

PostgresHook.prototype._query = function(sql, callback) {
  var self = this;

  // Use the pg module's built-in client pool
  pg.connect(self.options.database, function(err, client) {
    if (err) {
      self._error(err);
      callback(err, null);
      return;
    }

    // we use 'apply' so we can handle strings, arrays, or objects
    var query_args = sql;
    if (typeof(args) !== 'array') query_args = [query_args];
    query_args = query_args.concat(function(err, result) {
      if (err) {
        self._error(err);
        callback(err, null);
        return;
      }

      callback(null, result);
    });

    client.query.apply(client, query_args);
  });
};

PostgresHook.prototype._error = function(err) {
  var self = this;
  self.emit('postgres::error', err);
};
