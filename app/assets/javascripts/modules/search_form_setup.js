function searchFormSetup(formElement) {

    $(formElement).on("submit", function (event) {
        event.preventDefault();
        var queryString = $('form.vndl-search').serialize();
        getResultsPage(queryString);

    });


    $('#search-map-button').on("click", function() {

        // add fake bounding box value to form
        $('form.vndl-search').append('<input type="hidden" name="bbox" value="-12,122,-30,150">');

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