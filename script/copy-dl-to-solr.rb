#!/usr/bin/env ruby

require 'json'
require 'rsolr'
require_relative '../lib/geonames'

# usage:
# $ copy-dl-to-solr.rb [source solr url] [target solr url]
# $ copy-dl-to-solr.rb [source solr url] -o


# This is getting to be kinda ugly.

if ARGV.length != 2
  puts "USAGE:"
  puts "copy-dl-to-solr.rb [source solr url] [target solr url]"
  puts "copy-dl-to-solr.rb [source solr url] -o"
  puts "copy-dl-to-solr.rb [source solr url] -i"
  exit 1
end

output_stdout = false

if ARGV[1] == "-o"
  output_stdout = true
end

STDERR.puts "Source is #{ARGV[0]}"
source = RSolr.connect url: ARGV[0]

if output_stdout
  STDERR.puts "Output to stdout"
  target = nil
else
  STDERR.puts "Target is #{ARGV[1]}"
  target = RSolr.connect url: ARGV[1]
end

response = source.get 'select', params: {q: '*:vecnet', rows: 1000}

def first_or_nil(lst)
  return nil if lst.nil?
  lst.first
end

geonames = Geonames.new('geoname-cache.json')
processed_count = 0
output = []

response['response']['docs'].each do |record|
  processed_count += 1
  STDERR.puts "Processing record #{record['id']}"
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
  bbox = Geonames::Bbox.new
  better_place_names = []
  record.fetch('desc_metadata__based_near_t', []).each do |place|
    STDERR.puts "Lookup #{place}"
    place = place.split(",").first
    STDERR.puts "/ #{place}"
    info = geonames.lookup_name(place)
    next unless info
    if info['bbox']
      bbox.add_bbox(info['bbox'])
    else
      bbox.add_point(info)
    end
    better_place_names << "#{info['name']} (#{info['countryName']}) [#{info['geonameId']}/#{info['fcode']}]"
  end
  STDERR.puts better_place_names.join("\n") if better_place_names.length > 0
  new_record['dct_spatial_sm'] = better_place_names
  if bbox.valid?
    # nothing was added to this bounding box
  else
    west = bbox.west
    south = bbox.south
    east = bbox.east
    # solr does not like coordinates > 180 :(
    east -= 360 if east > 180
    north = bbox.north
    new_record.merge!({
      "solr_bbox" => "#{west} #{south} #{east} #{north}",
      "solr_geom" => "ENVELOPE(#{west}, #{east}, #{north}, #{south})",
      #"solr_ne_pt" => "#{north},#{east}",
      #"solr_sw_pt" => "#{south},#{west}",
      "georss_box_s" => "#{south} #{west} #{north} #{east}",
      #"georss_polygon_s" => "#{north} #{west} #{north} #{east} #{south} #{east} #{south} #{west} #{north} #{west}"
    })
  end

  if output_stdout
    output << new_record
  end
  if target
    target.add new_record
  end
end

geonames.save

if output_stdout
  puts JSON.pretty_generate(output)
end

if target
  target.commit
end

STDERR.puts "Processed #{processed_count} records"
