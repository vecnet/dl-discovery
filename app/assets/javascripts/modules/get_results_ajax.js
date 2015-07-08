
function getResultsPage(queryString, start, length) {
    // lol ignore the start/length paging info.

    var url = '/?' + queryString;

    // Assign handlers immediately after making the request,
// and remember the jqXHR object for this request
    var jqxhr = $.ajax({url: url, dataType: "text", cache: false})
        .done(function (data) {

            var queryString = $('form.vndl-search').serialize();

            var newURL = '/?' + queryString;

            console.log('the serialized form is : ' + queryString);

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
                // TODO: Is this necessary since the example home text partial is rendered when no search params?
                //history.replaceState="?";

            }


            // inject DOMified search results into the vndl-results section of the current page
            $('.contentwrapper > .content').html(searchResultDOMElement);


            // rerun the method to hijack the search form to prevent a new page load
            searchFormSetup($('form.vndl-search'));


            // chuck away the previous map markers
            //window.vndl.theMap.clearMarkers();
            VndlMap.prototype.clearClusterLayer();

            // chuck away the previous rectangles
            //window.vndl.theMap.clearRectangles();
            VndlMap.prototype.clearRectangles();

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

//----------------------------------------------------------------------------------------------------------------------


function getSearchParameters(newURL) {
    var paramString = window.location.search.substr(1);
    return paramString != null && paramString != "" ? transformToAssocArray(paramString) : {};
}

//----------------------------------------------------------------------------------------------------------------------

function transformToAssocArray( paramString ) {
    var params = {};
    var paramArray = paramString.split("&");
    for ( var i = 0; i < paramArray.length; i++) {
        var tmparr = paramArray[i].split("=");
        params[tmparr[0]] = tmparr[1];
    }
    return params;
}