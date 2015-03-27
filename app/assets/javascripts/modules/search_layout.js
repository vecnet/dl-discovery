// assume jquery is available as $

// ------------------------------------------------------------------
// disable an input AND add a "disabled" class to its wrapper.
function disable(element) {
    var $elem = $(element);
    $elem.prop('disabled', true);
    $elem.parent().closest('.checkbox, .checkbox-inline, .radio, .radio-inline, fieldset').addClass('disabled');
}
// ------------------------------------------------------------------
// un-disables an input AND removes the "disabled" class from its wrapper.
function enable(element) {
    var $elem = $(element);
    $elem.prop('disabled', false);
    $elem.parent().closest('.disabled').removeClass('disabled');
}
// ------------------------------------------------------------------
function getResultsPage(queryString, start, length) {
    // lol ignore the start/length paging info.

    var url = '/?' + queryString;

    // Assign handlers immediately after making the request,
// and remember the jqXHR object for this request
    var jqxhr = $.ajax({url: url, dataType: "text", cache: false})
        .done(function (data) {

            //console.log( data );
            console.log("start of ajax search request");
            console.log('found the following search result as elements : ' + $(data).find('#documents'));
            //console.log('the search result elements to html is : ' + $(data).find('#documents').html());

            if ($(data).find('#content').length)
            {

                console.log('found search result elements in #content' );

                // find and store the search result document element contained in #content
                var searchResultDOMElement = $(data).find('#content').html();

            }

           else {
                // TODO: Redo this correctly
                // some function that loads a result page that is the default page
                document.location.href="/";

            }



            // inject DOMified search results into the vndl-results section of the current page
            $('.contentwrapper > .content').html(searchResultDOMElement);


            // rerun the method to hijack the search form to prevent a new page load
            searchFormSetup($('form.vndl-search'));


            // chuck away the previous map markers
            window.vndl.theMap.clearMarkers();

            // chuck away the previous rectangles
            window.vndl.theMap.clearRectangles();

            // parse the inserted content for new map references
            window.vndl.theMap.discoverAndMapGeoDataInResultsHtml($('.contentwrapper > .content'));


        })

        // TODO: Add user error page for when jqxhr doesn't return 200
        .fail(function (jqXHR, textStatus) {
            console.log("error" + textStatus);
        })
        .always(function () {
            console.log(" ajax search and load finished");
        });
}
// ------------------------------------------------------------------
// ------------------------------------------------------------------
$(function () {

    // Gets called at the start of a page load

    // store the map reference in a global
    window.vndl = {};

    // make a map
    window.vndl.theMap = new window.VndlMap('map');

    // set the height of the contentwrapper to fill the screen
    var $cw = $('.contentwrapper');
    $cw.height($(window).height() - $cw.position().top);
    window.vndl.theMap.resizeFor(1.5);

    // they're coming, everyone hide and get ready to yell "surprise!"
    // (initialise things to their start up values)
    window.vndl.theMap.hide();
    disable($('input[name=searchmap]'));


    // overrides the form submit event on the top Search form
    // gets the user input search terms
    // calls jqxhr getResultsPage with search terms

    searchFormSetup($('form.vndl-search'));

    // make the submit-search-form work
    $('#gosearch').click(function (event) {
        // for now just fetch a result page
        getResultsPage();
    });

});

