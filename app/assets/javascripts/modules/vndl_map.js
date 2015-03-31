// presume leaflet is present as L
// presume jquery is present as $

// ------------------------------------------------------------------

console.log('running vndlmap source');

window.VndlMap = function (mapDomId, options) {

    // TODO: Setup teaspoon js testing framework after feature complete

    this.leafletMap = L.map(mapDomId, {
        reuseTiles: true,      // cache tiles
        worldCopyJump: true,    // keep markers when scroll sideways into a new world
        scrollWheelZoom: false // forced to double-click or use the controls so no crazy things


    });

    // this.opts is our options, there are many like it but this one is ours
    this.opts = options || {};

    // make a layer for the markers
    // so we can clear them all with a nice function
    markerLayer = new L.FeatureGroup();
    this.leafletMap.addLayer(markerLayer);


    // make a layer for the rectangles
    // so we can clear them all with a nice function
    rectangleLayer = new L.FeatureGroup();
    this.leafletMap.addLayer(rectangleLayer);

    // the nice clearing map functions
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

    // when adding use a layer and so we can call layer.remove

    markerLayer.clearLayers();

};
// ------------------------------------------------------------------
VndlMap.prototype.clearRectangles = function () {

    rectangleLayer.clearLayers();

};
// ------------------------------------------------------------------
// takes not-exactly Well Known Text (the ENVELOPE(...) thing isn't
// proper WKT, despite Solr's opinion), and returns a rectangle,
// represented as an array of two points (e.g. [[x1,y1],[x2,y2]])
// that are the bounds of a rectangle.  No rect, get a null back.


// pointOrder optionally specifies the bounds for the rectangle
// i.e. "WSEN" means (W)est then (S)outh then (E)ast then (N)orth
// this is because solr varys the bound directions order

// e.g

// "solr_bbox" is "#{west} #{south} #{east} #{north}"
// "solr_geom" is "ENVELOPE(#{west}, #{east}, #{north}, #{south})"
// "georss_box_s" is "#{south} #{west} #{north} #{east}"


