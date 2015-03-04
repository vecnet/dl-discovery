module ApplicationHelper

  def comment
  end


  # These need to be moved to somewhere responsible but hey

  def get_map_checkbox

    "checked" if params.include? :showmap


  end


  def get_search_query_text

    user_search_text = params[:q]

  end
end
