<account-userlist>
  <div class="coect-user-list">
    <ul class="list-inline">
      <li each={ u in opts.users }>
        <div class="media">
          <div class="media-left">
            <img class="media-object pull-left" width="32" height="32" 
                 alt={ u.id } src={ site.urls.avatar(u, 32) }>
          </div>
          <div class="media-body">
            <a href={ site.urls.user(u) }>{ u.name || u.id }</a>
            <span if={ u.username }>(@{ u.username })</span>
          </div>
        </div>
      </li>
    </ul>

  </div>


  <script>
   this.mixin('coect-account')
  </script>

</account-userlist>
