var url = 'data/tweets.json';

(function () {
	var map;
	var ajaxRequest;
	var plotlist;
	var plotlayers=[];
	var markerGroup;
	var firstScale = true;

	function removeMarkers() {
		for (i=0;i<plotlayers.length;i++) {
			map.removeLayer(plotlayers[i]);
		}
		plotlayers=[];
	}

	function countMarker(id) {
		var count = plotlayers.filter(function (item) {
			return item.data.id === id;
		}).length;

		return count;
	}

	function fitBounds () {
		var group = new L.featureGroup(plotlayers);
		map.fitBounds(group.getBounds());
	}

	function onDataLoaded (data) {
		for (i=0;i<data.length;i++) {
			// check exists
			if (countMarker(data[i].id) === 0) {
				var plotll = new L.LatLng(data[i].lat,data[i].lon, true);

				var newMarker = new L.Marker(plotll);
				newMarker.data = data[i];

				// add to group
				markerGroup.addLayer(newMarker);

				newMarker.bindPopup("<h3><img style=\"border-radius:5px\" src=\"" + data[i].avatar + "\" />"+  data[i].name+"</h3>"+data[i].details);
				plotlayers.push(newMarker);
			}
		}

		if (firstScale === true) {
			firstScale = false;
			fitBounds();
		}
	}

	function getData () {
		$.get(url, onDataLoaded);
	}

	function initmap() {
		// set up the map
		map = new L.Map('map');

		// create the tile layer with correct attribution
		var osmUrl='http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
		var osmAttrib='Map data © <a href="http://openstreetmap.org">OpenStreetMap</a> contributors';
		var osm = new L.TileLayer(osmUrl, {minZoom: 3, maxZoom: 12, attribution: osmAttrib});

		// start the map in South-East England
		map.setView(new L.LatLng(51.3, 0.7), 9);
		map.addLayer(osm);

		markerGroup = L.markerClusterGroup({
			spiderfyOnMaxZoom: false,
			showCoverageOnHover: false,
			zoomToBoundsOnClick: true
		});
		map.addLayer(markerGroup);
	}

	function refresh () {
		getData();
	}

	$(document).ready(function() {
		initmap();
		refresh();

		window.setInterval(refresh, 3000);
	});
})();
