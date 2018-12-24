const blockexplorer = require('blockexplorer');

async function getBlockByIndex(i) {
    try {
        return await blockexplorer.blockIndex(i); 
    } catch (e) {
		console.log("​getBlockByIndex -> catch -> e", e);
    }
}

async function getBlockByHash(hash) {
    try {
        return await blockexplorer.block(hash); 
    } catch (e) {
		console.log("getBlockByHash -> catch -> e", e);
    }
}

(async ()=>{
    const { blockHash } = JSON.parse(await getBlockByIndex(2));
    console.log("​block hash", blockHash);

    const blockData = JSON.parse(await getBlockByHash(blockHash)); 
	console.log("​blockData", JSON.stringify(blockData, null, 4))
})()