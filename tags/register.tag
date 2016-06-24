<account-register>
  <coect-head title="Sign up" />

  <div class="coect-register">
    <h1>Sign up</h1>

    <form onsubmit={ register } method="POST">
      <div class="form-group">
        <label>Username (latin chars and digits only)</label>
        <input type="text" class="form-control" name="username">
      </div>

      <div class="form-group">
        <label>Password (min length 8 chars)</label>
        <input type="password" class="form-control" name="password">
      </div>
      
      <div class="form-group">
          <button type="submit" class="btn btn-primary">Sign up</button>
      </div>
      <p>Already have an account? <a onclick={ showLogin }>Log in now!</a></p>
    </form>
  </div>


  <script>
   var tag = this
   tag.mixin('coect-context', 'coect-account')

   $(tag.password).password({
     eyeClass: 'fa',
     eyeOpenClass: 'fa-eye',
     eyeCloseClass: 'fa-eye-slash',
   })

   tag.showLogin = function() {
     tag.site.show('account-login')
   }

   tag.register = function(e) {
     e.preventDefault()
     tag.app.auth.register(tag, {
       username: tag.username.value,
       password: $(tag.password).password('val')
     })
   }


   tag.on('mount unmount', function() {
     tag.password.value = ''
   })

   tag.on('*', function(event) {
     debug('register.tag', event, tag.opts)
   })

  </script>

</account-register>
