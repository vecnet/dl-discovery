module ApplicationHelper

  def comment
  end

  def snippet(text)
    if (text)
      if (text.length > 350)
        text.slice(0,350) + '...'
      else
        text
      end
    else
      ''
    end
  end


  # These need to be moved to somewhere responsible but hey

  def get_map_checkbox

    "checked" if params.include? :showmap


  end


  def get_search_query_text

    user_search_text = params[:q]

  end
end
