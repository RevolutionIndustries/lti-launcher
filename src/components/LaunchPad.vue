<template>
  <div class="hello">
    <h1>LTI Launchpad</h1>
    <p>
      Open source tools for developers and admins working with Learning Tools Interoperability systems.
    </p>

    <div class="setup">
      <h3>Setup Integration</h3>
      <ul>
        <li>BASE URL: <input v-model="baseURL" placeholder="base url like https://site.com" /></li>
        <li>ASSIGNMENT URL: <input v-model="launchURL" placeholder="url to send lti launch to" /></li>
        <li>COURSE NAV URL: <input v-model="courseNavUrl" placeholder="url to send courseNav launch to" /></li>
        <li>SELECTION URL: <input v-model="resourceSelectionUrl" placeholder="" /></li>
        <li>RESOURCE LINK ID: <input v-model="resourceLinkId" placeholder="" /></li>
        <li>LTI KEY: <input v-model="ltiKey" placeholder="enter an lti key" /></li>
        <li>LTI SECRET: <input v-model="ltiSecret" placeholder="enter an lti secret" /></li>
      </ul>
      <h4>Setup User</h4>
      <ul>
        <li>EMAIL: <input v-model="email" placeholder="user email" /></li>
        <li>NAME: <input v-model="familyName" placeholder="user last name" /></li>
        <li>FULL NAME: <input v-model="fullName" placeholder="user full name" /></li>
        <li>GIVEN NAME: <input v-model="givenName" placeholder="Random Instructor" /></li>
        <li>SOURCEDID: <input v-model="sourcedId" placeholder="rand:555" /></li>
        <li>ROLES: <input v-model="roles" placeholder="Instructor" /></li>
        <li>USERID: <input v-model="userId" placeholder="555" /></li>
        https://www.imsglobal.org/spec/lti/v1p3/#resource-link
      </ul>
      <button @click="saveUser()">Save User</button>
      <button @click="restoreUser()">Restore User</button>
      <h3>Generate Random User</h3>
      <button @click="randomizeUser({student: false})">Instructor</button>
      <button @click="randomizeUser({student: true})">Student</button>
    </div>

    <h3>Launch</h3>
    <ul>
			<li><b>LTI Course Nav:</b> (simulate launch from LMS nav menu)
				<ul>
					<li>
            <button @click="clickLink(COURSE_NAV, 'course_1');">Launch from Course Nav</button>
            ({{ baseURL }}{{ launchURL }})
          </li>
          <li>
              <button @click="clickLink(RESOURCE_SELECTION, 'course_1');">Launch Resource Selection</button>
              ({{ baseURL }}{{ resourceSelectionUrl }})
          </li>
          <li>
              <button @click="clickLink(ASSIGNMENT, 'course_1');">Launch Assignment</button>
              ({{ baseURL }}{{ launchURL }})
          </li>
				</ul>
			</li>
    </ul>

    <h3>By us. For Everyone.</h3>
    <p>
      Created by OpenEduCloud &amp; the founding people behind Obojoob &amp; Materia.
    </p>

    <form ref="form" v-bind:method="method" v-bind:action="endpoint" v-bind:target="launchURL">
        <input
          v-for="(value, name) in params"
          v-bind:key="name"
          type="hidden"
          v-bind:name="name"
          v-bind:value="value"
        />
    </form>

  </div>
</template>

<script>
const sig = require('oauth-signature')
const COURSE_NAV = 'course_navigation'
const ASSIGNMENT = 'assignment'
const RESOURCE_SELECTION = 'resource_selection'
const syncKeys = ['ltiKey','ltiSecret','baseURL','resourceLinkId','launchURL','courseNavUrl','resourceSelectionUrl','email','familyName','fullName','givenName','sourcedId','roles','userId']

const ltiContext = {
	context_id: 'S3294476',
	context_label: 'OBO4321',
	context_title: 'Obojobo Local Dev 101',
	context_type: 'CourseSection'
}

const ltiToolConsumer = {
	tool_consumer_info_product_family_code: 'obojobo-next',
	tool_consumer_instance_guid: 'obojobo.ucf.edu',
	tool_consumer_instance_name: 'University of Central Florida',
	tool_consumer_instance_url: 'https://obojobo.ucf.edu/'
}

