import React, { useState, createContext, useContext, ReactNode, useCallback } from "react";

type Operation = {
    type: "insert" | "Backspace";
    position: number;
    character?: string;
    userId: string;
    timestamp: number;
};

class Document {
    title: string;
    content: string;
    history: Operation[];

    constructor(title = "Document Title", content = "", history: Operation[] = []) {
        this.title = title;
        this.content = content;
        this.history = history;
    }

    applyOperation(op: Operation) {
        if (op.type === "insert" && op.character) {
            this.content =
                this.content.slice(0, op.position) +
                op.character +
                this.content.slice(op.position);
        } else if (op.type === "Backspace") {
            this.content =
                this.content.slice(0, op.position) +
                this.content.slice(op.position + 1);
        }

        this.history.push(op);
    }
}

interface DoucumentContextType {
    documentState: Document;
    updateDocumentContent: (newContent: string) => void;
    updateTitle: (e: React.FocusEvent<HTMLHeadingElement>) => void;
}

export const DocumentContext = createContext<DoucumentContextType | undefined>(undefined);

export function useDocument(): DoucumentContextType {
    const context = useContext(DocumentContext);
    if (!context) {
        throw new Error("useDocument must be used within a DocumentProvider");
    }
    return context;
}

interface DocumentProviderProps {
    children: ReactNode;
}

export function DocumentProvider({ children }: DocumentProviderProps) {
    const [documentState, setDocumentState] = useState<Document>(new Document());

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
        setDocumentState(prev =>
            new Document(prev.title, newContent, prev.history)
        );
    }, []);
  

    const updateTitle = (e: React.FocusEvent<HTMLHeadingElement>) => {
        const target = e.currentTarget.textContent || '';
        documentState.title = target;
    }

    const value: DoucumentContextType = { documentState, updateDocumentContent, updateTitle };

    return (
        <DocumentContext.Provider value={value}>
            {children}
        </DocumentContext.Provider>
    )
}