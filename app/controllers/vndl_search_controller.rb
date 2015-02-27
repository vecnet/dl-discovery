# -*- encoding : utf-8 -*-
require 'blacklight/catalog'

class VndlSearchController < CatalogController

  layout :pick_layout

  def pick_layout

    if has_search_parameters?
      return 'vndl-search-results'
    else
      'vndl'
    end
  end


end
