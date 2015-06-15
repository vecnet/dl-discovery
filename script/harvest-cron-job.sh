#!/bin/bash -e

which=$1

DL_SOURCE="https://dl-dev.vecnet.org"
CI_SOURCE="https://ci-qa.vecnet.org"
DISCOVERY_SOLR="http://localhost:8081/solr/discovery"

app_root=$(cd $(dirname $0)/.. && pwd)

# Try to get a lock, and exit if someone else already has it.
# This keeps a lot of harvest processes from spawning
# should a paricular harvest take a long time.
# The lock is released when this shell exits.
exec 200> "$app_root/tmp/last-harvest-$which-lock"
flock -e --nonblock 200 || exit 0

# mark this time
new_harvest_mark=$(date '+%Y-%m-%dT%H:%M:%S')

last_harvest_file="$app_root/tmp/last-harvest-$which"
last_harvest=""
if [ -e $last_harvest_file ]; then
    last_harvest=$(cat $last_harvest_file)
fi

cd $app_root
if [ -e /etc/profile.d/chruby.sh ]; then
    source /etc/profile.d/chruby.sh
    chruby 2.0.0-p353
    source $app_root/script/get-env.sh
fi

case $which in
    dl)
        export APIKEY
        bundle exec $app_root/script/harvest-dl.rb $DL_SOURCE $DISCOVERY_SOLR $last_harvest
        ;;
    ci)
        bundle exec $app_root/script/harvest-ci.rb $CI_SOURCE $DL_SOURCE $DISCOVERY_SOLR
        ;;
    *)
        echo "unknown parameter $which to $0"
        exit 3
        ;;
esac

# if we get here, there were no errors (right?!?!)
# save the mark
echo $new_harvest_mark > $last_harvest_file
