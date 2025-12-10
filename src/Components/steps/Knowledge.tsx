"use client";
import { useState, useEffect } from "react";
import {
  Tabs,
  Upload,
  Button,
  Input,
  Table,
  Dropdown,
  Tag,
  message,
  Progress,
  Alert,
} from "antd";
import type { MenuProps, UploadFile } from "antd";
import {
  PlusOutlined,
  SearchOutlined,
  MoreOutlined,
  DeleteOutlined,
  EditOutlined,
  CheckOutlined,
  UploadOutlined,
  FileExcelOutlined,
  ReloadOutlined,
  DownloadOutlined,
} from "@ant-design/icons";
import axios from "axios";
import { axiosClient } from "@/utils/axiosClient";

// Use env directly - NEXT_PUBLIC_PYTHON_URL should be base URL (e.g., https://hubaix.world/python)
// The Python routes are /ingest/, /index/, etc. (no /python prefix in routes)
// The reverse proxy at /python should strip /python before forwarding to Python service
let PYTHON_URL = process.env.NEXT_PUBLIC_PYTHON_URL || "http://localhost:8000/python";

console.log("🔍 Raw NEXT_PUBLIC_PYTHON_URL:", process.env.NEXT_PUBLIC_PYTHON_URL);
console.log("🔍 Initial PYTHON_URL:", PYTHON_URL);

// Normalize PYTHON_URL to always end with exactly one /python
// Remove trailing slash if present
PYTHON_URL = PYTHON_URL.replace(/\/$/, '');
console.log("🔍 After removing trailing slash:", PYTHON_URL);

// Remove any existing /python suffix(es) to avoid duplicates
PYTHON_URL = PYTHON_URL.replace(/\/python\/?$/g, '');
console.log("🔍 After removing /python suffix:", PYTHON_URL);

// Ensure it ends with exactly one /python
if (!PYTHON_URL.endsWith('/python')) {
  PYTHON_URL = `${PYTHON_URL}/python`;
}
console.log("🔍 Final normalized PYTHON_URL:", PYTHON_URL);

if (!process.env.NEXT_PUBLIC_PYTHON_URL) {
  console.warn("NEXT_PUBLIC_PYTHON_URL not set, using default:", PYTHON_URL);
} else {
  console.log("✅ PYTHON_URL normalized to:", PYTHON_URL);
}

interface KnowledgeProps {
  organizationId: number;
  agentId?: number;
  agentName?: string;
  indexName?: string;
}

