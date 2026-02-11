'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  getAllProviders,
  createProvider,
  updateProvider,
  deleteProvider,
  getImageUrl,
  uploadFile,
} from '@operator/shared/api';
import type { Provider, ProvidersListResponse } from '@operator/shared/types';

export default function ProvidersPage() {
  const [mounted, setMounted] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingProvider, setEditingProvider] = useState<Provider | null>(null);
  const [formData, setFormData] = useState<Partial<Provider>>({
    providerID: '',
    name: '',
    logo: '',
  });
  const [uploadingLogo, setUploadingLogo] = useState(false);

  useEffect(() => {
    setMounted(true);
    checkAdminAccess();
  }, []);

  useEffect(() => {
    if (mounted && isAuthorized) {
      fetchProviders();
    }
  }, [mounted, isAuthorized]);

  const checkAdminAccess = () => {
    const userDataStr = localStorage.getItem('userData');
    if (!userDataStr) {
      setIsAuthorized(false);
      return;
    }

    try {
      const userData = JSON.parse(userDataStr);
      if (userData.userType === 'ADMIN') {
        setIsAuthorized(true);
      } else {
        setIsAuthorized(false);
      }
    } catch {
      setIsAuthorized(false);
    }
  };

  const fetchProviders = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getAllProviders();
      if (response.code === 200) {
        setProviders(response.data.providers || []);
      } else {
        setError('Failed to fetch providers');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch providers');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    const authToken = localStorage.getItem('authToken');
    if (!authToken) {
      setError('No authentication token found');
      return;
    }

    if (!formData.providerID || !formData.name) {
      setError('Provider ID and Name are required');
      return;
    }

    try {
      setError(null);
      await createProvider(authToken, {
        providerID: formData.providerID,
        name: formData.name,
        logo: formData.logo,
      });
      setShowCreateModal(false);
      resetForm();
      fetchProviders();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create provider');
    }
  };

  const handleUpdate = async () => {
    if (!editingProvider || !editingProvider.providerID) return;
    const authToken = localStorage.getItem('authToken');
    if (!authToken) {
      setError('No authentication token found');
      return;
    }

    try {
      setError(null);
      await updateProvider(authToken, editingProvider.providerID, {
        name: formData.name,
        logo: formData.logo,
      });
      setEditingProvider(null);
      resetForm();
      fetchProviders();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update provider');
    }
  };

  const handleDelete = async (providerID: string) => {
    if (!confirm('Are you sure you want to delete this provider?')) return;
    const authToken = localStorage.getItem('authToken');
    if (!authToken) {
      setError('No authentication token found');
      return;
    }

    try {
      setError(null);
      await deleteProvider(authToken, providerID);
      fetchProviders();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete provider');
    }
  };

  const resetForm = () => {
    setFormData({
      providerID: '',
      name: '',
      logo: '',
    });
  };

  const openEditModal = (provider: Provider) => {
    setEditingProvider(provider);
    setFormData({
      name: provider.name,
      logo: provider.logo || '',
    });
  };

  const handleFileUpload = async (file: File): Promise<void> => {
    const authToken = localStorage.getItem('authToken');
    if (!authToken) {
      setError('No authentication token found');
      return;
    }

    // Validate file size (10MB = 10 * 1024 * 1024 bytes)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      setError(`File size exceeds 10MB limit. Current size: ${(file.size / 1024 / 1024).toFixed(2)}MB`);
      return;
    }

    // Validate file type (images only)
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    try {
      setUploadingLogo(true);
      setError(null);

      const response = await uploadFile(authToken, file);
      if (response.code === 200) {
        setFormData({
          ...formData,
          logo: response.data.url,
        });
      } else {
        setError('Failed to upload file');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload file');
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleLogoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (isAuthorized === false) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-black flex items-center justify-center">
        <div className="text-center p-8 max-w-md">
          <div className="text-red-500 text-6xl mb-4">🚫</div>
          <h1 className="text-3xl font-bold text-black dark:text-white mb-4">
            Access Denied
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            You do not have ADMIN privileges to access this page.
          </p>
          <Link
            href="/"
            className="inline-block px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  if (isAuthorized === null) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Checking permissions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-black dark:text-white mb-2">
              Providers Management
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Create, update, and manage game providers
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => {
                resetForm();
                setEditingProvider(null);
                setShowCreateModal(true);
              }}
              className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
            >
              Create Provider
            </button>
            <Link
              href="/"
              className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-100 dark:bg-red-900/20 border border-red-400 dark:border-red-800 rounded-lg">
            <p className="text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-md overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Loading providers...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-zinc-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Logo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Provider ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Created At
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-zinc-900 divide-y divide-gray-200 dark:divide-zinc-800">
                  {providers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                        No providers found
                      </td>
                    </tr>
                  ) : (
                    providers.map((provider) => (
                      <tr key={provider.providerID} className="hover:bg-gray-50 dark:hover:bg-zinc-800">
                        <td className="px-6 py-4">
                          {provider.logo ? (
                            <img
                              src={getImageUrl(provider.logo)}
                              alt={`${provider.name} logo`}
                              className="w-16 h-16 object-contain rounded-lg bg-gray-100 dark:bg-zinc-800 p-1"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64"%3E%3Crect width="64" height="64" fill="%23e5e7eb"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%239ca3af" font-size="10"%3ENo Logo%3C/text%3E%3C/svg%3E';
                              }}
                            />
                          ) : (
                            <div className="w-16 h-16 bg-gray-100 dark:bg-zinc-800 rounded-lg flex items-center justify-center">
                              <span className="text-xs text-gray-400">No Logo</span>
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900 dark:text-gray-100">
                          {provider.providerID}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                          {provider.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {formatDate(provider.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex gap-2">
                            <button
                              onClick={() => openEditModal(provider)}
                              className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(provider.providerID)}
                              className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Create/Edit Modal */}
        {(showCreateModal || editingProvider) && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <h2 className="text-2xl font-bold text-black dark:text-white mb-4">
                  {editingProvider ? 'Edit Provider' : 'Create New Provider'}
                </h2>
                <div className="space-y-4">
                  {!editingProvider && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Provider ID *
                      </label>
                      <input
                        type="text"
                        value={formData.providerID}
                        onChange={(e) => setFormData({ ...formData, providerID: e.target.value.toUpperCase() })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-black dark:text-white"
                        placeholder="SPRIBE"
                      />
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Name *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-black dark:text-white"
                      placeholder="Spribe"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Logo Image (Max 10MB)
                    </label>
                    <div className="space-y-2">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoFileChange}
                        disabled={uploadingLogo}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-black dark:text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900/20 dark:file:text-blue-300"
                      />
                      {uploadingLogo && (
                        <div className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                          Uploading...
                        </div>
                      )}
                      {formData.logo && !uploadingLogo && (
                        <div className="mt-2">
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Uploaded URL:</p>
                          <input
                            type="text"
                            value={formData.logo}
                            readOnly
                            className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-lg bg-gray-50 dark:bg-zinc-800 text-black dark:text-white text-sm"
                          />
                          {formData.logo && (
                            <img
                              src={getImageUrl(formData.logo)}
                              alt="Logo preview"
                              className="mt-2 max-w-xs max-h-32 object-contain rounded"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                              }}
                            />
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="mt-6 flex gap-3 justify-end">
                  <button
                    onClick={() => {
                      setShowCreateModal(false);
                      setEditingProvider(null);
                      resetForm();
                    }}
                    className="px-4 py-2 bg-gray-200 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-zinc-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={editingProvider ? handleUpdate : handleCreate}
                    className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                  >
                    {editingProvider ? 'Update' : 'Create'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
