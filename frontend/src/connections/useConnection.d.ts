import * as signalR from '@microsoft/signalr';

export type ConnectionStatus = 'Loading' | 'Reconnecting' | 'Connected' | 'Disconnected';

export interface ConnectionInterface {
  shouldConnect: boolean;
  setShouldConnect: (shouldConnect: boolean) => void;
  hubConnection: signalR.HubConnection | null;
  connectionStatus: ConnectionStatus;
  /**
   * Attempts to reconnect
   */
  reconnect: () => void;
  /**
  * Sends a message.
  * @param user - The username sending the message.
  * @param message - The message to be sent.
  */
  sendMessage: (user: string | null, message: string) => void;
  /**
   * Updates the document.
   * @param user - The username sending the update.
   * @param content - The new content of the document.
   */
  sendUpdate: (connection: hubConnection, user: string | null, content: string) => void;
  /**
   * Gets content from the document.
   */
  getContent: () => string;
  /**
   * Adds a user to the server.
   * @param user - The username to send to the server.
   */
  addUserToServer: (user: string | null) => void;
}

declare function useConnection(user: string | null): ConnectionInterface;

export default useConnection;