// presume leaflet is present as L
// presume jquery is present as $

// ------------------------------------------------------------------

console.log('running vndlmap source');

window.VndlMap = function (mapDomId, options) {

    // TODO: Setup teaspoon js testing framework after feature complete

    // this.l is the leaflet map reference

    // TODO : Rename this.l to more expressive this.leafletMap with a refactor
    this.leafletMap = L.map(mapDomId, {
        reuseTiles: true,      // cache tiles
        worldCopyJump: true,    // keep markers when scroll sideways into a new world
        scrollWheelZoom: false // forced to double-click or use the controls so no crazy things


    });
    // this.opts is our options, there are many like it but this one is ours
    this.opts = options || {};

    markerLayer = new L.FeatureGroup();

    this.leafletMap.addLayer(markerLayer);

    rectangleLayer = new L.FeatureGroup();

    this.leafletMap.addLayer(rectangleLayer);

    this.clearMarkers();

    this.clearRectangles();

    this.leafletMap.setView([-13, 140], 3);
    // add an OpenStreetMap tile layer
    L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="http://osm.org/copyright">OSM</a> contributors'
    }).addTo(this.leafletMap);
};
// ------------------------------------------------------------------
VndlMap.prototype.clearMarkers = function () {

    markerLayer.clearLayers();

    // when adding use a layer and call layer.delete

    // example : https://stackoverflow.com/questions/20751523/removing-leaflet-layers-and-l-marker-method

};
// ------------------------------------------------------------------
VndlMap.prototype.clearRectangles = function () {

    rectangleLayer.clearLayers();

    // when adding use a layer and call layer.delete

    // example : https://stackoverflow.com/questions/20751523/removing-leaflet-layers-and-l-marker-method
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


        // TODO: turn this back on when testing rectangles
        //// compare points 01,00 against 03,02 and if 0302 is to the LEFT/ WEST of 0100
        //// then addsubtract 360 to the value
        //// ie https://www.mapbox.com/mapbox.js/example/v1.0.0/cross-date-line/
        //if (points[0][0] > points[0][2]){
        //    points[0][2] = points[0][2] - 360;
        //}

        return [
            [points[0][1], points[0][0]],
            [points[0][3], points[0][2]]
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




    // TODO : REFACTOR
    // Break into several methods that accept two params
    // newItem as the data state
    // $r is the input for the function to add to the newItem store
    // the functions alter newItem which can then be passed around in any order

    var map = this.leafletMap;  // saving keystrokes when calling mappy

    var $r = $(result);  // jQuery-ify the result element

    // represents a single result entry (a thing in the Digital Library)
    var newItem = {
        id: null,
        element: $r,
        primary: {points: [], rectangles: [], bounds: null},
        secondary: {points: [], rectangles: [], bounds: null},
        tertiary: {points: [], rectangles: [], bounds: null}
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
            if (pts) {
                newItem[uiType].points.push(
                    new L.marker([pts[p][1], pts[p][0]])
                );
            }
            else {
                console.log("results that are bad points are : " + $r.find('h3').text())
            }
        }
    }.bind(this));




    //
    // find any rectangles
    //

    var $rectElem = $r.find('[data-rectangle]');
    var uiType = this.parseUiType($rectElem.attr('data-ui-type'));

    var rect = this.getRect($rectElem.attr('data-rectangle'));
    if (rect){
        newItem[uiType].rectangles.push(
            new L.rectangle(rect)
        )

    }
    else {
        console.log("results that are bad rectangles are : " + $r.find('h3').text())
    }


    // ------------------------------------------------------------------


    // Calculate the BOUNDS for points et al
    //

    var flavours = ['primary','secondary', 'tertiary'];
    for (var f=0; f < flavours.length; f++) {
        var flavourWord = flavours[f];
        var flavour = newItem[flavourWord];


        // loop through each point and extend flavour.bounds by the latlng of each point
        $.each(flavour.points, function (index, point) {
            if (!flavour.bounds) {
                // if there's not already a bound, make one that includes this point
                flavour.bounds = L.latLngBounds(point.getLatLng(), point.getLatLng());
            } else {
                // make the bound object include each point of the results so the final bound object
                // covers all the points
                flavour.bounds.extend(point.getLatLng());
            }
        });


        // loop through each rectangle and extend flavour.bounds by the latlng of each point
        $.each(flavour.rectangles, function (index, rect) {
            if (!flavour.bounds) {
                // if there's not already a bound, make one that includes this point
                flavour.bounds = L.latLngBounds(rect.getBounds());
            } else {
                // make the bound object include each point of the results so the final bound object
                // covers all the points
                flavour.bounds.extend(rect.getBounds());
            }
        });
    //console.log('the bounds object is hereeee : ' + flavour.bounds );
    }


    // ------------------------------------------------------------------

    // Creates a red with highlight marker
    var redMarker = L.AwesomeMarkers.icon({
        icon: 'circle',
        markerColor: 'red'
    });

    // Creates a blue marker
    var blueMarker = L.AwesomeMarkers.icon({
        icon: 'circle',
        markerColor: 'blue'
    });


    // TODO: make a duplicate of this with alterations to color etc
    // ie highlighted yellow center or with css so can animate


    var vndlIcon = L.Icon.extend({
        options: {
            iconUrl: 'http://cdn.leafletjs.com/leaflet-0.7/images/marker-icon.png'
        }
    });

    var vndlIcon = new vndlIcon();




    //
    // toggle highlight class on search results and map markers
    //

    function highlightResult() {

        $.each(newItem.primary.points, function (index, marker) {

            marker.setIcon(redMarker);

            // TODO : Change highlight method to surround entire search result parent element

        });

        // in case the bounds are null and prevent leaflet from erroring
        if (newItem.primary.bounds) {


            // turn off the map panning to results

            //map.fitBounds(newItem.primary.bounds);
        }

        $r.addClass("vndl-results-highlight");

    }

    //---

    function unHighlightResult() {


        $.each(newItem.primary.points, function (index, marker) {

            marker.setIcon(blueMarker);

        });

        $r.removeClass("vndl-results-highlight");

    }


    // add points to FeatureGroup layer and connect highlight functions
    if (!$.each(newItem.primary.points, function (index, marker) {


            // add event listeners for mouseover and mouseout
            marker.on({
                mouseover: highlightResult,
                mouseout: unHighlightResult
            });

            marker.addTo(markerLayer);


            // TODO: messing with the default icon causes various issues
            // needs to be sorted out to some satisfactory way.

            // set the default marker
            marker.setIcon(blueMarker);


        })) {

    }







    // add rects to map
    $.each(newItem.primary.rectangles, function (index, rect) {

        rect.on({
            mouseover: highlightResult,
            mouseout: unHighlightResult
        });


        // TODO: turn rectangles back on when deal with meridian issue
        //rect.addTo(rectangleLayer);
    });





    $r.on('mouseover', highlightResult);
    $r.on('mouseout', unHighlightResult);

    // TODO 5: handle secondary points

    // after completing the building of the item, push it to the big list
    this.resultItems.push(newItem);

    // return newItem

    return newItem;
};

