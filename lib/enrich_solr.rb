require 'json'
require_relative 'geonames'

# this class is used to alter the solr records from the backend solr
# to be in the format expected for the discovery solr. It does the following
# broad tasks
#
#  * add geodata, coordinates, and bounding boxes for any place names
#  * remap the solr field names to be in the form expected by geoblacklight
#
# This class does not talk to either solr. It just does the data enrichment and
# transformation.
class EnrichSolr
  def initialize(cache_filename=nil)
    @geonames = Geonames.new(cache_filename)
  end

  def process_one(record)
    new_record = {
      uuid:             record['id'],
      dc_title_s:       first_or_nil(record['desc_metadata__title_t']),
      dc_description_s: first_or_nil(record['desc_metadata__description_t']),
      dc_creator_sm:    record['desc_metadata__creator_t'],
      dc_type_s:        first_or_nil(record['desc_metadata__resource_type_t']),
      dc_subject_sm:    record['desc_metadata__subject_t'],
      dct_spatial_sm:   record['desc_metadata__based_near_t'],
      # these are required ATM for geoblacklight...
      layer_id_s:       first_or_nil(record['noid_s']),
      layer_slug_s:     first_or_nil(record['noid_s']),
      layer_geom_type_s: 'Point',
      dct_provenance_s: 'Digital Library',
      # should be dc_accessrights_s, dc_rights is for intellectual rights not access rights
      dc_rights_s:      first_or_nil(record['read_access_group_t']) || 'Public'
    }
    new_record.merge!(enrich_bounding_box(record))
    new_record.merge!(enrich_location_names(record))

    new_record
  end

  def save
    @geonames.save
  end

  private

  # add all locations into a bounding box.
  # todo: include spatial data in the bounding box
  def enrich_bounding_box(record)
    bbox = Geonames::Bbox.new
    record.fetch('desc_metadata__based_near_t', []).each do |place|
      place = place.split(",").first
      info = @geonames.lookup_name(place)
      if info.nil?
        next
      elsif info['bbox']
        bbox.add_bbox(info['bbox'])
      else
        bbox.add_point(info)
      end
    end

    if bbox.valid?
      # nothing was added to this bounding box
      new_record = {}
    else
      north = bbox.north
      south = bbox.south
      west = bbox.west
      east = bbox.east
      # solr does not like coordinates > 180 :(
      east -= 360 if east > 180
      # if Bbox is a point, enlarge it slightly so it is nicer.
      if north == south
        north += 0.1 if north <= 89.9
        south -= 0.1 if south >= -89.9
      end
      if east == west
        east += 0.1 if east <= 179.9
        west -= 0.1 if west >= -179.9
      end
      new_record = {
        "solr_bbox" => "#{west} #{south} #{east} #{north}",
        "solr_geom" => "ENVELOPE(#{west}, #{east}, #{north}, #{south})",
        "georss_box_s" => "#{south} #{west} #{north} #{east}",
        #"georss_polygon_s" => "#{north} #{west} #{north} #{east} #{south} #{east} #{south} #{west} #{north} #{west}"
      }
    end
    new_record
  end

  def enrich_location_names(record)
    better_place_names = []
    record.fetch('desc_metadata__based_near_t', []).each do |place|
      short_place = place.split(",").first
      info = @geonames.lookup_name(short_place)
      if info.nil?
        better_place_names << place
      else
        name = info['name']
        country = info['countryName']
        country = "(" + country + ")" if country != ""
        geoid = info['geonameId']
        fcode = info['fcode']
        better_place_names << "#{name} #{country} [#{geoid}/#{fcode}]"
      end
    end
    { 'dct_spatial_sm' => better_place_names }
  end

  def first_or_nil(lst)
    return nil if lst.nil?
    lst.first
  end
end
