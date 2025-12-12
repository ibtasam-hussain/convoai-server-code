import { api } from "@/Components/lib/api";


// 🔹 Type definition
export interface OrganizationPayload {
  name: string;
  email: string;
  region?: string;
  language?: string;
  twoStepVerification?: boolean;
  password?: string | null;
  logo?: string | null;
  bio?: string | null;
  website_url?: string | null;
  sms_number?: string | null;
  instagram_handle?: string | null;
  messenger_username?: string | null;
  whatsapp_number?: string | null;
}

// ✅ CREATE
export async function createOrganization(data: any, token?: string) {
  console.log(data, "token");

  const formData = new FormData();

  // 🧱 append all fields (including strings like prompt)
  for (const key in data) {
    if (data[key] !== undefined && data[key] !== null) {
      formData.append(key, data[key]);
    }
  }

  // 🧩 send multipart/form-data to backend
  const res = await api.post("/organizations", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  });

  console.log(res.data);
  return res.data;
}


// ✅ READ (list all)
export async function listOrganizations(token?: string) {
  const res = await api.get("/organizations", {
  });
  return res.data;
}

// ✅ READ (single)
export async function getOrganization(id: number, token?: string) {
  const res = await api.get(`/organizations/organization/${id}`, {
  });
  return res.data;
}

// ✅ UPDATE
export async function updateOrganization(id: number, data: any, token?: string) {
  const formData = new FormData();

  for (const key in data) {
    if (data[key] !== undefined && data[key] !== null) {
      formData.append(key, data[key]);
    }
  }

  const res = await api.patch(`/organizations/${id}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  });

  return res.data;
}


// ✅ DELETE
export async function deleteOrganization(id: number, token?: string) {
  const res = await api.delete(`/organizations/${id}`, {
  });
  return res.data;
}
