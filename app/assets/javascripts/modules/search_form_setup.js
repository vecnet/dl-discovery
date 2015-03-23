function searchFormSetup(formElement) {

    $(formElement).on("submit", function (event) {
        event.preventDefault();

        var queryString = $('form.vndl-search').serialize();

        console.log('the serialized form make the following query string : ' + queryString);

        getResultsPage(queryString);


    });



    //
    //----------------------------------------------------------------------
    //




    // change facet buttons href's to equal the current search form when serialized
    // ie the serialised version of the facets already being applied.


    if ($('#appliedParams').length) {

        console.log('div id appliedParams has length and therefore elements');

        // make the serialised form string
        var serialisedForm = $('form.vndl-search').serialize();


        // find all the elements that contain more_facets_link
        var $links = $('form.vndl-search').find('.more_facets_link');


        //console.log('the links object is : ' + $links.html());

        //console.log('the serialised form is : ' + serialisedForm);


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

            console.log('each respective link href will now be : ' + originalHref + '?' + serialisedForm);

        });


        // for each 'remove this filter' link we need to
        // hijack the click
        // remove its hidden input
        // trigger submit


        // find the elements that contain removeFacet
        var $removeFacetLinks = $('form.vndl-search').find('.removeFacet');

        $removeFacetLinks.each(function(index,button){


            $button = $(button);

            $button.on("click", function(event){

                event.preventDefault();

                //$button.closest("div[aria-label=location-filter]").remove();

                $button.closest("div[aria-label=location-filter]").remove();

                $('form.vndl-search').trigger('submit');

                //alert('form triggered...');

                console.log('remove facet link performed...');

            })

        });

    }




    //
    // Replace modal links with ajax versions
    //

    // when the Bootstrap modal is loaded

    $('#ajax-modal').on('show.bs.modal', function(e) {


        $('.modal-body a.facet_select').each(function (index, link) {


            // call the function to remove submit event on href

            attachEventsToFacetLink(link);


        });


        // hijack the remove facet link in the modal

        $('.modal-body a.remove').each(function (index, link) {


            removeFacetWithAjax(link);

        });

    });


    //
    //----------------------------------------------------------------------
    //


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


        // construct the facet_name URL with the special encoding geobl and solr expect
        var hiddenInputFacetNameFormatted = "f[" + solrFacetName + "][]";


        // make the hidden input element that will be added to the form
        var $hiddenInput = $('<input type="hidden" name="" value="">');


        // given hidden input name and value of the facet_field and facet_value
        $hiddenInput.attr('name', hiddenInputFacetNameFormatted);
        $hiddenInput.attr('value', facetValue);


        // check if the form element already exists in the search form parent

        if ($("[data-facetvalue='"+facetValue+"']").length){

            // don't go breaking my heart

            alert("this code shouldn't run as I can't add the same facet...");

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


        //TODO: This requires review


        $link = $(link);

        var facetValue = $link.attr('data-facet-solr-value');

        $("form.vndl-search[data-facet-solr-value='"+facetValue+"']").remove();


        //this calls the search form's overridden submit method that serializes the form
        // and does an jqxh request for new search result content
        $('form.vndl-search').trigger('submit');


        $('#ajax-modal').modal('hide');

    }

}

