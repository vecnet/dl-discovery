$(document).ready(function() {
    $('dd:before').expander({
        slicePoint: 100,
        widow: 2,
        expandEffect: 'show',
        userCollapseText: '[^]'
    });

    $('.truncate:before').expander({
        slicePoint: 100,
        widow: 2,
        expandEffect: 'show',
        userCollapseText: '[^]'
    });

});