// can pass in four letters as pointOrder to specify the point order
// otherwise defaults to "WSEN" which is solr_bbox
VndlMap.prototype.getRect = function(text, pointOrder) {
    // WOOT GET RECKT RIGHT AWAY!!


    if (!pointOrder){

        pointOrder = "WSEN";

    }

    // regardless of where we get the string, make it uniform

    pointOrder.toUpperCase();

    // regex to change from SOLR's ENVELOP to our format

    text = text.replace(/\,/g       , ' ');
    text = text.replace(/ENVELOPE/g , ' ');
    text = text.replace(/\(/g       , ' ');
    text = text.replace(/\)/g       , ' ');
    var points = this.getPoints( 'POINT(' + text + ')' );


    if (points && points.length == 1 && points[0].length == 4) {


        var E = points[0][pointOrder.indexOf('E')];
        var W = points[0][pointOrder.indexOf('W')];
        var N = points[0][pointOrder.indexOf('N')];
        var S = points[0][pointOrder.indexOf('S')];



        if (W <= E){

            return [[[S,W],[N,E]]];
        }

        else {

            // return two rectangles, one for meridian and one for anti-meridian
            return [
                [[S,W],[N,180]],
                [[S,-180],[N,E]]
            ];
        }


        //return [
        //
        //    [[points[0][pointOrder.indexOf('S')], points[0][pointOrder.indexOf('W')]],
        //    [points[0][pointOrder.indexOf('N')], points[0][pointOrder.indexOf('E')]]]
        //];
    } else {

        // logging which objects don't parse
        console.debug('expected a rectangle of some kind but got the following rubbish : <' + text + '>');
        return [];
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
        title: null,
        link: null,
        element: $r,
        primary: {points: [], rectangles: [], titles: [], bounds: null},
        secondary: {points: [], rectangles: [], titles: [], bounds: null},
        tertiary: {points: [], rectangles: [], titles: [], bounds: null}
    };

    //
    // find the id, if there is one
    //
    var id = $r.find('[data-layer-id]').attr('data-layer-id');
    newItem.id = id;


    //
    // find the title, if there is one
    //
    var title = $r.find('[data-title]').attr('data-title');
    newItem.title = title;

    //
    // find the catalog link, if there is one
    //
    var link = $r.find('[data-link]').attr('href');
    console.log(link);
    //var link = linkEl.attr('href');
    newItem.link = link;


    //
    // find the placenames, if there are any
    //
    //var placenames = $r.find('[data-placename]').attr('data-placename');
    //newItem.placenames = placenames;

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
    // find any rectangles within the result item
    //


    var $rectElems = $r.find('[data-rectangle]');

    $rectElems.each(function (i, rectElem){

        var $rectElem = $(rectElem);

        var uiType = this.parseUiType($rectElem.attr('data-ui-type'));


        var rects = this.getRect($rectElem.attr('data-rectangle'));

        for (var r = 0; r < rects.length; r++) {


            if (rects) {

                // make a leaflet object from the first rectangle in the rects list
                var newRect = L.rectangle(rects[r]);

                // store the original string to check with rectangle debugging
                newRect.originalString = $rectElem.attr('data-rectangle');

                // store the newRect leaflet object in the correct uiType structure
                newItem[uiType].rectangles.push(newRect);

            }

            else {
                console.log("results that are bad rectangles are : " + $r.find('h3').text())
            }
        }


    }.bind(this));





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

    var vndlIcon = L.Icon.extend({
        options: {
            iconUrl: 'http://cdn.leafletjs.com/leaflet-0.7/images/marker-icon.png'
        }
    });

    //
    // toggle highlight class on search results and map markers and rectangles
    //

    function highlightResult() {

        $.each(newItem.primary.points, function (index, marker) {

            //marker.setIcon(redMarker);



            // TODO: marker set style to be lighter or different colour to indicate highlight

            //marker.setOpacity(0.5);

            marker.openPopup();


            // TODO : Change highlight method to surround entire search result parent element

        });

        // set each relevant rectangle to the higlight style
        $.each(newItem.primary.rectangles, function (index, rect) {

            rect.setStyle({
                color: '#ffffab',
                weight: 3,
                opacity: 0.4,
                fillOpacity: 0.45,
                fillColor: '#ffffab'
            });
            console.log('original string of rectangle is : ' + rect.originalString);
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


        // default leaflet polygon style
        var defaultStyle = {
            color: "#2262CC",
            weight: 2,
            opacity: 0.6,
            fillOpacity: 0.1,
            fillColor: "#2262CC"
        };


        $.each(newItem.primary.points, function (index, marker) {

            // TODO: set marker back to default style
            //marker.setOpacity(1);

            marker.closePopup();

        });

        $.each(newItem.primary.rectangles, function (index, rect) {

            rect.setStyle(defaultStyle);
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


            var link = newItem.link;

            var title = newItem.title;

            console.log("item link for popup is : " + link);

            // Insert whatever you want into the container, using whichever approach you prefer
            var container = $("<div> <h3 class='result-title'> <a href='' class='rectangleLink'>Click me</a> </div>");

            container.find('a').attr('href', link);

            container.find('a').text(title);

            container.find('a').attr('target', "_blank");

            console.log("find expression equal", container.find('a'));

            console.log("container is : ", container);



            // Insert the container into the popup
            marker.bindPopup(container[0]);


            // debug
            //marker.on('click', function (e){
            //
            //    alert("marker click");
            //});






            // finally add the marker to the displayed layer
            marker.addTo(markerLayer);


            // TODO: messing with the default icon causes various issues
            //
            // set the default marker
            //marker.setIcon(blueMarker);


        })) {

    }


    // add rects to rectangleLayer and connect highlight functions

    $.each(newItem.primary.rectangles, function (index, rect) {

        rect.on({
            mouseover: highlightResult,
            mouseout: unHighlightResult
        });

        //
        // adding popups to rectangles
        //

        var link = newItem.link;

        var link = newItem.title;





        // Insert whatever you want into the container, using whichever approach you prefer
        var container = $("<div> <h3 class='result-title'> <a href='' class='rectangleLink'>Click me </a></div>");

        container.find('a').attr('href', link);

        container.find('a').attr('target', "_blank");

        container.find('a').text(title);




        // replace link text with title


        // Insert the container into the popup
        rect.bindPopup(container[0]);

        // finally add the rectangle to the displayed layer
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
        me.leafletMap.invalidateSize(true);
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
