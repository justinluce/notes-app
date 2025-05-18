import { useEffect, useState } from 'react';
import '../styles/Editor.css';
import useConnection from '../connections/useConnection.js';
import { useUser } from '../Context/useUser.ts';
import { NoteDoc } from '../Context/DocumentContext.js';
import { useDocument } from '../Context/useDocument.ts';
import TipTapEditor from '../Components/TipTapEditor.tsx';
import { getDocuments, saveDocument } from '../firebase.ts';
import { ShareModal } from './ShareModal.tsx';
import { useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TurndownService from 'turndown';

export const Editor = () => {
    const [modalOpen, setModalOpen] = useState<boolean>(false);
    const turndownService = new TurndownService();

    const { documentState, updateDocumentContent, updateTitle, loadDoc, updateID } = useDocument();
    const { currentUser, updateYourDocs } = useUser();
    const { shouldConnect, setShouldConnect, connectionStatus, reconnect } = useConnection(currentUser);

    const editor = useEditor({
        extensions: [StarterKit],
        content: documentState.content,
        onUpdate: ({ editor }) => {
            const newContent = editor.getHTML();
            updateDocumentContent(newContent);
        },
    });
    
    // Need to update editor content to keep it in sync with documentState.content
    useEffect(() => {
        if (editor && documentState.content !== editor.getHTML()) {
            editor.commands.setContent(documentState.content);
        }
    }, [documentState.content, editor]);
    
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
        if (!editor) return;
        const html = editor.getHTML();
        const markdown = turndownService.turndown(html);
        const blob = new Blob([markdown], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${documentState.title}.md`;
        a.click();
        URL.revokeObjectURL(url);
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
            {/* <button onClick={() => console.log(documentState)}>Log document state</button> */}
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
                    <button id='new-button' onClick={() => {
                        const newDoc = new NoteDoc(currentUser, 'New Document', '', [], null, []);
                        loadDoc(newDoc);
                    }}>New Doc</button>
                    <button id='save-button' onClick={() => saveDocument(documentState).then((id) => {
                        console.log(id);
                        updateID(id);
                        getDocuments(currentUser).then((docs) => {
                            if (documentState.owner) {
                                return updateYourDocs(docs, documentState.owner);
                            }
                        })
                    })}><img src='/save-icon.png' /></button>
                    <button id='share-button' onClick={() => setModalOpen(true)}><img src='/share-icon.png' /></button>
                    <button id='download-button' onClick={() => handleDownload()}>Download</button>
                </div>
            </div>
            {modalOpen && (
                <ShareModal document={documentState} onClose={() => setModalOpen(false)} />
            )}
            <TipTapEditor
                editor={editor} />
        </div>
    )
}
