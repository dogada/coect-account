var _ = require('lodash')
var debug = require('debug')('auth:twitter')
var tflow = require('tflow')
var passport = require('passport')
var TwitterStrategy = require('passport-twitter').Strategy
var User = require('../models/user')

var NS = 'twitter'

function ns(id) {
  return 'twitter:' + id
}

/**
   Profile pictures and sizes: By modifying the URL, you can retrieve other
   variant sizings such as “bigger”, “mini”, and “original”.
   https://dev.twitter.com/overview/general/user-profile-images-and-banners
*/
function twitterPhotos(url) {
  return {
    // micro - good for 16x16
    mini: url.replace('_normal', '_mini'), // good for 24x24
    normal: url, // good for 32x32
    // large - good for 512x512
    original: url.replace('_normal', '')
  }
}

function syncUser(user, service, twitter) {
  debug('syncUser', user, service, twitter)
  user.addService(ns(service.id), service)
  var profile = user.profile
  if (!profile.name) profile.name = service.displayName
  debug('profile.photos.normal', profile.photos && profile.photos.normal)
  if ((!profile.photos || !profile.photos.normal) && service.photos && service.photos[0]) {
    profile.photos = twitterPhotos(service.photos[0].value)
  }
  if (!profile.location) profile.location = twitter.location
  if (!user.name) user.name = user.profile.name
  if (!user.avatar || User.isDefaultAvatar(user.avatar)) user.avatar = user.profile.photos.normal
  return user
}

function prepareTwitterProfile(twitter) {
  return _.pick(twitter, ['id', 'name', 'screen_name', 'description', 'location',
                          'protected', 'verified',
                          'time_zone', 'utc_offset',
                          'profile_image_url_https',
                          'friends_count', 'followers_count', 'statuses_count'])
}


function connect(req, service, twitter, done) {
  debug('connect')
  tflow([
    function() {
      User.findByServiceId(ns(service.id), this)
    },
    function(existingUser) {
      if (existingUser && existingUser.id !== req.user.id) {
        debug('connect existingUser', existingUser)
        req.flash('errors', { msg: service.displayName + ' is already used in other account. Sign in with that account or delete it, then link it with your current account.'});
        return this.done()
      }
      User.get(req.user.id, this) //reload user
    },
    function(user) {
      syncUser(user, service, twitter)
      user.save(this.send(user))
    },
    function(user) {
      req.flash('info', { msg: 'Twitter account has been linked.' });
      this.next(user)
    }
  ], done);
}

function login(req, service, twitter, done) {
  debug('login')
  tflow([
    function() {
      User.findByServiceId(ns(service.id), this)
    },
    function(existingUser) {
      if (existingUser) {
        syncUser(existingUser, service, twitter)
        existingUser.save(this.send(existingUser))
      } else {
        req.app.createUser(syncUser(new User({
          // FIX: avoid fake email
          email: service.username + '@twitter.com'
        }), service, twitter), this)
      }
    },
  ], done);
}

/**
   Normalized profile information conforms to the contact schema established by
   Portable Contacts. The common fields available are outlined in the following
   table.
   http://passportjs.org/docs/profile
*/

exports.init = function(sid, config) {
  passport.use(sid, new TwitterStrategy(config, function(req, accessToken, tokenSecret, profile, done) {
    var service = {
      name: NS,
      provider: NS,
      id: profile.id,
      username: profile.username,
      displayName: profile.displayName,
      photos: profile.photos,
      emails: profile.emails,
      accessToken: accessToken,
      tokenSecret: tokenSecret,
      profile: prepareTwitterProfile(profile._json)
    };
    debug(`Twitter user=${req.user}, profile=${profile.username}, id=${profile.id}`)
    debug('req', typeof req, 'config', config)
    debug('profile', profile)
    debug('service', service)
    ;(req.user ? connect : login)(req, service, profile._json, done)
  }))
}

