#!/usr/bin/env ruby

require 'json'
require 'rsolr'

# usage:
# $ upload-to-solr.rb [filename] [target solr url]

# This is getting to be kinda ugly.

if ARGV.length != 2
  puts "USAGE:"
  puts "upload-to-solr.rb [filename] [target solr url]"
  exit 1
end

STDERR.puts "Source is file #{ARGV[0]}"
data = File.read(ARGV[0])
source = JSON.parse(data)

STDERR.puts "Target is #{ARGV[1]}"
target = RSolr.connect url: ARGV[1]

processed_count = 0
source.each do |record|
  processed_count += 1
  STDERR.puts "Uploading record #{record['uuid']}"
  target.add(record)
end

target.commit

STDERR.puts "Uploaded #{processed_count} records"
