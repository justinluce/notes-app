import { Key, useState } from 'react';
import '../styles/Sidebar.css';
import { HistoryItem } from '../Context/UserContext';
import { signInWithGoogle, getDocuments, getSingleDoc, addUser, deleteDoc, db, doc, signInEmailPassword } from '../firebase.ts';
import { NoteDoc } from '../Context/DocumentContext.tsx';
import GoogleButton from 'react-google-button';
import { query, collection, getDocs, where } from 'firebase/firestore';
import { useUser } from '../Context/useUser.ts';
import { useDocument } from '../Context/useDocument.ts';
import CreateAccountModal from './CreateAccountModal';
// Need to update history when we save (currently is not updating until you click on the recent doc)
// I think it works now?

export const Sidebar = () => {
    const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
    const [historyOpen, setHistoryOpen] = useState<boolean>(false);
    const [yourDocsOpen, setYourDocsOpen] = useState<boolean>(false);
    const [sharedDocsOpen, setSharedDocsOpen] = useState<boolean>(false);
    const [username, setUsername] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [createAccountModal, setCreateAccountModal] = useState<boolean>(false);

    const { currentUser, setUser, clearUser, yourDocs, sharedDocs, docHistory, updateYourDocs, updateDocHistory } = useUser();
    const { updateOwner, loadDoc, updateDocumentContent, updateTitle } = useDocument();

    const toggleSidebar = () => {
        setSidebarOpen(prev => !prev);
    }
    
    const handleLogout = () => {
        clearUser();
        loadDoc(new NoteDoc(''));
    }

    const handleRecentClick = (e: React.MouseEvent<HTMLSpanElement, MouseEvent>, doc: NoteDoc) => {
        e.preventDefault();
        e.stopPropagation();
        setYourDocsOpen(true);
        getSingleDoc(currentUser, doc)
            .then((doc) => {
                loadDoc(doc.doc);
                updateDocHistory(doc.doc.history);
            })
            .catch((err) => {
                console.error('Error getting single doc: ', err);
            });
    }

    const handleHistoryClick = (e: React.MouseEvent<HTMLLIElement, MouseEvent>, item: HistoryItem) => {
        e.stopPropagation();
        updateDocumentContent(item.content);
    }

    const handleLoginWithGoogle = async () => {
        const username = await signInWithGoogle();
        if (!username) return;
        setUser(username);
        addUser(username);
        updateOwner(username);
        const docs = await getDocuments(username);
        if (docs) updateYourDocs(docs, username);
        
        // const sharedDocs = await getSharedDocuments(username);
        // if (sharedDocs) updateSharedDocs(sharedDocs);
    }

    const handleDelete = async (e: React.MouseEvent<HTMLSpanElement, MouseEvent>, docItem: NoteDoc) => {
        e.stopPropagation();
        if (!currentUser || !docItem.id) return;
        try {
            // Get userId from username
            const userQuery = query(collection(db, 'users'), where('email', '==', currentUser));
            const userSnapshot = await getDocs(userQuery);
            
            if (userSnapshot.empty) {
                console.error('User not found');
                return;
            }
            
            const userId = userSnapshot.docs[0].id;
            const success = await deleteDoc(doc(db, 'users', userId, 'documents', docItem.id));
            
            if (success && yourDocs) {
                updateYourDocs(yourDocs.filter((item: { id: string | null; }) => item.id !== docItem.id), currentUser);
                updateDocumentContent(new NoteDoc(currentUser, 'New Document', '', [], null, []).content);
                updateTitle('New Document');
            }
        } catch (error) {
            console.error('Error in handleDelete:', error);
        }
    }

    return (
        <div id='sidebar-container' className={sidebarOpen ? 'sidebar-open' : ''}>
            <div id='sidebar-main' className={sidebarOpen ? 'sidebar-open' : ''}>
                <div id=''></div>
                <div id='login-container'>
                {createAccountModal && <CreateAccountModal onClose={() => setCreateAccountModal(false)} />}
                {/* <button onClick={testFirestore}>Test Firestore</button> */}
                {currentUser ? (
                    <>
                        Logged in as {currentUser}
                        <button onClick={handleLogout}>Logout</button>
                        <div
                            id='history-container' 
                            onClick={() => setHistoryOpen(prev => !prev)}
                        >
                            <h3>History <span id='arrow' className={historyOpen ? 'arrow-open' : ''}><img src='arrow.png' /></span></h3>
                            <ul id='history-list' className={historyOpen ? 'history-open' : ''}>
                                {docHistory?.map((item, index) => (
                                    <li id='history-item' onClick={(e) => handleHistoryClick(e, item)} key={index}>{item.date.month}/{item.date.day}/{item.date.year}</li>
                                ))}
                            </ul>
                        </div>
                        <div 
                            id='recent-container'
                            onClick={() => setYourDocsOpen(prev => !prev)}
                            className={yourDocsOpen ? 'recent-open' : ''}
                        >
                            <h3>Your Documents <span id='arrow' className={yourDocsOpen ? 'arrow-open' : ''}><img src='arrow.png' /></span></h3>
                            <ul id='recent-list' className={yourDocsOpen ? 'recent-open' : ''}>
                                {yourDocs?.map((item: NoteDoc, index: Key | null | undefined) => (
                                    <li key={index}>
                                        <span id='recent-title' onClick={(e) => handleRecentClick(e, item)}>{item.title}</span>
                                        <span id='delete-icon' onClick={(e) => handleDelete(e, item)}><img src='delete-icon.png' /></span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div 
                            id='shared-container'
                            onClick={() => setSharedDocsOpen(prev => !prev)}
                            className={sharedDocsOpen ? 'shared-open' : ''}
                        >
                            <h3>Shared With You <span id='arrow' className={sharedDocsOpen ? 'arrow-open' : ''}><img src='arrow.png' /></span></h3>
                            <ul id='shared-list' className={sharedDocsOpen ? 'shared-open' : ''}>
                                {sharedDocs?.map((item: NoteDoc, index: Key | null | undefined) => (
                                    <li key={index}>
                                        <span id='shared-item' onClick={(e) => handleRecentClick(e, item)}>{item.title}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </>
                ) : (
                    <>
                        <input 
                            placeholder='Email'
                            onChange={(e) => setUsername(e.target.value)}
                        />
                        <input 
                            placeholder='Password'
                            onChange={(e) => setPassword(e.target.value)}
                            type='password'
                        />
                        <button onClick={() => signInEmailPassword(username, password)}>Login</button>
                        <p onClick={() => setCreateAccountModal(true)}>Create Account</p>
                        <GoogleButton onClick={handleLoginWithGoogle} />
                    </>
                )}
                </div>
            </div>
            <button id='hamburger' onClick={toggleSidebar}>{sidebarOpen ? '\u2716' : '\u2630'}</button>
        </div>
    )
}