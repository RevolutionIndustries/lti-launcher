#!/usr/bin/env node
const logger = require('debug-logger')('lti-launcher')
const app = require('express')()

// load the lti routes
require('./lti-routes')(app)

// some server utility borrowed from obojobo-express
const startServer = require('./http_server.js')

// start the server
startServer(app, logger, process.env.PORT)
