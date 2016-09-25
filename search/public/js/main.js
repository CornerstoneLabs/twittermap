var url = '/data/tweets.json';

(function () {
	var map;
	var ajaxRequest;
	var plotlist;
	var plotlayers=[];

	function removeMarkers() {
		for (i=0;i<plotlayers.length;i++) {
			map.removeLayer(plotlayers[i]);
		}
		plotlayers=[];
	}

	function onDataLoaded (data) {
		plotlist = data;

		for (i=0;i<plotlist.length;i++) {
			var plotll = new L.LatLng(plotlist[i].lat,plotlist[i].lon, true);
			var plotmark = new L.Marker(plotll);
			plotmark.data=plotlist[i];
			map.addLayer(plotmark);
			plotmark.bindPopup("<h3><img src=\"" + plotlist[i].avatar + "\" />"+  plotlist[i].name+"</h3>"+plotlist[i].details);
			plotlayers.push(plotmark);
		}

		var group = new L.featureGroup(plotlayers);

		map.fitBounds(group.getBounds());
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
		map.setView(new L.LatLng(51.3, 0.7),9);
		map.addLayer(osm);
	}

	function refresh () {
		removeMarkers();
		getData();
	}

	$(document).ready(function() {
		initmap();
		refresh();

		window.setInterval(refresh, 3000);
	});
})();
