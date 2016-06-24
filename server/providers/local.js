'use strict';

var debug = require('debug')('auth:local')
var tflow = require('tflow')
var coect = require('coect')
var passport = require('passport')
var LocalStrategy = require('passport-local').Strategy
var User = require('../models').User

exports.init = function() {
  passport.use(new LocalStrategy(
    {usernameField: 'username', passReqToCallback: true}, function(req, username, password, done) {
      debug('LocalStrategy username', username)
      tflow([
        function() {
          User.findOne({username: username.toLowerCase()}, {select: '*'}, this)
        },
        function(user) {
          debug('user', user)
          if (!user) return this.complete(false, {message: 'Username ' + username + ' isn\'t found.'})
          user.comparePassword(password, this.join(user))
        },
        function(user, valid) {
          debug('valid', valid, user.id)
          if (valid) return this.next(user)
          else return done(null, false, {message: 'Invalid username or password.'})
        },
      ], done)
    }))
}


exports.register = function(req, res, next) {
  debug('register', req.body.username, !!req.body.password)
  tflow([
    function() {
      User.validate(req.body, User.schema, this)
    },
    function(form) {
      User.findOne({username: form.username}, this.join(form))
    },
    function(form, existingUser) {
      if (existingUser) return coect.json.errors(res, 'username', 'The username is taken already.')
      User.hashPassword(req.body.password, this.join(form))
    },
    function(form, hashedPassword) {
      req.app.createUser(new User({
        username: form.username,
        password: hashedPassword,
        email: form.email
      }), this)
    },
    function(user) {
      debug('Created new user', user)
      req.logIn(user, this.send(user))
    },
  ], coect.json.response(res))
}

