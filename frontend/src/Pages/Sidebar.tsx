
import { useState } from 'react';
import '../styles/Sidebar.css';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../Context/UserContext';

export const Sidebar = () => {
    const [open, setOpen] = useState<boolean>(false);
    const [username, setUsername] = useState<string>('');
    const [password, setPassword] = useState<string>('');

    const navigate = useNavigate();

    const { currentUser, setUser, clearUser } = useUser();

    const toggleSidebar = () => {
        setOpen(prev => !prev);
    }
    
    const handleLogin = () => {
        setUser(username);
    }

    return (
        <div id='sidebar-container' className={open ? 'open' : ''}>
            <div id='sidebar-main' className={open ? 'open' : ''}>
                <div id=''></div>
                <div id='login-container'>
                {currentUser ? (
                    <>
                        Logged in as {currentUser}
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
            <button id='hamburger' onClick={toggleSidebar}>&#9776;</button>
        </div>
    )
}