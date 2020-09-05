import { Controller, Get, Body, Param } from '@nestjs/common';
import { AccountService } from './account.service';

@Controller('account')
export class AccountController {

    constructor(private readonly accountService: AccountService){}

    @Get('/:secret')
    async new_account(@Param('secret') secret: string){
        return this.accountService.createWallet(secret);
    }

}
