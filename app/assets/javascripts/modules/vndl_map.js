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
// proper WKT, despite Solr's opinion), and returns a rectangle,
// represented as an array of two points (e.g. [[x1,y1],[x2,y2]])
// that are the bounds of a rectangle.  No rect, get a null back.
VndlMap.prototype.getRect = function(text) {
    // WOOT GET RECKT RIGHT AWAY!!
    text = text.replace(/\,/g       , ' ');
    text = text.replace(/ENVELOPE/g , ' ');
    text = text.replace(/\(/g       , ' ');
    text = text.replace(/\)/g       , ' ');
    var points = this.getPoints( 'POINT(' + text + ')' );


    if (points && points.length == 1 && points[0].length == 4) {
        return [
            [points[0][0], points[0][2]],
            [points[0][1], points[0][3]]
        ];
    } else {

        // logging which objects don't parse
        console.debug('expected a rectangle of some kind but got the following rubbish : <' + text + '>');
        return null;
    }
};
// ------------------------------------------------------------------
// takes Well Known Text that's either a point or a multipoint,
// and returns a flat array of point(s).
VndlMap.prototype.getPoints = function(text) {
    var geoObject = this.parseGeoText(text);

    // if there are no points or unparseable from the text
    // fail gracefully please

    if (!geoObject) {

        // show objects that don't parse
        console.debug('expected POINTS but got the following rubbish : <' + text + '>');

        return [];
    }

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

// ------------------------------------------------------------------

VndlMap.prototype.connectSingleResultToMap = function (result) {

    var map = this.l;  // saving keystrokes when calling mappy

    var $r = $(result);  // jQuery-ify the result element

    // represents a single result entry (a thing in the Digital Library)
    var newItem = {
        id: null,
        element: $r,
        primary: {points: [], rectangles: []},
        secondary: {points: [], rectangles: []},
        tertiary: {points: [], rectangles: []}
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

    //return newItem;

    // TODO: 3.0: make functions here for adding and removing the "highlight"
    // class on the result element, so you can use those functions as the
    // event handlers for mouseover
    // e.g:

    //function highlightResultItem(...) { $r. ... }
    //function unHighlightResultItem(...) { $r. ... }


// ------------------------------------------------------------------

    // Creates a blue with highlight marker
    var redMarker = L.AwesomeMarkers.icon({
        markerColor: 'red',
        icon: 'circle'

    });

    // Creates a blue marker
    var blueMarker = L.AwesomeMarkers.icon({
        markerColor: 'blue',
        icon: 'circle'


    });


    // TODO: make a duplicate of this with alterations to color etc
    // ie highlighted yellow center or with css so can animate


    var vndlIcon = L.Icon.extend({
        options: {
            iconUrl: 'http://cdn.leafletjs.com/leaflet-0.7/images/marker-icon.png'


        }
    });

    var vndlIcon = new vndlIcon();


    // functions to toggle highlight class on search results and map markers

    function highlightResult() {

        $.each(newItem.primary.points, function (index, marker) {

            marker.setIcon(redMarker);

            // TODO : add panTo marker on highlight? to see on map?

        });

        $r.addClass("vndl-results-highlight");

    }

    function unHighlightResult() {


        $.each(newItem.primary.points, function (index, marker) {

            marker.setIcon(blueMarker);

        });

        $r.removeClass("vndl-results-highlight");

    }


    // add points to map and connect highlight functions
    if (!$.each(newItem.primary.points, function (index, marker) {

            // TODO 3.1: hook up events between the leaflet marker and the result element

            // e.g:
            marker.on({
                mouseover: highlightResult,
                mouseout: unHighlightResult
            });
            marker.addTo(map);


            // TODO: messing with the default icon causes various issues
            // needs to be sorted out to some satisfactory way.

            marker.setIcon(blueMarker);


        })) {

    }


    // add rects to map
    $.each(newItem.primary.rectangles, function (index, rect) {

        // TODO 3.2: hook up events between the leaflet marker and the result element

        rect.on({
            mouseover: highlightResult,
            mouseout: unHighlightResult
        });
        rect.addTo(map);
    });

    // TODO 4: attach mouseover handler to $r that highlights
    // ALL primary points
    // TODO 5: handle secondary points

    $r.on('mouseover', highlightResult);
    $r.on('mouseout', unHighlightResult);



    // after completing the building of the item, push it to the big list
    this.resultItems.push(newItem);
};

// ------------------------------------------------------------------

VndlMap.prototype.discoverAndMapGeoDataInResultsHtml = function (domElement) {

    var $elem = $(domElement);

    var $results = $elem.find('.vndl-search-result');
    this.resultItems = [];
    var map = this.l;

    // loop through results - find each ones map location and adding it to the map
    $results.each(function (index, result) {

        this.connectSingleResultToMap(result);
        // TODO : Add listener to DOM element for search results to highlight markers


    }.bind(this));


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
