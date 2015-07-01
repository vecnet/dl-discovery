Blacklight.onLoad(function(){
  Blacklight.do_hierarchical_facet_expand_contract_behavior();
});

Blacklight.do_hierarchical_facet_expand_contract_behavior.selector = 'li.h-node';

(function($) {
  Blacklight.do_hierarchical_facet_expand_contract_behavior = function() {
    $( Blacklight.do_hierarchical_facet_expand_contract_behavior.selector ).each (
      Blacklight.hierarchical_facet_expand_contract
    );
  };

  Blacklight.hierarchical_facet_expand_contract = function() {

    alert("printf should be called once");
    var li = $(this);

    $('ul', this).each(function() {
      li.addClass('twiddle');
      if($('span.selected', this).length === 0){
        $(this).hide();
      } else {
        li.addClass('twiddle-open');
      }
    });

    // attach the toggle behavior to the li tag
    li.click(function(e){
      if (e.target === this) {
        // toggle the content
        $(this).toggleClass('twiddle-open');
        $(this).children('ul').slideToggle();
      }
    });
  };
})(jQuery);