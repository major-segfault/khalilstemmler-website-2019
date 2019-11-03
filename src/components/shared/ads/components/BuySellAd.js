import React from 'react'
import "../styles/BuySellAd.css"

export function initBuySellAd () {
  try {
    if (
      typeof window !== 'undefined' &&
      typeof window._bsa !== 'undefined' 
      && window._bsa) {
        window._bsa.init('custom', 'CK7D42QU', 'placement:khalilstemmler.com',
    {
      target: '.custom-slant',
      template: `
<a href="##link##" class="native-banner">
  <div class="native-sponsor-container">
    <div class="native-sponsor">
      <div class="native-label">Sponsor</div>
      <div class="native-company">##company##</div>
    </div>
  </div>
  <div class="native-main">
    <img class="native-logo" src="##logo##" style="background-color: ##backgroundColor##">
    <div class="native-text">
      <div class="native-tagline">##tagline##</div>
      <div class="native-description">##description##</div>
      <div class="native-cta">##callToAction##</div>
    </div>
  </div>
</a>
    `
        }
      );
    }
  } catch (err) {
  }
}

class BuySellAd extends React.Component {
  render () {
    return (
      <div class="custom-slant"></div>
    )
  }
}

export default BuySellAd;