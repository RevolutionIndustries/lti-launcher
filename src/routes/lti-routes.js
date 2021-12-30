const sig = require('oauth-signature')
const bodyParser = require('body-parser')
const { isTrueParam } = require('../util/is-true-param')
const path = require('path')

const randomUser = ({ isInstructor = false}) => {
	const randomIntString = Math.floor(Math.random() * Math.floor(999999999)) + ''
	const typeString = isInstructor ? 'Instructor' : 'Learner'
	return {
		lis_person_contact_email_primary: `rand-${randomIntString}@obojobo.com`,
		lis_person_name_family: randomIntString,
		lis_person_name_full: `Random ${typeString} ${randomIntString}`,
		lis_person_name_given: `Random ${typeString}`,
		lis_person_sourcedid: `rand:${randomIntString}`,
		roles: typeString,
		user_id: randomIntString,
	}
}

const ltiToolConsumer = {
	tool_consumer_info_product_family_code: 'obojobo-lti-random-launcher',
	tool_consumer_instance_guid: 'ltirando',
	tool_consumer_instance_name: 'LTI Random Student Launcher',
	tool_consumer_instance_url: 'https://obojobo.ucf.edu/'
}

const ltiContext = {
	context_id: 'S3294476',
	context_label: 'RLTI101',
	context_title: 'Random LTI Launcher',
	context_type: 'CourseSection'
}

const defaultResourceLinkId = 'random-lti-launcher-resource-link-id'

// constructs a signed lti request and sends it.
const renderLtiLaunch = (paramsIn, method, key, secret, endpoint, res) => {
	console.log({endpoint})
	const url = new URL(endpoint)
	// add the required oauth params to the given prams
	const oauthParams = {
		oauth_nonce: Math.round(new Date().getTime() / 1000.0),
		oauth_timestamp: Math.round(new Date().getTime() / 1000.0),
		oauth_callback: 'about:blank',
		oauth_consumer_key: key,
		oauth_signature_method: 'HMAC-SHA1',
		oauth_version: '1.0'
	}
	const params = { ...paramsIn, ...oauthParams }
	const hmac_sha1 = sig.generate(method, endpoint, params, secret, '', {
		encodeSignature: false
	})
	params['oauth_signature'] = hmac_sha1
	const paramKeys = Object.keys(params)
	const htmlInput = paramKeys
		.map(key => `<input type="hidden" name="${key}" value="${params[key]}"/><br/>`)
		.join('')

	res.set('Content-Type', 'text/html')
	res.send(`<html>
		<body>
		<form id="form" method="${method}" action="${endpoint}" >${htmlInput}</form>
		<script>document.getElementById('form').submit()</script>
		</body></html>`)
}

// util to get a baseUrl for inernal requests
const baseUrl = req => `${req.protocol}://${req.get('host')}`

module.exports = app => {
	app.use(bodyParser.json({limit: "2mb"}))
	app.use(bodyParser.urlencoded({extended: false}))
	app.enable('trust proxy') // allows node to trust proxy headers (like on heroku)

	// index page with links to all the launch types
	app.get('/', (req, res) => {
		res.set('Content-Type', 'text/html')
		res.send(`<html>
			<head>
			<title>Random LTI Launcher tool</title>
			</head><body>
			<h1>Random LTI Launcher tool</h1>
			<p>Edit the url below to link to your module.</p>
			<pre>${baseUrl(req)}/launch?url=https://obojobo-free-for-teachers.herokuapp.com/view/00000000-0000-0000-0000-000000000000</pre>
			<pre>${baseUrl(req)}/launch?url=https://&lt;HOST&gt;/view/&lt;DRAFT_ID&gt;</pre>
			<p><a href="${baseUrl(req)}/launch?url=https://obojobo-free-for-teachers.herokuapp.com/view/00000000-0000-0000-0000-000000000000">Example link</a></p>
			</body></html>`)
	})

	app.get('/dev', (req, res) => {
		// res.set('Content-Type', 'text/html')
		// res.sendFile(path.join(__dirname+'/../templates/index.html'))
		res.render('../templates/index.ejs', {foo: 'FOO'});
	})

	// builds a document view lti launch and submits it
	app.get('/launch', (req, res) => {
		const resource_link_id = req.query.resource_link_id || defaultResourceLinkId
		const isInstructor = isTrueParam(req.query.is_instructor)
		const person = randomUser({isInstructor})
		const params = {
			lis_outcome_service_url: 'https://example.fake/outcomes/fake',
			lti_message_type: 'basic-lti-launch-request',
			lti_version: 'LTI-1p0',
			resource_link_id,
			score_import: isTrueParam(req.query.score_import) ? 'true' : 'false'
		}
		renderLtiLaunch({ ...ltiContext, ...person, ...params }, 'POST', req.query.lti_key, req.query.lti_secret, decodeURIComponent(req.query.url), res)
	})

	// builds a valid course navigation lti launch and submits it
	app.get('/course_navigation', (req, res) => {
		const resource_link_id = req.query.resource_link_id || defaultResourceLinkId
		const isInstructor = isTrueParam(req.query.is_instructor)
		const person = randomUser({isInstructor})
		const params = {
			launch_presentation_css_url: 'https://example.fake/nope.css',
			launch_presentation_document_target: 'frame',
			launch_presentation_locale: 'en-US',
			launch_presentation_return_url: 'https://example.fake/fake-return.html',
			lis_course_offering_sourcedid: 'DD-ST101',
			lis_course_section_sourcedid: 'DD-ST101:C1',
			lis_outcome_service_url: 'https://example.fake/outcomes/fake',
			lis_result_sourcedid: 'UzMyOTQ0NzY6Ojo0Mjk3ODUyMjY6OjoyOTEyMw==',
			lti_message_type: 'basic-lti-launch-request',
			lti_version: 'LTI-1p0',
			resource_link_id,
			resource_link_title: 'Phone home'
		}
		renderLtiLaunch(
			{ ...ltiContext, ...person, ...ltiToolConsumer, ...params },
			'POST',
			req.query.lti_key,
			req.query.lti_secret,
			decodeURIComponent(req.query.url),
			res
		)
	})

	// builds a valid resource selection lti launch and submits it
	app.get('/resource_selection', (req, res) => {
		console.log({query: req.query})
		const isInstructor = isTrueParam(req.query.is_instructor)
		const person = randomUser({isInstructor})
		const params = {
			accept_copy_advice: 'false',
			accept_media_types: '*/*',
			accept_multiple: 'false',
			accept_presentation_document_targets: 'embed,frame,iframe,window,popup,overlay,none',
			accept_unsigned: 'false',
			auto_create: 'true',
			can_confirm: 'false',
			content_item_return_url: `${baseUrl(req)}/return_resource_selection?test=this%20is%20a%20test`,
			launch_presentation_css_url: 'https://example.fake/nope.css',
			launch_presentation_locale: 'en-US',
			lti_message_type: 'ContentItemSelectionRequest',
			lti_version: 'LTI-1p0',
			data: "this opaque 'data' should be sent back to the LMS!"
		}
		renderLtiLaunch(
			{ ...ltiContext, ...person, ...ltiToolConsumer, ...params },
			'POST',
			req.query.lti_key,
			req.query.lti_secret,
			decodeURIComponent(req.query.url),
			res
		)
	})

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
