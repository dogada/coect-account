var debug = require('debug')('admin:user')
var tflow = require('tflow')
var coect = require('coect')

exports.list = function(req, res, next) {
  debug('list', req.params)
  const db = req.app.db
  var flow = tflow([
    () => db.User.find({orderBy: ['id', 'asc'], limit: 100}, flow),
    (users) => flow.next({items: users})
  ], next)
}
