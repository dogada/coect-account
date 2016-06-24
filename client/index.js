'use strict'

const coect = require('coect')
const defaultApi = require('../api/')

exports.initApi = function({server, site, extensions}) {
  let classes = coect.object.assign({}, defaultApi, extensions || {})
  return coect.Api.makeApis({classes, opts: {server, site}})
}

exports.pages = require('../pages')
