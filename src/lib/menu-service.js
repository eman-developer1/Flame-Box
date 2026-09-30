import { menu as defaultMenu } from "./menu-data.js";

const LOCAL_STORAGE_KEY = "flamebox_custom_menu";
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export function getCachedMenuItems() {
  if (typeof window === "undefined") return defaultMenu;
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    // Ignore JSON parse errors
  }
  return defaultMenu;
}

export async function fetchMenuItems() {
  const cached = getCachedMenuItems();

  try {
    const timeoutPromise = new Promise((resolve) =>
      setTimeout(() => resolve({ timeout: true }), 2000)
    );

    const fetchPromise = (async () => {
      try {
        const response = await fetch(`${API_URL}/menu`);
        if (!response.ok) return cached;
        const data = await response.json();
        
        if (!data || data.length === 0) return cached;

        const mapped = data.map((item) => ({
          id: String(item.id),
          name: item.name,
          description: item.description || "",
          price: Number(item.price),
          image: item.image || defaultMenu[0]?.image,
          category: item.category || "Burgers",
          rating: Number(item.rating || 4.8),
          bestseller: Boolean(item.bestseller),
          spicy: Boolean(item.spicy),
          veg: Boolean(item.veg),
          inStock: Boolean(item.in_stock ?? item.inStock ?? true),
        }));

        if (typeof window !== "undefined") {
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(mapped));
        }
        return mapped;
      } catch (e) {
        return cached;
      }
    })();

    const result = await Promise.race([fetchPromise, timeoutPromise]);
    if (result && !result.timeout && Array.isArray(result)) {
      return result;
    }
    return cached;
  } catch (err) {
    return cached;
  }
}

export async function saveMenuItemToSupabase(dish) {
  // Renamed but kept same signature to avoid breaking other files
  const payload = {
    id: String(dish.id || `dish-${Date.now()}`),
    name: dish.name,
    description: dish.description,
    price: Number(dish.price),
    image: dish.image,
    category: dish.category,
    rating: Number(dish.rating || 4.8),
    bestseller: Boolean(dish.bestseller),
    spicy: Boolean(dish.spicy),
    veg: Boolean(dish.veg),
    in_stock: Boolean(dish.inStock ?? true),
  };

  try {
    const response = await fetch(`${API_URL}/menu`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    
    if (!response.ok) return null;
    const data = await response.json();

    if (data && typeof window !== "undefined") {
      const fresh = Array.isArray(data) ? data : [data];
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(fresh));
    }
    return data;
  } catch (err) {
    console.warn("Express connection error:", err);
    return null;
  }
}

export async function deleteMenuItemFromSupabase(id) {
  // Renamed but kept same signature
  try {
    const response = await fetch(`${API_URL}/menu/${id}`, {
      method: "DELETE",
    });
    
    if (response.ok) {
      const cached = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || "[]");
      const updated = cached.filter((i) => i.id !== String(id));
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
    } else {
      console.warn("Express delete error:", response.statusText);
    }
  } catch (err) {
    console.warn("Express connection error:", err);
  }
}

export function subscribeToMenuChanges(onChangeCallback) {
  // We'll replace realtime with a simple polling mechanism for now as Socket.io was not fully requested yet
  const interval = setInterval(async () => {
    const freshData = await fetchMenuItems();
    onChangeCallback(freshData);
  }, 5000);
  
  return () => {
    clearInterval(interval);
  };
}
