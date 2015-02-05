#!/bin/bash

# Start the application server

source /etc/profile.d/chruby.sh
chruby 2.0.0-p353

source /home/app/vecnet/current/script/get-env.sh
cd $RAILS_ROOT
bundle exec unicorn -D -E deployment -c $RAILS_ROOT/config/unicorn.rb
