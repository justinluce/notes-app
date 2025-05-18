import React, { useState, useEffect } from 'react';
import * as signalR from '@microsoft/signalr';

const useConnection = (user) => {
    const endpoint = import.meta.env.VITE_BACKEND_API;
    const [shouldConnect, setShouldConnect] = useState(false);
    const [connectionStatus, setConnectionStatus] = useState('Loading');
    const [hubConnection, setHubConnection] = useState(null);
    const [usersList, setUsersList] = useState([]);

    useEffect(() => {
        if (user === '' || !shouldConnect) return;
        const connection = new signalR.HubConnectionBuilder()
            .withUrl(`/chatHub`)
            .withAutomaticReconnect()
            .build();

        setHubConnection(connection);

        console.log(connection);

        connection.onreconnecting(error => {
            setConnectionStatus('Reconnecting');
            console.log('Reconnecting... ', error);
        });

        connection.onreconnected(connectionID => {
            setConnectionStatus('Connected');
            console.log('Reconnected. Connection ID: ', connectionID);
        });

        connection.onclose(error => {
            setConnectionStatus('Disconnected');
            console.log('Connection closed. ', error);
        });

        connection
            .start()
            .then(() => {
                setConnectionStatus('Connected');
                connection.invoke('AddToGroup', user).catch(err => {
                    console.error(err.toString());
                });
                console.log(`Connected as ${user}`);
            })
            .catch(err => {
                setConnectionStatus('Disconnected');
                console.error('Error starting connection: ', err.toString());
            });

        return () => {
            connection.stop();
            setHubConnection(null);
        }
    }, [user, shouldConnect]);

    useEffect(() => {
        if (!hubConnection) return;

        hubConnection.on("ReceiveMessage", (user, message) => {
            console.log(user, message, Date.now());
        });
        
        hubConnection.on("ReceiveDocumentUpdate", (content) => {
            console.log("Received update from server: ", content);
        });

        hubConnection.on("ReceiveUsers", (users) => {
            setUsersList(users);
            console.log("received users: ", users);
        });
    }, [hubConnection]);

    const reconnect = () => {
        setConnectionStatus('Loading');
        hubConnection.start()
            .then(() => {
                setConnectionStatus('Connected');
            })
            .catch(err => {
                setConnectionStatus('Disconnected');
                console.error('Error Reconnecting: ', err.toString());
            })
    }
    
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

    const addUserToServer = (user) => {
        if (!hubConnection) return;
        console.log('adding user: ', user);
        hubConnection.invoke('AddUser', user).catch(err => {
            console.error(err.toString());
        });
    }

    return { shouldConnect, setShouldConnect, hubConnection, connectionStatus, reconnect, sendMessage, sendUpdate, getContent, addUserToServer }
}

export default useConnection;