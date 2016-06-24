'use strict';

var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy
var OAuthHandler = require('./handler').OAuthHandler

module.exports = class GoogleHandler extends OAuthHandler {
  getRealPicture(service) {
    if (service.raw.picture && !service.raw.picture.isDefault) return service.raw.picture.url
  }

  static init(sid, config) {
    this.activate(sid, config, GoogleStrategy)
  }
}
