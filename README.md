
## VecNET Discovery

Geospatial discovery layer for VecNET Digital Library.
// replace with homepage screenshots

Built using:

* [Earthworks](https://github.com/sul-dlss/earthworks)
* [GeoBlacklight](https://github.com/geoblacklight)


## Installation


```
# Clone repository
$ git clone git@github.com:vecnet/dl-discovery.git

# Install ruby dependencies
$ bundle install

# Install for development
$ bundle exec rake earthworks:install

# Start up Solr instance through Jetty server
$ bundle exec rake jetty:start

# Start Rails application
$ rails server
```

## Tests

#### Running continuous integration tests
```
$ rake ci
```

### Running data integration tests
**Important!!!**
Must be run with a production index passed in using the `TEST_SOLR_URL` env variable. If ssh tunneling, make *sure* to **NOT** run rake ci while tunneled as it may delete the index.

```
$ TEST_SOLR_URL=http://example.com:8080/solr/core_name rake integration
```
## Running application
```
$ rails s
```

## Uploading sample data

To upload sample records into your local jetty solr, run the following.

    ./script/upload-to-solr.rb vecnet-solr-sample.json http://localhost:8983/solr/blacklight-core

## Harvesting production data

Optionally, clear the solr core.

    curl http://<remote_ip>:8081/solr/discovery/update?commit=true -H 'Content-Type:application/xml' -d '<delete><query>*:*</query></delete>'

Harvest the Library and Simulation Records:

    ./script/harvest-dl.rb https://dl.vecnet.org <target solr core> 2015-04-01
    ./script/harvest-ci.rb https://ci-qa.vecnet.org https://dl.vecnet.org <target solr core>
