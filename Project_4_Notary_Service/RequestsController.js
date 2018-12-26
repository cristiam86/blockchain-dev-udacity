const SHA256 = require('crypto-js/sha256');
const BlockClass = require('./Block.js');
const Level = require('./Level.js');
const TimeoutRequestsWindowTime = 5*60*1000;
const TimeoutValidRequestsWindowTime = 30*60*1000;

/**
 * Controller Definition to encapsulate routes to work with blocks
 */
class RequestsController {

    /**
     * Constructor to create a new BlockController, you need to initialize all your endpoints here
     * @param {*} app 
     */
    constructor(app) {
        this.app = app;
        this.mempool = {};
        this.timeoutRequests = {};
        this.mempoolValid = {};
        

        this.requestValidation();
        this.validateMessage();

        return this;
    }

    requestValidation(){
        this.app.post("/requestValidation", (req, res) => {
            if(req.body && typeof req.body.address === "string" && req.body.address != "") {
                const {body: {address}} = req;
                const requestTimeStamp = new Date().getTime().toString().slice(0,-3);
                let request = {}

                if (this.mempool[address]) {
                    request = this.mempool[address];
                } else {
                    request = {
                        "walletAddress": address,
                        "requestTimeStamp": requestTimeStamp,
                        "message": `${address}:${requestTimeStamp}:starRegistry`
                    }

                    this.timeoutRequests[request.walletAddress] = setTimeout(() => {
                        this._removeValidationRequest(request.walletAddress) 
                    }, TimeoutRequestsWindowTime );

                }
                const timeElapse = requestTimeStamp - request.requestTimeStamp
                const timeLeft = (TimeoutRequestsWindowTime/1000) - timeElapse;
                request.validationWindow = timeLeft;
                this.mempool[address] = request;

                res.send(request);
               
            } else {
                this._returnInvalidData(res);
            }
        });
    }

    validateMessage(){
        this.app.post('/message-signature/validate', (req, res) => {
            if(req.body && typeof req.body.address === "string" && req.body.address != ""
                && typeof req.body.signature === "string" && req.body.signature != "") {
                const {body: {address, signature}} = req;
                const request = this.mempool[address];

                if (request) {
                    const bitcoinMessage = require('bitcoinjs-message'); 
                    
                    if (bitcoinMessage.verify(request.message, address, signature)) {
                        const response = {
                            "registerStar": true,
                            "status": {
                                "address": address,
                                "requestTimeStamp": request.requestTimeStamp,
                                "message": request.message,
                                "validationWindow": request.validationWindow,
                                "messageSignature": true
                            }
                        };
                        this.mempoolValid[address] = response;

                        this._removeValidationRequest(address);
                        
                        setTimeout(() => { this._removeMempoolValid(address) }, TimeoutValidRequestsWindowTime );
                        res.send(response);
                    } else {
                        this._returnInvalidData(res);
                    }
                } else {
                    this._returnNotFoundRequest(res);
                }
            } else {
                this._returnInvalidData(res);
            }
        });
    }

    verifyAddressRequest(address){
        return typeof this.mempoolValid[address] !== 'undefined';
    }

    _removeMempoolValid(address) {
        delete this.mempoolValid[address];
    }

    _removeValidationRequest(address) {
        delete this.mempool[address];
        delete this.timeoutRequests[address];
    }

    _returnInvalidData(res) {
        res.status(503).send('invalid data');
    }

    _returnNotFoundRequest(res) {
        res.status(404).send('request not found');
    }
}

module.exports = (app) => { return new RequestsController(app);}