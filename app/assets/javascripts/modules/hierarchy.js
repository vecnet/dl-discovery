$(document).ready(function(){
  Blacklight.do_hierarchical_facet_expand_contract_behavior();
    console.log('window ready event fired and called initial function');
});

(function($) {
  Blacklight.do_hierarchical_facet_expand_contract_behavior = function() {
    $( Blacklight.do_hierarchical_facet_expand_contract_behavior.selector ).each (
        Blacklight.hierarchical_facet_expand_contract()
     );
      console.log('print for each selector expand contract function call');
  };
  Blacklight.do_hierarchical_facet_expand_contract_behavior.selector = 'li.h-node';

  Blacklight.hierarchical_facet_expand_contract = function() {
      console.log("inside expand contract function");
    var li = $(this);
    
    $('ul', this).each(function() {
      li.addClass('twiddle');
        console.log('added twiddle class to li');
      if($('span.selected', this).length == 0){
        $(this).hide();
      } else {
        li.addClass('twiddle-open');
      }
    });

    // attach the toggle behavior to the li tag
    li.click(function(e){
      if (e.target == this) {
        // toggle the content
        $(this).toggleClass('twiddle-open');
        $(this).children('ul').slideToggle();
      }
    });
  };
})(jQuery);
