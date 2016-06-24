'use strict';

var debug = require('debug')('auth:handler')
var passport = require('passport')
var tflow = require('tflow')
var User = require('../models/user')

class Handler {
  
  constructor(sid) {
    this.sid = sid
  }


  /**
     Each strategy provides different parameters, so subclass must handle them
     and return generic service.
   */
  service() {
    throw new Error('Must be implemented in a subclass.')
  }

  basicService(config, profile, extra) {
    debug(`basicService ${this.sid} ${config.tag}, profile`, profile)
    return Object.assign({
      sid: this.sid,
      guid: this.sid + ':' + profile.id,
      provider: profile.provider,
      tag: config.tag,
      id: profile.id,
      name: profile.name,
      username: profile.username,
      displayName: profile.displayName,
      profileUrl: profile.profileUrl,
      email: profile.emails && profile.emails[0] &&  profile.emails[0].value,
      photos: profile.photos,
      raw: profile._json
    }, extra || {})
  }

  /**
     Get real not default picture.
   */
  getRealPicture(service) {
    if (service.photos && service.photos[0]) return service.photos[0].value
  }

  sync(user, service) {
    debug('sync', user, service)
    user.addService(service.guid, service)
    var profile = user.profile
    if (!user.name && service.displayName) {
      user.name = profile.name = service.displayName
    }
    if (!user.hasCustomPicture() && this.getRealPicture(service)) {
      user.avatar = this.getRealPicture(service)
    }
    if (!profile.location) profile.location = service.location
    return user
  }

  login(req, service, done) {
    debug('login', service.guid)
    var flow = tflow([
      () => {
        User.findByServiceId(service.guid, flow)
      },
      (existingUser) => {
        if (existingUser) {
          this.sync(existingUser, service)
          existingUser.save(flow.send(existingUser))
        } else {
          req.app.createUser(this.sync(new User(), service), flow)
        }
      },
    ], done);
  }

  connect(req, service, done) {
    debug('connect', service.guid)
    var flow = tflow([
      () => {
        User.findByServiceId(service.guid, flow)
      },
      (existingUser) => {
        if (existingUser && existingUser.id !== req.user.id) {
          debug('connect existingUser', existingUser)
          req.flash('errors', {msg: `${service.displayName} ${service.provider} account is already used in other account.`})
          return flow.done()
        }
        User.get(req.user.id, flow) //reload user
      },
      (user) => {
        this.sync(user, service)
        user.save(flow.send(user))
      },
      (user) => {
        req.flash('info', {msg: `${service.displayName} ${service.provider} account has been linked.`})
        flow.next(user)
      }
    ], done)
  }


  static activate(sid, config, Strategy) {
    var handler = new this(sid) // instantiate subclassed Handler
    debug(`Activating ${Strategy.name} using config for '${sid}' (tag: ${config.tag}) and ${handler.constructor.name}.`)
    // pass req to handler always 
    config.passReqToCallback = true
    // prepend config to all handlers
    passport.use(sid, new Strategy(config, function(req) {
      debug(`Using strategy ${sid}, req.user=${req.user && req.user.id}`)
      debug(`config: clientID=${config.clientID}, callbackURL=${config.callbackURL}`)

      // pass all arguments to the handler to build service data for the strategy
      var service = handler.service.apply(handler, [config].concat(Array.from(arguments)))
      debug('created service', service)
      var process = (req.user ? handler.connect : handler.login)
      // last argument is Strategy callback
      process.call(handler, req, service, arguments[arguments.length - 1])
    }))
  }

}


/**
   OAuth 2.0 handler
*/
class OAuthHandler extends Handler {
  
  service(config, req, accessToken, refreshToken, profile, done) {
    return this.basicService(config, profile, {accessToken, refreshToken})
  }
}

module.exports = {
  Handler,
  OAuthHandler
}
