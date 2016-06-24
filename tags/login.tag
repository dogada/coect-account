<account-login>
  <coect-head title="Log in" />

  <div class="coect-login">
    <h1>Log in</h1>

    <h3>Use social accounts</h3>

    <ul class="coect-login-social list-inline">
      <li><a class="btn btn-primary" rel="external" href="{ site.auth.url('facebook') }?next={ site.state.returnTo }">Facebook</a></li>

      <li><a class="btn btn-primary" rel="external" href="{
      site.auth.url('google') }?next={ site.state.returnTo }">Google</a></li>

      <li><a class="btn btn-primary" rel="external" href="{
      site.auth.url('twitter') }?next={ site.state.returnTo }">Twitter</a></li>

      <!--li><a class="btn btn-primary" rel="external" href={ app.url('github') }>GitHub</a></li-->
    </ul>

    <h3>Have username and password?</h3>
    <form onsubmit={ login } method="POST">
      <div class="form-group">
        <label>Username</label>
        <input type="text" class="form-control" name="username">
      </div>
      <div class="form-group">
        <label>Password</label>
        <input type="password" class="form-control" name="password">
      </div>
      
      <div class="form-group">
          <button type="submit" class="btn btn-primary">Log in</button>
      </div>
      <p>Don&#39;t have an account yet? <a onclick={ showRegister }>Create it now!</a></p>
    </form>
  </div>
    

  <style scoped>
   h1 {
     margin-bottom: 30px;
   }
   .coect-login-social {
     margin-bottom: 30px;
   }

  </style>

  <script>
   this.mixin('coect-account')
   var tag = this

   //https://github.com/wenzhixin/bootstrap-show-password
   $(tag.password).password({
     eyeClass: 'fa',
     eyeOpenClass: 'fa-eye',
     eyeCloseClass: 'fa-eye-slash'
   })

   debug('login returnTo', tag.site.state.returnTo)

   tag.showRegister = function() {
     tag.site.show('account-register')
   }

   tag.login = function(e, data) {
     debug('login', typeof e, e, arguments)
     if (e) e.preventDefault()
     tag.app.auth.login(tag, data || {
       username: tag.username.value,
       password: $(tag.password).password('val')
     })
   }


   tag.on('mount unmount', function() {
     tag.username.value = tag.password.value = ''
   })

   tag.on('*', function(event) {
     debug('login.tag', event, tag.opts)
   })

  </script>

</account-login>
