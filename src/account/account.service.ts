import { Injectable } from '@nestjs/common';
import { Wallet } from '../wallet/wallet';

@Injectable()
export class AccountService {

    async createWallet(secret: string){
        const wallet = new Wallet(secret);
        return wallet.isOwner;
    }

}
