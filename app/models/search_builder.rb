class SearchBuilder < Geoblacklight::SearchBuilder
  #include Blacklight::Solr::SearchBuilderBehavior

  def initialize(processor_chain, scope)
    # scope is the catalog controller object for this request. We need it
    # to get to the current_user
    @scope = scope
    super(processor_chain, scope)
  end

  # Add filter query to limit documents returned by search to those
  # the current_user can view.
  #
  # This does not do the actual authz needed when displaying an item show page.
  def apply_authz(solr_params)
    req_params = blacklight_params
    discovery_permissions = ["read_access_group_sm:public"]
    if @scope.current_user
      # don't apply any limits to admin
      return if @scope.current_user.admin?
      discovery_permissions += [
        "read_access_group_sm:registered",
        "read_access_person_sm:\"#{@scope.current_user.uid}\"",
        "edit_access_person_sm:\"#{@scope.current_user.uid}\""
      ]
      @scope.current_user.groups.each do |grp|
        discovery_permissions += [
          "read_access_group_sm:\"#{grp}\"",
          "edit_access_group_sm:\"#{grp}\""
        ]
      end
    end
    solr_params[:fq] ||= []
    solr_params[:fq] << discovery_permissions.join(" OR ")
  end

end
