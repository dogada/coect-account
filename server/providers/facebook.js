'use strict';

var FacebookStrategy = require('passport-facebook').Strategy
var OAuthHandler = require('./handler').OAuthHandler

module.exports = class FacebookHandler extends OAuthHandler {

  getRealPicture(service) {
    let pic = service.raw.picture
    if (pic && pic.data && !pic.data.is_silhouette) return pic.data.url
  }

  static init(sid, config) {
    this.activate(sid, config, FacebookStrategy)
  }

}
