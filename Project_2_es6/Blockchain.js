/* ===== Blockchain Class ==========================
|  Class with a constructor for new blockchain 		|
|  ================================================*/

const SHA256 = require('crypto-js/sha256');
const LevelSandbox = require('./LevelSandbox.js');
const Block = require('./Block.js');

class Blockchain {

    constructor() {
        this.db = new LevelSandbox.LevelSandbox();
        this.generateGenesisBlock();
    }

    // Auxiliar method to create a Genesis Block (always with height= 0)
    // You have to options, because the method will always execute when you create your blockchain
    // you will need to set this up statically or instead you can verify if the height !== 0 then you
    // will not create the genesis block
    generateGenesisBlock(){
        this.getBlockHeight().then(res => {
            if (res == 0) {
                const newBlock = new Block.Block("First block in the chain - Genesis block");
                newBlock.height = res;
                newBlock.time = new Date().getTime().toString().slice(0,-3);
                newBlock.hash = SHA256(JSON.stringify(newBlock)).toString();
                this.saveBlockToDB(newBlock).then(genesisBlock => {
					console.log("​generateGenesisBlock -> ", genesisBlock)
                    
                });
            }
        })
            
    }

    // Get block height, it is auxiliar method that return the height of the blockchain
    getBlockHeight() {
        return this.db.getBlocksCount();
    }

    getLatestBlock(){
        return new Promise((resolve, reject) => {
            this.getBlockHeight().then(height => {
                if (height == 0) {
                    resolve(null);
                } else {
                    this.getBlock(height-1).then(block => {
                        resolve(block);
                    }).catch(err => {
						console.log("​getLatestBlock -> getBlockHeight -> getBlock -> err", err)
                    })
                }
                
            })
        })
    }

    // Add new block
    addBlock(newBlock){
        // Block height
        return new Promise((resolve, reject) => {
            this.getBlockHeight().then(res => {
                newBlock.height = res;
                newBlock.time = new Date().getTime().toString().slice(0,-3);
    
                // previous block hash
                this.getLatestBlock().then(prevBlock => {
                    if (prevBlock) {
                        newBlock.previousBlockHash = prevBlock.hash;
                        newBlock.hash = SHA256(JSON.stringify(newBlock)).toString();
                        this.saveBlockToDB(newBlock).then(result => {
                            resolve(result);
                        })
                    }
                });
                
            }).catch(error => {
                console.log("​addBlock -> getBlockHeight -> error", error)
            });
        })
    }

    saveBlockToDB(newBlock){
        return new Promise((resolve, reject) => {
            this.db.addLevelDBData(newBlock.height, JSON.stringify(newBlock)).then(key => {
                resolve(key);
            }).catch(error => {
                console.log("​addBlock -> getBlockHeight -> addLevelDBData -> error", error)
            })
        })
    }

    // Get Block By Height
    getBlock(height) {
        return new Promise((resolve, reject) => {
            this.db.getLevelDBData(height).then(blockAsString => {
                resolve(JSON.parse(blockAsString));
            }).catch(error => {
				console.log("​getBlock -> error", error)
            })
        });
    }

    // Validate if Block is being tampered by Block Height
    validateBlock(height) {
        return new Promise((resolve, reject) => {
            this.getBlock(height).then(block => {
                const blockHash = block.hash;
                block.hash = "";
                const recalculateBlockHash = SHA256(JSON.stringify(block)).toString();
                if (recalculateBlockHash === blockHash) {
                    resolve(true);
                } else {
                    resolve(false);
                }
            }).catch(error => {
                console.log("​validateBlock -> error", error)
            })
        });
    }

    // Validate Blockchain
    validateChain() {
        return new Promise((resolve, reject) => {
            this.getChain().then(chain => {
                const errors = [];
                const promises = [];

                const parsedChain = chain
                    .sort((a,b) => parseInt(a.key) - parseInt(b.key))
                    .map((block) => JSON.parse(block.value));

                for(let i=0 ; i<parsedChain.length - 1 ; i++) {
                    const currentBlock = { ...parsedChain[i] };
                    const nextBlock = parsedChain[i + 1];

                    const newPromise = new Promise((resolve, reject) => {
                        this.validateBlock(i).then((valid) => {
                            if(!valid) {
                                errors.push(`The block with height ${i} is not valid`);
                            }
                            resolve();
                        });
                    });
                    promises.push(newPromise);
                    currentBlock.hash = "";
                    const currentBlockHash = SHA256(JSON.stringify(currentBlock)).toString();
                    if (currentBlockHash !== nextBlock.previousBlockHash) {
                        errors.push(`The previous hash of the block with height ${i+1} does not match with the hash of the block ${i}`);
                    }
                }
				Promise.all(promises).then(() => { 
                    resolve(errors);
                 });
                
            });
        })
    }

    getChain(){
        return new Promise((resolve, reject) => {
            this.db.getAll().then(blocks => {
                resolve(blocks);
            })
        })
    }

    // Utility Method to Tamper a Block for Test Validation
    // This method is for testing purpose
    _modifyBlock(height, block) {
        let self = this;
        return new Promise( (resolve, reject) => {
            this.db.addLevelDBData(height, JSON.stringify(block).toString()).then((blockModified) => {
                resolve(blockModified);
            }).catch((err) => { console.log(err); reject(err)});
        });
    }
   
}

module.exports.Blockchain = Blockchain;