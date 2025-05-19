import { useEffect, useState } from 'react';
import '../styles/Editor.css';
import useConnection from '../connections/useConnection';
import { useUser } from '../Context/useUser';
import { NoteDoc } from '../Context/DocumentContext';
import { useDocument } from '../Context/useDocument';
import TipTapEditor from '../Components/TipTapEditor';
import { getDocuments, saveDocument } from '../firebase';
import { ShareModal } from './ShareModal';
import { useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TurndownService from 'turndown';

export const Editor = () => {
    const [modalOpen, setModalOpen] = useState<boolean>(false);
    const turndownService = new TurndownService();

    const { documentState, updateDocumentContent, updateTitle, loadDoc, updateID } = useDocument();
    const { currentUser, updateYourDocs } = useUser();
    const { shouldConnect, setShouldConnect, connectionStatus, hubConnection, updateDocument } = useConnection(
        currentUser, 
        documentState.id,
        (content) => {
            if (content !== documentState.content) {
                updateDocumentContent(content);
            }
        }
    );

    // Set up SignalR connection when document is loaded or user changes
    useEffect(() => {
        console.log('Connection state:', { currentUser, documentId: documentState.id, shouldConnect });
        if (currentUser && documentState.id) {
            console.log('Setting shouldConnect to true');
            setShouldConnect(true);
        } else {
            console.log('Setting shouldConnect to false');
            setShouldConnect(false);
        }
    }, [documentState.id, currentUser, setShouldConnect]);

    const editor = useEditor({
        extensions: [StarterKit],
        content: documentState.content,
        onUpdate: ({ editor }) => {
            const newContent = editor.getHTML();
            updateDocumentContent(newContent);
            // Send update through SignalR
            if (hubConnection) {
                updateDocument(newContent);
            }
        },
    });
    
    // Need to update editor content to keep it in sync with documentState.content
    useEffect(() => {
        if (editor && documentState.content !== editor.getHTML()) {
            editor.commands.setContent(documentState.content);
        }
    }, [documentState.content, editor]);

    const renderConnectionStatus = () => {
        console.log('Rendering connection status:', connectionStatus);
        switch (connectionStatus) {
            case 'Connected':
                return <div className='status connected'>Connected</div>;
            case 'Disconnected':
                return <div className='status disconnected'>Disconnected</div>;
            case 'Reconnecting':
                return <div className='status reconnecting'>Reconnecting...</div>;
            case 'Connecting':
                return <div className='status connecting'>Connecting...</div>;
            default:
                return <div className='status disconnected'>Disconnected</div>;
        }
    };

    const handleDownload = () => {
        const markdown = turndownService.turndown(documentState.content);
        const blob = new Blob([markdown], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${documentState.title}.md`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    return (
        <div id='editor-container'>
            <div id='connection-status'>
                {renderConnectionStatus()}
            </div>
            <div className='top-container'>
                <h2 
                    id='document-title'
                    contentEditable='true'
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
