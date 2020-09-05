import { SHA256 } from "crypto-js";
import {  TKeyPair, signBytes, base64Decode, verifySignature, sharedKey, messageEncrypt, keyPair } from '@waves/ts-lib-crypto';
import { LevelModule } from "../leveldb/setup.database";


export class Transaction {

    public readonly timestamp: number;
    
    public sign: string;

    public message: string;

    
    constructor(public readonly from: string, public readonly to: string, message: string){
        this.message = message;
        this.timestamp = Date.now();
        this.sign = "";
    }

    createdBy(owner: TKeyPair){
        this.encryptMessage(owner);
        this.signTransaction(owner);
        return this;
    }

    private encryptMessage(owner: TKeyPair){
        if( owner.publicKey !== this.from)
            throw new Error("You cannot encrypt message for other wallets!");
        try {
            const sharedKeyA = sharedKey(owner.privateKey, this.to, "waves");
            const encrypted = messageEncrypt(sharedKeyA, this.message);
            this.message = Buffer.from(encrypted).toString("hex");            
        } catch (error) {
            throw new Error("Cannot encrypt this message. Please checkout transaction");
        }        
    }

    get hash(): string{
        return SHA256(this.from + this.to + this.message + this.timestamp).toString();
    }

    get signature(): string {
        return this.sign;
    }    

    get fromAddress(): string{
        return this.from;
    }

    get toAddress(): string{
        return this.to;
    }

    private signTransaction(signKey: TKeyPair): string{
        if( signKey.publicKey !== this.from){
            throw new Error("You cannot sign transactions for other wallets!");
        }
        try {
            const obj = {from: this.from, to: this.to, timestamp: this.timestamp, hash: this.hash}
            const sign = signBytes({privateKey: signKey.privateKey}, base64Decode(JSON.stringify(obj)));
            this.sign = sign;
            return sign;
        } catch (error) {
            throw new Error("Cannot sign this transaction check contain before sign it!")
        }
    }

    isValid(): boolean {        
        if(this.sign.length === 0 ){
            throw new Error("Not signature in this transaction");
        }
        const obj = {from: this.from, to: this.to, timestamp: this.timestamp, hash: this.hash}
        return verifySignature(this.from, base64Decode(JSON.stringify(obj)), this.sign);
    }

}

export class Block {

    private nonce: number;

    public readonly timestamp: number;

    private readonly BID: string = this.calculateHash();

    constructor(private readonly transactions: Transaction[], public readonly previousHash: string[] = ['']){
        this.nonce = 0 ;
        this.timestamp = Date.now();
    }

    get hash(): string {
        return this.BID;
    }

    

    calculateHash(): string {
        return SHA256(this.timestamp + JSON.stringify(this.previousHash) + this.nonce + JSON.stringify(this.transactions)).toString();
    }

    hasValidTransactions(){
        for(const tx of this.transactions){
            if(!tx.isValid()){
                return false;
            }
        }
        return true;
    }

}

export class Blockchain {
    
    private static instance: Blockchain;

    private readonly db = new LevelModule();

    private pendingTransactions: Array<Transaction> = new Array();

    private constructor(){
        this.createGenisisBlock();
    }

    public static getInstance(): Blockchain{
        if(!Blockchain.instance){
            Blockchain.instance = new Blockchain();
        }
        return Blockchain.instance;
    }

    private createGenisisBlock(): Block{
        const moncef = keyPair("moncef");
        const anass = keyPair("anass");
        const tx = new Transaction(moncef.publicKey, anass.publicKey, 'Hello my friend').createdBy(moncef);
        const block: Block = new Block([tx]);
        this.db.addBlock(block).then((err)=> {
            if(err === undefined){
                throw err;
            }
        });
        return block;
    }

    addTransaction(tx: Transaction){
        if(!tx.from || !tx.to){
            throw new Error("Invalid transaction addresses");
        }
        if(!tx.isValid()){
            throw new Error("Invalid transaction signature");
        }
        this.pendingTransactions.push(tx);
    }


    async validChain(): Promise<boolean>{
        for (const  block of await this.getAllBlocks()){
            if(!block.hasValidTransactions()){
                return false;
            }
            if(!(block.hash === block.calculateHash())){
                return false;
            }
        }
        return true;
    }

    async getAllBlocks(){
        return await this.db.getAllBlocks();
    }

    async getLastBlocks(){
        return await this.db.getLastBlocks();
    }

    async mineBlock(){
        const hashs: Array<string> = new Array();
        const last_blocks = await this.getLastBlocks();
        for (const block of last_blocks){
            hashs.push(block.hash)
        }
        const new_block = new Block(this.pendingTransactions, hashs);
        await this.db.addBlock(new_block);
        this.pendingTransactions = new Array();
    }

}