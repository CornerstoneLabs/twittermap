var url = 'data/tweets.json';

(function () {
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

			var newMarker = new L.Marker(plotll, opts);
			newMarker.data = markerData;

			// add to group
			newMarker.bindPopup("<div style=\"text-align: center\"><h3><div><img style=\"border-radius:5px\" src=\""
				+ markerData.avatar
				+ "\" /></div><a target=\"_blank\" href=\"https://twitter.com/"
				+ markerData.screen_name
				+ "\">"
				+ markerData.name
				+ "</a></h3>"
				+ markerData.details
				+ "</div>"
			);

			if (USE_CLUSTERING === true) {
				markerGroup.addLayer(newMarker);
				plotlayers.push(newMarker);
			} else {
				try {
					newMarker.addTo(map);
					loadedData.push(newMarker);
				} catch (e) {
					console.log('error adding to map', e);
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
							$.get(localUrl, function (data) {
								// remember this data
								//caches[localUrl] = data;
								onDataLoaded(data, function() {
									done();
								});
							}).fail(function (error) {
								done();
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

		console.log(hashes);

		getData();
	}

	function initmap() {
		// set up the map
		map = new L.Map('map');

		// create the tile layer with correct attribution
		var osmUrl='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
		var osmAttrib='';
		var osm = new L.TileLayer(osmUrl, {minZoom: 8, maxZoom: 12, attribution: osmAttrib});

		var mapboxUrl = 'https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={token}';
		var mapboxLayer = new L.TileLayer(mapboxUrl, {
			id: 'mapbox.emerald',
			minZoom: 8,
			maxZoom: 14,
			attribution: osmAttrib,
			token: API_KEY
		});

		// start the map in South-East England
		map.setView(new L.LatLng(52.360, 0.0), 10);
		// map.locate({
		// 	setView: true,
		// 	maxZoom: 16
		// });
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

		var lc = L.control.locate({
 			flyTo: true
 		}).addTo(map);

		window.setTimeout(function () {
	 		lc.start();
		}, 2000);

		window.setInterval(refresh, 1000 * 10);
	}

	$(document).ready(function() {
		initmap();

		$.get('data/hashindex.json', function (data) {
			hashIndex = data;
			refresh();
		});

//		twitterBoot();

		//window.setInterval(refresh, 60 * 1000);
	});
})();
