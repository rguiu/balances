

var redis = require('redis'),
    client = redis.createClient();

var cql = require('node-cassandra-cql');
var client = new cql.Client({hosts: ['localhost'], keyspace: 'balances'});
var consistency = cql.types.consistencies.one;//.quorum;

