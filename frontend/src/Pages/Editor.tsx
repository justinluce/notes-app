import { KeyboardEvent, useEffect, useState, useCallback, ChangeEvent } from "react";
import useConnection from '../connections/useConnection.js';

type Operation = {
    type: "insert" | "Backspace";
    position: number;
    character?: string;
    userId: string;
    timestamp: number;
};
  
class Document {
    content: string;
    history: Operation[];

    constructor(content = "", history: Operation[] = []) {
        this.content = content;
        this.history = history;
    }

    applyOperation(op: Operation) {
        if (op.type === "insert" && op.character) {
            this.content =
                this.content.slice(0, op.position) +
                op.character +
                this.content.slice(op.position);
        } else if (op.type === "Backspace") {
            this.content =
                this.content.slice(0, op.position) +
                this.content.slice(op.position + 1);
        }

        this.history.push(op);
    }
}

export const Editor = () => {
    const [user, setUser] = useState("Luce");
    const [documentState, setDocumentState] = useState(new Document());
    const [messageState, setMessageState] = useState('');

    const { hubConnection, connectionStatus, sendMessage, sendUpdate, getContent } = useConnection(user);
    // const { sendMessage, sendUpdate } = useMessenger();
    
    // Operational Transformation
    function transform(opA: Operation, opB: Operation): Operation {
        if (opA.position < opB.position || (opA.position === opB.position && opA.timestamp < opB.timestamp)) {
          return opA; // don't adjust if it's earlier
        }
      
        if (opA.type === "insert" && opB.type === "insert") {
          // if both are at the same position, move the second one forward
          return { ...opA, position: opA.position + 1 };
        }
      
        if (opA.type === "Backspace" && opB.type === "insert") {
          // deleting a character before an insert doesn’t affect it
          return opA;
        }
      
        if (opA.type === "insert" && opB.type === "Backspace") {
          // if deleting before an insert, move insert position back
          return { ...opA, position: Math.max(0, opA.position - 1) };
        }
      
        if (opA.type === "Backspace" && opB.type === "Backspace") {
          // if deleting the same character, ignore the second delete
          return opA;
        }
      
        return opA;
    }

    const handleInput = useCallback((e: KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.ctrlKey || e.altKey || e.metaKey) return;
        if (e.key !== "Backspace" && e.key.length !== 1) return;

        const target = e.target as HTMLTextAreaElement;
        const newDocument = new Document();
        newDocument.content = documentState.content;
        newDocument.history = [...documentState.history];

        const operation: Operation = {
            type: e.key === "Backspace" ? "Backspace" : "insert",
            position: documentState.content.length,
            character: e.key === "Backspace" ? "" : e.key,
            userId: '2',
            timestamp: Date.now()
        };

        newDocument.applyOperation(operation);

        console.log(newDocument);
        
        sendUpdate(hubConnection, user, target.value);
        setDocumentState(prev => {
            return new Document(target.value, [...prev.history, ...newDocument.history]);
        });
    }, []);

    const handleMessageText = (e: ChangeEvent<HTMLInputElement>) => {    
        const target = e.target as HTMLInputElement;    
        setMessageState(target.value);
    }

    const handleMessage = () => {
        sendMessage(user, messageState);
    }

    useEffect(() => {
        // documentState.content = getContent();
    }, []);

    // useEffect(() => {
    //     console.log("running", documentState.content);
    //     sendUpdate(user, documentState.content);
    // }, [documentState]);
    
    return (
        <div>
            <div>
                {connectionStatus} as {user}
            </div>
            <textarea onKeyDown={(e) => handleInput(e)} />
            <div className="history-container">
                {documentState.history.map((item, index) => (
                    <p key={index}>{item.character}</p>
                ))}
            </div>
            <input 
                onChange={(e) => handleMessageText(e)}
                value={messageState}
                type="text" />
            <button onClick={() => handleMessage()}>Send Message</button>
        </div>
    )
}
