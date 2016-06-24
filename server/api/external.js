'use strict';

var debug = require('debug')('auth:external')
var tflow = require('tflow')
var User = require('../models/user')

exports.unlink = function(req, res, done) {
  var sid = User.serviceId(req.params.service, req.params.id)
  tflow([
    function() {
      User.get(req.user.id, this)
    },
    function(user) {
      user.removeService(sid)
      user.save(this)
    },
    function(id) {
      req.flash('info', { msg: req.params.service + ' account has been unlinked.' })
      res.redirect('/me/')
    },
  ], done)
}

