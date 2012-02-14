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

  self.on('hook::ready', function(){
    self._start();
  });
};

// Postgres inherits from Hook
util.inherits(PostgresHook, Hook);

PostgresHook.prototype._start = function() {
  var self = this;

  // We have to use the callback API for this bit because
  // pg currently doesn't emit a 'connected' or 'ready'
  // event.
  pg.connect(self.options.database, function(err, client) {
    if (err) {
      self._error(err);
    } else {
      self.client = client;

      self.client.on('error', function(err) {
        self._error(err);
      });

      self.on('**::postgres::query', function(sql, callback) {
        self._query(sql, callback);
      });

      self.emit('postgres::connected');
    }
  });
};

PostgresHook.prototype._query = function(sql, callback) {
  var self = this;

  var query = self.client.apply(sql); // handle strings, arrays, or objects with apply
  var rows = [];

  query.on('row', function(row) {
    rows.push(row);
  });

  query.on('end', function() {
    callback(null, rows);
  });

  query.on('error', function(err) {
    callback(err, null);
  });
};

PostgresHook.prototype._error = function(err) {
  var self = this;
  self.emit('postgres::error', err);
};
