import { useContext } from 'react';
import { DocumentContext, DocumentContextType } from './DocumentContext';

export function useDocument(): DocumentContextType {
    const context = useContext(DocumentContext);
    if (!context) {
        throw new Error('useDocument must be used within a DocumentProvider');
    }
    return context;
} 