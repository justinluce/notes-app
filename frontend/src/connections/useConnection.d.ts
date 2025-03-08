import * as signalR from '@microsoft/signalr';

export type ConnectionStatus = 'loading' | 'reconnecting' | 'connected' | 'disconnected';

export interface ConnectionInterface {
  hubConnection: signalR.HubConnection | null;
  connectionStatus: ConnectionStatus;
  /**
  * Sends a message.
  * @param user - The username sending the message.
  * @param message - The message to be sent.
  */
  sendMessage: (user: string, message: string) => void;
  /**
   * Updates the document.
   * @param user - The username sending the update.
   * @param content - The new content of the document.
   */
  sendUpdate: (connection: hubConnection, user: string, content: string) => void;
  /**
   * Gets content from the document.
   */
  getContent: () => string;
}

declare function useConnection(user: string): ConnectionInterface;

export default useConnection;