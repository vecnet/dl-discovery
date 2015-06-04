$(document).ready(function() {
    $('dd').expander({
        slicePoint: 100,
        widow: 4,
        expandEffect: 'show',
        userCollapseText: '[^]'
    });

    $('dd:before').expander({
        slicePoint: 100,
        widow: 2,
        expandEffect: 'show',
        userCollapseText: '[^]'
    });

});



//// The number of characters
//var XX = 100;
//
//$('dd:before').filter(function() {
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