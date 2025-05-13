import { useState, createContext, ReactNode } from 'react';
import { NoteDoc } from './DocumentContext';

export interface UserContextType {
    currentUser: string | null;
    yourDocs: NoteDoc[] | null;
    sharedDocs: NoteDoc[] | null;
    docHistory: HistoryItem[] | null;
    setUser: (username: string | null) => void;
    clearUser: () => void;
    updateYourDocs: (documents: NoteDoc[], email: string) => void;
    updateDocHistory: (history: HistoryItem[]) => void;
}

export interface HistoryItem {
    date: {
        day: number;
        month: number;
        year: number;
    };
    content: string;
}

export const UserContext = createContext<UserContextType | undefined>(undefined);

interface UserProviderProps {
    children: ReactNode;
}

export function UserProvider({ children }: UserProviderProps) {
    const [currentUser, setCurrentUser] = useState<string | null>('');
    const [yourDocs, setYourDocs] = useState<NoteDoc[] | null>([]);
    const [sharedDocs, setSharedDocs] = useState<NoteDoc[] | null>([]);
    const [docHistory, setDocHistory] = useState<HistoryItem[] | null>([]);

    const setUser = (username: string | null) => {
        setCurrentUser(username);
    }

    const clearUser = () => {
        setCurrentUser('');
    }

    const updateYourDocs = (documents: NoteDoc[], email: string) => {
        const tempYours: NoteDoc[] = [];
        const tempShared: NoteDoc[] = [];
        // Don't use ternary since we're not returning a value
        documents.forEach((doc) => {
            console.log(doc);
            if (doc.owner === email) {
                tempYours.push(doc);
            } else {
                tempShared.push(doc);
            }
        });
        setYourDocs(tempYours);
        setSharedDocs(tempShared);
    }

    const updateDocHistory = (history: HistoryItem[]) => {
        setDocHistory(history);
    }

    const value: UserContextType = { currentUser, yourDocs, sharedDocs, docHistory, setUser, clearUser, updateYourDocs, updateDocHistory };

    return (
        <UserContext.Provider value={value}>
            {children}
        </UserContext.Provider>
    )
}