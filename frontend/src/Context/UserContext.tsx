import { useState, createContext, useContext, ReactNode } from "react";

interface UserContextType {
    currentUser: string;
    setUser: (username: string) => void;
    clearUser: () => void;
}

export const UserContext = createContext<UserContextType | undefined>(undefined);

export function useUser(): UserContextType {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error("useUser must be used within a UserProvider");
    }
    return context;
}

interface UserProviderProps {
    children: ReactNode;
}

export function UserProvider({ children }: UserProviderProps) {
    const [currentUser, setCurrentUser] = useState<string>("");

    const setUser = (username: string) => {
        setCurrentUser(username);
    }

    const clearUser = () => {
        setCurrentUser("");
    }

    const value: UserContextType = { currentUser, setUser, clearUser };

    return (
        <UserContext.Provider value={value}>
            {children}
        </UserContext.Provider>
    )
}