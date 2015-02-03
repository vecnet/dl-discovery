
## VecNET Discovery

Geospatial discovery application for VecNET Digital Library. Built using:

* [Earthworks](https://github.com/sul-dlss/earthworks)
* [GeoBlacklight](https://github.com/geoblacklight)
* [GeoHydra](https://github.com/sul-dlss/geohydra)
* [gis-robot-suite](https://github.com/sul-dlss/gis-robot-suite)
* [OpenGeoMetadatda](https://github.com/opengeometadata)

## Installation

Install PostgreSQL if you don't have it already.
```
brew update
brew install postgresql
```

```
# Clone repository
$ git clone git@github.com:vecnet/dl-discovery.git

# Install ruby dependencies
$ bundle install

# Install for development
$ rake earthworks:install

# Start up Solr instance through Jetty server
$ rake jetty:start

# Start Rails application
$ rails server
```

### Running tests

#### Running continuous integration tests
```
$ rake ci
```

#### Running data integration tests
**Important!!!**
Must be run with a production index passed in using the `TEST_SOLR_URL` env variable. If ssh tunneling, make *sure* to **NOT** run rake ci while tunneled as it may delete the index.

```
$ TEST_SOLR_URL=http://example.com:8080/solr/core_name rake integration
```
### Running application
```
$ rails s
```
