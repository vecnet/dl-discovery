function changeFormSubmitEventToAjaxCall(formElement) {

    $(formElement).on("submit", function (event) {

        event.preventDefault();

        var queryString = $('form.vndl-search').serialize();

        console.log('the serialized form make the following query string : ' + queryString);

        getResultsPage(queryString);

        // because servers understand URLs differently
        var fullPathQueryString = "?" + queryString;

        // use the html5 history API to preserve the browser history and back button
        history.pushState(queryString,null,fullPathQueryString);

    });
}

function flashFeedbackElement() {
    $('.flash').animate({opacity: 0.5}, 500);
    $('.flash').animate({opacity: 1}, 500);
    $('.flash').animate({opacity: 0.5}, 500);
    $('.flash').animate({opacity: 1}, 500);
}
function searchFormSetup(formElement) {

  flashFeedbackElement();

  changeFormSubmitEventToAjaxCall(formElement);

  changeAnchorToUseAjax('a.paginate-next');

  changeAnchorToUseAjax('a.paginate-prev');

  changeAnchorToUseAjax('div.search-widgets .dropdown-menu li a');

  // set up the "show map" checkbox to switch the map on and off
  // and also to allow/disallow the "search map area only" check
  // box.

  setMapVisibility();

  $('input[name=showmap]').change(setMapVisibility);

  // turn the checkbox into a pumpkin everytime
  $('.bootstrap-checkbox').checkboxpicker();



    //
    // Event Handling
    // -----------------------------------------------------------
    //


    // ensure the hierarchy facets in modals fire when shown
    $('#ajax-modal').on('show.bs.modal', function () {
      Blacklight.do_hierarchical_facet_expand_contract_behavior();
      console.log("firing hierarchy facet js formatting code");
    });

    // use the shown map area as a search parameter
    $('#search-map-area').on("click", function() {

        searchMapAreaUsingFormSubmit();

    });

    // Toggle the map visibility for the Geospatial 'Show Me' link
    $('.geospatial-readmore').click(function(e) {

        $( "input[type='checkbox']" ).prop( "checked", function( i, val ) {
            return !val;
        });

    });

    // if a facet has already been applied
    if ($('#appliedParams').length) {
        console.log('div id appliedParams has length and therefore facets are applied');

        // make the serialised form string
        var serialisedForm = $('form.vndl-search').serialize();

        console.log('the serialized form currently is : ' + serialisedForm);

        // find all the elements that contain more_facets_link
        var $links = $('form.vndl-search').find('.more_facets_link');

        // for each link in links, add the serialised search form to it's href
        // so it's correctly using ajax instead of original link
        addSerialisedFormToHref($links);


        // find the elements that contain removeFacet
        var $removeFacetLinks = $('form.vndl-search').find('.removeFacet');

        // remove hidden input elements contained in 'remove this Filter' links
        // then reserialise the form and trigger submit
        addClickEventToRemoveAppliedFacet($removeFacetLinks);

    }
}


// Functions
//----------------------------------------------------------------------------------------------------------------------


//
//----------------------------------------------------------------------------------------------------------------------
// Get the current map bounds
// convert it to the right format for geoblacklight to parse
// add to hidden input on search form
// trigger form submit
//
function searchMapAreaUsingFormSubmit() {
    

    var currentMapBounds = window.vndl.theMap.leafletMap.getBounds();


    // TODO: Do some rounding on the output so can be readable in the UI?

    var currentMapBoundsString = currentMapBounds.toBBoxString();

    console.log('toBBoxString output : ' + currentMapBoundsString);


    var spacedString = currentMapBoundsString.split(',').join(' ');

    console.log('with spaces the map bounds are : ' + spacedString);

    console.log('maps bounds are : ' + currentMapBounds.toBBoxString());

    console.log('setting the search bounds to : ' + spacedString);


    // add fake bounding box value to form
    $('form.vndl-search').append('<input id="bbox-input-field" type="hidden" name="bbox" value="' + spacedString + '">');

    $('form.vndl-search').trigger('submit');
}

//
//----------------------------------------------------------------------------------------------------------------------
//

// Prevent the normal link action and make an ajax call to original href instead
function changeAnchorToUseAjax(elementSelector){

    $(elementSelector).click(function(){
        event.preventDefault();

        var ajaxLink = ($(this).attr('href'));
        // or alert($(this).hash();

        getResultsPage(ajaxLink);
        console.log("the href just submitted by ajax is" + ajaxLink);
    });
}
//----------------------------------------------------------------------------------------------------------------------

//
// for each link in links prevent the default click and
// instead remove the closest div with aria-label=location-filter (aka an applied facet)
// then trigger the form submit to get refreshed search results
//
function addClickEventToRemoveAppliedFacet($links) {

    var $removeFacetLinks = $links;

    $removeFacetLinks.each(function (index, link) {

        var $newLink = $(link);

        $newLink.on("click", function (event) {

            event.preventDefault();

            var ParentButtonGroup = $newLink.closest("div[aria-label=location-filter]");

            ParentButtonGroup.remove();

            console.log('remove facet link performed. trigger form submit next');

            $('form.vndl-search').trigger('submit');

        });
    });
}
//----------------------------------------------------------------------------------------------------------------------

//
// for each link in links, add the serialised search form to it's href
//
function addSerialisedFormToHref($links) {

    $links.each(function (i, link) {

        $link = $(link);

        // find the original href
        var originalHref = $link.attr('href');

        var serialisedForm = $('form.vndl-search').serialize();

        // append the serialised form to it
        $link.attr('href', originalHref + '?' + serialisedForm);

        // the correct link structure is e.g.

        // <a href="/catalog/facet/desc_metadata__creator_facet?f%5Bdesc_metadata__creator_facet%5D%5B%5D=Abaga%2C+S."

        // therefore : add a '?' prior to the append

        console.log('each respective link href will now be : ' + originalHref + '?' + serialisedForm);
    });
}
//----------------------------------------------------------------------------------------------------------------------

function setMapVisibility() {
    var showmap = $('input[name=showmap]').prop('checked');

    if (showmap) {
        window.vndl.theMap.show();
        //enable($('input[name=searchmap]'));
        enable($('button[name=searchmap]'));
        addShowmapToHrefs();

    } else {
        window.vndl.theMap.hide();
        //disable($('input[name=searchmap]'));
        disable($('button[name=searchmap]'));
        removeShowmapFromHrefs();
    }
}
//----------------------------------------------------------------------------------------------------------------------
// add showmap=on to hrefs in the page

function addShowmapToHrefs() {
    $('a[href]').each(function (index, anchor) {
        var href = $(anchor).attr('href');

        if (typeof href !== 'undefined') {

            if (href.indexOf('?') != -1) {
                href = href + '&showmap=on';
            }
            else {
                href = href + '?showmap=on';
            }
            $(this).attr('href', href);

        }
    });
}
//----------------------------------------------------------------------------------------------------------------------
// remove all showmap=on to hrefs in the page

function removeShowmapFromHrefs() {

    $("a[href*='showmap=']").each(function (index, anchor) {
        var href = $(anchor).attr('href');
        $(this).attr('href', href.replace(/&?showmap=\w+/, ''));
    });
}
//----------------------------------------------------------------------------------------------------------------------
