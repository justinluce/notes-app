import { KeyboardEvent, useEffect, useState, useCallback, ChangeEvent } from 'react';
import '../styles/Editor.css';
import useConnection from '../connections/useConnection.js';
import { useUser } from '../Context/useUser.ts';
import { NoteDoc } from '../Context/DocumentContext.js';
import { useDocument } from '../Context/useDocument.ts';
import TipTapEditor from '../Components/TipTapEditor.tsx';
import { getDocuments, saveDocument } from '../firebase.ts';
import { ShareModal } from './ShareModal.tsx';

export const Editor = () => {
    const [modalOpen, setModalOpen] = useState<boolean>(false);

    const { documentState, updateDocumentContent, updateTitle, loadDoc } = useDocument();
    const { currentUser, setUser, clearUser, updateYourDocs } = useUser();
    const { shouldConnect, setShouldConnect, hubConnection, connectionStatus, reconnect, sendMessage, sendUpdate, getContent } = useConnection(currentUser);
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
    //       // deleting a character before an insert doesn't affect it
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

    // const handleInput = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    //     updateDocument(e);
    // };

    const renderConnectionStatus = () => {
        if (!shouldConnect) {
            return <p></p>;
        }
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

    const handleDownload = () => {
        
    }

    useEffect(() => {
        if (documentState.sharedWith.length > 0 || (currentUser && documentState.sharedWith.includes(currentUser))) {
            setShouldConnect(true);
        }
    }, [documentState]);

    // useEffect(() => {
    //     console.log("running", documentState.content);
    //     sendUpdate(hubConnection, currentUser, documentState.content);
    // }, [documentState]);

    return (
        <div id='editor-container'>
            <div id='connection-status'>
                {renderConnectionStatus()}
            </div>
            <div className='top-container'>
                <h2 
                    id='document-title'
                    contentEditable='true'
                    // Handling state update on blur, so this warning should be irrelevant
                    suppressContentEditableWarning={true}
                    onBlur={(e) => updateTitle(e)}
                >
                    {documentState.title}
                </h2>
                <div id='button-container'>
                    {/* <button onClick={() => console.log(documentState)}>Log document state</button> */}
                    <button id='new-button' onClick={() => {
                        // Create completely new document (reset ID and content)
                        const newDoc = new NoteDoc(currentUser, 'New Document', '', [], null, []);
                        loadDoc(newDoc);
                    }}>New Doc</button>
                    <button id='save-button' onClick={() => saveDocument(documentState).then(() => {
                        getDocuments(currentUser).then((docs) => {
                            if (documentState.owner) return updateYourDocs(docs, documentState.owner);
                        })
                    })}><img src='/save-icon.png' /></button>
                    <button id='share-button' onClick={() => setModalOpen(true)}><img src='/share-icon.png' /></button>
                    <button id='download-button' onClick={() => handleDownload()}>Download</button>
                </div>
            </div>
            {modalOpen && (
                <ShareModal document={documentState} open={modalOpen} onClose={() => setModalOpen(false)} />
            )}
            {/* <button onClick={() => {
                getDocuments(currentUser)
                    .then((docs) => {
                        updateRecentDocs(docs);
                    })
                    .catch((err) => {
                        console.error("Error fetching docs: ", err)
                    })
            }}>Get Documents</button> */}
            <TipTapEditor
                content={documentState.content} 
                onUpdateContent={updateDocumentContent} />
            {/* <textarea
                id='document' 
                onKeyUp={(e) => handleInput(e)}
                defaultValue={documentState.content}
            /> */}
        </div>
    )
}
