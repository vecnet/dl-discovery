#!/usr/bin/env ruby

require 'json'
require 'rsolr'
require_relative '../lib/geonames'
require_relative '../lib/enrich_solr'

# This is getting to be kinda ugly.

if ARGV.length < 2 || ARGV.length > 3
  puts "USAGE:"
  puts "harvest-dl.rb [harvest url] [target solr url]"
  puts "harvest-dl.rb [harvest url] [target solr url] YYYY-MM-DD"
  puts "harvest-dl.rb [harvest url] -o"
  puts "harvest-dl.rb [harvest url] -o YYYY-MM-DD"
  puts
  puts "The YYYY-MM-DD is date in the past to start harvesting from."
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
params = {}
params[:since] = ARGV[2] if ARGV[2]
response = RestClient.get(ARGV[0] + "/harvest", params: params)
response = JSON.parse(response)

def first_or_nil(lst)
  return nil if lst.nil?
  lst.first
end

enrich = EnrichSolr.new('geoname-cache.json', ARGV[0])
processed_count = 0
output = []

response.each do |record|
  processed_count += 1
  next if record.nil?
  STDERR.puts "#{processed_count}) Processing record #{record['url']}"

  # get full record from source
  begin
    dl_record = RestClient.get(record["url"] + ".xml")
  rescue RestClient::Exception
    STDERR.puts " ...received error"
    next
  end

  new_record = enrich.process_one(dl_record)
  #if new_record[:dct_spatial_sm].length > 0
  #  STDERR.puts "   " + new_record[:dct_spatial_sm].join("\n   ")
  #end
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