export default {
  name: 'LaunchPad',
  data: () => ({
    method: 'POST',
    ltiKey: '',
    ltiSecret: '',
    baseURL: '',
    launchURL: '',
    resourceLinkId: '',
    courseNavUrl: '',
    resourceSelectionUrl: '',
    email: '',
    familyName: '',
    fullName: '',
    givenName: '',
    sourcedId: '',
    roles: '',
    userId: '',
    endpoint: null,
    params: {}
  }),
  props: {
    msg: String
  },
  created() {
    // establish some constants for use in the template
    this.COURSE_NAV = COURSE_NAV
    this.ASSIGNMENT = ASSIGNMENT
    this.RESOURCE_SELECTION = RESOURCE_SELECTION
  },
  mounted() {
    // when mounting, load each key from local storage into scope
    syncKeys.forEach(key => {
      if(localStorage[key]) this[key] = localStorage[key];
    })
  },
  watch: {
    ltiKey(newVal) {
      localStorage.ltiKey = newVal;
    },
    ltiSecret(newVal){
      localStorage.ltiSecret = newVal;
    },
    baseURL(newVal){
      localStorage.baseURL = newVal;
    },
    launchURL(newVal){
      localStorage.launchURL = newVal;
    },
    resourceLinkId(newVal){
      localStorage.resourceLinkId = newVal
    },
    courseNavUrl(newVal){
      localStorage.courseNavUrl = newVal;
    },
    resourceSelectionUrl(newVal){
      localStorage.resourceSelectionUrl = newVal;
    },
    email(newVal){
      localStorage.email = newVal;
    },
    familyName(newVal){
      localStorage.familyName = newVal
    },
    fullName(newVal){
      localStorage.fullName = newVal
    },
    givenName(newVal){
      localStorage.givenName = newVal
    },
    sourcedId(newVal){
      localStorage.sourcedId = newVal
    },
    roles(newVal){
      localStorage.roles = newVal
    },
    userId(newVal){
      localStorage.userId = newVal
    }
  },
  methods: {
    saveUser(){

    },
    restoreUser(){

    },
    submit(){
      const oauthParams = {
        oauth_nonce: Math.round(new Date().getTime() / 1000.0),
        oauth_timestamp: Math.round(new Date().getTime() / 1000.0),
        oauth_callback: 'about:blank',
        oauth_consumer_key: this.ltiKey,
        oauth_signature_method: 'HMAC-SHA1',
        oauth_version: '1.0'
      }

      const personParams = {
        lis_person_contact_email_primary: this.email,
        lis_person_name_family: this.familyName,
        lis_person_name_full: this.fullName,
        lis_person_name_given: this.givenName,
        lis_person_sourcedid: this.sourcedId,
        roles: this.roles,
        user_id: this.userId,
        user_image: 'https://s.gravatar.com/avatar/17f34572459fa620071cae55d7f1eacb?s=80'
      }

      let params = {...this.params, ...personParams, ...oauthParams}
      const hmac_sha1 = sig.generate(this.method, this.endpoint, params, this.ltiSecret, '', {encodeSignature: false})

      params.oauth_signature = hmac_sha1
      this.params = {...params, ...oauthParams}

      // render to form then submit
      this.$nextTick(() => {
          this.$refs.form.submit()
          console.log(this.params)
      });

    },
    randomizeUser({student = false}) {
      const randomIntString = Math.floor(Math.random() * Math.floor(999999999)) + ''
      const typeString = student ? 'Learner' : 'Instructor'

      localStorage.email = this.email = `rand-${randomIntString}@obojobo.com`
      localStorage.familyName = this.familyName = randomIntString
      localStorage.fullName = this.fullName = `Random ${typeString} ${randomIntString}`
      localStorage.givenName = this.givenName = `Random ${typeString}`
      localStorage.sourcedId = this.sourcedId = `rand:${randomIntString}`
      localStorage.roles = this.roles = typeString
      localStorage.userId = this.userId = randomIntString
    },
    clickLink(mode, course, scoreImport = false) {
      // let modeUrl
      // let launchInFrame = false
      switch(mode){
        case ASSIGNMENT:
          {
            this.endpoint = this.baseURL + this.launchURL
            const extraParams = {
              lis_outcome_service_url: 'https://example.fake/outcomes/fake',
              lti_message_type: 'basic-lti-launch-request',
              lti_version: 'LTI-1p0',
              resource_link_id: this.resourceLinkId,
              score_import: true
            }
            this.params = {...ltiContext, ...extraParams}
          }
          break;

        case COURSE_NAV:
          {
            this.endpoint = this.baseURL + this.courseNavUrl
            // eslint-disable-next-line no-case-declarations
            const extraParams = {
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
              resource_link_id: this.resourceLinkId,
              resource_link_title: 'Phone home'
            }
            this.params = {...ltiContext, ...ltiToolConsumer, ...extraParams}
          }
          break;

        case RESOURCE_SELECTION:
          {
            this.endpoint = this.baseURL + this.resourceSelectionUrl

            const extraParams = {
              accept_copy_advice: 'false',
              accept_media_types: '*/*',
              accept_multiple: 'false',
              accept_presentation_document_targets: 'embed,frame,iframe,window,popup,overlay,none',
              accept_unsigned: 'false',
              auto_create: 'true',
              can_confirm: 'false',
              content_item_return_url: `${location.protocol}//${location.host}/lti/dev/return/resource_selection`,
              launch_presentation_css_url: 'https://example.fake/nope.css',
              launch_presentation_locale: 'en-US',
              lti_message_type: 'ContentItemSelectionRequest',
              lti_version: 'LTI-1p0',
              data: "this opaque 'data' should be sent back to the LMS!"
            }
            this.params = {...ltiContext, ...ltiToolConsumer, ...extraParams}
          }
          break;
      }
      console.log({scoreImport, course})
      this.submit()
      // params.append('score_import', scoreImport ? 'true' : 'false')

      // if(launchInFrame){
        // const iframeEl = document.getElementById('the-iframe')
        // iframeEl.src = window.location.origin+modeUrl+'?'+params.toString();
        // iframeEl.scrollIntoView()
      // } else {
      // window.location.href = window.location.origin+modeUrl+'?'+params.toString();

      // }
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}

.setup{
  max-width: 600px;
  margin: 0 auto;
}

.setup ul{
  width:100%;
  text-align: left;
}

.setup input {
  width: 400px;
}

a {
  color: #42b983;
}
</style>
