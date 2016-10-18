var url = 'data/tweets.json';
var MAP_NAME = 'TESTING';
var TWEET_HASHTAG  = '#clmtest';

function getParameterByName(name, url) {
	if (!url) url = window.location.href;
	name = name.replace(/[\[\]]/g, "\\$&");
	var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
	    results = regex.exec(url);
	if (!results) return null;
	if (!results[2]) return '';
	return decodeURIComponent(results[2].replace(/\+/g, " "));
}

//
// Some way to load data
//
function ajax(url, callback, data, x) {
	try {
		x = new(this.XMLHttpRequest || ActiveXObject)('MSXML2.XMLHTTP.3.0');
		x.open(data ? 'POST' : 'GET', url, 1);
		x.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
		x.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
		x.onreadystatechange = function () {
			x.readyState > 3 && callback && callback(x.responseText, x);
		};
		x.send(data)
	} catch (e) {
		// window.console && console.log(e);
	}
};


(function () {
	//
	// twitter injector here
	//
	window.twttr = (function(d, s, id) {
	    var js, fjs = d.getElementsByTagName(s)[0],
	        t = window.twttr || {};
	    if (d.getElementById(id)) return t;
	    js = d.createElement(s);
	    js.id = id;
	    js.src = "https://platform.twitter.com/widgets.js";
	    fjs.parentNode.insertBefore(js, fjs);

	    t._e = [];
	    t.ready = function(f) {
	        t._e.push(f);
	    };

	    return t;
	}(document, "script", "twitter-wjs"));

	var map;
	var ajaxRequest;
	var plotlist;
	var plotlayers=[];
	var markerGroup;
	var firstScale = true;
	var loadedData = [];
	var USE_CLUSTERING = false;
	var hashIndex = [];

	function twitterBoot () {
		window.twttr.widgets.load();
	}

	function removeMarkers() {
		for (i=0;i<plotlayers.length;i++) {
			map.removeLayer(plotlayers[i]);
		}
		plotlayers=[];
	}

	function countMarker(compareData) {
		var count = loadedData.filter(function (item) {
			return (item.data.lat === compareData.lat) && (item.data.lon === compareData.lon);
		}).length;

		return count;
	}

	function fitBounds () {
		var group = new L.featureGroup(plotlayers);
		map.fitBounds(group.getBounds());
	}

	function addMarker (markerData) {
		if (countMarker(markerData) === 0) {
			var plotll = new L.LatLng(markerData.lat, markerData.lon, true);
			var opts = {};

			if (USE_CLUSTERING === false) {
				opts = {
					bounceOnAdd: true,
				};
			}

			var customIcon = new L.icon({
				iconUrl: markerData.avatar,
				iconSize: [48, 48],
				iconAnchor: [24, 24],
				popupAnchor: [0, -10],
				className: 'twitter-avatar-marker'
			});

			opts.icon = customIcon;

			var newMarker = new L.Marker(plotll, opts);
			newMarker.data = markerData;

			// add to group
			var popupHtml = "<div style=\"text-align: center\"><h3>"
				+ "<a target=\"_blank\" href=\"https://twitter.com/"
				+ markerData.screen_name
				+ "\">"
				+ markerData.name
				+ "</a></h3>"
				+ markerData.details
				+ "</div>";

			newMarker.bindPopup(popupHtml);

			if (USE_CLUSTERING === true) {
				markerGroup.addLayer(newMarker);
				plotlayers.push(newMarker);
			} else {
				try {
					loadedData.push(newMarker);

					window.setTimeout(function () {
						newMarker.addTo(map);
					}, Math.random() * 1000);
				} catch (e) {
				}
			}
		} else {
		}
	}

	function onDataLoaded (data, callback) {
		for (i=0;i<data.length;i++) {
			// check exists
			addMarker(data[i]);
		}

		callback();
	}

	var caches = {};
	var hashes = [];

	function getData () {
		var index = 0;

		NProgress.start();

		function done () {
			NProgress.done();

			window.setTimeout(next, 10);
		}

		function next() {
			if (index < hashes.length) {
				var hash = hashes[index];

				index++;

				//if (typeof hashes[index] !== 'undefined' || true) {
					var localUrl = 'data/tweets-' + hash + '.json';

					//if (typeof caches[localUrl] === 'undefined') {
						// if (hashIndex.filter(function (item) {
						// 	return (item == hash);
						// }).length !== 0) {
							ajax(localUrl, function (stringData, xhrRequest) {
								var data = [];

								try {
									data = JSON.parse(stringData);
								} catch (e) {

								}
								// remember this data
								//caches[localUrl] = data;
								onDataLoaded(data, function() {
									done();
								});
							});
						// } else {
						// 	next();
						// }
					// } else {
					// 	onDataLoaded(caches[localUrl], function() {
					// 		done();
					// 	});
					// }
			//	}
			} else {
				done();
			}
		}

		next();
	}

	function refresh () {
		// stop existing hashes
		hashes = [];

		var bounds = map.getBounds();
		var minLat = bounds.getSouth();
		var maxLat = bounds.getNorth();
		var minLon = bounds.getWest();
		var maxLon = bounds.getEast();

		hashes = geohash.bboxes(minLat, minLon, maxLat, maxLon, 3);

		//console.log(hashes);

		getData();
	}

	function initmap(defaultLat, defaultLng, override) {
		//
		// set up the map
		//
		map = new L.Map('map');

		//
		// create the tile layer with correct attribution
		//
		var osmUrl='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
		var osmAttrib='';
		var osm = new L.TileLayer(osmUrl, {minZoom: 6, maxZoom: 15, attribution: osmAttrib});

		var mapboxUrl = 'https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={token}';
		var mapboxLayer = new L.TileLayer(mapboxUrl, {
			id: 'mapbox.emerald',
			minZoom: 6,
			maxZoom: 15,
			attribution: osmAttrib,
			token: API_KEY
		});

		//
		// start the map near Birmingham
		//
		map.setView(new L.LatLng(defaultLat, defaultLng), 10);
		map.addLayer(mapboxLayer);

		var credctrl = L.controlCredits({
			image: "img/cl.png",
			link: "http://www.cornerstonelabs.co.uk/",
			text: "Interactive map<br/>by Cornerstone Labs",
			position: 'bottomleft',
			width: 30,
			height: 30
		}).addTo(map);

		markerGroup = L.markerClusterGroup({
			spiderfyOnMaxZoom: false,
			showCoverageOnHover: false,
			zoomToBoundsOnClick: true
		});
		map.addLayer(markerGroup);

		map.on('movestart', function() {
			hashes = [];
 		});

		map.on('moveend', function() {
			window.setTimeout(refresh, 1000);
 		});

		if (override === false) {
			var locateError = L.popup().setContent('Unable to work out your location.');
			var lc = L.control.locate({
	 			flyTo: false,
	 			onLocationError: function () {
	 				locateError.setLatLng(map.getCenter()).openOn(map);
	 			},
	 			onLocationOutsideMapBounds: function () { },
	 		}).addTo(map);

			window.setTimeout(function () {
		 		lc.start();
			}, 2000);
		}

		window.setInterval(refresh, 1000 * 10);

		var html = '<div class="cl-info-panel"><h2><span class="fa fa-info"></span> Pin yourself to the ' + MAP_NAME + ' map</h2><p>Tweet your town & country to ' + TWEET_HASHTAG + '.</p><p>' +
			'<a href="https://twitter.com/intent/tweet?button_hashtag=#clmtest" class="twitter-hashtag-button" data-show-count="false">#clmtest</a>' +
			'</p></div>';

		var infoPopup = L.popup().setContent(html);
		var easyButton = L.easyButton('fa-info', function(btn, map){
			infoPopup.setLatLng(map.getCenter()).openOn(map);
			window.setTimeout(function () {
				window.twttr.widgets.load();
			}, 10);
		});
		easyButton.options.position = 'topright';
		easyButton.addTo(map);
	}

	DomReady.ready(function() {
		var lat = getParameterByName('lat') || 52.47872;
		var lng = getParameterByName('lng') || -1.90723;
		var override = getParameterByName('o') === 't';

		initmap(lat, lng, override);

		window.setTimeout(function () {
			refresh();
		}, 1000);
	});
})();
