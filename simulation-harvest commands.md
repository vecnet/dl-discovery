simulation data harvest commands

203.101.226.101
203.101.226.186

curl http://203.101.226.186:8081/solr/discovery/update?commit=true -H ‘Content-Type:application/xml’ -d ‘<delete><query>*:*</query></delete>’


./script/harvest-dl.rb https://dl.vecnet.org http://203.101.226.186:8081/solr/discovery 2015-04-01


./script/harvest-ci.rb https://ci-qa.vecnet.org https://dl.vecnet.org http://203.101.226.186:8081/solr/discovery