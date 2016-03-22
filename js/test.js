//======== MODEL ========//
var map;

function initMap() {
    var mapDiv = document.getElementById('map');
    map = new google.maps.Map(mapDiv, {
        center: {
            lat: 37.7733,
            lng: -122.4167
        },
        zoom: 13,
        mapTypeControlOptions: {
            position: google.maps.ControlPosition.LEFT_BOTTOM
        }
    });
    initApp();
}

var Business = function(name, address, img, rating, latLong, category) {
    this.name = name;
    this.address = address;
    this.img = img;
    this.rating = rating;
    this.latLong = {
        lat: latLong.latitude,
        lng: latLong.longitude
    };
    this.category = category;
};

var businesses = ko.observableArray([]);

function addMarker(business) {
    var marker = new google.maps.Marker({
        position: business.latLong,
        map: map
    });
    var infoWindow = new google.maps.InfoWindow({
        content: '<div class="info"><div class="info-text"><p class="title">' + business.name +
                '</p><p class="address">' + business.address[0] + '</p><p class="address">' + business.address[1] +
                '</p><p class="address">' + business.address[2] + '</p></div><div class="bus-img"><img src="' + business.img +
                '" alt="Picture of Place"></div><p class="rating">' + business.rating + ' out of 5</p> </div>'
    });
    marker.addListener('click', function() {
        infoWindow.open(map, marker);
    });

    business.infoWindow = infoWindow;
    business.marker = marker;
}

function initApp() {
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
        oauth_timestamp: Math.floor(Date.now() / 1000),
        oauth_signature_method: 'HMAC-SHA1',
        oauth_version: '1.0',
        callback: 'cb',
        location: 'San+Francisco,+CA',
        sort: '2' // This is crucial to include for jsonp implementation in AJAX or else the oauth-signature will be wrong.
    };

    var encodedSignature = oauthSignature.generate('GET', yelp_url, parameters, 'xQTSPiz7FAt8-cyI9m66L6hTtfI', '-AbNK3guQzneMaOBEqEeFwMVKcI');
    parameters.oauth_signature = encodedSignature;

    var settings = {
        url: yelp_url,
        data: parameters,
        cache: true, // This prevents jQuery's cache-busting parameter "_=23489489749837".
        dataType: 'jsonp',
        success: function(results) {
            // Do stuff with results
            for (var i = 0; i < results.businesses.length; i++) {
                var name = results.businesses[i].name;
                var address = results.businesses[i].location.display_address;
                var img = results.businesses[i].image_url;
                var rating = results.businesses[i].rating;
                var latLong = results.businesses[i].location.coordinate;
                var category = results.businesses[i].categories[0][0];
                businesses.push(new Business(name, address, img, rating, latLong, category));

                addMarker(businesses()[i]);
            }
        },
        fail: function() {
            // Do stuff on fail
            alert("Aw snap!\nThis app is temporarily unavailable.\nPlease try again later.");
        }
    };

    $.ajax(settings);


//======== VIEW-MODEL ========//

    var ViewModel = function() {
        var self = this;

        self.businesses = businesses;

        self.search = ko.observable("");

        self.alert = function() {
            alert("It worked!");
        };

        self.moreInfo = function(business) {
            business.infoWindow.open(map, business.marker);
        };
    };

    ko.applyBindings(new ViewModel());
}