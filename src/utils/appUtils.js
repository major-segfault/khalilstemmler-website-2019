
class AppUtils {
  getAPIUrl () {
    if (this.isDevelopment()) {
      return 'http://localhost:9021'
    } else {
      return 'https://khalil-stemmler-backend.herokuapp.com'
    }
  }

  isDevelopment () {
    return typeof 'window' !== 'undefined' && window
      .location.href.indexOf('http://localhost') === 0;
  }
}

const appUtils = new AppUtils();

export { appUtils }