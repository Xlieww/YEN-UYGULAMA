import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";
import { app } from "@/lib/firebase";

const auth = getAuth(app);
const db = getFirestore(app);

// Kullanıcı kaydı ve rol ekleme
export async function registerUserWithRole(email: string, password: string, role: string) {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;
  await setDoc(doc(db, "users", user.uid), {
    email: user.email,
    role: role,
  });
  return user;
}

// Kullanıcı rolünü çekme
export async function getUserRole(uid: string): Promise<string | null> {
  const docRef = doc(db, "users", uid);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return docSnap.data().role;
  } else {
    return null;
  }
} 