// ------------------------------------------------------------------

VndlMap.prototype.discoverAndMapGeoDataInResultsHtml = function (domElement) {

    var $elem = $(domElement);
    var $results = $elem.find('.vndl-search-result');
    this.resultItems = [];

    // to zoom the map to surround all results
    //var boundsThemAll = L.latLngBounds();

    var boundsThemAll = null;




    // loop through results - find each ones map location and adding it to the map
    $results.each(function (index, result) {

        // the following is a huge function that does most of the map work for the single result

       var currentResult = this.connectSingleResultToMap(result);


        // getting bounds

        // testing if the correct data
        if (currentResult.primary.bounds) {

            // if a bound already exists
            if (boundsThemAll) {

                // extend the bound with the new results bounds
                boundsThemAll.extend(currentResult.primary.bounds);

            }

            // if the bounds object doesn't already exist or is null then create one
            // matching the current items bound. um ok.

            else {
                boundsThemAll = L.latLngBounds(currentResult.primary.bounds);
            }
        }


    }.bind(this));


    // now pan it like its hot

    // fit the map bounds to show all the primary markers
    if (boundsThemAll) {
        this.leafletMap.fitBounds(boundsThemAll);
    }


};
// ------------------------------------------------------------------
VndlMap.prototype.leaflet = function () {
    return this.leafletMap;
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
