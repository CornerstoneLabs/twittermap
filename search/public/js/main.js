var url = 'data/tweets.json';

(function () {
	var map;
	var ajaxRequest;
	var plotlist;
	var plotlayers=[];
	var markerGroup;
	var firstScale = true;
	var loadedData = [];
	var USE_CLUSTERING = false;
	var hashIndex;

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
			newMarker.bindPopup("<div style=\"text-align: center\"><h3><div><img style=\"border-radius:5px\" src=\"" + markerData.avatar + "\" /></div>"+  markerData.name+"</h3>"+markerData.details + "</div>");

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

		function next() {
			if (index < hashes.length) {
				index++;

				if (typeof hashes[index] !== 'undefined') {
					var localUrl = 'data/tweets-' + hashes[index] + '.json';

					if (typeof caches[localUrl] === 'undefined') {
						if (hashIndex.filter(function (item) {
							return (item == hashes[index]);
						}).length !== 0) {
							$.get(localUrl, function (data) {
								// remember this data
								caches[localUrl] = data;
								onDataLoaded(data, function() {
									window.setTimeout(next, 10);
								});
							}).fail(function (error) {
								window.setTimeout(next, 10);
							});
						} else {
							next();
						}
					} else {
						onDataLoaded(caches[localUrl], function() {
							window.setTimeout(next, 10);
						});
					}
				}
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

		hashes = geohash.bboxes(minLat, minLon, maxLat, maxLon, 4);

		getData();
	}

	function initmap() {
		// set up the map
		map = new L.Map('map');

		// create the tile layer with correct attribution
		var osmUrl='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
		var osmAttrib='Map data © <a href="http://openstreetmap.org">OpenStreetMap</a> contributors';
		var osm = new L.TileLayer(osmUrl, {minZoom: 8, maxZoom: 12, attribution: osmAttrib});

		// start the map in South-East England
		map.setView(new L.LatLng(52.360, 0.0), 10);
		map.locate({setView: true, maxZoom: 16});
		map.addLayer(osm);

		var credctrl = L.controlCredits({
			image: "../img/CornerstoneLabs.svg",
			link: "http://www.cornerstonelabs.co.uk/",
			text: "Interactive mapping<br/>by Cornerstone Labs",
			width: "155",
			height: "25"
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
	}

	$(document).ready(function() {
		initmap();

		$.get('data/hashindex.json', function (data) {
			hashIndex = data;
			refresh();
		});

		//window.setInterval(refresh, 60 * 1000);
	});
})();
