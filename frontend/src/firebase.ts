import { initializeApp } from 'firebase/app';
import { getFirestore, setLogLevel, collection, addDoc, getDoc, query, where, getDocs, doc, updateDoc, DocumentReference, deleteDoc as firestoreDeleteDoc } from 'firebase/firestore';
import { getAuth, signInWithPopup, GoogleAuthProvider, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { NoteDoc } from './Context/DocumentContext';
import { HistoryItem } from './Context/UserContext';

// Firebase configuration
// https://support.google.com/firebase/answer/7015592
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
  };

// TODO: Will need to enable offline data https://firebase.google.com/docs/firestore/manage-data/enable-offline

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

setLogLevel('debug');

async function testFirestore() {
  try {
    const docRef = await addDoc(collection(db, 'users'), {
      first: 'Ada',
      last: 'Lovelace',
      born: 1815
    });
    console.log('Document written with ID: ', docRef.id);
  } catch (err) {
    console.error('Error adding document: ', err);
  }
}

const addUser = async (email: string) => {
  try {
    const q = query(collection(db, 'users'), where('email', '==', email));
    const querySnapshot = await getDocs(q);
    if (querySnapshot.docs.length > 0) {
      console.log('User already exists');
      return querySnapshot.docs[0].id;
    }
    const docRef = await addDoc(collection(db, 'users'), {
      email: email
    });
    console.log('Document written with ID: ', docRef.id);
    return docRef.id;
  } catch (err) {
    console.error('Error adding document: ', err);
    return null;
  }
}

const saveDocument = async (document: NoteDoc) => {
  // Try to get the document according to its ID
  // If it exists, update it
  // If not, add a new doc
  if (!document.id) {
    return addNewDoc(document);
  }
  try {
    const userQuery = query(collection(db, 'users'), where('email', '==', document.owner));
    const userSnapshot = await getDocs(userQuery);
    
    if (userSnapshot.empty) {
      console.error('User not found');
      return null;
    }
    
    const userId = userSnapshot.docs[0].id;
    const docRef = doc(db, 'users', userId, 'documents', document.id);
    const dbDoc = await getDoc(docRef);

    if (dbDoc.exists()) {
      // update it
      const data = dbDoc.data();
      const existingHistory: HistoryItem[] = data.history || [];

      const now = new Date();
      const dateObj = {
        day: now.getDate(),
        month: now.getMonth() + 1,
        year: now.getFullYear()
      }

      const newHistory = data.content === document.content ? [...existingHistory] : [...existingHistory, { date: dateObj, content: document.content }];

      await updateDoc(docRef, {
        title: document.title,
        content: document.content,
        history: newHistory,
        sharedWith: document.sharedWith || []
      });
      return document.id;
    } else {
      return addNewDoc(document);
    }
  } catch (err) {
    console.error('Error saving document: ', err);
    return null;
  }
}

const addNewDoc = async (document: NoteDoc) => {
  try {
    // Make sure the document has an owner before adding it
    if (!document.owner) {
      console.error('Cannot add document without an owner');
      return null;
    }
    
    // Find the user ID first
    const userQuery = query(collection(db, 'users'), where('email', '==', document.owner));
    const userSnapshot = await getDocs(userQuery);
    
    if (userSnapshot.empty) {
      console.error('User not found');
      return null;
    }
    
    const userId = userSnapshot.docs[0].id;
    
    // Now add the document as a subcollection under the user
    const docRef = await addDoc(collection(db, 'users', userId, 'documents'), {
      owner: document.owner,
      title: document.title,
      content: document.content,
      history: document.history || [],
      sharedWith: document.sharedWith || []
    });
    
    console.log('Document written with ID: ', docRef.id);
    return docRef.id;
  } catch (err) {
    console.error('Error adding document: ', err);
    return null;
  }
}

const shareDocument = async (document: NoteDoc, email: string): Promise<{ success: boolean, msg: string }> => {
  try {
    if (!document.owner) {
      console.error('Cannot share document without an owner');
      return { success: false, msg: 'Need to log in first' };
    }

    // Find the user they're trying to share it with
    const userQuery = query(collection(db, 'users'), where('email', '==', email));
    const userSnapshot = await getDocs(userQuery);

    if (userSnapshot.empty) {
      console.error('User not found');
      return { success: false, msg: 'User not found' };
    }

    const userId = userSnapshot.docs[0].id;
    
    if (userId === document.owner) {
      console.error('userID is the same as owner');
      return { success: false, msg: 'Cannot share document with yourself' };
    }

    await addDoc(collection(db, 'users', userId, 'documents'), {
      owner: document.owner,
      title: document.title,
      content: document.content,
      history: document.history || [],
      sharedWith: email
    });

    console.log('Shared with: ', email);
    return { success: true, msg: 'Shared successfully' };
  } catch (err) {
    console.error('Error sharing document: ', err);
    return { success: false, msg: err instanceof Error ? err.message : 'Unknown error' };
  }
}

