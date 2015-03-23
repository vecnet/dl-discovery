$(function () {
    $( '#table' ).searchable({
        striped: true,
        oddRow: { 'background-color': '#f5f5f5' },
        evenRow: { 'background-color': '#fff' },
        searchType: 'fuzzy',
        onSearchActive : function( elem, term ) {
            elem.show();
        },
        onSearchBlur: function() {
            $( '#feedback' ).hide();
        },
        clearOnLoad: true,
        hide          : function( elem ) {
            elem.fadeOut(50);
        },
        show          : function( elem ) {
            elem.fadeIn(50);
        }
    });

});

