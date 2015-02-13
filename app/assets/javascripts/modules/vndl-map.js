// presume leaflet is present as L
// presume jquery is present as $

// ------------------------------------------------------------------

console.log('running vndlmap source');

window.VndlMap = function (mapDomId, options) {
    // this.l is the leaflet map reference
    this.l = L.map(mapDomId, {
        reuseTiles: true
    });
    // this.opts is our options
    this.opts = options || {};

    this.clearMarkers();

    this.l.setView([-13, 140], 4);
    // add an OpenStreetMap tile layer
    L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="http://osm.org/copyright">OSM</a> contributors'
    }).addTo(this.l);
};
// ------------------------------------------------------------------
VndlMap.prototype.clearMarkers = function () {
    // TODO: remove from Leaflet map first?
    this.markers = [];
};
// ------------------------------------------------------------------
VndlMap.prototype.findMarkers = function (domElement) {
    var $elem = $(domElement);

    var $results = $elem.find('.vndl-result');
    var markers = this.markers;
    var map = this.l;

    // loop through results finding each one's map location
    $results.each(function (index, result) {
        var $points = $(result).find('[itemtype="http://schema.org/GeoCoordinates"]');
        // alow multiple points for a single result..
        var pts = [];
        $points.each(function (i, pt) {
            var $pt = $(pt);
            var lat = $pt.find('[itemprop="latitude"]').first();
            var lng = $pt.find('[itemprop="longitude"]').first();
            if (lat.length > 0 && lng.length > 0) {
                var latNum = parseFloat(lat.text());
                var lngNum = parseFloat(lng.text());
                pts.push({lat: latNum, lng: lngNum});

                // just for now, shove them onto the map
                L.marker([latNum, lngNum]).addTo(map);
            }
        });
        markers.push({
            element: result,
            pts: pts
        });
    });

    console.log(markers);
};
// ------------------------------------------------------------------
VndlMap.prototype.leaflet = function () {
    return this.l;
}
// ------------------------------------------------------------------
VndlMap.prototype.resizeFor = function (duration) {
    // repeatedly tell the map it has resized, for <duration> seconds
    duration = +duration || 1
    var interval = 100; // milliseconds

    // start resizing repeatedly
    var me = this;
    var resizingId = setInterval(function () {
        me.l.invalidateSize(true);
    }, interval);

    // stop resizing in <duration> seconds
    setTimeout(function () {
        clearInterval(resizingId);
    }, duration * 1000);
}
// ------------------------------------------------------------------
VndlMap.prototype.show = function () {
    $('body').removeClass('map-inactive').addClass('map-active');
    $('#main-container').removeClass('container').addClass('container-fluid');
    $('.mapwrapper').removeClass('col-xs-1 col-sm-1 col-md-1 col-lg-1');
    $('.mapwrapper').addClass('col-xs-6 col-sm-6 col-md-6 col-lg-6');
    $('.content').removeClass('col-xs-11 col-sm-11 col-md-11 col-lg-11');
    $('.content').addClass('col-xs-6 col-sm-6 col-md-6 col-lg-6');
    this.resizeFor(2);
}
// ------------------------------------------------------------------
VndlMap.prototype.hide = function () {
    $('body').removeClass('map-active').addClass('map-inactive');
    $('#main-container').removeClass('container-fluid').addClass('container');
    $('.mapwrapper').removeClass('col-xs-6 col-sm-6 col-md-6 col-lg-6');
    $('.mapwrapper').addClass('col-xs-1 col-sm-1 col-md-1 col-lg-1');
    $('.content').removeClass('col-xs-6 col-sm-6 col-md-6 col-lg-6');
    $('.content').addClass('col-xs-11 col-sm-11 col-md-11 col-lg-11');
    this.resizeFor(2);
}
// ------------------------------------------------------------------
// ------------------------------------------------------------------
