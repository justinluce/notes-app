import { useEffect, useState } from 'react'
import { NoteDoc } from '../Context/DocumentContext';
import { saveDocument, shareDocument } from '../firebase';
import '../styles/ShareModal.css';

interface ShareProps {
    document: NoteDoc;
    onClose: () => void;
}

export const ShareModal = ({ document, onClose }: ShareProps ) => {
    const [name, setName] = useState<string>('');
    const [currentShare, setCurrentShare] = useState<string[]>(
        document.sharedWith
    );
    const [isClosing, setIsClosing] = useState(false);

    useEffect(() => {
        console.log(document);
    }, [document]);

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(() => {
            onClose();
            setIsClosing(false);
        }, 400);
    };

    const handleShare = async () => {
        shareDocument(document, name)
            .then((result) => {
                if (result.success) {
                    document.sharedWith = [...document.sharedWith, name];
                    saveDocument(document);
                    setCurrentShare(document.sharedWith);
                    handleClose();
                }
                alert(result.msg);
            });
    }

    const removeShare = (user: string) => {
        document.sharedWith = document.sharedWith.filter(item => item !== user);
        saveDocument(document);
        setCurrentShare(document.sharedWith);
    }

    return (
        <div className="modal-overlay" onClick={handleClose}>
            <div className={`modal-content ${isClosing ? 'modal-disappear' : 'modal-appear'}`} onClick={(e) => e.stopPropagation()}>
                <div className="modal-close" onClick={handleClose}>X</div>
                <p>Currently shared with</p>
                <ul>
                    {currentShare.map((item) => (
                    <>
                        <li>{item}</li>
                        <button onClick={() => removeShare(item)}>Remove</button>
                    </>
                ))}
            </ul>
            <input 
                placeholder='Enter Email'
                onChange={(e) => setName(e.target.value)}
            />
                <button onClick={handleShare}>Share</button>
            </div>
        </div>
    )
}