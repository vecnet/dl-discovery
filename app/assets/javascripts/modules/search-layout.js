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

    var url = 'http://localhost:3000/?' + queryString;

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


            // throw away the DOM elements of search results HTML that we don't need
            // only keep the search results documents div
            // inject that selected div into the vndl-results section

            var thingWeWant = $(data).find('#documents').html();
            $('.contentwrapper > .content > .vndl-results').html(thingWeWant);

            // TODO make the search results page a partial that instead displayed on the home page as well
            // the partial needs to include the search form but not the results


        })
        .fail(function (jqXHR, textStatus) {
            console.log("error" + textStatus);
        })
        .always(function () {
            console.log(" ajax search load finished");
        });


    //$('.contentwrapper > .content').load(jqxhr, function () {
    //

    //
    //
    //
    //    // chuck away the previous map markers
    //    window.vndl.theMap.clearMarkers();
    //    // parse the inserted content for new map references
    //    window.vndl.theMap.findMarkers($('.contentwrapper > .content'));
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

    // set up the "show map" checkbox to switch the map on and off
    // and also to allow/disallow the "search map area only" check
    // box.
    $('input[name=showmap]').change(function () {
        var showmap = $('input[name=showmap]').prop('checked');
        if (showmap) {
            window.vndl.theMap.show();
            enable($('input[name=searchmap]'));
        } else {
            window.vndl.theMap.hide();
            disable($('input[name=searchmap]'));
        }
    });


    // TODO extract this js to 'prep the form' to recieve input from user to run after the page loads
    // Give this js a new file with its name a semantic meaning so can be deciphered by next maintainer

    // override form submit on the top Search form

    $('form.vndl-search').on("submit", function (event) {
        event.preventDefault();
        var queryString = $('form.vndl-search').serialize();
        getResultsPage(queryString);

    });



    // make the submit-search-form work
    $('#gosearch').click(function (event) {
        // for now just fetch a result page
        getResultsPage();
    });

});

