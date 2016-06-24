<account-usereditor>
  <div class="coect-profile">
    <coect-h1>Edit profile</coect-h1>

    <form id="profile" method="POST" onsubmit={ save }>
      <div class="form-group" if={ user.admin }>
        <label>Email</label>
        <input type="email" class="form-control" name="email"
               value={ user.email || ''}>
      </div>

      <div class="form-group">
        <label>Username <small>(can not be changed)</small></label>
        <input type="text" class="form-control" name="username" 
               value={ user.username || ''} disabled={ user.username }>
      </div>

      <div class="form-group">
        <label>Name</label>
        <input type="text" class="form-control" name="name" 
               value={ user.name || ''}>
      </div>

      <div class="form-group">
        <label>Location</label>
        <input type="text" class="form-control" name="location" 
               value={ user.location || ''}>
      </div>

      <div class="form-group">
        <label>About (links are clickable)</label>
        <textarea class="form-control" name="about"
                  rows="5"
                  value={ user.about || ''}></textarea>
      </div>

      <div class="form-group">
        <label>Picture</label><br>
        <img width="128" height="128" class="avatar"
             alt="avatar"
             src="{ site.account.avatar(user, 64) }"
             title="{ user.name || user.username}">
      </div>

      <div class="form-group">
        <button type="submit" class="btn btn-primary">Update Profile</button>
      </div>
    </form>
  </div>

  <script>
   this.mixin('coect-context', 'coect-account')
   var tag = this
   tag.fields = ['email', 'name', 'location', 'about', 'username']
   debug('usereditor', tag.site)
   tag.user = tag.opts.user || tag.site && tag.site.user

   function select(obj, keys, fn) {
     var res = {}
     $.each(keys, function(i, key) {
       res[key] = (fn ? fn(obj[key]) : obj[key])
     })
     return res
   }

   tag.save = function(e) {
     debug('save')
     e.preventDefault()
     const form = select(tag, tag.fields, field => field.value)
     tag.app.profile.update(tag, form)
   }
  </script>

</account-usereditor>
