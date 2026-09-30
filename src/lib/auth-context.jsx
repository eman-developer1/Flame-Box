import { createContext, useContext, useEffect, useState } from "react";
// removed supabase import

const AuthContext = createContext({
  session: null,
  user: null,
  loading: true,
  signIn: async () => {},
  signUp: async () => {},
  signOut: async () => {},
  resetPassword: async () => {},
  updatePassword: async () => {},
});

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("flamebox_token");
      if (!token) {
        setSession(null);
        setUser(null);
        setLoading(false);
        return;
      }
      try {
        const res = await fetch("http://localhost:5000/api/auth/check", {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          if (data.isAuthenticated) {
            setSession({ user: data.user, access_token: token });
            setUser(data.user);
          } else {
            localStorage.removeItem("flamebox_token");
            setSession(null);
            setUser(null);
          }
        } else {
          localStorage.removeItem("flamebox_token");
          setSession(null);
          setUser(null);
        }
      } catch (err) {
        setSession(null);
        setUser(null);
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  const signIn = async (email, password) => {
    const res = await fetch("http://localhost:5000/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (res.ok && data.success) {
      localStorage.setItem("flamebox_token", data.token);
      setSession({ user: data.user, access_token: data.token });
      setUser(data.user);
      return { data: { user: data.user }, error: null };
    }
    return { data: null, error: new Error(data.error || "Login failed") };
  };

  const signUp = async (email, password, fullName) => {
    const res = await fetch("http://localhost:5000/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, full_name: fullName }),
    });
    const data = await res.json();
    if (res.ok && data.success) {
      localStorage.setItem("flamebox_token", data.token);
      setSession({ user: data.user, access_token: data.token });
      setUser(data.user);
      return { data: { user: data.user }, error: null };
    }
    return { data: null, error: new Error(data.error || "Signup failed") };
  };

  const signOut = async () => {
    localStorage.removeItem("flamebox_token");
    setSession(null);
    setUser(null);
    return { error: null };
  };

  const resetPassword = async (email) => {
    // Fake implementation for now
    return { error: null };
  };

  const updatePassword = async (newPassword) => {
    // Fake implementation for now
    return { error: null };
  };

  return (
    <AuthContext.Provider
      value={{ session, user, loading, signIn, signUp, signOut, resetPassword, updatePassword }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  return useContext(AuthContext);
};
