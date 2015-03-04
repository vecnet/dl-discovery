module ApplicationHelper

  def comment
  end


  # These need to be moved to somewhere responsible but hey

  def get_map_checkbox

    show_map_checkbox = params[:showmap]

  end


  def get_search_query_text

    user_search_text = params[:q]

  end
end
