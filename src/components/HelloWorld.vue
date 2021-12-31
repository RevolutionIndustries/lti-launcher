<template>
  <div class="hello">
    <h1>LTI Rocket Launcher</h1>
    <p>
      Open source tools for developers and admins working with Learning Tools Interoperability systems.
    </p>
    <div class="setup">
      <h3>Setup</h3>
      <ul>
        <li>LTI KEY: <input v-model="ltiKey" placeholder="enter an lti key" /></li>
        <li>LTI SECRET: <input v-model="ltiSecret" placeholder="enter an lti secret" /></li>
        <li>LAUNCH URL: <input v-model="launchURL" placeholder="url to send lti launch to" /></li>
        <li>COURSE NAV URL: <input v-model="courseNavUrl" placeholder="url to send courseNav launch to" /></li>
        <li>SELECTION URL: <input v-model="resourceSelectionUrl" placeholder="" /></li>
        <li>EMAIL: <input v-model="email" placeholder="user email" /></li>
        <li>NAME: <input v-model="familyName" placeholder="user last name" /></li>
        <li>FULL NAME: <input v-model="fullName" placeholder="user full name" /></li>
        <li>GIVEN NAME: <input v-model="givenName" placeholder="Random Instructor" /></li>
        <li>SOURCEDID: <input v-model="sourcedId" placeholder="rand:555" /></li>
        <li>ROLES: <input v-model="roles" placeholder="Instructor" /></li>
        <li>USERID: <input v-model="userId" placeholder="555" /></li>

        https://www.imsglobal.org/spec/lti/v1p3/#resource-link
      </ul>
      <button @click="randomizeUser({student: false})">Random Instructor</button>
      <button @click="randomizeUser({student: true})">Random Student</button>
    </div>
    <h3>Launch</h3>
    <ul>
			<li><b>LTI Course Nav:</b> (simulate launch from LMS nav menu)
				<ul>
					<li><a href="#" onClick="clickLink(COURSE_NAV, 'course_1', false, true);">as an Instructor</a></li>
					<li><a href="#" onClick="clickLink(COURSE_NAV, 'course_1');">as a Student</a></li>
				</ul>
			</li>
    </ul>
    <h3>By us. For Everyone.</h3>
    <p>
      Created by OpenEduCloud &amp; the founding people behind Obojoob &amp; Materia.
    </p>
  </div>
</template>

<script>
const COURSE_NAV = 'course_navigation'
const ASSIGNMENT = 'assignment'
const RESOURCE_SELECTION = 'resource_selection'
const syncKeys = ['ltiKey','ltiSecret','launchURL','courseNavUrl','resourceSelectionUrl','email','familyName','fullName','givenName','sourcedId','roles','userId']
export default {
  name: 'HelloWorld',
  data: () => ({
    ltiKey: '',
    ltiSecret: '',
    launchURL: '',
    courseNavUrl: '',
    resourceSelectionUrl: '',
    email: '',
    familyName: '',
    fullName: '',
    givenName: '',
    sourcedId: '',
    roles: '',
    userId: ''
  }),
  props: {
    msg: String
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
    launchURL(newVal){
      localStorage.launchURL = newVal;
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
    clickLink(mode, course, scoreImport = false, isInstructor = false) {
      let modeUrl
      let launchInFrame = false
      let url
      switch(mode){
        case ASSIGNMENT:
          modeUrl = '/launch'
          url = document.getElementById('launch_url').value
          break;

        case COURSE_NAV:
          modeUrl = '/course_navigation'
          url = document.getElementById('course_nav_url').value
          break;

        case RESOURCE_SELECTION:
          modeUrl = '/resource_selection'
          url = document.getElementById('course_resource_selection_url').value
          launchInFrame = true
          break;
      }

      const params = new URLSearchParams()
      params.append('url', url)
      params.append('is_instructor', isInstructor ? 'true' : 'false')
      params.append('resource_link_id', course)
      params.append('score_import', scoreImport ? 'true' : 'false')
      params.append('lti_key', this.ltiKey)
      params.append('lti_secret', this.ltiSecret)

      console.log({launchInFrame})
      if(launchInFrame){
        const iframeEl = document.getElementById('the-iframe')
        iframeEl.src = window.location.origin+modeUrl+'?'+params.toString();
        iframeEl.scrollIntoView()
      } else {
        window.location.href = window.location.origin+modeUrl+'?'+params.toString();
      }
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

.setup li {

  /* display: inline-block; */
  /* margin: 0 10px; */
}

.setup input {
  width: 400px;
}

a {
  color: #42b983;
}
</style>
