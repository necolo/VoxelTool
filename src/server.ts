import { SocketInterface, ServerHandlerI } from './spec';
import { ServerProtocol } from './server/protocol';

export = function (socket:SocketInterface, serverHandler:ServerHandlerI) {
    const protocol = new ServerProtocol(socket, serverHandler);
}