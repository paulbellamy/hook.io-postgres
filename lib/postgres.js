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

  self.on('*::postgres::query', function(sql, callback) {
    self._query(sql, callback);
  });
};

// Postgres inherits from Hook
util.inherits(PostgresHook, Hook);

PostgresHook.prototype._start = function() {
  var self = this;

  self.client = new pg.Client(self.options.database);
  self.client.connect();

  self.client.on('error', function(err) {
    self._error(err);
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
