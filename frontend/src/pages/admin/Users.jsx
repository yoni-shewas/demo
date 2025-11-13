import { useState, useEffect } from 'react';
import { Users as UsersIcon, UserPlus, Download, Edit2, Trash2, Save, X, Upload, Search, Filter, Eye, EyeOff } from 'lucide-react';
import { toast } from 'react-toastify';
import * as adminService from '../../services/adminService';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [importFile, setImportFile] = useState(null);
  const [visiblePasswords, setVisiblePasswords] = useState({});
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'STUDENT',
    firstName: '',
    lastName: '',
  });

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    filterAndSearchUsers();
  }, [users, searchTerm, roleFilter]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await adminService.getAllUsers();
      setUsers(data.users || data || []);
      toast.success('Users loaded successfully');
    } catch (error) {
      console.error('Error loading users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const filterAndSearchUsers = () => {
    let filtered = [...users];

    // Apply role filter
    if (roleFilter !== 'ALL') {
      filtered = filtered.filter((u) => u.role === roleFilter);
    }

    // Apply search
    if (searchTerm) {
      filtered = filtered.filter(
        (u) =>
          u.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          u.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          u.lastName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredUsers(filtered);
    setCurrentPage(1); // Reset to first page when filtering
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      await adminService.createUser(formData);
      toast.success('User created successfully!');
      setShowCreateModal(false);
      setFormData({
        username: '',
        email: '',
        password: '',
        role: 'STUDENT',
        firstName: '',
        lastName: '',
      });
      loadUsers();
    } catch (error) {
      console.error('Error creating user:', error);
      toast.error(error.response?.data?.message || 'Failed to create user');
    }
  };

  const handleUpdateUser = async (userId) => {
    try {
      await adminService.updateUser(userId, editingUser);
      toast.success('User updated successfully!');
      setEditingUser(null);
      loadUsers();
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error(error.response?.data?.message || 'Failed to update user');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!confirm('Are you sure you want to delete this user?')) return;

    try {
      await adminService.deleteUser(userId);
      toast.success('User deleted successfully!');
      loadUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error(error.response?.data?.message || 'Failed to delete user');
    }
  };

  const handleExport = async (type) => {
    try {
      toast.info(`Exporting users as ${type.toUpperCase()}...`);
      if (type === 'csv') {
        await adminService.exportUsersCSV();
      } else if (type === 'sql') {
        await adminService.exportUsersSQL();
      }
      toast.success(`Users exported as ${type.toUpperCase()} successfully!`);
    } catch (error) {
      console.error(`Error exporting ${type}:`, error);
      toast.error(`Failed to export ${type.toUpperCase()}`);
    }
  };

  const handleImportUsers = async (e) => {
    e.preventDefault();
    if (!importFile) {
      toast.error('Please select a file to import');
      return;
    }

    const formData = new FormData();
    formData.append('file', importFile);

    try {
      toast.info('Importing users...');
      const response = await adminService.importUsers(formData);
      toast.success(
        `Successfully imported ${response.imported || response.count || 0} users!`
      );
      setShowImportModal(false);
      setImportFile(null);
      loadUsers();
    } catch (error) {
      console.error('Error importing users:', error);
      toast.error(error.response?.data?.message || 'Failed to import users');
    }
  };

  // Pagination
  const indexOfLastUser = currentPage * itemsPerPage;
  const indexOfFirstUser = indexOfLastUser - itemsPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Loading users...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-sm text-gray-600 mt-1">
            Manage all users in the system ({filteredUsers.length} total)
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowImportModal(true)}
            className="flex items-center space-x-2 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Upload className="h-4 w-4" />
            <span>Import Users</span>
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center space-x-2 bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
          >
            <UserPlus className="h-4 w-4" />
            <span>Add User</span>
          </button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, username, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
              />
            </div>
          </div>

          {/* Role Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
            >
              <option value="ALL">All Roles</option>
              <option value="STUDENT">Students</option>
              <option value="INSTRUCTOR">Instructors</option>
              <option value="ADMIN">Admins</option>
            </select>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-4 gap-4 mt-4 pt-4 border-t border-gray-200">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">{filteredUsers.length}</p>
            <p className="text-xs text-gray-600">Total</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">
              {users.filter((u) => u.role === 'STUDENT').length}
            </p>
            <p className="text-xs text-gray-600">Students</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">
              {users.filter((u) => u.role === 'INSTRUCTOR').length}
            </p>
            <p className="text-xs text-gray-600">Instructors</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-red-600">
              {users.filter((u) => u.role === 'ADMIN').length}
            </p>
            <p className="text-xs text-gray-600">Admins</p>
          </div>
        </div>
      </div>

      {/* Export Options */}
      <div className="flex items-center justify-between bg-white rounded-lg border border-gray-200 p-4">
        <div className="text-sm text-gray-600">Export user data</div>
        <div className="flex space-x-3">
          <button
            onClick={() => handleExport('csv')}
            className="flex items-center space-x-2 border border-gray-300 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors text-sm"
          >
            <Download className="h-3 w-3" />
            <span>CSV</span>
          </button>
          <button
            onClick={() => handleExport('sql')}
            className="flex items-center space-x-2 border border-gray-300 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors text-sm"
          >
            <Download className="h-3 w-3" />
            <span>SQL</span>
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Password
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {currentUsers.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    {editingUser?.id === u.id ? (
                      <div className="flex space-x-2">
                        <input
                          type="text"
                          value={editingUser.firstName}
                          onChange={(e) =>
                            setEditingUser({ ...editingUser, firstName: e.target.value })
                          }
                          className="border border-gray-300 rounded px-2 py-1 text-sm w-24"
                          placeholder="First"
                        />
                        <input
                          type="text"
                          value={editingUser.lastName}
                          onChange={(e) =>
                            setEditingUser({ ...editingUser, lastName: e.target.value })
                          }
                          className="border border-gray-300 rounded px-2 py-1 text-sm w-24"
                          placeholder="Last"
                        />
                      </div>
                    ) : (
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {u.firstName} {u.lastName}
                        </div>
                        <div className="text-sm text-gray-500">{u.username}</div>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {editingUser?.id === u.id ? (
                      <input
                        type="email"
                        value={editingUser.email}
                        onChange={(e) =>
                          setEditingUser({ ...editingUser, email: e.target.value })
                        }
                        className="border border-gray-300 rounded px-2 py-1 text-sm w-48"
                      />
                    ) : (
                      <div className="text-sm text-gray-900">{u.email}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {editingUser?.id === u.id ? (
                      <input
                        type="text"
                        value={editingUser.password || ''}
                        onChange={(e) =>
                          setEditingUser({ ...editingUser, password: e.target.value })
                        }
                        className="border border-gray-300 rounded px-2 py-1 text-sm w-32"
                        placeholder="New password"
                      />
                    ) : (
                      <div className="flex items-center space-x-2">
                        <div className="text-sm text-gray-600 font-mono bg-gray-100 px-2 py-1 rounded">
                          {visiblePasswords[u.id] ? u.password || '••••••••' : '••••••••'}
                        </div>
                        <button
                          onClick={() => setVisiblePasswords(prev => ({
                            ...prev,
                            [u.id]: !prev[u.id]
                          }))}
                          className="text-gray-400 hover:text-gray-600"
                          title={visiblePasswords[u.id] ? 'Hide password' : 'Show password'}
                        >
                          {visiblePasswords[u.id] ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {editingUser?.id === u.id ? (
                      <select
                        value={editingUser.role}
                        onChange={(e) =>
                          setEditingUser({ ...editingUser, role: e.target.value })
                        }
                        className="border border-gray-300 rounded px-2 py-1 text-sm"
                      >
                        <option value="STUDENT">Student</option>
                        <option value="INSTRUCTOR">Instructor</option>
                        <option value="ADMIN">Admin</option>
                      </select>
                    ) : (
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          u.role === 'ADMIN'
                            ? 'bg-red-100 text-red-800'
                            : u.role === 'INSTRUCTOR'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {u.role}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                      Active
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {editingUser?.id === u.id ? (
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleUpdateUser(u.id)}
                          className="text-green-600 hover:text-green-900"
                          title="Save"
                        >
                          <Save className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setEditingUser(null)}
                          className="text-gray-600 hover:text-gray-900"
                          title="Cancel"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => setEditingUser({ ...u })}
                          className="text-blue-600 hover:text-blue-900"
                          title="Edit"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(u.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Showing {indexOfFirstUser + 1} to{' '}
              {Math.min(indexOfLastUser, filteredUsers.length)} of {filteredUsers.length} users
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                Previous
              </button>
              {[...Array(totalPages)].map((_, index) => (
                <button
                  key={index}
                  onClick={() => paginate(index + 1)}
                  className={`px-3 py-1 border rounded-lg text-sm ${
                    currentPage === index + 1
                      ? 'bg-black text-white border-black'
                      : 'border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {index + 1}
                </button>
              ))}
              <button
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Add New User</h2>
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Username *
                </label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-black focus:border-transparent"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    First Name *
                  </label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-black focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-black focus:border-transparent"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-black focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password *
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-black focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role *</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-black focus:border-transparent"
                  required
                >
                  <option value="STUDENT">Student</option>
                  <option value="INSTRUCTOR">Instructor</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-black text-white py-2 rounded-lg hover:bg-gray-800 transition-colors"
                >
                  Create User
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 border border-gray-300 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Import Users Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Import Users</h2>
            <form onSubmit={handleImportUsers} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload File (CSV or JSON)
                </label>
                <input
                  type="file"
                  accept=".csv,.json"
                  onChange={(e) => setImportFile(e.target.files[0])}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-black focus:border-transparent"
                  required
                />
                <p className="text-xs text-gray-500 mt-2">
                  Supported formats: CSV, JSON
                </p>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-xs text-blue-800">
                  <strong>CSV Format:</strong> username, email, password, role, firstName,
                  lastName
                </p>
                <p className="text-xs text-blue-800 mt-1">
                  <strong>JSON Format:</strong> Array of user objects with the same fields
                </p>
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-black text-white py-2 rounded-lg hover:bg-gray-800 transition-colors"
                >
                  Import Users
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowImportModal(false);
                    setImportFile(null);
                  }}
                  className="flex-1 border border-gray-300 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
