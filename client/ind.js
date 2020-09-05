
const WebSocket = require('ws');

process.on('uncaughtException', function (err) {
  console.log(err);
}); 

const socket = new WebSocket('ws://localhost:9000');
      socket.onopen = function() {
        console.log('Connected');
        socket.send(
          JSON.stringify({
            event: 'txToServer',
            data: {
                from: '2CtVdQsup4SpHAsKBcjPAA8UngF16BYoHJz7NansWCvF',
                to: '2CtVdQsup4SpHAsKBcjPAA8UngF16BYoHJz7NansWCvF',
                message: 'string',
                owner: {
                    publicKey: '2CtVdQsup4SpHAsKBcjPAA8UngF16BYoHJz7NansWCvF',
                    privateKey: '7X8R4nMWhJ2bDbaaw5dnenu6wJTZa9YUMZpbDSxvp6wn'
                }
            },
          }),
        );
        socket.onmessage = function(data) {
          console.log(data);
        };
      };