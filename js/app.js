//======== MODEL ========//

// Declare map variable globally, to make it available in every function
var map;

// Google Maps error function
function mapError() {
    alert('Aww snap!\nGoogle Maps is temporarily unavailable.\nPlease try again later.');
}

// Callback function for Google Maps api, to initialize the map
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

    // Load the app after map has loaded, beginning with the Yelp ajax call
    initApp();
}

// Class for Business object, AKA Yelp place/location
var Business = function(name, address, img, rating, latLong, category, match) {
    this.name = name;
    this.address = address;
    this.img = img;
    this.rating = rating;
    this.latLong = {
        lat: latLong.latitude,
        lng: latLong.longitude
    };
    this.category = category;
    this.match = match;
};

// Observable array for Business objects
var businesses = ko.observableArray([]);

// Creates new marker, based on the properties of a Business object
function addMarker(business) {
    // The marker
    var marker = new google.maps.Marker({
        position: business.latLong,
        map: map,
        animation: null
    });
    // An info window for the marker
    var infoWindow = new google.maps.InfoWindow({
        content: '<div class="info"><div class="info-text"><p class="title">' + business.name +
            '</p><p class="address">' + business.address[0] + '</p><p class="address">' + business.address[1] +
            '</p><p class="address">' + business.address[2] + '</p></div><div class="bus-img"><img src="' + business.img +
            '" alt="Picture of Place"></div><p class="rating">' + business.rating + ' out of 5</p> </div>'
    });
    // Click listener which opens the info window and animates the marker
    marker.addListener('click', function() {
        businesses().forEach(function(business) {
            business.infoWindow.close();
        });
        infoWindow.open(map, marker);
        toggleBounce(marker);
        setTimeout(function() {
            marker.setAnimation(null);
        }, 700);
    });

    // Add the info window and marker to the current Business object
    business.infoWindow = infoWindow;
    business.marker = marker;
}

// Animation function for marker, especially useful for setTimeout
function toggleBounce(m) {
    if (m.getAnimation() !== null) {
        m.setAnimation(null);
    } else {
        m.setAnimation(google.maps.Animation.BOUNCE);
    }
}

// Declared globally to check display size from within a function
var display = (window.innerWidth <= 450);

function initApp() {
    // Shout out to Mark N (Udacity Coach) for the oauth parameters code below

    // Generates a random number and returns it as a string for OAuthentication
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
        callback: 'cb', // This is crucial to include for jsonp implementation in AJAX or else the oauth-signature will be wrong
        location: 'San+Francisco,+CA',
        sort: '2' // Sorts results by highest rated
    };

    var encodedSignature = oauthSignature.generate('GET', yelp_url, parameters, 'xQTSPiz7FAt8-cyI9m66L6hTtfI', '-AbNK3guQzneMaOBEqEeFwMVKcI');
    parameters.oauth_signature = encodedSignature;

    // Timeout for error handling.
    var yelpRequestTimeout = setTimeout(function(){
        alert('Aw snap!\nYelp is temporarily unavailable.\nPlease try again later.');
    }, 8000);

    var settings = {
        url: yelp_url,
        data: parameters,
        cache: true, // This prevents jQuery's cache-busting parameter "_=23489489749837"
        dataType: 'jsonp',
        success: function(results) {
            clearTimeout(yelpRequestTimeout);

            for (var i = 0; i < results.businesses.length; i++) {
                var name = results.businesses[i].name;
                var address = results.businesses[i].location.display_address;
                var img = results.businesses[i].image_url;
                var rating = results.businesses[i].rating;
                var latLong = results.businesses[i].location.coordinate;
                var category = results.businesses[i].categories[0][0];
                var match = ko.observable(true);
                businesses.push(new Business(name, address, img, rating, latLong, category, match));

                addMarker(businesses()[i]);
            }
        }
    };

    // jQuery ajax call for Yelp data
    $.ajax(settings);


    //======== VIEW-MODEL ========//

    var ViewModel = function() {
        // To avoid issues with using 'this' within methods
        var self = this;

        // Set to previously defined 'businesses' observable array
        self.businesses = businesses;

        // Holds the value in the search bar
        self.search = ko.observable('');

        // When a business in list is clicked, this method opens its infowindow and animates its marker
        self.moreInfo = function(business) {
            google.maps.event.trigger(business.marker, 'click');
        };

        // Filters list and markers based on search value when search is submitted
        self.submit = function() {
            if (self.search() !== '') {
                // Split the search query up
                var words = self.search().toLowerCase().split(' ');

                // For each word in search query
                words.forEach(function(word) {
                    // For each business in the businesses list
                    self.businesses().forEach(function(business) {
                        // Hide each business and its marker
                        business.match(false);
                        business.marker.setMap(null);
                        // If a word in the search query matches a word in the business name or cateogory, the business and its marker are visible
                        if (business.name.toLowerCase().indexOf(word) !== -1 || business.category.toLowerCase().indexOf(word) !== -1) {
                            business.match(true);
                            business.marker.setMap(map);
                        }
                    });
                });
            // If the search query is empty, make every list item and marker visible
            } else if (self.search() === '') {
                self.businesses().forEach(function(business) {
                    business.match(true);
                    business.marker.setMap(map);
                });
            }
        };

        // Obvservable used for switching visibility of entire list, triggered by click of div.yelp
        self.listHidden = ko.observable(display);

        // Method for showing/hiding entire list
        self.collapse = function() {
            if (self.listHidden()) {
                self.listHidden(false);
            } else {
                self.listHidden(true);
            }
        };
    };
    // Bind ViewModel to index.html
    ko.applyBindings(new ViewModel());
}