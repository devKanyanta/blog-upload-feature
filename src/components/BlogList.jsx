import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  Edit,
  Trash2,
  Eye,
  Calendar,
  Clock,
  FileText,
  Search,
  Filter,
  Plus,
  ChevronLeft,
  ChevronRight,
  LogIn,
  Grid,
  List,
  ArrowUpRight,
  TrendingUp,
  BookOpen,
  User
} from 'lucide-react';
import { blogApi } from '../api/blogApi';

const BlogList = () => {
  const navigate = useNavigate();
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [viewMode, setViewMode] = useState('list'); // 'grid' or 'list'
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    pages: 1
  });

  const isAuthenticated = !!localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    fetchBlogs();
  }, [pagination.page, filterStatus, searchTerm]);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        ...(filterStatus !== 'all' && { status: filterStatus }),
        ...(searchTerm && { search: searchTerm }),
        sortBy: 'created_at',
        sortOrder: 'DESC'
      };

      const response = await blogApi.getAllBlogs(params);
      
      if (response.success) {
        setBlogs(response.data);
        setPagination(response.pagination || {
          page: 1,
          limit: 12,
          total: response.data.length,
          pages: 1
        });
      } else {
        toast.error('Failed to load blogs');
        setBlogs([]);
      }
    } catch (error) {
      toast.error('Failed to load blogs');
      setBlogs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, title, e) => {
    e.stopPropagation(); // Prevent card click
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) {
      return;
    }

    try {
      const response = await blogApi.deleteBlog(id);
      if (response.success) {
        setBlogs(blogs.filter(blog => blog.id !== id));
        toast.success('Blog deleted successfully');
        fetchBlogs();
      } else {
        throw new Error(response.error || 'Failed to delete blog');
      }
    } catch (error) {
      toast.error(error.error || error.message || 'Failed to delete blog');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchBlogs();
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.pages) {
      setPagination(prev => ({ ...prev, page: newPage }));
    }
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'published':
        return 'bg-green-50 text-green-700 border border-green-200';
      case 'draft':
        return 'bg-yellow-50 text-yellow-700 border border-yellow-200';
      case 'archived':
        return 'bg-gray-50 text-gray-700 border border-gray-200';
      default:
        return 'bg-gray-50 text-gray-700 border border-gray-200';
    }
  };

  // Check if user can edit/delete this blog
  const canEditBlog = (blog) => {
    if (!isAuthenticated) return false;
    if (user.role === 'admin' || user.role === 'editor') return true;
    if (user.role === 'author' && blog.created_by === user.id) return true;
    return false;
  };

  const handleCreateClick = () => {
    if (!isAuthenticated) {
      navigate('/login');
      toast.error('Please login to create a blog');
    } else {
      navigate('/create');
    }
  };

  const handleCardClick = (id) => {
    navigate(`/blog/${id}`);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <div className="relative">
          <div className="h-12 w-12 rounded-full border-2 border-gray-300"></div>
          <div className="h-12 w-12 rounded-full border-2 border-gray-900 border-t-transparent animate-spin absolute top-0 left-0"></div>
        </div>
        <p className="text-gray-600 font-medium">Loading blogs...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Blog Posts</h1>
          <p className="text-gray-600 mt-2">
            {isAuthenticated ? 'Manage and create your blog posts' : 'Browse our collection of blog posts'}
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          {/* View Mode Toggle */}
          <div className="flex items-center space-x-1 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'grid' 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              title="Grid View"
            >
              <Grid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'list' 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              title="List View"
            >
              <List className="h-4 w-4" />
            </button>
          </div>
          
          <button
            onClick={handleCreateClick}
            className="btn btn-primary flex items-center space-x-2"
          >
            {isAuthenticated ? (
              <>
                <Plus className="h-4 w-4" />
                <span>New Post</span>
              </>
            ) : null}
          </button>
        </div>
      </div>

      {/* Improved Search and Filter Section */}
      <div className="card p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Search Bar */}
          <div className="flex-1">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-gray-900 to-gray-800 rounded-lg blur opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search blogs by title, content, or excerpt..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch(e)}
                  className="w-full pl-12 pr-4 py-3.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent bg-white placeholder-gray-400 transition-all duration-200"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
          </div>
          
          {/* Filters */}
          <div className="flex items-center space-x-3">
            <div className="relative group">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent bg-white appearance-none cursor-pointer"
              >
                <option value="all">All Status</option>
                {isAuthenticated ? (
                  <>
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                    <option value="archived">Archived</option>
                  </>
                ) : (
                  <option value="published">Published</option>
                )}
              </select>
            </div>
            
            <button
              onClick={handleSearch}
              className="px-6 py-3 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors duration-200 flex items-center space-x-2"
            >
              <Search className="h-4 w-4" />
              <span>Search</span>
            </button>
          </div>
        </div>
        
        {/* Search Tips */}
        <div className="mt-4 flex flex-wrap items-center gap-2 text-sm text-gray-500">
          <span className="flex items-center space-x-1">
            <TrendingUp className="h-3 w-3" />
            <span>Sort by: Latest</span>
          </span>
          <span>•</span>
          <span>{pagination.total} posts found</span>
          {searchTerm && (
            <>
              <span>•</span>
              <span>Searching for: "{searchTerm}"</span>
            </>
          )}
        </div>
      </div>

      {/* Blog Grid/List */}
      {blogs.length === 0 ? (
        <div className="card p-12 text-center">
          <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-900 mb-2">
            {searchTerm || filterStatus !== 'all' ? 'No matching blogs found' : 'No blogs yet'}
          </h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            {searchTerm || filterStatus !== 'all' 
              ? 'Try adjusting your search or filter to find what you\'re looking for.' 
              : isAuthenticated 
                ? 'Get started by creating your first blog post.'
                : 'Check back later for new content. Sign up to be notified.'
            }
          </p>
          {isAuthenticated ? (
            <Link
              to="/create"
              className="btn btn-primary inline-flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Create Your First Blog</span>
            </Link>
          ) : (
            <Link
              to="/register"
              className="btn btn-primary inline-flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Join Our Community</span>
            </Link>
          )}
        </div>
      ) : (
        <>
          {/* Grid View */}
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {blogs.map(blog => {
                const canEdit = canEditBlog(blog);
                
                return (
                  <div 
                    key={blog.id} 
                    onClick={() => handleCardClick(blog.id)}
                    className="card hover:shadow-lg transition-all duration-300 cursor-pointer group"
                  >
                    {/* Image */}
                    {blog.featured_image && (
                      <div className="h-48 overflow-hidden relative">
                        <img
                          src={blog.featured_image}
                          alt={blog.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://via.placeholder.com/800x400?text=No+Image';
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      </div>
                    )}
                    
                    {/* Content */}
                    <div className="p-6">
                      {/* Status and Date */}
                      <div className="flex items-center justify-between mb-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium tracking-wide ${getStatusBadgeColor(blog.status)}`}>
                          {blog.status.charAt(0).toUpperCase() + blog.status.slice(1)}
                        </span>
                        
                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                          <Calendar className="h-4 w-4" />
                          <span>{formatDate(blog.created_at)}</span>
                        </div>
                      </div>
                      
                      {/* Title */}
                      <h3 className="text-lg font-semibold text-gray-900 mb-3 line-clamp-2 group-hover:text-gray-700 transition-colors">
                        {blog.title}
                        <ArrowUpRight className="h-4 w-4 inline-block ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </h3>
                      
                      {/* Excerpt */}
                      {blog.excerpt && (
                        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                          {blog.excerpt}
                        </p>
                      )}
                      
                      {/* Read Time and Views */}
                      <div className="flex items-center justify-between text-sm text-gray-500 mb-6">
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          <span>{blog.read_time || 3} min read</span>
                        </div>
                        <div className="flex items-center">
                          <Eye className="h-4 w-4 mr-1" />
                          <span>{blog.view_count || 0}</span>
                        </div>
                      </div>
                      
                      {/* Actions - Only show on hover for viewers */}
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                          <div className="flex space-x-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCardClick(blog.id);
                              }}
                              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                              title="View"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            {canEdit && (
                              <Link
                                to={`/edit/${blog.id}`}
                                onClick={(e) => e.stopPropagation()}
                                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                                title="Edit"
                              >
                                <Edit className="h-4 w-4" />
                              </Link>
                            )}
                          </div>
                          
                          {canEdit && (
                            <button
                              onClick={(e) => handleDelete(blog.id, blog.title, e)}
                              className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* List View - Better for viewers */
            <div className="space-y-4">
              {blogs.map(blog => {
                const canEdit = canEditBlog(blog);
                
                return (
                  <div 
                    key={blog.id} 
                    onClick={() => handleCardClick(blog.id)}
                    className="card hover:shadow transition-all duration-200 cursor-pointer group"
                  >
                    <div className="p-6">
                      <div className="flex flex-col md:flex-row md:items-start gap-6">
                        {/* Image for List View */}
                        {blog.featured_image && (
                          <div className="md:w-48 md:h-32 flex-shrink-0 overflow-hidden rounded-lg">
                            <img
                              src={blog.featured_image}
                              alt={blog.title}
                              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = 'https://via.placeholder.com/300x200?text=No+Image';
                              }}
                            />
                          </div>
                        )}
                        
                        {/* Content */}
                        <div className="flex-1">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                            <div className="flex items-center space-x-3">
                              <span className={`px-2.5 py-1 rounded-full text-xs font-medium tracking-wide ${getStatusBadgeColor(blog.status)}`}>
                                {blog.status.charAt(0).toUpperCase() + blog.status.slice(1)}
                              </span>
                              <div className="flex items-center space-x-2 text-sm text-gray-500">
                                <Calendar className="h-4 w-4" />
                                <span>{formatDate(blog.created_at)}</span>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                              <div className="flex items-center">
                                <Clock className="h-4 w-4 mr-1" />
                                <span>{blog.read_time || 3} min</span>
                              </div>
                              <div className="flex items-center">
                                <Eye className="h-4 w-4 mr-1" />
                                <span>{blog.view_count || 0} views</span>
                              </div>
                            </div>
                          </div>
                          
                          {/* Title and Excerpt */}
                          <div className="mb-4">
                            <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-gray-700 transition-colors flex items-center">
                              {blog.title}
                              <ArrowUpRight className="h-4 w-4 ml-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </h3>
                            {blog.excerpt && (
                              <p className="text-gray-600 line-clamp-2">
                                {blog.excerpt}
                              </p>
                            )}
                          </div>
                          
                          {/* Tags and Actions */}
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="flex items-center space-x-3 text-sm text-gray-500">
                              <div className="flex items-center">
                                <BookOpen className="h-4 w-4 mr-1" />
                                <span>Read post</span>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCardClick(blog.id);
                                }}
                                className="px-3 py-1.5 text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors flex items-center space-x-1"
                              >
                                <Eye className="h-3.5 w-3.5" />
                                <span>View</span>
                              </button>
                              {canEdit && (
                                <>
                                  <Link
                                    to={`/edit/${blog.id}`}
                                    onClick={(e) => e.stopPropagation()}
                                    className="px-3 py-1.5 text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors flex items-center space-x-1"
                                  >
                                    <Edit className="h-3.5 w-3.5" />
                                    <span>Edit</span>
                                  </Link>
                                  <button
                                    onClick={(e) => handleDelete(blog.id, blog.title, e)}
                                    className="px-3 py-1.5 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors flex items-center space-x-1"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                    <span>Delete</span>
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="text-sm text-gray-600">
                  Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} posts
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1}
                    className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    <span>Previous</span>
                  </button>
                  
                  <div className="flex items-center space-x-1">
                    {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                      let pageNum;
                      if (pagination.pages <= 5) {
                        pageNum = i + 1;
                      } else if (pagination.page <= 3) {
                        pageNum = i + 1;
                      } else if (pagination.page >= pagination.pages - 2) {
                        pageNum = pagination.pages - 4 + i;
                      } else {
                        pageNum = pagination.page - 2 + i;
                      }
                      
                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`w-10 h-10 rounded-lg transition-colors ${
                            pagination.page === pageNum
                              ? 'bg-gray-900 text-white'
                              : 'text-gray-600 hover:bg-gray-100'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>
                  
                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page === pagination.pages}
                    className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                  >
                    <span>Next</span>
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Stats - Only show for authenticated users */}
      {isAuthenticated && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="card p-5">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-gray-600">Total Posts</div>
                <div className="text-2xl font-bold text-gray-900 mt-1">{pagination.total || 0}</div>
              </div>
              <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center">
                <FileText className="h-5 w-5 text-gray-600" />
              </div>
            </div>
          </div>
          <div className="card p-5">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-gray-600">Published</div>
                <div className="text-2xl font-bold text-green-600 mt-1">
                  {blogs.filter(b => b.status === 'published').length}
                </div>
              </div>
              <div className="h-10 w-10 rounded-lg bg-green-50 flex items-center justify-center">
                <Eye className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </div>
          <div className="card p-5">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-gray-600">Drafts</div>
                <div className="text-2xl font-bold text-yellow-600 mt-1">
                  {blogs.filter(b => b.status === 'draft').length}
                </div>
              </div>
              <div className="h-10 w-10 rounded-lg bg-yellow-50 flex items-center justify-center">
                <FileText className="h-5 w-5 text-yellow-600" />
              </div>
            </div>
          </div>
          <div className="card p-5">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-gray-600">Archived</div>
                <div className="text-2xl font-bold text-gray-600 mt-1">
                  {blogs.filter(b => b.status === 'archived').length}
                </div>
              </div>
              <div className="h-10 w-10 rounded-lg bg-gray-50 flex items-center justify-center">
                <FileText className="h-5 w-5 text-gray-600" />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BlogList;