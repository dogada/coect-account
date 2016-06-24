'use strict'

var debug = require('debug')('auth:init')
var passport = require('passport')
var local = require('./providers/local')

debug('Auth session')

exports.initPassport = function(app, config) {
  debug('initPassport', app)
  app.use(passport.initialize())
  app.use(passport.session())

  const services = Object.keys(config)
  for (let sid of services) {
    let path = './providers/' + sid
    let service = require('./providers/' + sid)
    debug('Activating', path, service)
    service.init(sid, config[sid])
  }
  if (config.local !== false) local.init()
  require('./session') // Init passport session

}


function getRedirect(req) {
  if (req.user) return '/me/'  // connect requests
  return req.query.next || '/'
}

function setRedirect(req, res, next) {
  req.session.returnTo = getRedirect(req)
  debug('setRedirect', req.session)
  next()
}

function redirect(req, res) {
  res.redirect(req.session.returnTo || '/')
  delete req.session.returnTo
}

/**
 * Log out.
 */
exports.logout = function(req, res) {
  console.log('logout', req.user && req.user.id)
  req.logout()
  if (req.session) req.session.destroy()
  res.json({})
}

exports.routes = function (router) {
  router.post('/register', local.register)
  router.post('/login', passport.authenticate('local'), function(req, res) {
    res.json(req.user.publicData())
  })
  router.post('/logout', exports.logout)

  router.get('/twitter', setRedirect, passport.authenticate('twitter'))
  router.get('/twitter/callback', passport.authenticate('twitter', { failureRedirect: '/me' }), redirect)

  // https://github.com/jaredhanson/passport-google-oauth
  router.get('/google', setRedirect, passport.authenticate('google', {
    scope: 'https://www.googleapis.com/auth/plus.login email',
    accessType: 'offline'
  }))
  router.get('/google/callback', passport.authenticate('google', { failureRedirect: '/me' }), redirect)

  router.get('/facebook', setRedirect, passport.authenticate('facebook', {
    // https://developers.facebook.com/docs/facebook-login/permissions#reference-public_profile
    // https://developers.facebook.com/docs/graph-api/reference/user
    //https://developers.facebook.com/tools/explorer/145634995501895/?method=GET&path=me%3Ffields%3Did%2Cname%2Cpicture&version=v2.5
    scope: ['public_profile', 'email', 'user_friends'], // 'user_birthday'
    accessType: 'offline' // seems ignored by FB
  }))
  router.get('/facebook/callback', passport.authenticate('facebook', { failureRedirect: '/me' }), redirect)

  return router
}

