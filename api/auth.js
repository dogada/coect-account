var debug = require('debug')('account:auth')

const CoectApi = require('coect').Api

module.exports = class ProfileApi extends CoectApi {

  register(tag, data) {
    debug('register')
    const app = tag.app, site = tag.site
    this.post('auth/register', data, user => {
      if (user && user.id) this.loginUser(tag, user)
      if (!user) return tag.site.error('Unknown response.')
    })
  }
 
  login(tag, data) {
    debug('login')
    const app = tag.app, site = tag.site
    this.post('auth/login', data, user => {
      if (user && user.id) this.loginUser(tag, user)
      if (!user) return tag.site.error('Unknown login response.')
    })
  }


  logout(tag, redirectTo) {
    debug('logout', redirectTo)
    this.post('auth/logout', {}, () => {
      tag.site.update({user: null}, false)
      tag.site.go('/', true) // force reload to get new CSRF token
    })
  }

  loginUser(tag, user) {
    debug('loginUser', user)
    tag.site.update({user})
    tag.site.go(tag.site.state.returnTo || '/')
  }

  loginRequired() {
    debug('loginRequired', this)
    const tag = this
    tag.site.state.returnTo = Site.page.current
    tag.site.page(tag.site.urls.account())
  }
}
