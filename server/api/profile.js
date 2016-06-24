'use strict'

var debug = require('debug')('auth:account')
var _ = require('lodash')
var tflow = require('tflow')
var coect = require('coect')

exports.updateProfile = function(req, res, next) {
  let User = req.app.db.User
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
  ], next)
}
