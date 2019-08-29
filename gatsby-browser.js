require("./src/assets/styles/global.sass");
require('rodal/lib/rodal.css')
const React = require("react")
const bugsnag = require('@bugsnag/js')
const bugsnagReact = require('@bugsnag/plugin-react')

const ReactGA = require('react-ga')

require('./static/scripts/amplitude')
const domain = 'khalilstemmler.com'
let id = 'NOPE'

const isProd = document.location.hostname.indexOf(domain) !== -1;

if (isProd) {
  id = 'UA-75700925-1'
  console.log('[Site]: Google Analytics started in prod.')
  require('./static/scripts/hotjar')
} else {
  console.log('[Site]: Google Analytics not started.')
}

ReactGA.initialize(id)

exports.onRouteUpdate = ({ location, prevLocation }) => {
  console.log('new pathname', location.pathname)
  console.log('old pathname', prevLocation ? prevLocation.pathname : null)

  ReactGA.pageview(location.pathname + location.search + location.hash)
}

function loadScript (src) {
  return new Promise(function(resolve, reject){
    var script = document.createElement('script');
    script.src = src;
    script.addEventListener('load', function () {
      resolve();
    });
    script.addEventListener('error', function (e) {
      reject(e);
    });
    document.body.appendChild(script);
  })
};
// Promise Interface can ensure load the script only once.
loadScript('https://platform.twitter.com/widgets.js');


const bugsnagClient = bugsnag('6ebb797b32abf0914738a154bea1971b')
bugsnagClient.use(bugsnagReact, React)

// wrap your entire app tree in the ErrorBoundary provided
const ErrorBoundary = bugsnagClient.getPlugin('react')

function showQuizAnswer (id) {
  try {
    document.getElementById(id).style.display = 'block';
  } catch (err) {
    console.log(err);
  }
}

window.showQuizAnswer = showQuizAnswer;

exports.wrapRootElement = ({ element }) => (
  <ErrorBoundary>
    {element}
  </ErrorBoundary>
);
