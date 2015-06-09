$(document).ready(function() {
    $('dd').expander({
        slicePoint: 300,
        widow: 4,
        expandEffect: 'show',
        expandText: ' Read more >>',
        userCollapseText: '<< Read less',
        sliceOn: '.  '
    });

});

//// The number of characters
//var XX = 100;
//
//$('dd').filter(function() {
//    return $(this).text().length > XX;
//}).wrap('<span></span>.addClass('truncated');
//
//<p>
//This is the visible part <span class="truncated">this is the hidden part.</span>
//</p>
//Then hide it, append the hide/show icon, and toggle state:
//
//    $('.truncated').hide()                       // Hide the text initially
//        .after('<i class="icon-plus-sign"></i>') // Create toggle button
//        .next().on('click', function(){          // Attach behavior
//            $(this).toggleClass('icon-minus-sign')   // Swap the icon
//                .prev().toggle();                    // Hide/show the text
//        });