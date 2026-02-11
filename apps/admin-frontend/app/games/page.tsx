'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  getGamesList,
  createGame,
  updateGame,
  deleteGame,
  uploadFile,
  getImageUrl,
  getAllProviders,
  type Game,
} from '@operator/shared/api';
import type { GamesListResponse, Provider } from '@operator/shared/types';

export default function GamesPage() {
  const [mounted, setMounted] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingGame, setEditingGame] = useState<Game | null>(null);
  const [formData, setFormData] = useState<Partial<Game>>({
    gameID: '',
    name: '',
    poster: '',
    logo: '',
    currency: 'USDC',
    minBet: 1,
    maxBet: 1000,
    provider: '',
    category: '',
    isActive: true,
  });
  const [uploadingPoster, setUploadingPoster] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [providerSearchQuery, setProviderSearchQuery] = useState('');
  const [isProviderDropdownOpen, setIsProviderDropdownOpen] = useState(false);
  const [loadingProviders, setLoadingProviders] = useState(false);

  useEffect(() => {
    setMounted(true);
    checkAdminAccess();
  }, []);

  useEffect(() => {
    if (mounted && isAuthorized) {
      fetchGames();
    }
  }, [mounted, isAuthorized, page]);

  useEffect(() => {
    if (showCreateModal || editingGame) {
      fetchProviders();
    } else {
      setIsProviderDropdownOpen(false);
      setProviderSearchQuery('');
    }
  }, [showCreateModal, editingGame]);

  useEffect(() => {
    if (editingGame && providers.length > 0 && formData.provider) {
      const selectedProvider = providers.find((p) => p.providerID === formData.provider);
      if (selectedProvider && providerSearchQuery !== selectedProvider.name) {
        setProviderSearchQuery(selectedProvider.name);
      }
    }
  }, [providers, editingGame, formData.provider]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.provider-dropdown-container')) {
        setIsProviderDropdownOpen(false);
      }
    };

    if (isProviderDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isProviderDropdownOpen]);

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

  const fetchGames = async () => {
    const authToken = localStorage.getItem('authToken');
    if (!authToken) {
      setError('No authentication token found');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await getGamesList(authToken, page, limit);
      if (response.code === 200 || response.data) {
        const gamesList = response.data?.games || response.games || [];
        setGames(gamesList);
        if (response.data) {
          setTotal(response.data.total);
          setTotalPages(response.data.totalPages);
        }
      } else {
        setError('Failed to fetch games');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch games');
    } finally {
      setLoading(false);
    }
  };

  const fetchProviders = async () => {
    try {
      setLoadingProviders(true);
      const response = await getAllProviders();
      if (response.code === 200) {
        setProviders(response.data.providers || []);
      }
    } catch (err) {
      console.error('Failed to fetch providers:', err);
    } finally {
      setLoadingProviders(false);
    }
  };

  const handleCreate = async () => {
    const authToken = localStorage.getItem('authToken');
    if (!authToken) {
      setError('No authentication token found');
      return;
    }

    try {
      setError(null);
      await createGame(authToken, formData as Omit<Game, 'id' | 'createdAt' | 'updatedAt'>);
      setShowCreateModal(false);
      resetForm();
      fetchGames();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create game');
    }
  };

  const handleUpdate = async () => {
    if (!editingGame) return;
    const authToken = localStorage.getItem('authToken');
    if (!authToken) {
      setError('No authentication token found');
      return;
    }

    try {
      setError(null);
      await updateGame(authToken, editingGame.gameID, formData);
      setEditingGame(null);
      resetForm();
      fetchGames();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update game');
    }
  };

  const handleDelete = async (gameID: string) => {
    if (!confirm('Are you sure you want to delete this game?')) return;
    const authToken = localStorage.getItem('authToken');
    if (!authToken) {
      setError('No authentication token found');
      return;
    }

    try {
      setError(null);
      await deleteGame(authToken, gameID);
      fetchGames();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete game');
    }
  };

  const resetForm = () => {
    setFormData({
      gameID: '',
      name: '',
      poster: '',
      logo: '',
      currency: 'USDC',
      minBet: 1,
      maxBet: 1000,
      provider: '',
      category: '',
      isActive: true,
    });
    setProviderSearchQuery('');
    setIsProviderDropdownOpen(false);
  };

  const handleProviderSelect = (provider: Provider) => {
    setFormData({ ...formData, provider: provider.providerID });
    setProviderSearchQuery(provider.name);
    setIsProviderDropdownOpen(false);
  };

  const filteredProviders = providers.filter(
    (provider) =>
      provider.name.toLowerCase().includes(providerSearchQuery.toLowerCase()) ||
      provider.providerID.toLowerCase().includes(providerSearchQuery.toLowerCase())
  );

  const openEditModal = (game: Game) => {
    setEditingGame(game);
    setFormData({
      name: game.name,
      poster: game.poster,
      logo: game.logo,
      currency: game.currency,
      minBet: game.minBet,
      maxBet: game.maxBet,
      provider: game.provider,
      category: game.category,
      isActive: game.isActive,
    });
    // Provider search query will be set by useEffect when providers load
    setProviderSearchQuery(game.provider);
  };

  const handleFileUpload = async (
    file: File,
    type: 'poster' | 'logo'
  ): Promise<void> => {
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
      if (type === 'poster') {
        setUploadingPoster(true);
      } else {
        setUploadingLogo(true);
      }
      setError(null);

      const response = await uploadFile(authToken, file);
      if (response.code === 200) {
        setFormData({
          ...formData,
          [type]: response.data.url,
        });
      } else {
        setError('Failed to upload file');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload file');
    } finally {
      if (type === 'poster') {
        setUploadingPoster(false);
      } else {
        setUploadingLogo(false);
      }
    }
  };

  const handlePosterFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file, 'poster');
    }
  };

  const handleLogoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file, 'logo');
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
              Games Management
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Create, update, and manage games
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => {
                resetForm();
                setEditingGame(null);
                setShowCreateModal(true);
              }}
              className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
            >
              Create Game
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
              <p className="text-gray-600 dark:text-gray-400">Loading games...</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-zinc-800">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Logo
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Poster
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Game ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Provider
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Category
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Bet Range
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-zinc-900 divide-y divide-gray-200 dark:divide-zinc-800">
                    {games.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                          No games found
                        </td>
                      </tr>
                    ) : (
                      games.map((game) => (
                        <tr key={game.id || game.gameID} className="hover:bg-gray-50 dark:hover:bg-zinc-800">
                          <td className="px-6 py-4">
                            {game.logo ? (
                              <img
                                src={getImageUrl(game.logo)}
                                alt={`${game.name} logo`}
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
                          <td className="px-6 py-4">
                            {game.poster ? (
                              <img
                                src={getImageUrl(game.poster)}
                                alt={`${game.name} poster`}
                                className="w-24 h-16 object-cover rounded-lg bg-gray-100 dark:bg-zinc-800"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="96" height="64" viewBox="0 0 96 64"%3E%3Crect width="96" height="64" fill="%23e5e7eb"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%239ca3af" font-size="10"%3ENo Poster%3C/text%3E%3C/svg%3E';
                                }}
                              />
                            ) : (
                              <div className="w-24 h-16 bg-gray-100 dark:bg-zinc-800 rounded-lg flex items-center justify-center">
                                <span className="text-xs text-gray-400">No Poster</span>
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900 dark:text-gray-100">
                            {game.gameID}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                            {game.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                            {game.provider}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                            {game.category}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                            {game.minBet} - {game.maxBet} {game.currency}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                game.isActive
                                  ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                                  : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                              }`}
                            >
                              {game.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex gap-2">
                              <button
                                onClick={() => openEditModal(game)}
                                className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDelete(game.gameID)}
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

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="px-6 py-4 border-t border-gray-200 dark:border-zinc-800 flex items-center justify-between">
                  <div className="text-sm text-gray-700 dark:text-gray-300">
                    Showing {(page - 1) * limit + 1} to {Math.min(page * limit, total)} of {total} games
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="px-4 py-2 bg-gray-200 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="px-4 py-2 bg-gray-200 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Create/Edit Modal */}
        {(showCreateModal || editingGame) && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <h2 className="text-2xl font-bold text-black dark:text-white mb-4">
                  {editingGame ? 'Edit Game' : 'Create New Game'}
                </h2>
                <div className="space-y-4">
                  {!editingGame && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Game ID *
                      </label>
                      <input
                        type="text"
                        value={formData.gameID}
                        onChange={(e) => setFormData({ ...formData, gameID: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-black dark:text-white"
                        placeholder="aviator-001"
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
                      placeholder="Aviator"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Poster Image * (Max 10MB)
                    </label>
                    <div className="space-y-2">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePosterFileChange}
                        disabled={uploadingPoster}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-black dark:text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900/20 dark:file:text-blue-300"
                      />
                      {uploadingPoster && (
                        <div className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                          Uploading...
                        </div>
                      )}
                      {formData.poster && !uploadingPoster && (
                        <div className="mt-2">
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Uploaded URL:</p>
                          <input
                            type="text"
                            value={formData.poster}
                            readOnly
                            className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-lg bg-gray-50 dark:bg-zinc-800 text-black dark:text-white text-sm"
                          />
                          {formData.poster && (
                            <img
                              src={getImageUrl(formData.poster)}
                              alt="Poster preview"
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
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Logo Image * (Max 10MB)
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
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Currency *
                      </label>
                      <input
                        type="text"
                        value={formData.currency}
                        onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-black dark:text-white"
                        placeholder="USDC"
                      />
                    </div>
                    <div className="relative">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Provider *
                      </label>
                      <div className="relative provider-dropdown-container">
                        <input
                          type="text"
                          value={providerSearchQuery || formData.provider}
                          onChange={(e) => {
                            setProviderSearchQuery(e.target.value);
                            setIsProviderDropdownOpen(true);
                            if (!e.target.value) {
                              setFormData({ ...formData, provider: '' });
                            }
                          }}
                          onFocus={() => setIsProviderDropdownOpen(true)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-black dark:text-white"
                          placeholder="Search provider..."
                        />
                        {isProviderDropdownOpen && (
                          <div className="absolute z-10 w-full mt-1 bg-white dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-lg shadow-lg max-h-60 overflow-auto">
                            {loadingProviders ? (
                              <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500 mx-auto mb-2"></div>
                                Loading providers...
                              </div>
                            ) : filteredProviders.length === 0 ? (
                              <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                                No providers found
                              </div>
                            ) : (
                              filteredProviders.map((provider) => (
                                <button
                                  key={provider.providerID}
                                  type="button"
                                  onClick={() => handleProviderSelect(provider)}
                                  className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-zinc-700 flex items-center gap-3"
                                >
                                  {provider.logo && (
                                    <img
                                      src={getImageUrl(provider.logo)}
                                      alt={provider.name}
                                      className="w-8 h-8 object-contain rounded"
                                      onError={(e) => {
                                        (e.target as HTMLImageElement).style.display = 'none';
                                      }}
                                    />
                                  )}
                                  <div className="flex-1">
                                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                      {provider.name}
                                    </div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                                      {provider.providerID}
                                    </div>
                                  </div>
                                </button>
                              ))
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Min Bet *
                      </label>
                      <input
                        type="number"
                        value={formData.minBet}
                        onChange={(e) => setFormData({ ...formData, minBet: Number(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-black dark:text-white"
                        min="0"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Max Bet *
                      </label>
                      <input
                        type="number"
                        value={formData.maxBet}
                        onChange={(e) => setFormData({ ...formData, maxBet: Number(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-black dark:text-white"
                        min="0"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Category *
                    </label>
                    <input
                      type="text"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-black dark:text-white"
                      placeholder="Crash"
                    />
                  </div>
                  <div>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.isActive}
                        onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                        className="w-4 h-4"
                      />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Active
                      </span>
                    </label>
                  </div>
                </div>
                <div className="mt-6 flex gap-3 justify-end">
                  <button
                    onClick={() => {
                      setShowCreateModal(false);
                      setEditingGame(null);
                      resetForm();
                    }}
                    className="px-4 py-2 bg-gray-200 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-zinc-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={editingGame ? handleUpdate : handleCreate}
                    className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                  >
                    {editingGame ? 'Update' : 'Create'}
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

