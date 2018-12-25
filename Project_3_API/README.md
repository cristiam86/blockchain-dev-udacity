# Udacity Blockchain Developer Nanodegree -- Project 3 Blockchain API
This project implements the API for managing a blockchain. It provides functions to get and create blocks

## Getting Started

### Prerequisites
Install node and npm: you can download and follow the instructions [here](https://nodejs.org/es/download/)

### Installing
Clone the repository
```sh
git clone https://github.com/cristiam86/blockchain-dev-udacity.git
```

Install the dependencies on the root folder
```sh
npm install
```
Since this repository contains all the projects from the nanodegree, you must navigate to this specific folder
```sh
cd Project_3_API
```

Then you can launch the server 
```sh
node app.js 
```

## Node.js framework
The node js framework chosen is Express due to it's simplicity and flexibility

## Endpoint documentation
This API povides two methods
* Get block
* Add Block

### Get Block
Retrieves the block of the chain with the given height.

Usage:
```sh
curl http://localhost:8000/block/:height
```
If there is no such block for the given height, an error is returned. If the block exists, the response should look like the following:
```json
{
    "hash": "c19b753dcb86edd39c16e0f505e3cdf584c0e7bdad31e1e3a621b22e57dad63c",
    "height": 0,
    "body": "First block in the chain - Genesis block",
    "time": "1545765723",
    "previousBlockHash": ""
}
```

### ADD Block
Adds a block to the chain with the given data.

Usage:
```sh
 curl -X POST http://localhost:8000/block -d '{"body":"test data"}' -H "Content-Type: application/json"
```
If no data is sent, an error is returnet as **"invalid data"**. If the block is added to the chain, the response should look like the following:
```json
{
    "hash": "be1ff37dc8307fffd4d67dfa6b372936cd432fc64cb009e30fedadbd6bcd0dfc",
    "height": 1,
    "body": "block 1",
    "time": "1545765739",
    "previousBlockHash": "c19b753dcb86edd39c16e0f505e3cdf584c0e7bdad31e1e3a621b22e57dad63c"
}
```

## Built With

* [NodeJS](https://nodejs.org) - NodeJS
* [ExpressJS](https://expressjs.com/) - ExpressJS


## Authors

* **Cristiam Da Silva** - [Cristiam86](https://github.com/cristiam86)


## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details