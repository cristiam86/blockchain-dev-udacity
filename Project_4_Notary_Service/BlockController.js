const SHA256 = require('crypto-js/sha256');
const BlockClass = require('./Block.js');
const Level = require('./Level.js');
const hex2ascii = require('hex2ascii');

/**
 * Controller Definition to encapsulate routes to work with blocks
 */
class BlockController {

    /**
     * Constructor to create a new BlockController, you need to initialize all your endpoints here
     * @param {*} app 
     */
    constructor(app, mempool) {
        this.app = app;
        this.db = new Level.Level();
        this.mempool = mempool;

        this._getChain().then(chain => {
            this.blocks = chain;
			console.log("​Constructor -> chain", chain)
            if (this.blocks.length === 0) {
                this._generateGenesisBlock()
            }
        });
        this.blocks = [];
        
        // this.initializeMockData(); //Only needed for testing
        this.getBlockByHash();
        this.getBlockByWalletAddress();
        this.getBlockByHeight();
        this.postNewBlock();
    }


    /**
     * Implement a GET Endpoint to retrieve a block by index, url: "/block/:index"
     * 
     * 
     */
    getBlockByHash() {
        this.app.get("/stars/hash:block", (req, res) => {
            const {params: {block}} = req;
            const blockhash = block.slice(1);
            
            if(blockhash && blockhash !== "" && blockhash.length === 64) {
                this.db.getBlockByHash(blockhash).then(block => {
                    if (block && block.body && block.body.star) {
                        block.body.star.storyDecoded = hex2ascii(block.body.star.story);
                        res.send(block);
                    } else {
                        res.status(404).send('Block not found')
                    }
                }).catch(error => {
					console.log("​BlockController -> getBlockByHash -> error", error)
					res.status(503).send('There was a problem getting your block. Please try again');
                })
            } else {
                this._returnInvalidData(res);
            }
        });
    }

    getBlockByWalletAddress() {
        this.app.get("/stars/address:wallet", (req, res) => {
            const {params: {wallet}} = req;
            const walletHash = wallet.slice(1);
            
            if(walletHash && walletHash !== "") {
                this.db.getBlocksByWallet(walletHash).then(blocks => {
                    const parsedBlocks = blocks.map((bl) => {
                        if (bl && bl.body && bl.body.star) {
                            bl.body.star.storyDecoded = hex2ascii(bl.body.star.story);
                        }
                        return bl;
                    });
                    res.send(parsedBlocks);
                }).catch(error => {
					console.log("​BlockController -> getBlockByHash -> error", error)
					res.status(503).send('There was a problem getting your block. Please try again');
                })
            } else {
                this._returnInvalidData(res);
            }
        });
    }

    getBlockByHeight() {
        this.app.get("/block/:height", (req, res) => {
            const {params: {height}} = req;
            if (height >= 0) {
                this.db.getLevelDBData(height).then(value => {
                    let block = JSON.parse(value);
                    console.log("​BlockController -> getBlockByHeight -> block", block.body.star)
                    if (block && block.body && block.body.star) {
                        block.body.star.storyDecoded = hex2ascii(block.body.star.story);
						console.log("​BlockController -> getBlockByHeight -> block.body.star.storyDecoded", block.body.star.storyDecoded)
                    }
					console.log("​BlockController -> getBlockByHeight -> resSEND")
                    
                    res.send(block);
                }).catch(err => {
                    res.status(404).send('Block not found')
                }) 
            } else {
                res.status(404).send(`You must specify a height greater than 0`);
            }
            
        });
    }

    /**
     * Implement a POST Endpoint to add a new Block, url: "/block:data"
     */
    postNewBlock() {
        this.app.post("/block", (req, res) => {
            if(req.body && typeof req.body.address === "string" && req.body.address !== ""
                && req.body.star && req.body.star.dec && req.body.star.dec !== ""
                && req.body.star.ra && req.body.star.ra !== ""
                && req.body.star.story && req.body.star.story !== "") {

                if(this.mempool.verifyAddressRequest(req.body.address)){
                    req.body.star.story = Buffer(req.body.star.story).toString('hex')
                    const newBlock = this._getNewBlock(req.body);
                    this._saveBlockToDB(newBlock).then(newBlockKey => {
                        if (newBlockKey === newBlock.height) {
                            newBlock.body.star.storyDecoded = hex2ascii(newBlock.body.star.story);
                            this.mempool._removeMempoolValid(req.body.address);
                            res.send(newBlock);
                        } else {
                            res.status(503).send('There was a problem saving your block. Please try again');
                        }
                    });
                } else {
                    res.status(403).send('Wallet unauthorized');
                }
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
module.exports = (app, mempool) => { return new BlockController(app, mempool);}