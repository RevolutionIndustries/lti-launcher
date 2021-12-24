const sig = require('oauth-signature')
const bodyParser = require('body-parser')
const keys = new Map()

try{
	// KEY_JSON='{"url-without-protocol-or-trailing-slash.com":{"key":"lti-key","secret":"lti-secret"}}'
	const configKeys = JSON.parse(process.env.KEY_JSON)
	for (const [key, value] of Object.entries(configKeys)){
		keys.set(key, value)
	}
} catch (e){
	console.log(e)
	process.exit(1)
}

const randomUser = ({ instructor = false}) => {
	const randomIntString = Math.floor(Math.random() * Math.floor(999999999)) + ''
	const typeString = instructor ? 'Instructor' : 'Learner'
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
const renderLtiLaunch = (paramsIn, method, endpoint, res) => {
	const url = new URL(endpoint)
	if(!keys.has(url.hostname)) throw Error(`Unable to locate lti config for ${url.hostname}`)

	const {key, secret} = keys.get(url.hostname)

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
			<p><a href="${baseUrl(req)}/launch?url=https://obojobo-free-for-teachers.herokuapp.com/view/00000000-0000-0000-0000-000000000000">Example link</a></p>
			</body></html>`)
	})

	// builds a document view lti launch and submits it
	app.get('/launch', (req, res) => {
		const resource_link_id = req.query.resource_link_id || defaultResourceLinkId
		const person = randomUser({instructor: false})
		const method = 'POST'
		const params = {
			lis_outcome_service_url: 'https://example.fake/outcomes/fake',
			lti_message_type: 'basic-lti-launch-request',
			lti_version: 'LTI-1p0',
			resource_link_id
		}
		renderLtiLaunch({ ...person, ...params }, method, decodeURIComponent(req.query.url), res)
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
