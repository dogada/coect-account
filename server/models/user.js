'use strict';

var tflow = require('tflow')
var bcrypt = require('bcrypt-nodejs');
var crypto = require('crypto');
var _ = require('lodash')
var debug = require('debug')('auth:user')
var Model = require('coect').orm.Model
var Access = require('coect').Access

class User extends Model {
  constructor(props) {
    super(props)
    if (!this.profile) this.profile = {name: '', location: '', website: '', photos: {}}
    if (!this.services) this.services = []
    if (!this.data) this.data = {services: {}}
    if (this.access === undefined) this.access = Access.EVERYONE
  }
}

User.listFields = ['id', 'username', 'name', 'avatar', 'blog', 'location', 'created', 'access']
User.detailFields = User.listFields.concat(['about', 'profile'])
User.ownerFields = ['id', 'username', 'name', 'avatar', 'profile']

User.schema = {
  username: {
    isLength: {
      options: [3, 15],
      errorMessage: 'Must be between 3 and 15 chars long'
    },
    isLowercase: true,
    matches: {
      options: [/^[a-z]+[a-z\d\-]*$/],
      errorMessage: 'Username can contain latin letters in lower case (a-z), digits and hypen and should begin with a letter.'
    }
  },
  password: {
    isLength: {
      options: [8, 100],
      errorMessage: 'Must be between 8 and 100 chars long'
    }
  },
  email: {
    optional: true,
    isEmail: true,
    errorMessage: 'Invalid email',
    isLength: {
      options: [0, 126]
    }
  },
  name: {
    optional: true,
    errorMessage: 'Invalid name',
    isLength: {
      options: [0, 30],
      errorMessage: 'Must be less than 30 chars long'
    }
  },
  location: {
    optional: true,
    errorMessage: 'Invalid location',
    isLength: {
      options: [0, 30],
      errorMessage: 'Must be less than 30 chars long'
    }
  },
  about: {
    optional: true,
    errorMessage: 'Invalid about',
    isLength: {
      options: [0, 2000],
      errorMessage: 'Must be less than 2000 chars long'
    }
  }
}


User.serviceId = function(service, id) {
  return service + ':' + id
}

User.findByServiceId = function(sid, done) {
  debug('User.findByServiceId', sid)
  return this.findOne(function() {
    this.where('services', '@>', JSON.stringify([sid]))
  }, {select: '*'}, done)
}

/**
 * Hash plain password for secure storage.
 */
User.hashPassword = function(plain, done) {
  bcrypt.genSalt(10, function(err, salt) {
    if (err) return done(err)
    bcrypt.hash(plain, salt, null, function(err, hash) {
      if (err) return done(err)
      done(null, hash)
    })
  })
}

/**
 * Hash plain password and updated hashed password in the database.
 @param {string} userId 
 */
User.setPassword = function(userId, plain, done) {
  tflow([
    function() {
      User.hashPassword(plain, this)
    },
    function(hashedPassword) {
      User.update(userId, {password: hashedPassword}, this)
    }
  ], done)
}

User.stat = function(done) {
  var flow = tflow([
    () => this.table().select(this.raw('COUNT(*) AS count'), this.raw('MAX(created) AS last_created')).asCallback(flow),
    (row) => flow.next(row.map(r => Object.assign(r, {model: 'user'})))
  ], done)
}

/**
 * Helper method for validating user's password.
 */
User.prototype.comparePassword = function(candidatePassword, cb) {
  bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
    if (err) return cb(err)
    cb(null, isMatch)
  })
}

User.prototype.inGroup = function(group) {
  return _.includes(this.groups || [], group)
}

User.prototype.isRoot = function() {
  return this.inGroup('root')
}

User.prototype.isAdmin = function() {
  return this.inGroup('admins') || this.isRoot()
}

User.prototype.isModerator = function() {
  return this.inGroup('moderators')
}

User.prototype.isStaff = function() {
  return this.inGroup('staff')
}

User.prototype.isVIP = function() {
  return this.inGroup('vip')
}

/**
   If user doesn't have an email we show default avatar.
*/
User.isDefaultAvatar = function(url) {
  return !url || url.indexOf('gravatar.com/avatar/?') !== -1
}

User.prototype.hasCustomPicture = function() {
  return !!(this.avatar && !User.isDefaultAvatar(this.avatar))
}

/**
 * Helper method for getting user's gravatar.
 */
User.prototype.gravatar = function(size) {
  if (!size) size = 32
  if (!this.email) return 'https://gravatar.com/avatar/?s=' + size + '&d=retro'
  var md5 = crypto.createHash('md5').update(this.email).digest('hex')
  return 'https://gravatar.com/avatar/' + md5 + '?s=' + size + '&d=retro'
}

User.prototype.toString = function() {
  return this.profile.name || this.email || Model.prototype.toString.call(this)
}

User.prototype.publicData = function() {
  return _.extend(_.pick(this, User.detailFields), {admin: this.isAdmin()})
}

User.serviceGuid = function  (service) {
  return `${service.provider}:${service.label || ''}:${service.id}`
}


User.prototype.addService = function(sid, data) {
  if (!_.includes(this.services, sid)) this.services.push(sid)
  this.data.services[sid] = data
}

User.prototype.removeService = function(sid) {
  this.services = _.without(this.services, sid)
  delete this.data.services[sid]
}

User.prototype.getListId = function(type) {
  return this.data[`${type}_list`] || (type === 'main' && this.blog) 
}

User.prototype.setListId = function(type, id) {
  this.data[`${type}_list`] = id
}


module.exports = User
