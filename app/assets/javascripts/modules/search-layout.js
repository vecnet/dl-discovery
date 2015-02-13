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
function getResultsPage(start, length) {
    // lol ignore the start/length paging info.

    // make a url
    var url = 'results1.html';

    // normally this would be a post of the form.  but for now
    // just fetch the url
    $('.contentwrapper > .content').load(url, function () {
        // chuck away the previous map markers
        window.vndl.theMap.clearMarkers();
        // parse the inserted content for new map references
        window.vndl.theMap.findMarkers($('.contentwrapper > .content'));
    });

}
// ------------------------------------------------------------------
// ------------------------------------------------------------------
(function () {

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

    // make the submit-search-form work
    $('#gosearch').click(function (event) {
        // for now just fetch a result page
        getResultsPage();
    });

})();

