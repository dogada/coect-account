var debug = require('debug')('account:user')
const CoectApi = require('coect').Api

module.exports = class UserApi extends CoectApi {

  list(tag, data) {
    debug('list')

    this.get('user', tag.site.page.params, data => {
      tag.setState(data)
    })
  }
}
