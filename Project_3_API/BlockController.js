const SHA256 = require('crypto-js/sha256');
const BlockClass = require('./Block.js');
const Level = require('./Level.js');

/**
 * Controller Definition to encapsulate routes to work with blocks
 */
class BlockController {

    /**
     * Constructor to create a new BlockController, you need to initialize all your endpoints here
     * @param {*} app 
     */
    constructor(app) {
        this.app = app;
        this.db = new Level.Level();
        this._getChain().then(chain => {
            this.blocks = chain;
			console.log("​Constructor -> chain", chain)
            if (this.blocks.length === 0) {
                this._generateGenesisBlock()
            }
        });
        this.blocks = [];
        
        // this.initializeMockData(); //Only needed for testing
        this.getBlockByHeight();
        this.postNewBlock();
    }

    /**
     * Implement a GET Endpoint to retrieve a block by index, url: "/block/:index"
     */
    getBlockByHeight() {
        this.app.get("/block/:height", (req, res) => {
            const {params: {height}} = req;
            if (height >= 0 && height < this.blocks.length) {
                res.send(this.blocks[height]);
            } else {
                res.status(404).send(`You must specify a height between 0 and ${this.blocks.length-1}`);
            }
            
        });
    }

    /**
     * Implement a POST Endpoint to add a new Block, url: "/block:data"
     */
    postNewBlock() {
        this.app.post("/block", (req, res) => {
            if(req.body && typeof req.body.body === "string" && req.body.body != "") {
                const newBlock = this._getNewBlock(req.body.body);
                this._saveBlockToDB(newBlock).then(newBlockKey => {
                    if (newBlockKey === newBlock.height) {
                        res.send(newBlock);
                    } else {
                        res.status(503).send('There was a problem saving your block. Please try again');
                    }
                });
            } else {
                this._returnInvalidData(res);
            }
        });
    }

    _generateGenesisBlock() {
        const newBlock = this._getNewBlock("First block in the chain - Genesis block");
        this._saveBlockToDB(newBlock);
    }

    _returnInvalidData(res) {
        res.status(503).send('invalid data');
    }
    /**
     * Helper method to initialize a Mock dataset. It adds 10 test blocks to the blocks array.
     */
    // initializeMockData() {
    //     if(this.blocks.length === 0){
    //         for (let index = 0; index < 10; index++) {
    //             this.blocks.push(this._getNewBlock());
    //         }
    //     }
    // }

    _getNewBlock(data) {
        const index = this.blocks.length;
        let prevBlockHash = "";

        if(index > 0){
            const prevBlock = { ...this.blocks[index-1] };
            prevBlock.hash = "";
            prevBlockHash = SHA256(JSON.stringify(prevBlock)).toString();
        }

        let blockAux = new BlockClass.Block(data || `Test Data #${index}`);
        blockAux.height = index;
        blockAux.time = new Date().getTime().toString().slice(0,-3);
        blockAux.previousBlockHash = prevBlockHash;
        blockAux.hash = SHA256(JSON.stringify(blockAux)).toString();
        return blockAux;
    }

    _getChain(){
        return new Promise((resolve, reject) => {
            this.db.getAll().then(chain => {
                const parsedChain = chain
                    .sort((a,b) => parseInt(a.key) - parseInt(b.key))
                    .map((block) => JSON.parse(block.value));

                resolve(parsedChain);
            })
        })
    }

    _saveBlockToDB(newBlock){
        return new Promise((resolve, reject) => {
            this.db.addLevelDBData(newBlock.height, JSON.stringify(newBlock)).then(key => {
                this.blocks.push(newBlock);
                resolve(key);
            }).catch(error => {
                console.log("​addBlock -> getBlockHeight -> addLevelDBData -> error", error)
            })
        })
    }

}

/**
 * Exporting the BlockController class
 * @param {*} app 
 */
module.exports = (app) => { return new BlockController(app);}