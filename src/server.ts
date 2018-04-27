import { SocketInterface } from './spec';
import { ServerProtocol } from './server/protocol';

export = function (socket:SocketInterface, db:any) {
    const protocol =  new ServerProtocol(socket, db);
}