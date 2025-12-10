"use client";
import { Input, Select, Upload, Button } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { useEffect } from "react";

const { TextArea } = Input;
const { Option } = Select;

interface Step1Props {
  formData: any;
  setFormData: (data: any) => void;
}

export default function Step1_Account({ formData, setFormData }: Step1Props) {
  const handleChange = (key: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [key]: value }));
  };

  useEffect(() => {
    // optional: initialize defaults if needed
    if (!formData.region) handleChange("region", "Asia/Karachi");
    if (!formData.language) handleChange("language", "English");
  }, []);

  return (
    <div className="text-black">
      <h2 className="text-xl font-semibold mb-4">Organization Information</h2>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Organization Name */}
        <div>
          <label className="block mb-1 text-sm text-gray-600">
            Organization Name
          </label>
          <Input
            placeholder="Enter organization name"
            value={formData.name || ""}
            onChange={(e) => handleChange("name", e.target.value)}
          />
        </div>

        {/* Industry */}
        <div>
          <label className="block mb-1 text-sm text-gray-600">Industry</label>
          <Select
            placeholder="Select industry"
            value={formData.industry || undefined}
            onChange={(value) => handleChange("industry", value)}
            className="w-full"
          >
            <Option value="Technology">Technology</Option>
            <Option value="Healthcare">Healthcare</Option>
            <Option value="Finance">Finance</Option>
            <Option value="Education">Education</Option>
            <Option value="E-commerce">E-commerce</Option>
            <Option value="Other">Other</Option>
          </Select>
        </div>

        {/* About / Description */}
        <div className="col-span-2">
          <label className="block mb-1 text-sm text-gray-600">About</label>
          <TextArea
            rows={4}
            placeholder="Write a short description about your organization..."
            value={formData.bio || ""}
            onChange={(e) => handleChange("bio", e.target.value)}
          />
        </div>

        {/* Website */}
        <div>
          <label className="block mb-1 text-sm text-gray-600">Website</label>
          <Input
            placeholder="https://example.com"
            value={formData.website_url || ""}
            onChange={(e) => handleChange("website_url", e.target.value)}
          />
        </div>

        {/* City */}
        <div>
          <label className="block mb-1 text-sm text-gray-600">City</label>
          <Input
            placeholder="Enter city"
            value={formData.city || ""}
            onChange={(e) => handleChange("city", e.target.value)}
          />
        </div>

        {/* Support Email */}
        <div>
          <label className="block mb-1 text-sm text-gray-600">
            Support Email
          </label>
          <Input
            type="email"
            placeholder="support@example.com"
            value={formData.email || ""}
            onChange={(e) => handleChange("email", e.target.value)}
          />
        </div>

        {/* Support Phone */}
        <div>
          <label className="block mb-1 text-sm text-gray-600">
            Support Phone
          </label>
          <Input
            placeholder="+1 (555) 123-4567"
            value={formData.sms_number || ""}
            onChange={(e) => handleChange("sms_number", e.target.value)}
          />
        </div>

        {/* Logo Upload */}
        <div className="col-span-2">
          <label className="block mb-1 text-sm text-gray-600">
            Organization Logo
          </label>
<Upload
  beforeUpload={() => false}
  maxCount={1}
  onChange={(info) => {
    const file = info.fileList[0]?.originFileObj; // ✅ safest
    console.log("Selected logo file:", file);
    handleChange("logo", file);
  }}
>
  <Button icon={<UploadOutlined />}>Upload Logo</Button>
</Upload>


        </div>
      </div>
    </div>
  );
}
