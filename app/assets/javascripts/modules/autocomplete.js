$(document).on('ready page:load', function () {
  var terms = new Bloodhound({
    datumTokenizer: Bloodhound.tokenizers.obj.whitespace('value'),
    queryTokenizer: Bloodhound.tokenizers.whitespace,
    remote: {
      url: '/suggest?q=%QUERY'
    }
  });

  terms.initialize();

  // TODO: Change this selector to correct
  $('input.input-lg').typeahead({
        hint: false,
        highlight: true,
        minLength: 2
      },
      {
        name: 'terms',
        displayKey: 'term',
        source: terms.ttAdapter()
      });
});
