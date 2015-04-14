#!/usr/bin/env ruby

require 'json'
require 'rsolr'
require_relative '../lib/geonames'
require_relative '../lib/enrich_solr'

# usage:
# $ copy-dl-to-solr.rb [harvest url] [target solr url]
# $ copy-dl-to-solr.rb [harvest url] -o


# This is getting to be kinda ugly.

if ARGV.length != 2
  puts "USAGE:"
  puts "copy-dl-to-solr.rb [harvest url] [target solr url]"
  puts "copy-dl-to-solr.rb [harvest url] -o"
  exit 1
end

output_stdout = ARGV[1] == "-o"

STDERR.puts "Source is #{ARGV[0]}"

if output_stdout
  STDERR.puts "Output to stdout"
  target = nil
else
  STDERR.puts "Target is #{ARGV[1]}"
  target = RSolr.connect url: ARGV[1]
end

# harvest list of changes
response = RestClient.get(ARGV[0] + "/harvest?since=2015-04-01")
response = JSON.parse(response)

def first_or_nil(lst)
  return nil if lst.nil?
  lst.first
end

enrich = EnrichSolr.new('geoname-cache.json')
processed_count = 0
output = []

response.each do |record|
  STDERR.puts "Processing record #{record['url']}"
  puts record.inspect
  processed_count += 1

  # get full record from source
  dl_record = RestClient.get(record["url"] + ".xml")

  new_record = enrich.process_one(dl_record)
  puts new_record.inspect
  #if new_record[:dct_spatial_sm].length > 0
  #  STDERR.puts "   " + new_record[:dct_spatial_sm].join("\n   ")
  #end
  if output_stdout
    output << JSON.pretty_generate(new_record)
  end
  if target
    target.add(new_record)
  end
end

# save the geonames cache to disk
enrich.save

if output_stdout
  puts JSON.pretty_generate(output)
end

if target
  target.commit
end

STDERR.puts "Processed #{processed_count} records"
