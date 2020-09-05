import { keyPair, TKeyPair } from "@waves/ts-lib-crypto";


export class Wallet {

    private readonly public_key: string;

    private readonly private_key: string;

    public readonly isOwner: TKeyPair; 

    constructor(private readonly secret: string){
        this.isOwner = keyPair(secret);
        const {privateKey, publicKey} = this.isOwner;
        this.private_key = privateKey;
        this.public_key = publicKey;
    }

    get pulicKey(): string {
        return this.public_key
    }

    get privateKey(): string {
        return this.private_key
    }
    
}