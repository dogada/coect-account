<account-admin-userlist>

  <coect-h1>User Admin</coect-h1>
  <account-userlist users={ state.users } />

  <script>
   this.mixin('coect-account')
   var tag = this
   if (!tag.getState()) tag.app.user.list(tag)
  </script>

</account-admin-userlist>
