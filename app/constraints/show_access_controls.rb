class AccessDenied < RuntimeError
end

module ShowAccessControls

  # intended to be used to guard the show method in the blacklight
  # catalog controller.
  def enforce_show_permissions(opts={})



    puts "SESSION DEBUGGING ***** SESSION KEY SEARCH IS : *************"

    Rails.logger.debug{"session search is hash"}

    logger.debug{"adfladfkjaldjfalkdj"}


    _, doc = fetch params[:id]
    ok = false
    if current_user
      ok ||= current_user.admin?
      ok ||= member_of_field(doc["read_access_group_sm"], ["public", "registered"] + current_user.groups)
      ok ||= member_of_field(doc["edit_access_group_sm"], current_user.groups)
      ok ||= member_of_field(doc["read_access_person_sm"], current_user.uid)
      ok ||= member_of_field(doc["edit_access_person_sm"], current_user.uid)
    else
      ok = member_of_field(doc["read_access_group_sm"], "public")
    end
    raise AccessDenied unless ok
  end

  private
  def member_of_field(field, item)
    return false if field.nil?
    return (field & item).length > 0 if item.is_a?(Array)
    field.include?(item)
  end

end