const getDocuments = async (email: string | null): Promise<NoteDoc[]> => {
  if (email === null) return [];
  
  try {
    // First get the user ID
    const userQuery = query(collection(db, 'users'), where('email', '==', email));
    const userSnapshot = await getDocs(userQuery);
    
    if (userSnapshot.empty) {
      console.error('User not found');
      return [];
    }
    
    const userId = userSnapshot.docs[0].id;
    
    // Get all documents for this user
    const docsSnapshot = await getDocs(collection(db, 'users', userId, 'documents'));
    
    const docs = docsSnapshot.docs.map((item) => new NoteDoc(
      item.data().owner,
      item.data().title,
      item.data().content,
      item.data().history || [],
      item.id,
      item.data().sharedWith || []
    ));
    
    return docs;
  } catch (err) {
    console.error('Error getting docs from db: ', err);
    return [];
  }
};

const getSharedDocuments = async (email: string | null): Promise<NoteDoc[]> => {
  if (email === null) return [];
  
  try {
    // First get the user ID
    const userQuery = query(collection(db, 'users'), where('email', '==', email));
    const userSnapshot = await getDocs(userQuery);
    
    if (userSnapshot.empty) {
      console.error('User not found');
      return [];
    }
    
    const userId = userSnapshot.docs[0].id;
    
    // Get all shared documents for this user
    const sharedDocsSnapshot = await getDocs(collection(db, 'users', userId, 'documents'));
    
    const docs = sharedDocsSnapshot.docs.map((item) => new NoteDoc(
      item.data().owner,
      item.data().title,
      item.data().content,
      item.data().history || [],
      item.id,
      item.data().sharedWith ? [item.data().sharedWith] : []
    ));
    
    return docs;
  } catch (err) {
    console.error('Error getting shared docs: ', err);
    return [];
  }
};

const getSingleDoc = async (email: string | null, document: NoteDoc): Promise<{ success: boolean, msg: string, doc: NoteDoc }> => {
  if (email === null || !document.id) return { success: false, msg: 'No Email for document ID', doc: new NoteDoc() };
  
  try {
    // First get the user ID
    const userQuery = query(collection(db, 'users'), where('email', '==', email));
    const userSnapshot = await getDocs(userQuery);
    
    if (userSnapshot.empty) {
      console.error('User not found');
      return { success: false, msg: 'User not found', doc: new NoteDoc() };
    }
    
    const userId = userSnapshot.docs[0].id;
    
    console.log(userId);

    // Get the specific document
    const docRef = doc(db, 'users', userId, 'documents', document.id);
    const dbDoc = await getDoc(docRef);

    console.log(docRef);

    if (dbDoc.exists()) {
      const data = dbDoc.data();
      if (data) {
        return {
          success: true,
          msg: 'Success',
          doc: new NoteDoc(
            email,
            data.title,
            data.content,
            data.history || [],
            dbDoc.id,
            data.sharedWith || []
          )
        };
      }
    }
    return { success: false, msg: 'No Doc exists, creating new one', doc: new NoteDoc() };
  } catch (err) {
    console.error('Error getting document: ', err);
    return { success: false, msg: err instanceof Error ? err.message : 'Unknown error', doc: new NoteDoc() };
  }
};

const deleteDoc = async (docRef: DocumentReference) => {
  try {
    console.log('Deleting document:', docRef.path);
    await firestoreDeleteDoc(docRef);
    console.log('Document successfully deleted');
    return true;
  } catch (error) {
    console.error('Error deleting document:', error);
    return false;
  }
}

const signInWithGoogle = async () =>  {
  return signInWithPopup(auth, provider)
      .then((result) => {
          // This gives you a Google Access Token. You can use it to access the Google API.
          const credential = GoogleAuthProvider.credentialFromResult(result);
          if (!credential) return null;
          // const token = credential.accessToken;
          // The signed-in user info.
          const user = result.user;
          // IdP data available using getAdditionalUserInfo(result)
          // ...
          console.log(user);
          return user.email;
      }).catch((error) => {
          // Handle Errors here.
          const errorCode = error.code;
          const errorMessage = error.message;
          // The email of the user's account used.
          const email = error.customData.email;
          // The AuthCredential type that was used.
          const credential = GoogleAuthProvider.credentialFromError(error);
          // ...
          console.error(errorCode, errorMessage, email, credential);
          return null;
      });
}

const createUserEmailPassword = async (email: string, password: string) => {
  return createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
        const user = userCredential.user;
        console.log(user);
        return { success: true, msg: 'User created successfully', user: user.email };
    })
    .catch(err => {
        const errCode = err.code;
        const errMsg = err.message;
        console.error(errCode, errMsg);
        return { success: false, msg: errMsg, user: null };
    })
}

const signInEmailPassword = async (email: string, password: string) => {
  return signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      const user = userCredential.user;
      console.log(user);
      return user;
    })
    .catch(err => {
      const errCode = err.code;
      const errMsg = err.message;
      console.error(errCode, errMsg);
      return null;
    })
}
export { app, db, auth, testFirestore, addUser, saveDocument, shareDocument, getDocuments, getSharedDocuments, getSingleDoc, deleteDoc, signInWithGoogle, createUserEmailPassword, signInEmailPassword, doc };
