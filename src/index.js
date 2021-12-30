#!/usr/bin/env node

const logger = require('debug-logger')('lti-launcher')
const express = require('express')
const app = express()
const path = require('path')

app.set('views', path.join(__dirname, '/templates'));
app.set('view engine', 'ejs');
// load the lti routes
require('./routes/lti-routes')(app)


// some server utility borrowed from obojobo-express
const startServer = require('./https_server')

// start the server
startServer(app, logger, process.env.PORT)
