function searchFormSetup(formElement) {

    $(formElement).on("submit", function (event) {
        event.preventDefault();
        var queryString = $('form.vndl-search').serialize();
        getResultsPage(queryString);

    });


    $('#ajax-modal').on('show.bs.modal', function(e) {


        $('#ajax-modal a.facet_select').each(function (index, link) {


            // call the function to remove submit event on href

            attachingEventstoFacetLink(link);


        });
    });


    $('#search-map-button').on("click", function() {

        //
        // Get the current map bounds
        // convert it to the right format
        // for geoblacklight to parse
        // trigger form submit element
        //

        var currentMapBounds = window.vndl.theMap.leafletMap.getBounds();


        // TODO: Do some rounding on the output so can be readable in the UI?

        var currentMapBoundsString = currentMapBounds.toBBoxString();

        console.log('toBBoxString output : ' + currentMapBoundsString);



        // lets manipulate this string

        var s = currentMapBoundsString;


        var spacedString = currentMapBoundsString.split(',').join(' ');

        console.log('with spaces the map bounds are : ' + spacedString);


        // debugging

        //var southWestLatLng = currentMapBounds.getSouthWest();
        //
        //console.log('sw bounds are : ' + southWestLatLng.toString());
        //
        //var northEastLatLng = currentMapBounds.getNorthEast();
        //
        //console.log('ne bounds are : ' + northEastLatLng.toString());


        console.log('maps bounds are : ' + currentMapBounds.toBBoxString());

        console.log('setting the search bounds to : ' + spacedString);


        // add fake bounding box value to form
        $('form.vndl-search').append('<input id="bbox-input-field" type="hidden" name="bbox" value="nothing">');


        // change the bbox input value to the actual bounds of the map

        $('#bbox-input-field').val(spacedString);

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






    function attachingEventstoFacetLink(link) {

        // find all the a elements in the modal
        // add the content of the href to an input type for the form of type hidden
        // then trigger the form submit

        var $link = $(link);

        $link.on("click", function (event) {


            event.preventDefault();


            //// turn off the link to prevent running this handler again
            //
            //$link.click(function(){
            //    return false;
            //});


            ////make selected link unclickable
            //$link.attr( 'onClick', 'return false' );




            // TODO: Extract the following into a function
            
            // pull out facet values from data tags

            var solrFacetName = $link.attr('data-facet-name');

            var facetValue = $link.attr('data-facet-solr-value');



            // make the value the special encoding geobl and solr expect
            var hiddenInputFacetNameFormatted = "f[" + solrFacetName + "][]";



            // make a hidden input element to add to the form with the facet values

            var $hiddenInput = $('<input type="hidden" id="" name="" value="">');


            $hiddenInput.attr('id', facetValue);

            $hiddenInput.attr('name', hiddenInputFacetNameFormatted);
            $hiddenInput.attr('value', facetValue);


            // check if the form element already exists in the search form parent

            // TODO: Need to figure out why Rails doesn't recognise the params
            // containing the facet and thus rendering the render_selected_facet_value
            // method to include the right class and remove link element...

            if (!($('form.vndl-search').find('#'+ facetValue).length)){
                $('form.vndl-search').append($hiddenInput);
            }


            // return to the page
            $('#ajax-modal').modal('hide');


            // this calls the overridden form's submit method that serializes
            // and does an jqxh request for new search result content
            $('form.vndl-search').trigger('submit');



        })
    }
}

