module EarthworksGeoblacklightHelper
  include GeoblacklightHelper
  def document_available?
    # maybe this method should be removed altogether?
    true
  end

  def permission_badge_for(solr_document)
    case access_level(solr_document)
    when :public
      dom_label_class = 'label-success'
      link_title = t('discovery.access_label.public')
    when :registered
      dom_label_class = 'label-info'
      link_title = t('discovery.access_label.registered')
    when :private
      dom_label_class = 'label-important'
      link_title = t('discovery.access_label.private')
    else
      dom_label_class = 'label-warning'
      link_title = "Unknown"
    end

    %(<span class="label #{dom_label_class}" title="#{link_title}">#{link_title}</span>).html_safe
  end

  def read_only_users(solr_document)
    (solr_document.fetch('read_access_person_sm', []) +
     solr_document.fetch('read_access_group_sm', [])).sort.join(", ").html_safe
  end

  def edit_users(solr_document)
    (solr_document.fetch('edit_access_person_sm', []) +
     solr_document.fetch('edit_access_group_sm', [])).sort.join(", ").html_safe
  end

  private

  # returns one of :public, :registered, or :private
  def access_level(solr_doc)
    if solr_doc['read_access_group_sm'].present?
      if solr_doc['read_access_group_sm'].include?('public')
        return :public
      elsif solr_doc['read_access_group_sm'].include?('registered')
        return :registered
      end
    end
    :private
  end
end
