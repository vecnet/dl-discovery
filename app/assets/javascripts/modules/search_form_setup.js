function searchFormSetup(formElement) {

    $(formElement).on("submit", function (event) {
        event.preventDefault();
        var queryString = $('form.vndl-search').serialize();
        getResultsPage(queryString);

    });


    $('#ajax-modal').on('show.bs.modal', function(e) {


        $('#ajax-modal a.facet_select').each(function (index, link) {


            // call the function to remove submit event on href

            attachEventsToFacetLink(link);


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




    function attachEventsToFacetLink(link) {

        // find all the a elements in the modal
        // add the content of the href to an input type for the form of type hidden
        // then trigger the form submit

        var $link = $(link);

        $link.on("click", function (event) {


            event.preventDefault();


            makeHiddenInputElementForSearchForm($link);

        })
    }

    function makeHiddenInputElementForSearchForm($link) {

        // pull out facet values from data tags

        var solrFacetName = $link.attr('data-facet-name');

        var facetValue = $link.attr('data-facet-solr-value');


        // make the value the special encoding geobl and solr expect
        var hiddenInputFacetNameFormatted = "f[" + solrFacetName + "][]";


        // make a hidden input element to add to the form with the facet values

        var $hiddenInput = $('<input type="hidden" name="" value="">');


        $hiddenInput.attr('name', hiddenInputFacetNameFormatted);
        $hiddenInput.attr('value', facetValue);




        // TODO: Need to figure out why Rails doesn't recognise the params
        // containing the facet and thus rendering the render_selected_facet_value
        // method to include the right class and remove link element...





        // check if the form element already exists in the search form parent
        // TODO: Fix this selector

        if ($("form.vndl-search.div[data-facetValue="+facetValue+"]").length){

            console.log('found a data tag of : ' + facetValue);

        }

        else {

            $('form.vndl-search').append($hiddenInput);


            //this calls the search form's overridden submit method that serializes the form
            // and does an jqxh request for new search result content
            $('form.vndl-search').trigger('submit');
        }

        $('#ajax-modal').modal('hide');
    }
}

