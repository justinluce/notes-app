import { addUser, createUserEmailPassword } from '../firebase';
import { useEffect, useState } from 'react';
import '../styles/AccountModal.css';
import { useUser } from '../Context/useUser.ts';

interface CreateAccountModalProps {
    onClose: () => void;
}

const CreateAccountModal = ({ onClose }: CreateAccountModalProps) => {
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [confirmPassword, setConfirmPassword] = useState<string>('');
    const [error, setError] = useState<string>('');
    const [isClosing, setIsClosing] = useState<boolean>(false);
    const { setUser } = useUser();

    useEffect(() => {
        if (password !== confirmPassword) {
            setError('Passwords do not match');
        } else {
            setError('');
        }
    }, [password, confirmPassword]);

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(() => {
            onClose();
            setIsClosing(false);
        }, 400);
    };

    const handleCreateAccount = () => {
        createUserEmailPassword(email, password)
            .then((result) => {
                if (!result) return;
                if (result.success) {
                    addUser(email);
                    setUser(result.user);
                    handleClose();
                } else {
                    setError(result.msg);
                }
            });
        };

    return (
        <div className="modal-overlay" onClick={handleClose}>
            <div className={`modal-content ${isClosing ? 'modal-disappear' : 'modal-appear'}`} onClick={(e) => e.stopPropagation()}>
                <div className="modal-close" onClick={handleClose}>X</div>
                <h1>Create Account</h1>
                <input type="text" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
                <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
                <input type="password" placeholder="Confirm Password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                {error ? <p className="errorText">{error}</p> : <p className="errorText"></p>}
                <button onClick={handleCreateAccount}>Create Account</button>
            </div>
        </div>
    )
}

export default CreateAccountModal;