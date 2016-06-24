var debug = require('debug')('account:profile')
const CoectApi = require('coect').Api

module.exports = class ProfileApi extends CoectApi {

  update(tag, data) {
    debug('login')

    this.post('profile', data, user => {
      tag.site.update({user: user}, false)
      tag.site.go(tag.site.urls.user(user))
    })
  }
}
