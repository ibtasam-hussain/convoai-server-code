import { api } from "@/Components/lib/api";

// 🔹 Fetch all users under an organization
export const getUsersByOrganization = async (organizationId: number) => {
  const res = await api.get(`/users/organization/${organizationId}`);
  return res.data.users;
};

// 🔹 Create user
export const createUser = async (data: any) => {
  const formData = new FormData();
  Object.entries(data).forEach(([key, val]) => {
    if (val !== null && val !== undefined) {
      // Handle File objects and other types properly
      if (val instanceof File) {
        formData.append(key, val);
      } else if (typeof val === 'object' && !(val instanceof File)) {
        // Stringify objects/arrays
        formData.append(key, JSON.stringify(val));
      } else {
        formData.append(key, String(val));
      }
    }
  });

  console.log("📤 Creating user with FormData keys:", Array.from(formData.keys()));

  const res = await api.post("/users/add", formData, {
    headers: { 
      "Content-Type": "multipart/form-data",
    },
  });
  return res.data;
};

// 🔹 Update user
export const updateUser = async (data: any) => {
  if (!data.userId) {
    throw new Error("userId is required for updateUser()");
  }

  const userId = data.userId;
  // Remove userId from data before creating FormData (it goes in URL, not body)
  const { userId: _, ...userData } = data;

  const formData = new FormData();
  Object.entries(userData).forEach(([key, val]) => {
    if (val !== null && val !== undefined) {
      // Handle File objects and other types properly
      if (val instanceof File) {
        formData.append(key, val);
      } else if (typeof val === 'object' && !(val instanceof File)) {
        // Stringify objects/arrays
        formData.append(key, JSON.stringify(val));
      } else {
        formData.append(key, String(val));
      }
    }
  });

  console.log("🧾 Sending FormData for update:", Array.from(formData.keys()));
  console.log("🧾 Updating user ID:", userId);

  const res = await api.patch(`/users/${userId}`, formData, {
    headers: { 
      "Content-Type": "multipart/form-data",
    },
  });

  return res.data;
};


// 🔹 Delete user
export const deleteUser = async (userId: number) => {
  const res = await api.delete(`/users/${userId}`);
  return res.data;
};
