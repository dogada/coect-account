var coect = require('coect')

exports.api = function(router) {
  return coect.router.routeAPI(router, require('./endpoints'))
}
