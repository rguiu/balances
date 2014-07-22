var express = require('express');
var app = express();

var cql = require('node-cassandra-cql');
var cas_client = new cql.Client({hosts: ['localhost'], keyspace: 'balances'});
var consistency = cql.types.consistencies.one;//.quorum;
var query = 'INSERT INTO balances.transactions (accountID, ammount, type, created_at) values (?, ?, ?, dateof(now()))';

var redis = require("redis");
var red_client = redis.createClient();

var redis_atomic_withdraw = "local s=tonumber(redis.call('get', ARGV[1]));if s >= tonumber(ARGV[2]) then return redis.call('decrby',ARGV[1],ARGV[2]);else return -1;end;"
app.get('/', function(req, res){
  res.send('hello world');
});

app.get('/:accountID/deposit/:ammount', function(req, res){
    var params = [parseInt(req.params.accountID), parseInt(req.params.ammount), 'DEPOSIT'];
    red_client.incrby(req.params.accountID, req.params.ammount,function (err, balance) {
        console.log("User: " + req.params.accountID + " updated balance by depositing: " + req.params.ammount + " Total: " + balance);
        cas_client.execute(query, params, consistency, function(erc) {
            if (erc) {
                console.log('Something when wrong and the deposit failed', erc);
                res.statusCode = 404;
                res.send('Deposit failed');
            } else {
                console.log('Updated on the cluster');
                res.send('Hunky dory deposit for user ' + req.params.accountID + ' of ' + req.params.ammount + 'cents. Remaining balance: ' + balance );
            }
        });
    });
});

app.get('/:accountID/withdraw/:ammount', function(req, res){
    var params = [parseInt(req.params.accountID), parseInt(req.params.ammount), 'WITHDRAW'];
    red_client.eval(redis_atomic_withdraw, 0, req.params.accountID, req.params.ammount,function (err, balance) {
        console.log("User: " + req.params.accountID + " updated balance by withdrawing: " + req.params.ammount + " Total: " + balance);
        if (balance < 0) {
            console.log("Not enough balance");
            res.send('Not enough balance');
        } else {
            cas_client.execute(query, params, consistency, function(err) {
                if (err) {
                    console.log('Something when wrong and the withdraw failed', err);
                    res.statusCode = 404;
                    res.send('Withdraw failed');
                } else {
                    console.log('Updated on the cluster');
                    res.send('Hunky dory withdraw for user ' + req.params.accountID + ' of ' + req.params.ammount + ' cents. Remaining balance: ' + balance );
                }
            });
        }

    });    
});

app.get('/:accountID/balance', function(req, res){
    red_client.get(req.params.accountID,function (err, balance) {
        console.log("User: " + req.params.accountID + " requested balance: " + balance);
        res.send(balance);
    });
});
// lua call
// eval "local s=tonumber(redis.call('get', ARGV[1]));if s >= tonumber(ARGV[2]) then return redis.call('decrby',ARGV[1],ARGV[2]);else return -1;end;" 0 100 5
app.listen(3000);