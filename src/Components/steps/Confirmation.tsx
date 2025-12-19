"use client";
import { useState, useEffect } from "react";
import { Card, Input, Select, Button, Modal, message, Upload } from "antd";
import { PlusOutlined, ExclamationCircleOutlined, UploadOutlined } from "@ant-design/icons";
import axios from "axios";
import { createUser, updateUser, deleteUser } from "@/Components/services/users";


const { Option } = Select;

interface Step4Props {
  organizationId: number;
  agentId: number; // ✅ REQUIRED
}


export default function Step4_Confirmation({   organizationId,
  agentId, }: Step4Props) {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<number | null>(null);

  const [formData, setFormData] = useState<any>({
    id: Date.now(),
    name: "",
    email: "",
    password: "",
    role: "viewer",
    active: true,
    image: null,
  });

  // 🟢 Fetch users for this org
useEffect(() => {
  if (!agentId) return;
  fetchUsers();
}, [agentId]);


const fetchUsers = async () => {
  if (!agentId) return;

  try {
    setLoading(true);
    const token = localStorage.getItem("token");

    const res = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/users/${agentId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    setUsers(res.data);
  } catch (err) {
    console.error("Failed to load agent users", err);
    message.error("Failed to load agent users");
  } finally {
    setLoading(false);
  }
};


  // 🟣 Save / Update
const handleSave = async () => {
const fd = new FormData();

fd.append("name", formData.name);
fd.append("email", formData.email);
fd.append("role", formData.role);
fd.append("organizationId", String(organizationId));
fd.append("agentId", String(agentId));
fd.append("expiry", "1d");

// Password only if provided
if (formData.password) {
  fd.append("password", formData.password);
}

// Image only for new or changed
if (formData.image instanceof File) {
  fd.append("image", formData.image);
}

setLoading(true);

if (selectedUser) {
  fd.append("id", String(selectedUser.id));
  await updateUser(fd);
  message.success("User updated successfully!");
} else {
  await createUser(fd);
  message.success("New user added!");
}

try {
    await fetchUsers();

    resetForm();
    fetchUsers();
  } catch (err: any) {
    console.error("❌ User save/update error:", err);
    
    // Provide more detailed error message
    let errorMessage = "Failed to save user";
    if (err?.response?.data?.message) {
      errorMessage = err.response.data.message;
    } else if (err?.response?.data?.error) {
      errorMessage = err.response.data.error;
    } else if (err?.message) {
      errorMessage = err.message;
    }
    
    message.error(errorMessage);
  } finally {
    setLoading(false);
  }
};


  // 🔴 Delete Handlers
  const handleDeleteClick = (userId: number) => {
    setUserToDelete(userId);
    setDeleteModalOpen(true);
  };

  const confirmDeleteUser = async () => {
    if (!userToDelete) return;
    try {
      setLoading(true);
      await deleteUser(userToDelete);
      message.success("User deleted successfully");
      setUsers((prev) => prev.filter((u) => u.id !== userToDelete));
      await fetchUsers();
      resetForm();
    } catch (err) {
      message.error("Failed to delete user");
    } finally {
      setDeleteModalOpen(false);
      setLoading(false);
    }
  };

  const handleSelectUser = (user: any) => {
    setSelectedUser(user);
    setFormData({ 
      ...user, 
      password: "",
      image: user.avatar || user.image || null, // Preserve existing image
      role: user.role?.toLowerCase() || "viewer" // Normalize role
    });
    setIsAdding(true);
  };

  const resetForm = () => {
    setSelectedUser(null);
    setIsAdding(false);
    setFormData({
      id: Date.now(),
      name: "",
      email: "",
      password: "",
      role: "viewer",
      active: true,
      image: null,
    });
  };

  return (
    <div className="text-black relative">
      <h2 className="text-xl font-semibold mb-4">Agent's Users</h2>
      <p className="text-sm text-gray-500 mb-6">
        Manage your agents users, their roles, and access permissions.
      </p>

      {/* 🟢 User Cards */}
<div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">

  {/* USER CARDS */}
  {users.map((user) => (
    <div
      key={user.id}
      onClick={() => handleSelectUser(user)}
      className="
        relative
        bg-[#2A155A]
        rounded-2xl
        p-3
        cursor-pointer
        hover:scale-[1.02]
        transition-all
        shadow-md hover:shadow-lg
      "
    >
      {/* FULL IMAGE CONTAINER */}
      <div className="h-[190px] rounded-xl overflow-hidden">
        {user.avatar ? (
          <img
            src={user.avatar}
            alt={user.name}
            className="h-full w-full object-cover rounded-xl"
          />
        ) : (
          <div className="h-full w-full bg-gray-200 rounded-xl flex items-center justify-center">
            <span className="text-5xl font-bold text-gray-400">
              {user.name?.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
      </div>

      {/* USER DETAILS */}
      <div className="text-center py-4">
        <h3 className="text-white font-semibold text-base">{user.name}</h3>
        <p className="text-gray-300 text-sm">{user.email}</p>
        <p className="text-gray-400 text-xs mt-1 capitalize">
          {user.role}
        </p>
      </div>
    </div>
  ))}

  {/* ADD USER CARD */}
  <div
    onClick={() => {
      setIsAdding(true);
      setSelectedUser(null);
    }}
    className="
      bg-[#2A155A]
      rounded-2xl
      p-3
      cursor-pointer
      hover:scale-[1.02]
      transition-all
      shadow-md hover:shadow-lg
      flex flex-col items-center justify-center
      h-[260px]
    "
  >
    <div className="h-[190px] w-full rounded-xl border-2 border-dashed border-gray-400 flex items-center justify-center">
      <PlusOutlined className="text-white text-3xl" />
    </div>

    <p className="text-white font-medium mt-4 text-sm tracking-wide">
      Add User
    </p>
  </div>
</div>


      {/* 🧾 Add/Edit Form */}
      {isAdding && (
        <div className="mt-8 border-t border-gray-200 pt-6">
          <h3 className="text-lg font-semibold mb-4">
            {selectedUser ? "Edit User" : "Add New User"}
          </h3>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Full Name */}
            <div>
              <label className="block text-sm text-gray-600 mb-1">Full Name</label>
              <Input
                placeholder="Enter full name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm text-gray-600 mb-1">Email Address</label>
              <Input
                placeholder="Enter email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm text-gray-600 mb-1">Password</label>
              <Input.Password
                placeholder="Enter password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>

            {/* Role */}
            <div>
              <label className="block text-sm text-gray-600 mb-1">User Role</label>
              <Select
                placeholder="Select role"
                value={formData.role?.toLowerCase()}
                onChange={(v) => setFormData({ ...formData, role: v })}
                style={{ width: "100%" }}
              >
                <Option value="admin">Admin</Option>
                <Option value="member">Member</Option>
                <Option value="viewer">Viewer</Option>
              </Select>
            </div>

            {/* Upload Image */}
            <div>
              <label className="block text-sm text-gray-600 mb-1">Profile Image</label>
              <Upload
                beforeUpload={() => false}
                maxCount={1}
                onChange={(info) => setFormData({ ...formData, image: info.file })}
              >
                <Button icon={<UploadOutlined />}>Upload User Image</Button>
              </Upload>
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            {selectedUser && (
              <Button danger onClick={() => handleDeleteClick(selectedUser.id)}>
                Delete User
              </Button>
            )}
            <Button onClick={resetForm}>Cancel</Button>
            <Button className="bg-[#5B2ECC] text-white" onClick={handleSave}>
              {selectedUser ? "Update User" : "Save User"}
            </Button>
          </div>
        </div>
      )}

      {/* 🧱 Custom Delete Modal */}
      <Modal
        open={deleteModalOpen}
        onCancel={() => setDeleteModalOpen(false)}
        centered
        footer={null}
      >
        <div className="text-center py-4">
          <ExclamationCircleOutlined className="text-red-500 text-4xl mb-3" />
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            Are you sure you want to delete this user?
          </h3>
          <p className="text-gray-500 mb-6">
            This action cannot be undone. The user will be permanently removed.
          </p>

          <div className="flex justify-center gap-3">
            <Button onClick={() => setDeleteModalOpen(false)}>Cancel</Button>
            <Button danger type="primary" onClick={confirmDeleteUser}>
              Yes, Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
