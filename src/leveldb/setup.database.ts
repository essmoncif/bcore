import level from 'level-ts';
import { Block } from '../blockchain-core/blockchain';


export class LevelModule{

    private database = new level('./BLOCKCHAIN-DATABASE');

    async addBlock(block: Block){
        if(!block.hasValidTransactions()){
            throw new Error('Cannot put invalid block into global blockchain !');
        }
        await this.database.put(block.hash, block);
    }

    async getBlock(hash: string){
        const block: Block = await this.database.get(hash);
        if (!block){
            throw new Error(`There's no block with this hash: ${hash}`);
        }
        return block;
    }

    async getAllBlocks(): Promise<Block[]> {
        const all = await this.database.all();
        return all;
    }

    async getLastBlocks(): Promise<Block[]> {
        const last_blocks: Array<Block> = new Array();
        const blocks = await this.getAllBlocks();
        blocks.sort((b1: Block, b2: Block)=> b1.timestamp - b2.timestamp ).reverse();
        const last_previous_hash = blocks[0].previousHash ;
        for(const block of blocks){
            if(JSON.stringify(block.previousHash) === JSON.stringify(last_previous_hash)){
                last_blocks.push(block)
            }else{
                break;
            }
        }
        return last_blocks;
    }
}