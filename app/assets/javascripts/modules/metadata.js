//
//$(document).ready(function() {
//    $('#table-document').dataTable( {
//        "paging":   false,
//        "ordering": false,
//        "info":     false
//    } );
//} );
//
//
//$(document).ready(function() {
//    $('#table-file').dataTable( {
//        "paging":   false,
//        "ordering": false,
//        "info":     false
//    } );
//} );
//
//
//$(document).ready(function() {
//    $('#table-metadata').dataTable( {
//        "paging":   false,
//        "ordering": false,
//        "info":     false
//    } );
//} );

//$(document).ready(function() {
//
//
//    var dTable = $('#document-table').dataTable( {
//        "paging":   false,
//        "ordering": false,
//        "info":     false,
//        "bInfo":    false
//    } );
//
//    $('#search-field').keyup(function(){
//    dTable.fnFilter($(this).val());
//    });
//
//});


$(document).ready(function () {

    (function ($) {

        $('#search-field').keyup(function () {

            var rex = new RegExp($(this).val(), 'i');
            $('.searchable tr').hide();
            $('.searchable tr').filter(function () {
                return rex.test($(this).text());
            }).show();

        })

    }(jQuery));

});
