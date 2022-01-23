const bodyParser = require('body-parser')

module.exports = app => {
	app.use(bodyParser.json({limit: "2mb"}))
	app.use(bodyParser.urlencoded({extended: false}))
	app.enable('trust proxy') // allows node to trust proxy headers (like on heroku)

	// route that resource selections will return to
	app.post('/return_resource_selection', (req, res) => {
		const data = JSON.parse(req.body.content_items)
		res.set('Content-Type', 'text/html')
		res.send(`<html><body><h1>Resource selected!</h1>
			<p>This message is shown when the LTI tool sends results back to the content_item_return_url</p>
			<ul>
			<li><b>URL</b>: ${req.originalUrl}</li>
			<li><b>lti_message_type</b>: ${req.body.lti_message_type}</li>
			<li><b>Type</b>: ${data['@graph'][0]['@type']}</li>
			<li><b>URL</b>: ${data['@graph'][0].url}</li>
			<li><b>Title</b>: ${data['@graph'][0].title}</li>
			<li><b>Data</b>: ${req.body.data}</li>
			</ul>
			<code>${req.body.content_items}</code>
			</body></html>`)
	})

	// route that resource selections will return to
	app.post('/lti/dev/return/resource_selection', (req, res) => {
		const data = JSON.parse(req.body.content_items)
		res.set('Content-Type', 'text/html')
		res.send(`<html><body><h1>Resource selected!</h1>
			<ul>
			<li>URL: ${req.originalUrl}</li>
			<li>lti_message_type: ${req.body.lti_message_type}</li>
			<li>Type: ${data['@graph'][0]['@type']}</li>
			<li>URL: ${data['@graph'][0].url}</li>
			<li>Title: ${data['@graph'][0].title}</li>
			<li>Data: ${req.body.data}</li>
			</ul>
			<code>${req.body.content_items}</code>
			</body></html>`)
	})

	// unknown error handler
	app.use((err, req, res, next) => {
		console.log(err)
		res.set('Content-Type', 'text/html')
		res.send(`<html>
			<head>
			<title>Random LTI Launcher tool Error</title>
			</head><body>
			<h1>Error</h1>
			<p>${err.message}</p>
			</body></html>`)
	})

}
