Recreate the cache from snapshot

// 1. select date of last snapshot
// 2. copy snapshot into redis
// 3. loop for all distint user groups id%2 == 0 | 1
// 4. select all accounts from group adding deposits substracting..
// 5. add vaues to redis