export default function Step3_Knowledge({ 
  organizationId, 
  agentId, 
  agentName,
  indexName: propIndexName 
}: KnowledgeProps) {
  // Generate index name from agent name or use provided one
  const indexName = propIndexName || (agentName ? agentName.toLowerCase().replace(/[^a-z0-9]/g, '-') : `org-${organizationId}`);
  
  // -------------------- Knowledge Base --------------------
  const [files, setFiles] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [indexStats, setIndexStats] = useState<any>(null);
  const [loadingStats, setLoadingStats] = useState(false);

  // Load knowledge files from BE
  const fetchFiles = async () => {
    try {
      const params: any = { organizationId };
      if (agentId) params.agentId = agentId;
      const { data } = await axiosClient.get("/knowledge", { params });
      
      // Transform data to match table expectations
      const transformedFiles = (data || []).map((file: any) => {
        // Parse meta JSON if it's a string
        let meta = file.meta;
        if (typeof meta === 'string') {
          try {
            meta = JSON.parse(meta);
          } catch (e) {
            meta = {};
          }
        }
        
        return {
          ...file,
          key: file.id || file.key, // Add key for table
          recordsProcessed: meta?.recordsProcessed || null, // Extract from meta
          updatedAt: file.updatedAtStr || file.updatedAt, // Map updatedAtStr to updatedAt
        };
      });
      
      console.log("📁 Fetched knowledge files:", transformedFiles);
      setFiles(transformedFiles);
    } catch (e: any) {
      console.error("❌ Could not load knowledge files:", e);
      console.error("Error details:", e.response?.data || e.message);
    }
  };

  const fetchIndexStats = async () => {
    try {
      setLoadingStats(true);
      const statsUrl = `${PYTHON_URL}/index/${indexName}/stats`;
      console.log("Fetching stats from:", statsUrl);
      const response = await axios.get(statsUrl);
      setIndexStats(response.data);
    } catch (error: any) {
      // Index might not exist yet, that's ok
      if (error.response?.status !== 404) {
        console.error("Error fetching index stats:", error);
        console.error("URL was:", `${PYTHON_URL}/index/${indexName}/stats`);
      }
      setIndexStats(null);
    } finally {
      setLoadingStats(false);
    }
  };

  // Fetch index stats when indexName changes
  useEffect(() => {
    fetchIndexStats();
  }, [indexName]);

  // Fetch files when agentId or organizationId changes
  useEffect(() => {
    fetchFiles();
  }, [agentId, organizationId]);

  const handleUpload = async (file: File) => {
    // Validate file type
    const validTypes = [
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ];
    const isValidType = validTypes.includes(file.type) || 
      file.name.endsWith('.csv') || 
      file.name.endsWith('.xlsx') || 
      file.name.endsWith('.xls');

    if (!isValidType) {
      message.error('Please upload a CSV or Excel file (.csv, .xlsx, .xls)');
      return false;
    }

    // Check for duplicate file (same name, organizationId, and agentId)
    const duplicate = files.find(f => 
      f.name === file.name && 
      f.organizationId === organizationId && 
      (f.agentId === agentId || (!f.agentId && !agentId))
    );
    
    if (duplicate) {
      message.error('A file with this name already exists. Please use a different name or delete the existing file first.');
      return false;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      // Step 1: Upload file to Node.js backend first (saves file and returns storageUrl)
      const backendFormData = new FormData();
      backendFormData.append('file', file);
      backendFormData.append('organizationId', organizationId.toString());
      if (agentId) backendFormData.append('agentId', agentId.toString());
      backendFormData.append('name', file.name);
      backendFormData.append('status', 'Processing');

      let fileRecord;
      try {
        const backendResponse = await axiosClient.post("/knowledge", backendFormData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        fileRecord = backendResponse.data;
        console.log("✅ File saved to backend:", fileRecord);
      } catch (e: any) {
        console.error("❌ Could not save file to backend:", e);
        
        // Handle duplicate file error from backend
        if (e.response?.status === 409) {
          message.error(e.response?.data?.message || 'File with this name already exists');
          setUploading(false);
          setUploadProgress(0);
          return false;
        }
        throw new Error('Failed to save file to backend');
      }

      // Step 2: Forward file to Python backend for processing
      const pythonFormData = new FormData();
      pythonFormData.append('file', file);
      pythonFormData.append('clear_existing', 'false');

      const uploadUrl = `${PYTHON_URL}/ingest/${indexName}`;
      console.log("Uploading to Python:", uploadUrl);

      const pythonResponse = await axios.post(
        uploadUrl,
        pythonFormData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          onUploadProgress: (progressEvent) => {
            const percent = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 100));
            setUploadProgress(percent);
          },
        }
      );

      if (pythonResponse.data.success) {
        message.success(`Successfully processed ${pythonResponse.data.records_processed} Q&A records!`);
        
        // Step 3: Update metadata with processing results
        try {
          await axiosClient.patch(`/knowledge/${fileRecord.id}`, {
            status: "Processed",
            meta: { recordsProcessed: pythonResponse.data.records_processed, namespace: indexName },
          });
          console.log("✅ Knowledge metadata updated with processing results");
        } catch (e: any) {
          console.error("❌ Could not update knowledge metadata:", e);
          // Don't fail the upload if metadata update fails
        }

        // Refresh list
        fetchFiles();

        // Refresh index stats
        fetchIndexStats();
      } else {
        message.error(pythonResponse.data.message || 'Upload failed');
        // Update status to Failed if processing failed
        try {
          await axiosClient.patch(`/knowledge/${fileRecord.id}`, {
            status: "Failed",
          });
        } catch (e) {
          console.error("Could not update status to Failed:", e);
        }
      }
    } catch (error: any) {
      console.error('Upload error:', error);
      const errorMsg = error.response?.data?.detail || error.message || 'Failed to upload file';
      message.error(errorMsg);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }

    return false; // Prevent default upload behavior
  };

  const handleDelete = async (key: number) => {
    try {
      // Call backend DELETE endpoint
      await axiosClient.delete(`/knowledge/${key}`);
      
      // Remove from local state on success
      setFiles(files.filter((file) => file.key !== key));
      message.success("File removed successfully!");
      
      // Refresh file list to ensure sync
      fetchFiles();
    } catch (error: any) {
      console.error("Delete error:", error);
      const errorMsg = error.response?.data?.message || error.message || "Failed to delete file";
      message.error(errorMsg);
      // Don't remove from list if delete failed
    }
  };

  const handleDownload = async (record: any) => {
    try {
      const fileId = record.key || record.id;
      if (!fileId) {
        message.error("File ID not found");
        return;
      }

      // Check if file has storageUrl
      if (!record.storageUrl) {
        message.error("File is not available for download (no storage URL). This file was processed by Python backend only.");
        return;
      }

      // Download file using axiosClient with blob response type
      const response = await axiosClient.get(`/knowledge/${fileId}/download`, {
        responseType: 'blob',
      });

      // Create blob URL and trigger download
      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = record.name || 'knowledge-file';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      message.success("File downloaded successfully");
    } catch (error: any) {
      console.error("Download error:", error);
      const errorMsg = error.response?.data?.message || error.message || "Failed to download file";
      message.error(errorMsg);
    }
  };

  const handleClearIndex = async () => {
    try {
      await axios.delete(`${PYTHON_URL}/index/${indexName}`);
      message.success("Knowledge base cleared!");
      setIndexStats(null);
      setFiles([]);
    } catch (error: any) {
      message.error("Failed to clear knowledge base");
    }
  };

  const getFileMenuItems = (record: any): MenuProps["items"] => {
    const items: MenuProps["items"] = [];
    
    // Always show download option
    items.push({
      key: "download",
      icon: <DownloadOutlined />,
      label: "Download",
      onClick: () => handleDownload(record),
      disabled: !record.storageUrl, // Disable if no storageUrl
    });
    
    // Add delete option
    items.push({
      key: "delete",
      icon: <DeleteOutlined />,
      label: "Remove",
      danger: true,
      onClick: () => handleDelete(record.key),
    });
    
    return items;
  };

  const fileColumns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (text: string) => (
        <span className="font-medium">
          <FileExcelOutlined className="mr-2 text-green-600" />
          {text}
        </span>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) =>
        status === "Processed" ? (
          <Tag color="green">Processed</Tag>
        ) : status === "Processing" ? (
          <Tag color="blue">Processing...</Tag>
        ) : (
          <Tag color="orange">Pending</Tag>
        ),
    },
    {
      title: "Records",
      dataIndex: "recordsProcessed",
      key: "recordsProcessed",
      render: (count: number) => count ? `${count} Q&A pairs` : '-',
    },
    {
      title: "Last Updated",
      dataIndex: "updatedAt",
      key: "updatedAt",
    },
    {
      title: "",
      key: "actions",
      render: (_: any, record: any) => (
        <Dropdown
          menu={{ items: getFileMenuItems(record) }}
          trigger={["click"]}
        >
          <MoreOutlined className="text-gray-500 cursor-pointer text-lg" />
        </Dropdown>
      ),
    },
  ];

  // -------------------- Unanswered Queries --------------------
  const [queries, setQueries] = useState([
    {
      key: 1,
      question: "What is the refund policy?",
      date: "Jan 4, 2025",
    },
    {
      key: 2,
      question: "Do you offer 24/7 support?",
      date: "Jan 3, 2025",
    },
  ]);

  const handleSolve = (key: number) => {
    setQueries((prev) => prev.filter((q) => q.key !== key));
    message.success("Marked as solved!");
  };

  const queryColumns = [
    {
      title: "Question",
      dataIndex: "question",
      key: "question",
      render: (text: string) => (
        <span className="text-gray-800 font-medium">{text}</span>
      ),
    },
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
    },
    {
      title: "Action",
      key: "action",
      render: (_: any, record: any) => (
        <Button
          type="primary"
          icon={<CheckOutlined />}
          size="small"
          onClick={() => handleSolve(record.key)}
        >
          Mark as Solved
        </Button>
      ),
    },
  ];

  // -------------------- UI --------------------
  return (
    <div className="text-black">
      <h2 className="text-xl font-semibold mb-2">Knowledge Management</h2>
      <p className="text-sm text-gray-500 mb-6">
        Manage your AI’s knowledge base and review unanswered queries.
      </p>

      <Tabs
        defaultActiveKey="1"
        className="bg-white rounded-md p-4"
        items={[
          {
            key: "1",
            label: "Knowledge Base",
            children: (
              <>
                {/* Info Alert */}
                <Alert
                  message="Upload Q&A Knowledge Base"
                  description={
                    <span>
                      Upload a CSV or Excel file with two columns: <strong>question</strong> and <strong>answer</strong>. 
                      The AI will use this knowledge to respond to user queries.
                    </span>
                  }
                  type="info"
                  showIcon
                  className="mb-4"
                />

                {/* Index Stats */}
                {indexStats && (
                  <div className="mb-4 p-3 bg-gray-50 rounded-md flex items-center justify-between">
                    <div>
                      <span className="text-sm text-gray-600">Knowledge Base: </span>
                      <span className="font-medium text-[#5B2ECC]">{indexStats.index_name}</span>
                      <span className="ml-4 text-sm text-gray-600">Vectors: </span>
                      <span className="font-medium">{indexStats.total_vector_count || indexStats.namespace_vector_count || 0}</span>
                    </div>
                    <Button
                      size="small"
                      icon={<ReloadOutlined />}
                      onClick={fetchIndexStats}
                      loading={loadingStats}
                    >
                      Refresh
                    </Button>
                  </div>
                )}

                {/* Upload Area */}
                <div className="mb-4">
                  <Upload.Dragger
                    accept=".csv,.xlsx,.xls"
                    beforeUpload={handleUpload}
                    showUploadList={false}
                    disabled={uploading}
                  >
                    <p className="ant-upload-drag-icon">
                      <UploadOutlined style={{ fontSize: 32, color: '#5B2ECC' }} />
                    </p>
                    <p className="ant-upload-text">
                      Click or drag CSV/Excel file to upload
                    </p>
                    <p className="ant-upload-hint">
                      File should have columns: question, answer
                    </p>
                  </Upload.Dragger>

                  {uploading && (
                    <div className="mt-3">
                      <Progress percent={uploadProgress} status="active" />
                      <p className="text-sm text-gray-500 text-center mt-1">
                        Processing knowledge base...
                      </p>
                    </div>
                  )}
                </div>

                {/* Search */}
                <Input
                  prefix={<SearchOutlined />}
                  placeholder="Search knowledge files..."
                  className="mb-4 w-full h-10"
                />

                {/* Table */}
                <Table
                  columns={fileColumns}
                  dataSource={files}
                  rowKey={(record) => record.id || record.key || record.name}
                  pagination={false}
                  bordered
                  size="middle"
                  locale={{ emptyText: 'No knowledge files uploaded yet' }}
                />

                {/* Clear Index Button */}
                {indexStats && (indexStats.total_vector_count || indexStats.namespace_vector_count || 0) > 0 && (
                  <div className="mt-4 text-right">
                    <Button 
                      danger 
                      icon={<DeleteOutlined />}
                      onClick={() => {
                        if (confirm('Are you sure you want to clear the entire knowledge base?')) {
                          handleClearIndex();
                        }
                      }}
                    >
                      Clear Knowledge Base
                    </Button>
                  </div>
                )}
              </>
            ),
          },
          {
            key: "2",
            label: "Unanswered Queries",
            children: (
              <>
                <Table
                  columns={queryColumns}
                  dataSource={queries}
                  pagination={false}
                  bordered
                  size="middle"
                />
                {queries.length === 0 && (
                  <p className="text-center text-gray-500 mt-4 text-sm">
                    🎉 All queries have been resolved!
                  </p>
                )}
              </>
            ),
          },
        ]}
      />
    </div>
  );
}

