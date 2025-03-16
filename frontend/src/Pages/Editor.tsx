import { KeyboardEvent, useEffect, useState, useCallback, ChangeEvent } from "react";
import '../styles/Editor.css';
import useConnection from '../connections/useConnection.js';
import { useUser } from "../Context/UserContext.js";
import { useDocument } from "../Context/DocumentContext.js";

export const Editor = () => {
    const [messageState, setMessageState] = useState('');

    const { documentState, updateDocument, updateTitle } = useDocument();
    const { currentUser, setUser, clearUser } = useUser();
    const { hubConnection, connectionStatus, reconnect, sendMessage, sendUpdate, getContent } = useConnection(currentUser);
    // const { sendMessage, sendUpdate } = useMessenger();
    
    // Operational Transformation
    // function transform(opA: Operation, opB: Operation): Operation {
    //     if (opA.position < opB.position || (opA.position === opB.position && opA.timestamp < opB.timestamp)) {
    //       return opA; // don't adjust if it's earlier
    //     }
      
    //     if (opA.type === "insert" && opB.type === "insert") {
    //       // if both are at the same position, move the second one forward
    //       return { ...opA, position: opA.position + 1 };
    //     }
      
    //     if (opA.type === "Backspace" && opB.type === "insert") {
    //       // deleting a character before an insert doesn’t affect it
    //       return opA;
    //     }
      
    //     if (opA.type === "insert" && opB.type === "Backspace") {
    //       // if deleting before an insert, move insert position back
    //       return { ...opA, position: Math.max(0, opA.position - 1) };
    //     }
      
    //     if (opA.type === "Backspace" && opB.type === "Backspace") {
    //       // if deleting the same character, ignore the second delete
    //       return opA;
    //     }
      
    //     return opA;
    // }

    const handleInput = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        updateDocument(e);
    };

    const handleMessageText = (e: ChangeEvent<HTMLInputElement>) => {    
        const target = e.target as HTMLInputElement;    
        setMessageState(target.value);
    }

    const handleMessage = () => {
        sendMessage(currentUser, messageState);
    }

    const renderConnectionStatus = () => {
        if (currentUser === '') {
            return <p>Not logged in</p>;
        }

        if (connectionStatus === 'Connected') {
            return <p>Logged in as {currentUser}</p>;
        }
      
        if (connectionStatus === 'Disconnected') {
          return (
            <>
              <p>{connectionStatus}</p>
              <button onClick={reconnect}>Reconnect</button>
            </>
          );
        }

        return <p>{connectionStatus}</p>
    }

    useEffect(() => {
        // documentState.content = getContent();
    }, []);

    // useEffect(() => {
    //     console.log("running", documentState.content);
    //     sendUpdate(user, documentState.content);
    // }, [documentState]);
    
    return (
        <div id='editor-container'>
            <div id='connection-status'>
                {renderConnectionStatus()}
            </div>
            <div id='document-title'>
                <h2 
                    contentEditable='true'
                    onBlur={(e) => updateTitle(e)}
                >
                    {documentState.title}
                </h2>
            </div>
            <textarea
                id='document' 
                onKeyUp={(e) => handleInput(e)}
                defaultValue={documentState.content}
            />
            <input 
                onChange={(e) => handleMessageText(e)}
                value={messageState}
                type="text" />
            <button onClick={() => handleMessage()}>Send Message</button>
        </div>
    )
}
