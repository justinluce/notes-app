import { useState, useEffect } from 'react';
import * as signalR from '@microsoft/signalr';

interface ConnectionInterface {
    shouldConnect: boolean;
    setShouldConnect: (value: boolean) => void;
    connectionStatus: string;
    hubConnection: signalR.HubConnection | null;
    usersList: string[];
    updateDocument: (content: string) => Promise<void>;
}

// Get the base URL from environment or default to current origin
const getBaseUrl = () => {
    if (import.meta.env.VITE_API_URL) {
        console.log('Using VITE_API_URL:', import.meta.env.VITE_API_URL);
        return import.meta.env.VITE_API_URL;
    }
    // In development, use the backend URL
    if (import.meta.env.DEV) {
        console.log('Using development URL: http://localhost:5017');
        return 'http://localhost:5017';
    }
    // In production, use the current origin
    console.log('Using production URL:', window.location.origin);
    return window.location.origin;
};

const useConnection = (
    user: string | null, 
    documentId: string | null,
    onDocumentUpdate?: (content: string) => void
): ConnectionInterface => {
    const [shouldConnect, setShouldConnect] = useState(false);
    const [connectionStatus, setConnectionStatus] = useState('Disconnected');
    const [hubConnection, setHubConnection] = useState<signalR.HubConnection | null>(null);
    const [usersList, setUsersList] = useState<string[]>([]);

    useEffect(() => {
        // Only attempt to connect if we have both a user and a document ID
        if (!user || !documentId) {
            console.log('Missing user or documentId, not connecting:', { user, documentId });
            setConnectionStatus('Disconnected');
            return;
        }

        if (!shouldConnect) {
            console.log('shouldConnect is false, not connecting');
            setConnectionStatus('Disconnected');
            return;
        }

        const baseUrl = getBaseUrl();
        const hubUrl = `${baseUrl}/chatHub`;
        console.log('Starting connection with:', { user, documentId, hubUrl });
        setConnectionStatus('Connecting');

        const connection = new signalR.HubConnectionBuilder()
            .withUrl(hubUrl)
            .withAutomaticReconnect()
            .build();

        setHubConnection(connection);

        connection.onreconnecting(error => {
            setConnectionStatus('Reconnecting');
            console.log('Reconnecting... ', error);
        });

        connection.onreconnected(connectionID => {
            setConnectionStatus('Connected');
            console.log('Reconnected. Connection ID: ', connectionID);
            // Rejoin document group after reconnection
            if (documentId) {
                connection.invoke('JoinDocumentGroup', documentId, user).catch(err => {
                    console.error('Error rejoining group:', err.toString());
                });
            }
        });

        connection.onclose(error => {
            setConnectionStatus('Disconnected');
            console.log('Connection closed. ', error);
        });

        connection.on('ReceiveUsers', (users) => {
            setUsersList(users);
        });

        connection.on('ReceiveDocumentUpdate', (content) => {
            console.log('Received document update:', content);
            if (onDocumentUpdate) {
                onDocumentUpdate(content);
            }
        });

        connection
            .start()
            .then(() => {
                setConnectionStatus('Connected');
                if (documentId) {
                    connection.invoke('JoinDocumentGroup', documentId, user).catch(err => {
                        console.error('Error joining group:', err.toString());
                    });
                }
                console.log(`Connected as ${user}`);
            })
            .catch(err => {
                setConnectionStatus('Disconnected');
                console.error('Error starting connection: ', err.toString());
                console.error('Connection details:', {
                    baseUrl,
                    hubUrl,
                    user,
                    documentId
                });
            });

        return () => {
            if (documentId) {
                connection.invoke('LeaveDocumentGroup', documentId, user).catch(err => {
                    console.error('Error leaving group:', err.toString());
                });
            }
            connection.stop();
            setHubConnection(null);
        }
    }, [user, shouldConnect, documentId, onDocumentUpdate]);

    const updateDocument = async (content: string) => {
        if (hubConnection && documentId && user) {
            try {
                await hubConnection.invoke('UpdateDocument', documentId, user, content);
            } catch (err) {
                console.error('Error updating document:', err);
            }
        }
    };

    return {
        shouldConnect,
        setShouldConnect,
        connectionStatus,
        hubConnection,
        usersList,
        updateDocument
    };
};

export default useConnection; 