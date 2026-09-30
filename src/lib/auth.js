const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export async function checkAdminAuth() {
  try {
    const token = localStorage.getItem("flamebox_token");
    if (!token) return { isAuthenticated: false, user: null };

    const response = await fetch(`${API_URL}/auth/check`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!response.ok) {
      localStorage.removeItem("flamebox_token");
      return { isAuthenticated: false, user: null };
    }

    const data = await response.json();
    if (data.isAuthenticated) {
      const role = data.user.role.toLowerCase().trim();
      if (role === 'admin' || role === 'chef' || role === 'manager') {
        return {
          isAuthenticated: true,
          user: { ...data.user, originalRole: data.user.role }
        };
      }
    }
    
    return { isAuthenticated: false, user: null };
  } catch (e) {
    console.error('Auth check error:', e);
    return { isAuthenticated: false, user: null };
  }
}

export async function loginAdmin({ data }) {
  try {
    const { username: email, password } = data;
    
    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email, password })
    });
    
    const result = await response.json();
    
    if (!response.ok || !result.success) {
      return { success: false, error: result.error || "Login failed" };
    }

    localStorage.setItem("flamebox_token", result.token);
    
    return { success: true, role: result.user.role };
  } catch (e) {
    console.error('Login admin error', e);
    return { success: false, error: e.message || 'Login failed' };
  }
}

export async function logoutAdmin() {
  try {
    localStorage.removeItem("flamebox_token");
    return { success: true };
  } catch (e) {
    console.error('Logout error', e);
    return { success: false, error: e.message };
  }
}
