
/**
 * @type {import('@vue/cli-service').ProjectOptions}
 */
module.exports = {
	devServer: {
		before: (app) => {
			// load the lti routes
			require('./src/routes/lti-routes')(app)

		}
	}
}
