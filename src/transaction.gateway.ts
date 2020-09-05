import { SubscribeMessage, WebSocketGateway, WebSocketServer, OnGatewayInit } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Blockchain, Transaction } from './blockchain-core/blockchain';
import { Logger } from '@nestjs/common';

type Tx = {
  from: string,
  to: string,
  message: string,
  owner: {
    publicKey: string,
    privateKey: string
  }
}

@WebSocketGateway()
export class TransactionGateway implements OnGatewayInit {
  
  @WebSocketServer()
  private webSocketServer: Server;

  private logger: Logger = new Logger('Transaction-Gatway');
  
  afterInit(server: any) {
    this.logger.log("Init server")
  }

  
  @SubscribeMessage('txToServer')
  onEvent(client: Socket, tx: Tx): void {
    console.log("TXX", tx);
    const bc = Blockchain.getInstance();
    const transaction: Transaction = new Transaction(tx.from, tx.to, tx.message).createdBy(tx.owner);
    bc.addTransaction(transaction);
    this.webSocketServer.emit('txToClient', tx);
  }
}
