// presume leaflet is present as L
// presume jquery is present as $

// ------------------------------------------------------------------

console.log('running vndlmap source');

window.VndlMap = function (mapDomId, options) {
    // this.l is the leaflet map reference
    this.l = L.map(mapDomId, {
        reuseTiles: true,      // cache tiles
        worldCopyJump: true    // keep markers when scroll sideways into a new world

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
// takes not-exactly Well Known Text (the ENVELOPE(...) thing isn't
// proper WKT, despite Solr's opinion), and returns a rect,
// represented as an array of two points (e.g. [[x1,y1],[x2,y2]])
// that are the bounds of a rectangle.  No rect, get a null back.
VndlMap.prototype.getRect = function(text) {
    // WOOT GET RECKT RIGHT AWAY!!
    text = text.replace(/\,/g       , ' ');
    text = text.replace(/ENVELOPE/g , ' ');
    text = text.replace(/\(/g       , ' ');
    text = text.replace(/\)/g       , ' ');
    var points = this.getPoints( 'POINT(' + text + ')' );
    if (points.length == 1 && points[0].length == 4) {
        return [
            [points[0][0], points[0][2]],
            [points[0][1], points[0][3]]
        ];
    } else {
        return null;
    }
};
// ------------------------------------------------------------------
// takes Well Known Text that's either a point or a multipoint,
// and returns a flat array of point(s).
VndlMap.prototype.getPoints = function(text) {
    var geoObject = this.parseGeoText(text);
    if (geoObject.type == 'Point') {
        return [geoObject.coordinates];
    } else if (geoObject.type == 'MultiPoint') {
        return geoObject.coordinates;
    } else {
        return [];
    }
};
// ------------------------------------------------------------------
VndlMap.prototype.parseUiType = function(text) {
    // default to 'primary' if data-ui-type isn't set
    var uiType = text;
    if (!uiType) {
        uiType = 'primary';
    }
    return uiType.toLowerCase();
};
// ------------------------------------------------------------------
VndlMap.prototype.parseGeoText = function(text) {
    // use the wellknown library to parse the text
    // parse returns a GeoJSON object
    return wellknown.parse(text);
};
// ------------------------------------------------------------------

// TODO 1: rename this func to something like "discoverResults"

VndlMap.prototype.findMarkers = function (domElement) {
    var $elem = $(domElement);

    var $results = $elem.find('.vndl-search-result');
    var resultItems = [];
    var map = this.l;

    // loop through results finding each one's map location
    $results.each(function (index, result) {

        // TODO 2: take body of this loop into func called connectSingleResult or whatever

        // TODO: in theory it's more efficient if we var all these
        // variables into existence outside of this loop body.
        // .. including the Wkt object

        var $r = $(result);  // jQuery-ify the result element

        // represents a single result entry (a thing in the Digital Library)
        var newItem = {
            id: null,
            element: $r,
            primary:   { points: [], rectangles: [] },
            secondary: { points: [], rectangles: [] },
            tertiary:  { points: [], rectangles: [] }
        };

        //
        // find the id, if there is one
        //
        var id = $r.find('[data-layer-id]').attr('data-layer-id');
        newItem.id = id;

        //
        // find any points
        //
        var $points = $r.find('[data-points]');
        $points.each(function (i, ptElem) {
            var $ptElem = $(ptElem);

            var uiType = this.parseUiType($ptElem.attr('data-ui-type'));

            var pts = this.getPoints($ptElem.attr('data-points'));
            for (var p = 0; p < pts.length; p++) {
                newItem[uiType].points.push(
                    new L.marker([pts[p][1], pts[p][0]])
                );
            }
        }.bind(this));

        //
        // find any rectangles
        //
        var $rectElem = $r.find('[data-rectangle]');
        var uiType = this.parseUiType($rectElem.attr('data-ui-type'));

        var rect = this.getRect($rectElem.attr('data-rectangle'));
        newItem[uiType].rectangles.push(
            new L.rectangle(rect)
        );

        // TODO: 3.0: make functions here for adding and removing the "highlight"
        // class on the result element, so you can use those functions as the
        // event handlers for mouseover
        // e.g:
        function highlightResultItem(...) { $r. ... }
        function unHilightResultItem(...) { $r. ... }

        // add points to map
        $.each(newItem.primary.points, function(index, marker) {
            // TODO 3.1: hook up events between the leaflet marker and the result element
            // e.g:
            marker.on('mouseover', highlightResultItem);
            marker.addTo(map);
        });
        // add rects to map
        $.each(newItem.primary.rectangles, function(index, rect) {
            // TODO 3.2: hook up events between the leaflet marker and the result element
            rect.addTo(map);
        });

        // TODO 4: attach mouseover handler to $r that highlights
        // ALL primary points
        // TODO 5: handle secondary points

        resultItems.push(newItem);

    }.bind(this));

    this.resultItems = resultItems;
};
// ------------------------------------------------------------------
VndlMap.prototype.leaflet = function () {
    return this.l;
};
// ------------------------------------------------------------------
VndlMap.prototype.resizeFor = function (duration) {
    // repeatedly tell the map it has resized, for <duration> seconds
    duration = +duration || 1;
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
};
// ------------------------------------------------------------------
VndlMap.prototype.show = function () {
    $('body').removeClass('map-inactive').addClass('map-active');
    $('#main-container').removeClass('container').addClass('container-fluid');
    $('.mapwrapper').removeClass('col-xs-1 col-sm-1 col-md-1 col-lg-1');
    $('.mapwrapper').addClass('col-xs-6 col-sm-6 col-md-6 col-lg-6');
    $('.content').removeClass('col-xs-11 col-sm-11 col-md-11 col-lg-11');
    $('.content').addClass('col-xs-6 col-sm-6 col-md-6 col-lg-6');
    this.resizeFor(2);
};
// ------------------------------------------------------------------
VndlMap.prototype.hide = function () {
    $('body').removeClass('map-active').addClass('map-inactive');
    $('#main-container').removeClass('container-fluid').addClass('container');
    $('.mapwrapper').removeClass('col-xs-6 col-sm-6 col-md-6 col-lg-6');
    $('.mapwrapper').addClass('col-xs-1 col-sm-1 col-md-1 col-lg-1');
    $('.content').removeClass('col-xs-6 col-sm-6 col-md-6 col-lg-6');
    $('.content').addClass('col-xs-11 col-sm-11 col-md-11 col-lg-11');
    this.resizeFor(2);
};
// ------------------------------------------------------------------
// ------------------------------------------------------------------
