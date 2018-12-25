/* ===== Persist data with LevelDB ==================
|  Learn more: level: https://github.com/Level/level |
/===================================================*/

const level = require('level');
const chainDB = './chaindata';

class LevelSandbox {

    constructor() {
        this.db = level(chainDB);
    }

    // Get data from levelDB with key (Promise)
    getLevelDBData(key){
        return new Promise((resolve, reject) => {
            this.db.get(key, (err, value) => {
                if (err) {
                    reject('Not found!', err);
                } else {
                    resolve(value);
                }
              })
        });
    }

    // Add data to levelDB with key and value (Promise)
    addLevelDBData(key, value) {
        return new Promise((resolve, reject) => {
            this.db.put(key, value, function(err) {
                if (err) {
                    reject('Block ' + key + ' submission failed', err)
                } else {
                    resolve(key);
                }
            })
        });
    }

    // Method that return the height
    getBlocksCount() {
        return new Promise((resolve, reject)=> {
            let blocksCount = 0;

            this.db.createReadStream()
                .on('data', function (data) {
                    blocksCount++;
                })
                .on('error', function (err) {
                    console.log('Oh my!', err)
                    reject(err);
                })
                .on('close', function () {
                    resolve(blocksCount);
                });
        });
    }

    getAll(){
        return new Promise((resolve, reject)=> {
            let blocks = [];

            this.db.createReadStream()
                .on('data', function (data) {
                    blocks.push(data)
                })
                .on('error', function (err) {
                    console.log('Oh my!', err)
                    reject(err);
                })
                .on('close', function () {
                    resolve(blocks);
                });
        });
    }
        

}

module.exports.LevelSandbox = LevelSandbox;