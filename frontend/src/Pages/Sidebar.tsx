
import { useState } from 'react';
import '../styles/Sidebar.css';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../Context/UserContext';

export const Sidebar = () => {
    const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
    const [historyOpen, setHistoryOpen] = useState<boolean>(false);
    const [recentOpen, setRecentOpen] = useState<boolean>(false);
    const [username, setUsername] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [history, setHistory] = useState(['March 13', 'March 14', 'March 15']);
    const [recents, setRecents] = useState(['doc1', 'doc2', 'doc3']);

    const navigate = useNavigate();

    const { currentUser, setUser, clearUser } = useUser();

    const toggleSidebar = () => {
        setSidebarOpen(prev => !prev);
    }
    
    const handleLogin = () => {
        setUser(username);
    }

    const handleLogout = () => {
        clearUser();
    }

    return (
        <div id='sidebar-container' className={sidebarOpen ? 'sidebar-open' : ''}>
            <div id='sidebar-main' className={sidebarOpen ? 'sidebar-open' : ''}>
                <div id=''></div>
                <div id='login-container'>
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
                                {history.map((item, index) => (
                                    <li key={index}>{item}</li>
                                ))}
                            </ul>
                        </div>
                        <div 
                            id='recent-container' 
                            onClick={() => setRecentOpen(prev => !prev)} 
                            className={recentOpen ? 'recent-open' : ''}
                        >
                            <h3>Recent Documents <span id='arrow' className={recentOpen ? 'arrow-open' : ''}><img src='arrow.png' /></span></h3>
                            <ul id='recent-list' className={recentOpen ? 'recent-open' : ''}>
                                {recents.map((item, index) => (
                                    <li key={index}>{item}</li>
                                ))}
                            </ul>
                        </div>
                    </>
                ) : (
                    <>
                        <input 
                            placeholder='Username'
                            onChange={(e) => setUsername(e.target.value)}
                        />
                        <input 
                            placeholder='Password'
                            onChange={(e) => setPassword(e.target.value)}
                            type='password'
                        />
                        <button onClick={handleLogin}>Login</button>
                        <p onClick={() => navigate('/create-account')}>Create Account</p>
                    </>
                )}
                </div>
            </div>
            <button id='hamburger' onClick={toggleSidebar}>{sidebarOpen ? '\u2716' : '\u2630'}</button>
        </div>
    )
}