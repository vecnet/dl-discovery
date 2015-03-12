function searchFormSetup(formElement) {

    $(formElement).on("submit", function (event) {
        event.preventDefault();
        var queryString = $('form.vndl-search').serialize();
        getResultsPage(queryString);

    });


    $('#search-map-button').on("click", function() {

        //
        // TODO : Refactor all of this
        //

        var currentMapBounds = window.vndl.theMap.leafletMap.getBounds();



        // TODO: Do some rounding on the output so can be readable in the UI?

        var currentMapBoundsString = currentMapBounds.toBBoxString();

        var s = currentMapBoundsString;

        console.log('toBBoxString output : ' + s);

        var correctMapBoundsString = (s.split(',')[1] + ',' + s.split(',')[0] + ',' +  s.split(',')[3] + ',' + s.split(',')[2]);




        var envelopeFormatMapBoundsString = (s.split(',')[0] + ',' + s.split(',')[2] + ',' +  s.split(',')[3] + ',' + s.split(',')[1]);

        console.log('rearranged string is : ' + s.split(',')[1] + ',' + s.split(',')[0] + ',' +  s.split(',')[3] + ',' + s.split(',')[2]);



        // debugging

        //var southWestLatLng = currentMapBounds.getSouthWest();
        //
        //console.log('sw bounds are : ' + southWestLatLng.toString());
        //
        //var northEastLatLng = currentMapBounds.getNorthEast();
        //
        //console.log('ne bounds are : ' + northEastLatLng.toString());


        console.log('maps bounds are : ' + currentMapBounds.toBBoxString());

        console.log('setting the search bounds to : ' + envelopeFormatMapBoundsString);


        //// add fake bounding box value to form
        //$('form.vndl-search').append('<input id="bbox-input-field" type="hidden" name="bbox" value="nothing">');
        //
        //
        //// change the bbox input value to the actual bounds of the map
        //
        //$('#bbox-input-field').val(currentMapBoundsString);

        $(formElement).trigger('submit');


    });

    function makeMapVisible() {
        var showmap = $('input[name=showmap]').prop('checked');

        if (showmap) {
            window.vndl.theMap.show();
            enable($('input[name=searchmap]'));

        } else {
            window.vndl.theMap.hide();
            disable($('input[name=searchmap]'));
        }
    };


    // set up the "show map" checkbox to switch the map on and off
    // and also to allow/disallow the "search map area only" check
    // box.
    $('input[name=showmap]').change(makeMapVisible);

};