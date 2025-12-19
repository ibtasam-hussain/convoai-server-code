"use client";
import "@ant-design/v5-patch-for-react-19"; // Fix antd v5 compatibility with React 19
import { useEffect, useState } from "react";
import axios from "axios";
import { Card, Button, message, Spin, Popconfirm } from "antd";
import { PlusOutlined, DeleteOutlined, EditOutlined } from "@ant-design/icons";
import Step1_Account from "@/Components/steps/Account";
import { useRouter } from "next/navigation";
import { useRef } from "react";

type Org = {
  id: number;
  name: string;
  email: string;
  region: string;
  language: string;
  industry?: string;
  logo?: string;
  bio?: string;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function OrganizationsPage() {
  const router = useRouter();
  const [organizations, setOrganizations] = useState<Org[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [editingOrg, setEditingOrg] = useState<Org | null>(null);
  const formRef = useRef<HTMLDivElement | null>(null);

  // 🟢 Axios instance with token
  const api = axios.create({
    baseURL: API_URL,
    headers: {
      Authorization: `Bearer ${
        typeof window !== "undefined" ? localStorage.getItem("token") : ""
      }`,
    },
  });
  useEffect(() => {
    if (showForm && formRef.current) {
      formRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [showForm]);

  // 🟢 Fetch all organizations
  const fetchOrganizations = async () => {
    try {
      setLoading(true);
      const res = await api.get("/organizations");
      const data = res.data;

      if (Array.isArray(data)) {
        setOrganizations(data);
      } else if (Array.isArray(data.organizations)) {
        setOrganizations(data.organizations);
      } else {
        setOrganizations([]);
        console.warn("Unexpected response:", data);
      }
    } catch (err: any) {
      console.error(err);
      message.error("Failed to load organizations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrganizations();
  }, []);

  // 🟡 Create / Update Organization
  // 🟡 Create / Update Organization
  const handleSave = async () => {
    if (!formData.name || !formData.email) {
      message.warning("Please enter organization name and email!");
      return;
    }

    const form = new FormData();
    for (const key in formData) {
      if (formData[key] !== undefined && formData[key] !== null) {
        form.append(key, formData[key]);
      }
    }

    setLoading(true);
    try {
      let orgId;

      if (editingOrg) {
        const res = await api.patch(`/organizations/${editingOrg.id}`, form);
        orgId = editingOrg.id;
        message.success("✅ Organization updated successfully!");
      } else {
        const res = await api.post(`/organizations`, form);
        message.success("🎉 Organization added successfully!");
        orgId = res.data?.id || res.data?.organization?.id;
      }

      // Show loader before redirect
      message.loading("Redirecting to organization page...", 1);

      // Wait 1 second to display loader, then navigate
      setTimeout(() => {
        router.push(`/admin/organizations/${orgId}`);
      }, 1000);

      // Reset form
      setFormData({});
      setShowForm(false);
      setEditingOrg(null);
    } catch (err: any) {
      console.error(err);
      message.error(err.response?.data?.message || "Error saving organization");
    } finally {
      setLoading(false);
    }
  };

  // 🔴 Delete Organization
  const handleDelete = async (id: number) => {
    try {
      setLoading(true);
      await api.delete(`/organizations/${id}`);
      message.success("🗑️ Organization deleted successfully!");
      setOrganizations((prev) => prev.filter((o) => o.id !== id));
    } catch (err: any) {
      console.error(err);
      message.error(
        err.response?.data?.message || "Error deleting organization"
      );
    } finally {
      setLoading(false);
    }
  };

  // ✏️ Edit Organization
  const handleEdit = (org: Org) => {
    setEditingOrg(org);
    setFormData(org);
    setShowForm(true);
  };

  // 🎨 Helper to get first letter
  const getInitial = (name?: string) => {
    if (!name) return "O";
    return name.charAt(0).toUpperCase();
  };

  return (
    <main className="min-h-screen bg-[#F6F7FB] py-12 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header with Add Button */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-[#232323]">Organizations</h1>
          <Button
            type="primary"
            style={{
              backgroundColor: "#2A155A",
              borderColor: "#2A155A",
              fontWeight: 500,
            }}
            icon={<PlusOutlined />}
            onClick={() => {
              setShowForm(true);
              setEditingOrg(null);
              setFormData({});
            }}
          >
            Add Organization
          </Button>
        </div>

        {/* Listing */}
        {loading && organizations.length === 0 ? (
          <div className="flex justify-center mt-16">
            <Spin size="large" />
          </div>
        ) : Array.isArray(organizations) && organizations.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {organizations.map((org) => (
              <div
                key={org.id}
                onClick={() => router.push(`/admin/organizations/${org.id}`)}
                className="
      relative
      bg-[#2A155A]
      rounded-2xl
      p-3
      cursor-pointer
      hover:scale-[1.02]
      transition-all
      shadow-md hover:shadow-lg
      min-h-[360px]   /* 🔥 CARD HEIGHT INCREASED */
    "
              >
                {/* Edit/Delete buttons */}
                <div className="absolute top-5 right-5 flex gap-3 z-20">
                  <EditOutlined
                    className="
          text-white bg-black/40 
          p-2 rounded-full 
          hover:bg-black/60 
          transition text-base
        "
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEdit(org);
                    }}
                  />

                  <Popconfirm
                    title="Delete this organization?"
                    okText="Yes"
                    cancelText="No"
                    onConfirm={(e) => {
                      e?.stopPropagation();
                      handleDelete(org.id);
                    }}
                  >
                    <DeleteOutlined
                      className="
            text-white bg-black/40 
            p-2 rounded-full 
            hover:bg-black/60 
            transition text-base
          "
                      onClick={(e) => e.stopPropagation()}
                    />
                  </Popconfirm>
                </div>

                {/* FULL IMAGE WITH NO WHITE BACKGROUND */}
                <div
                  className="
        h-[320px]              /* 🔥 larger height */
        rounded-xl
        overflow-hidden        /* 🔥 image stays inside */
      "
                >
                  {org.logo ? (
                    <img
                      src={org.logo}
                      alt={org.name}
                      className="
            h-full w-full 
            object-cover       /* 🔥 FULL IMAGE FILL */
            rounded-xl
          "
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center bg-gray-100 rounded-xl">
                      <span className="text-5xl font-bold text-gray-400">
                        {org.name?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>

                {/* Name */}
                <p className="text-center text-white font-semibold py-4 text-base tracking-wide">
                  {org.name}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 mt-6">No organizations found.</p>
        )}

        {/* Inline Form */}
        {showForm && (
          <div
            ref={formRef}
            className="bg-white shadow-md rounded-xl p-6 mt-10 border border-gray-100 transition-all duration-300"
          >
            <h2 className="text-lg font-semibold mb-4 text-[#232323]">
              {editingOrg ? "Edit Organization" : "Add New Organization"}
            </h2>

            <Step1_Account formData={formData} setFormData={setFormData} />

            <div className="flex justify-end mt-6 gap-3">
              <Button onClick={() => setShowForm(false)}>Cancel</Button>
              <Button
                type="primary"
                onClick={handleSave}
                loading={loading}
                style={{
                  backgroundColor: "#6B4EFF",
                  borderColor: "#6B4EFF",
                  fontWeight: 500,
                }}
              >
                {editingOrg ? "Update" : "Save"} Organization
              </Button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
