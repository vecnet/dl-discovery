function searchFormSetup(formElement) {

    $(formElement).on("submit", function (event) {
        event.preventDefault();
        var queryString = $('form.vndl-search').serialize();
        getResultsPage(queryString);

    });


    $('#search-map-button').on("click", function() {


        // get the map bounds

        var currentMapBounds = window.vndl.theMap.l.getBounds();

        // convert it to string

        // TODO : Refactor all of this shit

        // TODO: Do some rounding on the output here so can be readable in the UI?

        var currentMapBoundsString = currentMapBounds.toBBoxString();

        var s = currentMapBoundsString;

        var correctMapBoundsString = (s.split(',')[1] + ',' + s.split(',')[0] + ',' +  s.split(',')[3] + ',' + s.split(',')[2]);


        console.log('rearranged string is : ' + s.split(',')[1] + ',' + s.split(',')[0] + ',' +  s.split(',')[3] + ',' + s.split(',')[2]);



        // debugging start

        var southWestLatLng = currentMapBounds.getSouthWest();

        console.log('sw bounds are : ' + southWestLatLng.toString());

        var northEastLatLng = currentMapBounds.getNorthEast();

        console.log('ne bounds are : ' + northEastLatLng.toString());


        console.log('maps bounds are : ' + currentMapBounds.toBBoxString());


        // debugging end

        // add fake bounding box value to form
        $('form.vndl-search').append('<input id="bbox-input-field" type="hidden" name="bbox" value="nothing">');


        // change the bbox input value to the actual bounds of the map

        $('#bbox-input-field').val(correctMapBoundsString);

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