import { api } from "@/Components/lib/api";

// 🔹 Fetch all users under an organization
export const getUsersByOrganization = async (organizationId: number) => {
  const res = await api.get(`/users/organization/${organizationId}`);
  return res.data.users;
};

// 🔹 Create user
export const createUser = async (formData: FormData) => {
  console.log("📤 Sending FormData keys:", Array.from(formData.keys()));

  const res = await api.post("/users/add", formData);
  return res.data;
};



// 🔹 Update user
export const updateUser = async (formData: FormData) => {
  const userId = formData.get("id");

  if (!userId) {
    throw new Error("userId is required for updateUser()");
  }

  // Remove id from body (it should go in URL)
  formData.delete("id");

  console.log("🧾 Updating user ID:", userId);
  console.log("🧾 Sending FormData keys:", Array.from(formData.keys()));

  const res = await api.patch(`/users/${userId}`, formData);
  return res.data;
};



// 🔹 Delete user
export const deleteUser = async (userId: number) => {
  console.log("🗑️ Deleting user with ID:", userId);
  const res = await api.delete(`/users/${userId}`);
  return res.data;
};
