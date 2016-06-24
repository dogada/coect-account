<account-home>

  <script>
   this.mixin('coect-account')
   debug('account-home')
   const tag = this
   window.setTimeout(() => {
     tag.site.show(tag.site.user ? 'account-usereditor' : 'account-login',
                   'account-sidebar')
   }, 0)
  </script>

</account-home>
