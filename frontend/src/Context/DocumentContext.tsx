import React, { useState, createContext, ReactNode, useCallback } from 'react';
import { useUser } from './useUser';
import { HistoryItem } from './UserContext';

type Operation = {
    type: 'insert' | 'Backspace';
    position: number;
    character?: string;
    userId: string;
    timestamp: number;
};

export class NoteDoc {
    owner: string | null;
    title: string;
    content: string;
    history: HistoryItem[];
    id: string | null;
    sharedWith: string[];
        constructor(
            owner: string | null = '',
            title = 'Document Title',
            content = '',
            history: HistoryItem[] = [],
            id: string | null = '',
            sharedWith: string[] = []
        ) {
            this.owner = owner;
            this.title = title;
            this.content = content;
            this.history = history;
            this.id = id;
            this.sharedWith = sharedWith;
        }

    // This sucks, I probably should have just used a simple object instead of a Document class
    cloneWith(updates: Partial<NoteDoc>): NoteDoc {
        return new NoteDoc(
            updates.owner !== undefined ? updates.owner : this.owner,
            updates.title !== undefined ? updates.title : this.title,
            updates.content !== undefined ? updates.content : this.content,
            updates.history !== undefined ? updates.history : this.history,
            updates.id !== undefined ? updates.id : this.id,
            updates.sharedWith !== undefined ? updates.sharedWith : this.sharedWith
        )
    }

    // applyOperation(op: Operation) {
    //     if (op.type === "insert" && op.character) {
    //         this.content =
    //             this.content.slice(0, op.position) +
    //             op.character +
    //             this.content.slice(op.position);
    //     } else if (op.type === "Backspace") {
    //         this.content =
    //             this.content.slice(0, op.position) +
    //             this.content.slice(op.position + 1);
    //     }

    //     this.history.push(op);
    // }
}

export interface DocumentContextType {
    documentState: NoteDoc;
    updateDocumentContent: (newContent: string) => void;
    updateTitle: (e: React.FocusEvent<HTMLHeadingElement> | string) => void;
    updateOwner: (email: string) => void;
    loadDoc: (doc: NoteDoc) => void;
}

export const DocumentContext = createContext<DocumentContextType | undefined>(undefined);

interface DocumentProviderProps {
    children: ReactNode;
}

export function DocumentProvider({ children }: DocumentProviderProps) {
    const { currentUser } = useUser();
    const [documentState, setDocumentState] = useState<NoteDoc>(
        () => new NoteDoc(currentUser || '')
    );

    // const updateDocument = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    //         if (e.ctrlKey || e.altKey || e.metaKey) return;
    //         if (e.key !== "Backspace" && e.key.length !== 1) return;
    
    //         const target = e.target as HTMLTextAreaElement;
    //         const newDocument = new Document();
    //         newDocument.content = documentState.content;
    //         newDocument.history = [...documentState.history];
    
    //         const operation: Operation = {
    //             type: e.key === "Backspace" ? "Backspace" : "insert",
    //             position: documentState.content.length,
    //             character: e.key === "Backspace" ? "" : e.key,
    //             userId: '2',
    //             timestamp: Date.now()
    //         };
    
    //         newDocument.applyOperation(operation);
    
    //         console.log(newDocument);

    //         setDocumentState(prev => {
    //             return new Document(documentState.title, target.value, [...prev.history, ...newDocument.history]);
    //         });
    //     }, []);

    // Refactored version for TipTap updates
    const updateDocumentContent = useCallback((newContent: string) => {
        setDocumentState(prev => prev.cloneWith({ content: newContent }));
    }, []);
  
    const updateTitle = (e: React.FocusEvent<HTMLHeadingElement> | string) => {
        const newTitle = typeof e === 'string' ? e : e.currentTarget.textContent || '';
        setDocumentState(prev => prev.cloneWith({ title: newTitle }));
    }

    const updateOwner = (email: string) => {
        setDocumentState(prev => prev.cloneWith({ owner: email }));
    }

    const loadDoc = (doc: NoteDoc) => {
        setDocumentState(doc);
    }

    const value: DocumentContextType = { documentState, updateDocumentContent, updateTitle, updateOwner, loadDoc };

    return (
        <DocumentContext.Provider value={value}>
            {children}
        </DocumentContext.Provider>
    )
}