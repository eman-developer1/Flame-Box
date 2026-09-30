const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export async function fetchProfiles() {
  try {
    const token = localStorage.getItem("flamebox_token");
    const resp = await fetch(`${API_URL}/users`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
    });
    
    if (resp.ok) {
      const json = await resp.json();
      if (Array.isArray(json.users)) {
        return json.users;
      }
    }
  } catch (err) {
    console.error("Error fetching profiles:", err);
  }
  return [];
}

export function subscribeToProfilesChanges(onPayload) {
  // Polling fallback
  const interval = setInterval(async () => {
    const freshData = await fetchProfiles();
    onPayload({ type: 'POLL_UPDATE', data: freshData });
  }, 5000);
  
  return () => {
    clearInterval(interval);
  };
}

export async function updateUserRole(userId, newRole) {
  if (!userId || !newRole) throw new Error("userId and newRole are required");
  const cleanRole = newRole.toLowerCase().trim();

  try {
    const token = localStorage.getItem("flamebox_token");
    const resp = await fetch(`${API_URL}/users/role`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: JSON.stringify({ userId, newRole: cleanRole }),
    });

    if (resp.ok) return { success: true };
    const err = await resp.json().catch(() => ({}));
    throw new Error(err.error || `Server returned ${resp.status}`);
  } catch (error) {
    throw error;
  }
}
