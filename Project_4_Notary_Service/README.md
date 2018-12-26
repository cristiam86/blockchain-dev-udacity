# Udacity Blockchain Developer Nanodegree -- Project 4 Notary Service
This project implements the API for managing a blockchain. It provides functions to query blocks on a different ways and allows signed wallets to add blocks

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
cd Project_4_Notary_Service
```

Then you can launch the server 
```sh
node app.js 
```

## Endpoint documentation
This API povides the following methods
* Request Validation
* Validate Message
* Add Block
* Get Block By Height
* Get Block By Hash
* Get Block By Wallet Address

### Request Validation
Retrieves the message that the wallet must sign in less than five (5) minutes in order to be able to add blocks.
The request should be made pinting out the wallet address as follows: 
```sh
curl -X POST \
  http://localhost:8000/requestValidation \
  -H 'Content-Type: application/json' \
  -H 'cache-control: no-cache' \
  -d '{
    "address":"19xaiMqayaNrn3x7AjV5cU4Mk5f5prRVpL"
}'
```

The API's response includes the message to be signed and the seconds left in order to expire the Validation Request:
```json
{
    "walletAddress": "19xaiMqayaNrn3x7AjV5cU4Mk5f5prRVpL",
    "requestTimeStamp": "1541605128",
    "message": "19xaiMqayaNrn3x7AjV5cU4Mk5f5prRVpL:1541605128:starRegistry",
    "validationWindow": 300
}
```

### Validate Message
Used to send the signed message and allow the wallet to add one block within 30 minutes.
The request should be made adding the signature as follows:
```sh
curl -X POST \
  http://localhost:8000/message-signature/validate \
  -H 'Content-Type: application/json' \
  -H 'cache-control: no-cache' \
  -d '{
