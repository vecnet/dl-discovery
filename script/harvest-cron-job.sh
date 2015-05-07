#!/bin/bash -x

DL_SOURCE="https://dl-dev.vecnet.org"
CI_SOURCE="https://ci-qa.vecnet.org"
DISCOVERY_SOLR="http://localhost:8081/solr/discovery"

app_root=$(cd $(dirname $0)/.. && pwd)

last_harvest_file="$app_root/tmp/last-harvest"

last_harvest=""
if [ -e $last_harvest_file ]; then
    last_harvest=$(cat $last_harvest_file)
fi
# mark this time
new_harvest_mark=$(date '+%Y-%m-%dT%H:%M:%S')

source /etc/profile.d/chruby.sh
chruby 2.0.0-p353
source $app_root/script/get-env.sh

bundle exec $app_root/script/harvest-dl.rb $DL_SOURCE $DISCOVERY_SOLR $last_harvest
bundle exec $app_root/script/harvest-ci.rb $CI_SOURCE $DL_SOURCE $DISCOVERY_SOLR

# save the mark
echo $new_harvest_mark > $last_harvest_file
