'use strict';

const api = require('./api')

module.exports = [
  {path: '/profile', post: api.profile.updateProfile},
  {path: '/user', get: api.user.list},
  {path: '/unlink/:service/:id', post: api.external.unlink}
]
