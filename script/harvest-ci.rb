#!/usr/bin/env ruby

# harvest metadata from the cyber-infrastructure and translate into solr
# records. Can either put the records to STDOUT or to a solr core.

require 'json'
require 'rsolr'
require_relative '../lib/geonames'
require_relative '../lib/enrich_solr'

# This is getting to be kinda ugly.

if ARGV.length < 3 || ARGV.length > 4
  puts "USAGE:"
  puts "harvest-ci.rb [harvest url] [authorities url] [target solr url]"
  puts "harvest-ci.rb [harvest url] [authorities url] [target solr url] YYYY-MM-DD"
  puts "harvest-ci.rb [harvest url] [authorities url] -o"
  puts "harvest-ci.rb [harvest url] [authorities url] -o YYYY-MM-DD"
  puts
  puts "The YYYY-MM-DD is date in the past to start harvesting from."
  puts
  puts "BUG: the YYYY-MM-DD is not working."
  exit 1
end

output_stdout = ARGV[2] == "-o"

STDERR.puts "Source is #{ARGV[0]}"

if output_stdout
  STDERR.puts "Output to stdout"
  target = nil
else
  STDERR.puts "Target is #{ARGV[2]}"
  target = RSolr.connect url: ARGV[2]
end

# harvest list of changes
response = RestClient.get(ARGV[0] + "/data_services/metadata")
response = JSON.parse(response)

def first_or_nil(lst)
  return nil if lst.nil?
  lst.first
end

def translate_record_to_xml(record)
  # add fixed fields
  record["_Type"] = "Simulation"

  # fix species issue
  record.fetch("Species", []).map! do |s|
    s.gsub("An.", "Anopheles")
  end

  nr = Nokogiri::XML::Builder.new do |xml|
    map = proc do |label, target|
      ns, tag = label.split(":", 2)
      v = record[target]
      if v.respond_to?(:each)
        v.each do |vv|
          xml[ns.to_s].send(tag, vv)
        end
      else
        xml[ns.to_s].send(tag, v) unless v.nil?
      end
    end

    xml.root(
      "xmlns:dc" => "http://purl.org/dc/elements/1.1/",
      "xmlns:dcterms" => "http://purl.org/dc/terms/",
      "xmlns:dwc" => "http://rs.tdwg.org/dwc/terms/",
      "xmlns:vn" => "https://dl.vecnet.org/terms#") {
      xml.metadata {
        map.call("dc:type",           "_Type")
        map.call("vn:identifier",     "ID")
        map.call("dc:title",          "Title")
        map.call("dcterms:alternate", "Name")
        map.call("dc:date_created",   "RunDate")
        map.call("dc:date_uploaded",  "RunDate")
        map.call("dc:date_modified",  "MetaData Last Updated")
        map.call("dc:description",    "Description")
        map.call("dc:creator",        "Creator")
        map.call("dc:subject",        "Interventions")
        map.call("dwc:scientificName", "Species")
        map.call("dc:relation",       "Tags")
        map.call("dc:bibliographicCitation", "Cite as")
        map.call("dc:coverage",       "Location")
        map.call("dc:temporal",       "Time Period of Simulation")
        map.call("dc:relation",       "Parameters of Interest")
        map.call("vn:purl",           "URL")
        map.call("dc:relation",       "Model")
        xml['dc'].send("access.read.group", "public")
      }
    }
  end
  nr.to_xml
end


enrich = EnrichSolr.new('geoname-cache.json', ARGV[1])
processed_count = 0
output = []

response.each do |_, record|
  processed_count += 1
  STDERR.puts "#{processed_count}) Processing record #{record['ID']}"

  # translate record to XML
  xml = translate_record_to_xml(record)
  new_record = enrich.process_one(xml)

  output << new_record if output_stdout
  target.add(new_record) if target

  # save our progress every so often
  if processed_count % 100 == 0
    STDERR.puts "(saving)"
    enrich.save
    target.commit if target
  end
end

# save the geonames cache to disk
enrich.save
puts JSON.pretty_generate(output) if output_stdout
target.commit if target

STDERR.puts "Processed #{processed_count} records"
