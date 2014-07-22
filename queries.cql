 CREATE KEYSPACE balances WITH replication = {'class':'SimpleStrategy', 'replication_factor':3};

 CREATE TABLE balances.transactions (
    accountID int,
    ammount int, 
    type text,
    created_at timestamp,
    PRIMARY KEY (accountId, created_at)
 );

 CREATE TABLE balances.snaptimes (
    created_at timestamp,
    current boolean,
    PRIMARY KEY (current, created_at)
 ) WITH CLUSTERING ORDER BY (created_at DESC);

SELECT accountid, ammount, type FROM balances.transactions WHERE created_at > '2014-07-07 23:20:12' ALLOW FILTERING;

INSERT INTO balances.snaptimes (id, created_at, current) values (now(), dateof(now()), true);
