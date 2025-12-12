"use client";

import { useEffect, useState } from "react";
import { Modal, Input, Select, Upload, Button } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { createUser, updateUser } from "@/Components/services/users";

type User = {
  id?: number;
  name: string;
  email: string;
  role: "admin" | "viewer";
  avatar?: string | null;
  password?: string;
};

export default function UserModal({
  mode,
  user,
  onClose,
  onSuccess,
}: {
  mode: "create" | "view";
  user?: User;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const isEdit = mode === "view";

  const [form, setForm] = useState<User>({
    name: "",
    email: "",
    role: "viewer",
    avatar: null,
    password: "",
  });

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  /* ---------------- PREFILL (EDIT MODE) ---------------- */
  useEffect(() => {
    if (user) {
      setForm({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar || null,
        password: "", // never prefill password
      });
    }
  }, [user]);

  /* ---------------- SUBMIT ---------------- */
  const handleSubmit = async () => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("email", form.email);
      formData.append("role", form.role);

  const organizationId = JSON.parse(localStorage.getItem("user") || "{}")?.organizationId;


if(!isEdit) {
      formData.append("organizationId", String(organizationId));
}
      // 🔐 Password
      if (form.password) {
        formData.append("password", form.password);
      }

      // 🖼 Avatar
      if (avatarFile) {
        formData.append("image", avatarFile);
      }

      if (isEdit && form.id) {
        formData.append("id", String(form.id));
        await updateUser(formData);
      } else {
        await createUser(formData);
      }

      onSuccess();
    } catch (err) {
      console.error("❌ User save failed:", err);
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- UI ---------------- */
  return (
    <Modal
      open
      onCancel={onClose}
      footer={null}
      centered
      width={420}
      className="rounded-xl"
    >
      {/* ================= HEADER ================= */}
      <div className="text-center mb-6">
        <div className="w-16 h-16 mx-auto rounded-full bg-[#2A155A] flex items-center justify-center text-white text-2xl font-bold">
          {form.name ? form.name.charAt(0) : "+"}
        </div>

        <h2 className="mt-4 text-xl font-semibold text-[#232323]">
          {isEdit ? "Edit User" : "Add New User"}
        </h2>

        <p className="text-sm text-gray-500">
          {isEdit
            ? "Update user details"
            : "Create a new user for your organization"}
        </p>
      </div>

      {/* ================= FORM ================= */}
      <div className="space-y-4">
        {/* Name */}
        <Input
          placeholder="Full Name"
          value={form.name}
          onChange={(e) =>
            setForm({ ...form, name: e.target.value })
          }
        />

        {/* Email */}
        <Input
          placeholder="Email Address"
          value={form.email}
          onChange={(e) =>
            setForm({ ...form, email: e.target.value })
          }
          disabled={isEdit}
        />

        {/* Password */}
        <Input.Password
          placeholder={
            isEdit
              ? "New Password (optional)"
              : "Password"
          }
          value={form.password}
          onChange={(e) =>
            setForm({ ...form, password: e.target.value })
          }
        />

        {/* Role */}
        <Select
          value={form.role}
          onChange={(val) =>
            setForm({ ...form, role: val })
          }
          className="w-full"
          options={[
            { label: "Admin", value: "admin" },
            { label: "Viewer", value: "viewer" },
          ]}
        />

        {/* Avatar Upload */}
        <div className="pt-3">
          <Upload
            beforeUpload={(file) => {
              setAvatarFile(file);
              return false;
            }}
            maxCount={1}
          >
            <Button
              icon={<UploadOutlined />}
              className="w-full"
            >
              Upload Avatar
            </Button>
          </Upload>
        </div>
      </div>

      {/* ================= ACTIONS ================= */}
      <div className="mt-6 flex justify-end gap-3">
        <Button onClick={onClose}>Cancel</Button>
        <Button
          loading={loading}
          onClick={handleSubmit}
          className="bg-[#A855F7] text-white border-none"
        >
          {isEdit ? "Update User" : "Create User"}
        </Button>
      </div>
    </Modal>
  );
}
