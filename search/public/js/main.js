var url = 'data/tweets.json';
var MAP_NAME = 'DumTeeDum';
var TWEET_HASHTAG  = '#dtdmap';

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
		x.setRequestHeader('Content-type', 'application/json');
		x.onreadystatechange = function () {
			x.readyState > 3 && callback && callback(x.responseText, x);
		};
		x.send(data);
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
	var markerSource = [];

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
			return (item.data.id === compareData.id) && (item.data.id === compareData.id);
		}).length;

		return count;
	}

	function fitBounds () {
		var group = new L.featureGroup(plotlayers);
		map.fitBounds(group.getBounds());
	}

	function sweepMarkers () {
		markerSource.forEach(function (marker) {
			var clobbered = markerSource.filter(function (innerMarker) {
					var value = (innerMarker.data.lat == marker.data.lat)
						&& (innerMarker.data.lng == marker.data.lng)
						&& (innerMarker.data.id !== marker.data.id);

					return value;
				});

			if (clobbered.length > 0) {
				if (marker.data.moved === true) {
					// only move them once
				} else {
					var point = map.latLngToLayerPoint(marker.getLatLng());

					point.x += (Math.random() * 100) - 50;
					point.y += (Math.random() * 100) - 50;

					marker.setLatLng(map.layerPointToLatLng(point));

					marker.data.moved = true;
				}
			}
		});
	}

	function addMarker (markerData) {
		if (countMarker(markerData) === 0) {
			var plotll = new L.LatLng(markerData.lat, markerData.lon, true);
			var opts = {};

			if (USE_CLUSTERING === false) {
				opts = {
					bounceOnAdd: true
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

			markerSource.push(newMarker);

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

		sweepMarkers();

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

				var localUrl = 'data/tweets-' + hash + '.json';

				function onAjaxSuccess(stringData, xhrRequest) {
					var data = [];

					try {
						data = JSON.parse(stringData);
					} catch (e) {

					}
					onDataLoaded(data, function() {
						done();
					});
				}

				ajax(localUrl, onAjaxSuccess);
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

		var _placeMeMarker;
		function onMapClick(e) {
			if (typeof _placeMeMarker === 'undefined') {
				_placeMeMarker = new L.marker(e.latlng, {draggable:'true'});

				_placeMeMarker.on('dragend', function(event){
					var marker = event.target;
					var position = marker.getLatLng();
					marker.setLatLng(new L.LatLng(position.lat, position.lng),{draggable:'true'});
					map.panTo(new L.LatLng(position.lat, position.lng));
				});
				map.addLayer(_placeMeMarker);

				// add to group
				var popupHtml;

				if (window.userTwitter.displayName) {
					popupHtml = "<div style=\"text-align: center\"><button class=\"btn\" onClick=\"window.sendLocation();\">Pin "
						+ window.userTwitter.displayName + " here!</button>"
						+ "</div>";
				} else {
					popupHtml = "<div style=\"text-align: center\"><a class=\"btn\" href=\"/auth/twitter\">Sign in with Twitter</button>"
						+ "</div>";
				}

				_placeMeMarker.bindPopup(popupHtml).openPopup();

				window._placeMeMarker = _placeMeMarker;
			} else {
				_placeMeMarker.setLatLng(e.latlng).openPopup();
			}
		}

		map.on('click', onMapClick);

		//
		// Send the location
		//
		window.sendLocation = function () {
			var _placeMeMarker = window._placeMeMarker;

			var data = JSON.stringify({
				lat: _placeMeMarker.getLatLng().lat,
				lng: _placeMeMarker.getLatLng().lng
			});

			ajax('/place-marker', function (a, b) {
				if (b.status === 200) {
					//alert("You've been added to the map! Your lovely face will appear shortly!");

					addMarker(JSON.parse(b.response));

					_placeMeMarker.closePopup();
				} else {
					alert('Hmm, something went wrong, sorry.');
				}
			}, data);
		};


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

		var html = '<div class="cl-info-panel"><h2><span class="fa fa-info"></span> Pin yourself to the ' +
			MAP_NAME +
			' map</h2><p>Click on the map to pin yourself to it!</p>' +
			'</div>';

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