"address":"19xaiMqayaNrn3x7AjV5cU4Mk5f5prRVpL",
 "signature":"H8K4+1MvyJo9tcr2YN2KejwvX1oqneyCH+fsUL1z1WBdWmswB9bijeFfOfMqK68kQ5RO6ZxhomoXQG3fkLaBl+Q="
}'
```

If the signature is valid and no error occurred, a confirmation response is sent as follows:
```json
{
    "registerStar": true,
    "status": {
        "address": "19xaiMqayaNrn3x7AjV5cU4Mk5f5prRVpL",
        "requestTimeStamp": "1541605128",
        "message": "19xaiMqayaNrn3x7AjV5cU4Mk5f5prRVpL:1541605128:starRegistry",
        "validationWindow": 200,
        "messageSignature": true
    }
}
```

### Add Block
Adds a block to the chain with the star data. The story field is hex encoded to be stored that way. The Request should be received with the following structure:
```json
{
"address": "19xaiMqayaNrn3x7AjV5cU4Mk5f5prRVpL",
    "star": {
            "dec": "68° 52' 56.9",
            "ra": "16h 29m 1.0s",
            "story": "Found star using https://www.google.com/sky/"
        }
}
```

If the block is added to the chain, the response should look like the following:
```json
{
     "hash": "a59e9e399bc17c2db32a7a87379a8012f2c8e08dd661d7c0a6a4845d4f3ffb9f",
      "height": 1,
      "body": {
           "address": "142BDCeSGbXjWKaAnYXbMpZ6sbrSAo3DpZ",
           "star": {
                "ra": "16h 29m 1.0s",
                "dec": "-26° 29' 24.9",
                "story": 
        "466f756e642073746172207573696e672068747470733a2f2f7777772e676f6f676c652e636f6d2f736b792f",
                "storyDecoded": "Found star using https://www.google.com/sky/"
             }
       },
      "time": "1532296234",
       "previousBlockHash": "49cce61ec3e6ae664514d5fa5722d86069cf981318fc303750ce66032d0acff3"
}
```

### Get Block By Height
Retrieves the block of the chain with the given height.

Usage:
```sh
curl http://localhost:8000/block/:height
```
If there is no such block for the given height, an error is returned. If the block exists, the response should look like the following:
```json
{
     "hash": "a59e9e399bc17c2db32a7a87379a8012f2c8e08dd661d7c0a6a4845d4f3ffb9f",
      "height": 1,
      "body": {
           "address": "142BDCeSGbXjWKaAnYXbMpZ6sbrSAo3DpZ",
           "star": {
                "ra": "16h 29m 1.0s",
                "dec": "-26° 29' 24.9",
                "story": "466f756e642073746172207573696e672068747470733a2f2f7777772e676f6f676c652e636f6d2f736b792f",
                "storyDecoded": "Found star using https://www.google.com/sky/"
             }
       },
      "time": "1532296234",
       "previousBlockHash": "49cce61ec3e6ae664514d5fa5722d86069cf981318fc303750ce66032d0acff3"
}
```

### Get Block By Hash
Retrieves the block of the chain with the given hash.

Usage:
```sh
curl http://localhost:8000/stars/hash:[HASH]
```
If there is no such block for the given hash, an error is returned. If the block exists, the response should look like the following:
```json
{
     "hash": "a59e9e399bc17c2db32a7a87379a8012f2c8e08dd661d7c0a6a4845d4f3ffb9f",
      "height": 1,
      "body": {
           "address": "142BDCeSGbXjWKaAnYXbMpZ6sbrSAo3DpZ",
           "star": {
                "ra": "16h 29m 1.0s",
                "dec": "-26° 29' 24.9",
                "story": "466f756e642073746172207573696e672068747470733a2f2f7777772e676f6f676c652e636f6d2f736b792f",
                "storyDecoded": "Found star using https://www.google.com/sky/"
             }
       },
      "time": "1532296234",
       "previousBlockHash": "49cce61ec3e6ae664514d5fa5722d86069cf981318fc303750ce66032d0acff3"
}
```

### Get Block By Wallet Address
Retrieves the blocks of the chain generated by the given address

Usage:
```sh
curl http://localhost:8000/stars/address:[HASH]
```
If there is no blocks for the given address, an empty array is returned. Otherwise, the response should look like the following:
```json
[
    {
        "hash": "32e638e9e81b2574d8fd55e7fc23e9c2bef72476bf2ef737616c504821c7f911",
        "height": 1,
        "body": {
            "address": "19xaiMqayaNrn3x7AjV5cU4Mk5f5prRVpL",
            "star": {
                "dec": "68° 52' 56.9",
                "ra": "16h 29m 1.0s",
                "story": "466f756e642073746172207573696e672068747470733a2f2f7777772e676f6f676c652e636f6d2f736b792f",
                "storyDecoded": "Found star using https://www.google.com/sky/"
            }
        },
        "time": "1545782706",
        "previousBlockHash": "03cce87c0969cd42a860ee762db05f14dd0281716fe1072f0b9a92ea89cf9408"
    },
    {
        "hash": "9551a891925056cc236681c64f23c048490dd6d4cd4c0ef6fa5b7cfc26f19954",
        "height": 2,
        "body": {
            "address": "19xaiMqayaNrn3x7AjV5cU4Mk5f5prRVpL",
            "star": {
                "dec": "68° 52' 56.9",
                "ra": "16h 29m 1.0s",
                "story": "466f756e642073746172207573696e672068747470733a2f2f7777772e676f6f676c652e636f6d2f736b792f",
                "storyDecoded": "Found star using https://www.google.com/sky/"
            }
        },
        "time": "1545782759",
        "previousBlockHash": "32e638e9e81b2574d8fd55e7fc23e9c2bef72476bf2ef737616c504821c7f911"
    }
]
```

## Built With

* [NodeJS](https://nodejs.org) - NodeJS
* [ExpressJS](https://expressjs.com/) - ExpressJS


## Authors

* **Cristiam Da Silva** - [Cristiam86](https://github.com/cristiam86)


## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details