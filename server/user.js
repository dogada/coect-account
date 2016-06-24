'use strict';

var debug = require('debug')('auth:account')
var _ = require('lodash')
var passport = require('passport')
var tflow = require('tflow')
var User = require('./models/user')
var misc = require('./misc')
var coect = require('coect')

exports.updateProfile = function(req, res, next) {
  debug('-----------------profile', req.params)
  var flow = tflow([
    () => User.validate(req.body, User.schema, flow),
    (form) => User.get(req.user.id, flow.join(form)),
    (form, user) => {
      var data = _.pick(form, ['name', 'about', 'location'])
      if (!user.username && form.username) data.username = form.username
      debug('data', data, form)
      User.update(user.id, data, flow)
    },
    () => User.get(req.user.id, flow),
  ], coect.json.response(res))
}

exports.routes = function (app, router) {
  debug('init')
  router.post('/profile', exports.updateProfile)
  return router
}
