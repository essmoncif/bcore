import { Module } from '@nestjs/common';
import { AccountModule } from './account/account.module';
import { TransactionGateway } from './transaction.gateway';

@Module({
  imports: [AccountModule],
  providers: [TransactionGateway],
})
export class AppModule {}
