var debug = require('debug')('auth:cache')
var tflow = require('tflow')
var _ = require('lodash')

var User = require('./models/user')

/**
   Load users from redis cache or database.
*/
exports.getUsers = function(ids, done) {
  debug('getUsers', ids.length)
  tflow([
    function() {
      User.find({
        ids: ids,
        select: User.ownerFields,
        limit: 0
      }, this)
    },
    function(users) {
      this.next(_.reduce(users, function(res, u) {
        res[u.id] = u
        return res
      }, {}))
    },
  ], done);
  
}

exports.setUsers = function(data, done) {
  
}

