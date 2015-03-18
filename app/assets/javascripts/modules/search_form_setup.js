function searchFormSetup(formElement) {

    $(formElement).on("submit", function (event) {
        event.preventDefault();
        var queryString = $('form.vndl-search').serialize();

        console.log('the query string from serialized form is : ' + queryString);
        getResultsPage(queryString);

    });



    // set the facet buttons to have href's that represent the current search params
    // ie the seralized verion of the facets already being applied.



    if ($('#appliedParams').length) {

        // make the serialised form string

        var serialisedForm = $('form.vndl-search').serialize();

        // find all the elements that contain more_facets_link


        var $links = $('form.vndl-search').find('.more_facets_link');


        console.log('the links object is : ' + $links.html());

        console.log('the serialised form that will become each href is : ' + serialisedForm);


        $links.each(function (i, link) {


            $link = $(link);


            // find the original href

            // append the serialised form to it

            // the correct link structure is
            //
            // <a href="/catalog/facet/desc_metadata__creator_facet?f%5Bdesc_metadata__creator_facet%5D%5B%5D=Abaga%2C+S."

            // therefore : add a '?' prior to the append

            var originalHref = $link.attr('href');


            $link.attr('href', originalHref + '?' + serialisedForm);

        });

    }





    $('#ajax-modal').on('show.bs.modal', function(e) {


        $('#ajax-modal a.facet_select').each(function (index, link) {


            // call the function to remove submit event on href

            attachEventsToFacetLink(link);


        });


        // hijack the remove facet link

        $('.modal-body a.remove').each(function (index, link) {


            removeFacetWithAjax(link);

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




        // check if the form element already exists in the search form parent

        if ($("div[data-facetvalue='"+facetValue+"']").length){

            // don't go breaking my heart

        }

        else {

            $('form.vndl-search').append($hiddenInput);


            //this calls the search form's overridden submit method that serializes the form
            // and does an jqxh request for new search result content
            $('form.vndl-search').trigger('submit');
        }

        $('#ajax-modal').modal('hide');
    }


    function removeFacetWithAjax(link) {


        //TODO: This requires code review


        $link = $(link);

        var facetValue = $link.attr('data-facet-solr-value');

        $("form.vndl-search[data-facet-solr-value='"+facetValue+"']").remove();


        //this calls the search form's overridden submit method that serializes the form
        // and does an jqxh request for new search result content
        $('form.vndl-search').trigger('submit');


        $('#ajax-modal').modal('hide');

    }

}

