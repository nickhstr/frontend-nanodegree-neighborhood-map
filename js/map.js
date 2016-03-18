function initMap() {
  var mapDiv = document.getElementById('map');
  var map = new google.maps.Map(mapDiv, {
    center: {lat: 37.7733, lng: -122.4367},
    zoom: 12
  });
}

/**
 * Generates a random number and returns it as a string for OAuthentication
 * @return {string}
 */
function nonce_generate() {
  return (Math.floor(Math.random() * 1e12).toString());
}

var yelp_url = 'https://api.yelp.com/v2/search/';

    var parameters = {
      oauth_consumer_key: 'sfsZU7Pw3g9SafRXI1MUEQ',
      oauth_token: 'slAPQjSSRtcYjlHPLlGjF8LVnHpAr8gc',
      oauth_nonce: nonce_generate(),
      oauth_timestamp: Math.floor(Date.now()/1000),
      oauth_signature_method: 'HMAC-SHA1',
      oauth_version : '1.0',
      callback: 'cb',
      location: 'San+Francisco,+CA',
      sort: '2'              // This is crucial to include for jsonp implementation in AJAX or else the oauth-signature will be wrong.
    };

    var encodedSignature = oauthSignature.generate('GET',yelp_url, parameters, 'xQTSPiz7FAt8-cyI9m66L6hTtfI', '-AbNK3guQzneMaOBEqEeFwMVKcI');
    parameters.oauth_signature = encodedSignature;

    var settings = {
      url: yelp_url,
      data: parameters,
      cache: true,                // This is crucial to include as well to prevent jQuery from adding on a cache-buster parameter "_=23489489749837", invalidating our oauth-signature
      dataType: 'jsonp',
      success: function(results) {
        // Do stuff with results
        for (var i = 0; i < results.businesses.length; i++) {
        	console.log(results.businesses[i].name);
        }
      },
      fail: function() {
        // Do stuff on fail
        console.log('Not quite right');
      }
    };

    // Send AJAX query via jQuery library.
    $.ajax(settings);