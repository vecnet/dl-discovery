// The number of characters to preview
var previewCharsLength = 100;

$('dd').filter(function() {
    return $(this).text().length > XX;
}).addClass('truncated');

$('.truncated').hide()                       // Hide the text initially
    .after('<i class="icon-plus-sign"></i>') // Create toggle button
    .next().on('click', function(){          // Attach behavior
        $(this).toggleClass('icon-minus-sign')   // Swap the icon
            .prev().toggle();                    // Hide/show the text
    });
