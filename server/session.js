var debug = require('debug')('auth:session')
var passport = require('passport')
var tflow = require('tflow')

passport.serializeUser(function(user, done) {
  debug('serializeUser', user)
  done(null, user.id)
})

passport.deserializeUser(function(req, id, done) {
  console.log('------------deserial', id)
  debug('deserializeUser', id)
  var User = req.app.db.User
  tflow([
    function() {
      User.findOne(id, {select: '*'}, this)
    },
    function(user) {
      if (!user) {
        console.error('deserialize: no user', id)
        // delete unknown user id from a session to force user login again
        req.logout()
        return this.fail('User not found: ' + id)
      }
      debug('Found user', user.id, user.name)
      this.next(user)
    },
  ], done)
})

