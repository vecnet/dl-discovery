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

    // TODO Change to correct path method

    var url = '/?' + queryString;

    // normally this would be a post of the form.  but for now
    // just fetch the url


    // Assign handlers immediately after making the request,
// and remember the jqXHR object for this request
    var jqxhr = $.ajax({url: url, dataType: "text", cache: false})
        .done(function (data) {
            //console.log( data );
            console.log("successful ajax search request");
            console.log("start parsing of html results");
            console.log($(data).find('#documents'));


            // find and store the search result document element contained in #content

            var searchResultDOMElement = $(data).find('#content').html();

            // inject DOMified search results into the vndl-results section of the current page

            $('.contentwrapper > .content').html(searchResultDOMElement);

            // rerun the method to hijack the search form to prevent a new page load

            searchFormSetup($('form.vndl-search'));

            // chuck away the previous map markers
            window.vndl.theMap.clearMarkers();

            // parse the inserted content for new map references
            window.vndl.theMap.discoverAndMapGeoDataInResultsHtml($('.contentwrapper > .content'));


        })
        .fail(function (jqXHR, textStatus) {
            console.log("error" + textStatus);
        })
        .always(function () {
            console.log(" ajax search load finished");
        });


    //the old jq load method

    //$('.contentwrapper > .content').load(jqxhr, function () {
    //

    //
    //
    //
    //    // chuck away the previous map markers
    //    window.vndl.theMap.clearMarkers();
    //    // parse the inserted content for new map references
    //    window.vndl.theMap.discoverAndMapGeoDataInResultsHtml($('.contentwrapper > .content'));
    //});

}
// ------------------------------------------------------------------
// ------------------------------------------------------------------
$(function () {

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

    //$('form.vndl-search').on("submit", function (event) {
    //    event.preventDefault();
    //    var queryString = $('form.vndl-search').serialize();
    //    getResultsPage(queryString);
    //
    //});



    // make the submit-search-form work
    $('#gosearch').click(function (event) {
        // for now just fetch a result page
        getResultsPage();
    });

});

