// src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from "react";
import {
  auth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile,
  db,
  doc,
  getDoc,
  setDoc,
  updateDoc,
} from "../services/firebase";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);

      if (firebaseUser) {
        await fetchUserData(firebaseUser.uid);
      } else {
        setUserData(null);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const fetchUserData = async (uid) => {
    try {
      const userDocRef = doc(db, "users", uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const data = userDoc.data();
        setUserData(data);
      } else {
        await createUserInFirestore(uid);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  // Refresh user data from Firestore
  const refreshUserData = async () => {
    if (!user) {
      return false;
    }

    try {
      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const data = userDoc.data();
        setUserData(data);
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error("Error refreshing user data:", error);
      return false;
    }
  };

  const createUserInFirestore = async (uid, username = "") => {
    try {
      const currentUser = auth.currentUser;
      const displayName =
        username ||
        currentUser?.displayName ||
        currentUser?.email?.split("@")[0] ||
        "User";

      const newUserData = {
        uid: uid,
        email: currentUser?.email || "",
        username: displayName,
        phoneNumber: currentUser?.phoneNumber || "",
        displayName: displayName,
        credits: 100,
        totalCreditsPurchased: 0,
        totalCreditsUsed: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        role: "user",
        isActive: true,
      };

      const userDocRef = doc(db, "users", uid);
      await setDoc(userDocRef, newUserData);
      setUserData(newUserData);
      return true;
    } catch (error) {
      console.error("Error creating user in Firestore:", error);
      return false;
    }
  };

  // Email/Password Login
  const login = async (email, password) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      await fetchUserData(result.user.uid);
      return { success: true, user: result.user };
    } catch (error) {
      console.error("Login error:", error);
      let errorMessage = "Login failed";
      if (error.code === "auth/user-not-found") {
        errorMessage = "No account found with this email";
      } else if (error.code === "auth/wrong-password") {
        errorMessage = "Incorrect password";
      } else if (error.code === "auth/invalid-email") {
        errorMessage = "Invalid email address";
      } else {
        errorMessage = error.message;
      }
      return { success: false, error: errorMessage };
    }
  };

  // Email/Password Register with username
  const register = async (email, password, username) => {
    try {
      const result = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );

      // Update profile with username
      await updateProfile(result.user, {
        displayName: username,
      });

      // Create Firestore document with username
      setTimeout(async () => {
        await createUserInFirestore(result.user.uid, username);
      }, 500);

      return { success: true, user: result.user };
    } catch (error) {
      console.error("Register error:", error);
      let errorMessage = "Registration failed";
      if (error.code === "auth/email-already-in-use") {
        errorMessage = "Email already in use";
      } else if (error.code === "auth/invalid-email") {
        errorMessage = "Invalid email address";
      } else if (error.code === "auth/weak-password") {
        errorMessage = "Password is too weak";
      } else {
        errorMessage = error.message;
      }
      return { success: false, error: errorMessage };
    }
  };

  // Reset password
  const resetPassword = async (email) => {
    try {
      await sendPasswordResetEmail(auth, email);
      return { success: true, message: "Password reset email sent" };
    } catch (error) {
      console.error("Reset password error:", error);
      return { success: false, error: error.message };
    }
  };

  // Update user credits in Firestore
  const updateUserCredits = async (newCredits) => {
    if (!user) return false;

    try {
      const userDocRef = doc(db, "users", user.uid);
      await updateDoc(userDocRef, {
        credits: newCredits,
        updatedAt: new Date().toISOString(),
      });

      setUserData((prev) => ({ ...prev, credits: newCredits }));
      return true;
    } catch (error) {
      console.error("Error updating credits:", error);
      return false;
    }
  };

  // Deduct credits (when generating ID card)
  const deductCredits = async (amount) => {
    if (!user || !userData) {
      return false;
    }

    if (userData.credits < amount) {
      return false;
    }

    const newCredits = userData.credits - amount;
    const success = await updateUserCredits(newCredits);

    if (success) {
      await refreshUserData();
    }

    return success;
  };

  // Add credits (when user purchases)
  const addCredits = async (amount) => {
    if (!user) return false;
    const newCredits = (userData?.credits || 0) + amount;
    const success = await updateUserCredits(newCredits);

    if (success) {
      await refreshUserData();
    }

    return success;
  };

  // Update user profile
  const updateUserProfile = async (updates) => {
    if (!user) return false;

    try {
      const userDocRef = doc(db, "users", user.uid);
      await updateDoc(userDocRef, {
        ...updates,
        updatedAt: new Date().toISOString(),
      });

      setUserData((prev) => ({ ...prev, ...updates }));
      return true;
    } catch (error) {
      console.error("Error updating profile:", error);
      return false;
    }
  };

  // Check if current user is admin
  const isAdmin = () => {
    return userData?.role === "admin";
  };

  // Logout
  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setUserData(null);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const value = {
    user,
    userData,
    loading,
    login,
    register,
    logout,
    resetPassword,
    updateUserProfile,
    deductCredits,
    addCredits,
    updateUserCredits,
    refreshUserData,
    isAdmin,
    isAuthenticated: !!user,
    credits: userData?.credits || 0,
    username:
      userData?.username ||
      userData?.displayName ||
      user?.displayName ||
      user?.email?.split("@")[0] ||
      "User",
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
