<template>
  <div class="homepage">

    <header class="intro">
      <h1>LTI Launchpad</h1>
      <p>
        Open source tools for developers and admins working with Learning Tools Interoperability systems.
      </p>

      <p>
        Privacy: No credentials are stored on the server, they're all stored locally in your browser.  Furthermore, this tool is open source for transparency's sake.
      </p>
    </header>

    <section id="setup">
      <div id="setup-integration" class="form-container">
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
        <div class="button-group">
          <button class="action" @click="saveConfig()">Save Config</button>
          <button class="action" v-if="savedConfigs.length" @click="toggleConfigList()">Restore Config...</button>
        </div>
        <div v-if="showConfigs" name="my-first-modal">
          <div v-for="(value, index) in savedConfigs" v-bind:key="index">
            {{ value.baseURL }}
            <button @click="restoreConfig(value)">Restore</button>
            <button @click="deleteConfig(index)">Delete</button>
          </div>
          <div class="button-group">
            <button class="close action"  @click="toggleConfigList()">Close</button>
          </div>
        </div>
      </div>

      <div id="setup-user" class="form-container">
        <h3>Setup User</h3>
        <ul>
          <li>EMAIL: <input v-model="email" placeholder="user email" /></li>
          <li>NAME: <input v-model="familyName" placeholder="user last name" /></li>
          <li>FULL NAME: <input v-model="fullName" placeholder="user full name" /></li>
          <li>GIVEN NAME: <input v-model="givenName" placeholder="Random Instructor" /></li>
          <li>SOURCEDID: <input v-model="sourcedId" placeholder="rand:555" /></li>
          <li>ROLES: <input v-model="roles" placeholder="Instructor" /></li>
          <li>USERID: <input v-model="userId" placeholder="555" /></li>
        </ul>

        <p>Generate a random:
        <button @click="randomizeUser({student: false})">Instructor</button>
        or
        <button @click="randomizeUser({student: true})">Student</button>
        </p>

        <div class="button-group">
          <button class="action" @click="saveUser()">Save User</button>
          <button class="action" v-if="savedUsers.length" @click="toggleUserList()">Restore User...</button>
        </div>

        <div v-if="showUsers" name="my-first-modal">
          <div v-for="(value, index) in savedUsers" v-bind:key="index">
            {{ value.fullName }}
            <button @click="restoreUser(value)">Restore</button>
            <button @click="deleteUser(index)">Delete</button>
          </div>
          <div class="button-group">
            <button class="action close" @click="toggleUserList()">Close</button>
          </div>
        </div>

      </div>
    </section>

    <section id="launch">
      <div class="form-container">
        <h3>Launch</h3>

        <div class="launch-group">
          <button class="action launch" @click="clickLink(COURSE_NAV, 'course_1');">Launch Course Nav</button>
          Simulate a nav menu LTI launch.
          <div class="small-detail">url: {{ baseURL }}{{ launchURL }}</div>
        </div>

        <div class="launch-group">
          <button class="action launch" @click="clickLink(RESOURCE_SELECTION, 'course_1');">Launch Resource Selection</button>
          Simulate choosing a resource to place in a course.
          <div class="small-detail">url: {{ baseURL }}{{ resourceSelectionUrl }}</div>
        </div>

        <div class="launch-group">
          <button class="action launch" @click="clickLink(ASSIGNMENT, 'course_1');">Launch Assignment</button>
          Simulate starting an assignment in a course.
          <div class="small-detail">url: {{ baseURL }}{{ launchURL }}</div>
        </div>

     </div>
    </section>

    <footer>
      <h3>By us. For Everyone.</h3>
      <p>
        Created by <a href="https://openeducloud.com/">OpenEduCloud</a> &amp; the founding people behind <a href="https://ucfopen.github.io/">Obojobo &amp; Materia</a>.
      </p>
    </footer>

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
    params: {},
    showUsers: false,
    savedUsers: [],
    showConfigs: false,
    savedConfigs: [],
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

    if(localStorage.savedUsers) this.savedUsers = JSON.parse(localStorage.savedUsers)
    if(localStorage.savedConfigs) this.savedConfigs = JSON.parse(localStorage.savedConfigs)
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
    saveConfig(){
      this.savedConfigs.push({
        baseURL: this.baseURL,
        launchURL: this.launchURL,
        courseNavUrl: this.courseNavUrl,
        resourceSelectionUrl: this.resourceSelectionUrl,
        resourceLinkId: this.resourceLinkId,
        ltiKey: this.ltiKey,
        ltiSecret: this.ltiSecret,
      })

      localStorage.savedConfigs = JSON.stringify(this.savedConfigs)
    },

    toggleConfigList(){
      this.showConfigs = ! this.showConfigs
    },

    restoreConfig(config){
      this.baseURL = config.baseURL
      this.launchURL = config.launchURL
      this.courseNavUrl = config.courseNavUrl
      this.resourceSelectionUrl = config.resourceSelectionUrl
      this.resourceLinkId = config.resourceLinkId
      this.ltiKey = config.ltiKey
      this.ltiSecret = config.ltiSecret
    },

    deleteConfig(index){
      this.savedConfigs.splice(index, 1)
      localStorage.savedConfigs = JSON.stringify(this.savedConfigs)
      if(this.savedConfigs.length < 1) this.showConfigs = false
    },

    saveUser(){
      this.savedUsers.push({
        email: this.email,
        familyName: this.familyName,
        fullName: this.fullName,
        givenName: this.givenName,
        sourcedId: this.sourcedId,
        roles: this.roles,
        userId: this.userId,
      })

      localStorage.savedUsers = JSON.stringify(this.savedUsers)
    },

    toggleUserList(){
      this.showUsers = ! this.showUsers
    },

    restoreUser(user){
        this.email = user.email
        this.familyName = user.familyName
        this.fullName = user.fullName
        this.givenName = user.givenName
        this.sourcedId = user.sourcedId
        this.roles = user.roles
        this.userId = user.userId
    },

    deleteUser(index){
      this.savedUsers.splice(index, 1)
      localStorage.savedUsers = JSON.stringify(this.savedUsers)
      if(this.savedUsers.length < 1) this.showUsers = false
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

header {
  margin-bottom: 3em;
}

ul {
  list-style-type: none;
  padding: 0;
}

.form-container {
  max-width: 600px;
  padding: 1em 1.2em;
  margin: 1em auto 3em auto;
  border: 1px solid rgba(0,0,0,.1);
  border-radius: 1em;
  box-sizing: border-box;
}

.form-container ul{
  width:100%;
  text-align: left;
}

.form-container ul li{
  margin-bottom: .3em;
}

.form-container input {
  width: 380px;
  border: 1px solid #ccc;
  padding: .3em;
}

.form-container h3:first-of-type {
  font-size: 1.5em;
  margin: 0 auto;
  margin-top: -1.5em;
  background-color: rgba(255,255,255,.5);
  width: 70%;
}

button.action {
  padding: 1em;
  margin: 1em;
  border: 0;
  border-radius: .5em;
  background-color: #1181b7;
  color: white;
  font-weight: bold;
}

button.launch:before {
  content: "🚀 ";
}

button.close{
  background-color: #889095;
}

button.close:before{
  color: #ffdada;
  content: "✖ ";
}

.launch-group {
  margin-top: 1.5em;
  border-bottom: 1px solid rgba(0,0,0,.05);
  padding-bottom: 1em;
}
.launch-group:last-of-type {
  border-bottom:0;
}

.launch-group button{
  display: block;
  margin: 1em auto;
}

.small-detail {
  font-size: .8em;
}

a {
  color: #42b983;
}
</style>
