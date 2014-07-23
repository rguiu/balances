## Wallet operations using event sourcing pattern 

**Event Sourcing** is an architectural pattern in which your entities mantain their state as a sequence of events stored as they happen. [Described by Martin Fowler in his blog some years ago](http://martinfowler.com/eaaDev/EventSourcing.html).

I will built an online wallet using this pattern. Imagine a gambling site where a user can deposit money and play games or place bets with the money in his wallet.

A wallet must support three main operations, 
* Deposit
* Withdraw
* Check the current balance

We need to make sure that under no circustance the user can spend more money than he has, is unable to use his money or has incorrect balance due a fail in the system.

So, how we can solve this using Event Sourcing. 

I decided to use [Redis](http://redis.io/) for the in memory state and [Cassandra](http://cassandra.apache.org/) for the event log.

My application will be build using Node.js.

Why Redis?
Its fast and has commands that allow me to have counters, [INCRBY](http://redis.io/commands/INCRBY), [DECR](http://redis.io/commands/decrby).

Why Cassandra?
Writes in Cassandra are fast, and that is what we need for the event log. 

### Running the app

You need to have installed Node.js, Cassandra and Redis. Start Cassandra and Redis if they are not running. 

In Cassandra we need to create some column families/tables. For that, we can use cassandra's shell ```cqlsh```. Once in the shell we type.

```
 CREATE KEYSPACE balances WITH replication = {'class':'SimpleStrategy', 'replication_factor':3};

 CREATE TABLE balances.transactions (
    accountID int,
    ammount int, 
    type text,
    created_at timestamp,
    PRIMARY KEY (accountId, created_at)
 );
```

So now we need to get or app running. 

In the root directory of the project we type:

``` npm install ```

Whis will install the dependencies described in ```package.json ```.

Now is all ready, we can start the application using:

``` node app.js ```

Now the app should be running on port 3000.

We will be able to do three calls (all ```GETs```, this is only a prove of concept after all).

To deposit 100 in account 101:
```http://localhost:3000/101/deposit/100```

To check balance of account 101:
```http://localhost:3000/101/balance```

To withdraw 10 from account 101:
```http://localhost:3000/101/withdraw/100```

Note: error handling has not be added to the app, so we should only use positive integers for deposits and withdraws.

###  Descriving the app/solution
*TODO*
(I still need to add the Snapshots)

