import React, { useState, useEffect } from 'react';
import * as signalR from '@microsoft/signalr';

const useConnection = (user) => {
    const endpoint = import.meta.env.VITE_BACKEND_API;
    const [connectionStatus, setConnectionStatus] = useState('loading');
    const [hubConnection, setHubConnection] = useState(null);

    useEffect(() => {
        const connection = new signalR.HubConnectionBuilder()
            .withUrl(`http://localhost:${endpoint}/chatHub`)
            .withAutomaticReconnect()
            .build();

        setHubConnection(connection);

        connection.onreconnecting(error => {
            setConnectionStatus('reconnecting');
            console.log('Reconnecting... ', error);
        });

        connection.onreconnected(connectionID => {
            setConnectionStatus('connected');
            console.log('Reconnected. Connection ID: ', connectionID);
        });

        connection.onclose(error => {
            setConnectionStatus('disconnected');
            console.log('Connection closed. ', error);
        });

        connection
            .start()
            .then(() => {
                setConnectionStatus('connected');
                console.log(`Connected as ${user}`);
            })
            .catch(err => {
                setConnectionStatus('disconnected');
                console.error('Error starting connection: ', err.toString());
            });

        return () => {
            connection.stop();
            setHubConnection(null);
        }
    }, [user]);

    useEffect(() => {
        console.log(hubConnection);
        if (!hubConnection) return;

        hubConnection.on("ReceiveMessage", (user, message) => {
            console.log(user, message, Date.now());
        });
        
        hubConnection.on("ReceiveDocumentUpdate", (content) => {
            console.log("Received update from server: ", content);
        });  
    }, [hubConnection]);
    
    const sendMessage = (user, message) => {
        if (!hubConnection) return;
        hubConnection.invoke("SendMessage", user, message).catch(err => {
          console.error(err.toString());
        });
      }
    
    const sendUpdate = (connection, user, content) => {
        //TODO: The connection isn't being updated. So it's null at the beginning, and it stays null even when the user connects
        console.log(connection);
        if (!connection) return;
        connection.invoke("UpdateDocument", user, content).catch(err => {
            console.error(err.toString());
        });
    }

    const getContent = () => {
        if (!hubConnection) return;
        const content = hubConnection.invoke("GetContent").catch(err => {
            console.error(err.toString());
        });
        return content;
    }

    return { hubConnection, connectionStatus, sendMessage, sendUpdate, getContent }
}

export default useConnection;