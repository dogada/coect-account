'use strict'

function page (path, view) {
  return {path, view, aside: 'account-sidebar'}
}

module.exports = [
  page('', 'account-home')
]
