#!/usr/bin/env ruby

require 'json'
require 'rsolr'
require_relative '../lib/geonames'
require_relative '../lib/enrich_solr'

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

enrich = EnrichSolr.new('geoname-cache.json')
processed_count = 0
output = []

response['response']['docs'].each do |record|
  processed_count += 1
  STDERR.puts "Processing record #{record['id']}"
  new_record = enrich.process_one(record)
  if new_record['dct_spatial_sm'].length > 0
    STDERR.puts "   " + new_record['dct_spatial_sm'].join("\n   ")
  end
  if output_stdout
    output << new_record
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
