# Table of Contents

- [Problem Statement](#problem-statement)
- [Solution Overview](#solution-overview)
- [Setup](#setup)
  - [1. Create .env file](#1.-create-.env-file)
  - [1.1 Extra configuration parameters](#1.1-extra-configuration-parameters)
  - [2. Start the app](#2.-start-the-app)
    - [Start with docker-compose](#start-with-docker-compose)
    - [Start without docker-compose](#start-without-docker-compose)
- [API Reference](#api-reference)
  - [Retrieve the total amount of CHZ transferred (since the start of the program)](<#retrieve-the-total-amount-of-chz-transferred-(since-the-start-of-the-program)>)
  - [Check whether a transaction is interacting with the CHZ token smart contract or not given its transaction hash (transaction older than the program is possible)](<check-whether-a-transaction-is-interacting-with-the-chz-token-smart-contract-or-not-given-its-transaction-hash-(transaction-older-than-the-program-is-possible)>)
- [Tests](#tests)

---

---

# Problem Statement

Write a NodeJs program that could index the Ethereum blockchain in real-time. Watch and store any new transactions interacting with the CHZ token smart contract (0x3506424f91fd33084466f402d5d97f05f8e3b4af).
Provide two private API endpoints (no need for authentication)

- One that would allow a user to retrieve the total amount of CHZ transferred (since the start of the program)
- One that would return whether a transaction is interacting with the CHZ token smart contract or not given its transaction hash (transaction older than the program is possible)

# Solution Overview

The app uses:

- web3.js for interacting with eth node.
- Decimal.js for avoiding arithmetic precision errors
- Express.js for http server
- Eslint with standard preset for linting
- Mocha, chai, chai-http for tests
- Docker, docker-compose
- MongoDB for storing transactions & app state

The app looks at every transaction in each block and picks out transactions that interact with contract specified in `config.js` (CHZ by default).  
The script that processes blocks supports small chain reorganizations, bigger reorgs can be supported by keeping track of more blocks in db.  
The code in `services/TransactionsService.js` can identify [account]->[CHZ contract] transactions as well as transactions with internal contract transfers (account->[Some smart contract]->[CHZ smart contract]).

# Setup

## 1. Create .env file

You can use the `.env.example` provided in the repo. Run:

```
cp .env.example .env
```

**After this make sure to populate the `WS_HOST` and `WS_PORT` or only `INFURA_URL` env variables with correct values. The rest of the values provided in .env.example will work.**

| Parameter        | Description         | Default Value |
| ---------------- | ------------------- | ------------- |
| NODE_ENV         | App Environment     | Dev           |
| WS_HOST          | Geth WS server host |               |
| WS_PORT          | Geth WS server port |               |
| INFURA_URL       | Infura url          |               |
| MONGODB_USERNAME | MongoDB Username    |               |
| MONGODB_PASSWORD | MongoDB Password    |               |
| MONGODB_HOST     | MongoDB Host        |               |
| MONGODB_PORT     | MongoDB Port        |               |
| MONGODB_DBNAME   | MongoDB Db name     |               |

**When connecting to Geth, the app will look for WS_HOST & WS_PORT variables first, if they are not specified the app will fall back to INFURA_URL**

### 1.1 Extra configuration parameters

In `config.js` you can set `TOKEN.SYMBOL` & `TOKEN.CONTRACT_ADDRESS` to monitor any ERC20 token transactions. Default value is CHZ.

## 2. Start the app

Next step would be to run the app.  
Once started, the the app will start looking at every block and saving transaction receipts for transactions that interract with CHZ smart contract.

### Start with docker-compose

Run:

```
docker-compose up
```

This will build the docker image, install dependencies & start the `chz-transaction-monitor-1` & `chz-transaction-monitor-mongodb-1` containers.  
You will be presented the stdout of the containers.  
The http server in the container will be bound to host port `3003`.  
To stop, press `Ctrl+C`.

### Start without docker-compose

The app was tested on Node.js 16.13 LTS, therefore I would suggest to use this version to avoid any bugs/anomalies.  
To run the app:

1. Start a MongoDB server
2. Run `npm i` to install all the dependencies
3. Run `npm start`

# API Reference

## Retrieve the total amount of CHZ transferred (since the start of the program)

- Request Path: `/api/transactions/totals`
- Request Method: `GET`
  Response:

```
{
    "totalTokensTransfered": 0,
    "totalTokensTransferedNative": 0
}
```

`totalTokensTransfered` will be the amount in CHZ  
`totalTokensTransferedNative` will be the native amount aka totalTokensTransfered \* Math.pow(10, chzTokenDecimals)

## Check whether a transaction is interacting with the CHZ token smart contract or not given its transaction hash (transaction older than the program is possible)

- Request Path: `/api/transactions/check/:transactionHash`
- Request Method: `GET`
  Response:

```
{
    "isTokenTransaction": true
}
```

# Tests

I've included few simple tests in the `test` folder. The tests follow the _Arrange-Act-Assert_ pattern and use mocha, chai & chai-http. To run them run:

```
npm test
```

or if you used docker-compose:

```
docker exec -it chz-transaction-monitor-1 npm test
```
