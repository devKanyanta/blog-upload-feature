import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  ArrowLeft,
  Calendar,
  Clock,
  Eye,
  Edit,
  Share2,
  Bookmark,
  LogIn
} from 'lucide-react';
import { blogApi } from '../api/blogApi';

const BlogView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isBookmarked, setIsBookmarked] = useState(false);

  const isAuthenticated = !!localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    fetchBlog();
  }, [id]);

  const fetchBlog = async () => {
    try {
      setLoading(true);
      const response = await blogApi.getBlogById(id);
      
      if (response.success) {
        setBlog(response.data);
      } else {
        toast.error('Blog not found');
        navigate('/');
      }
    } catch (error) {
      toast.error('Failed to load blog');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: blog?.title,
        text: blog?.excerpt || 'Check out this blog post!',
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };

  // Check if user can edit this blog
  const canEditBlog = () => {
    if (!isAuthenticated) return false;
    if (user.role === 'admin' || user.role === 'editor') return true;
    if (user.role === 'author' && blog?.created_by === user.id) return true;
    return false;
  };

  const handleEditClick = () => {
    if (!isAuthenticated) {
      navigate('/login');
      toast.error('Please login to edit blog posts');
    } else if (!canEditBlog()) {
      toast.error('You do not have permission to edit this blog');
    } else {
      navigate(`/edit/${id}`);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Blog not found</h2>
        <Link to="/" className="btn btn-primary inline-flex items-center space-x-2">
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Blogs</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Back Button */}
      <div className="mb-8">
        <Link
          to="/"
          className="inline-flex items-center space-x-2 text-gray-700 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Back to Blogs</span>
        </Link>
      </div>

      <article className="card">
        {/* Featured Image */}
        {blog.featured_image && (
          <div className="h-96 overflow-hidden">
            <img
              src={blog.featured_image}
              alt={blog.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://via.placeholder.com/1200x600?text=No+Image';
              }}
            />
          </div>
        )}

        <div className="p-8">
          {/* Header Info */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
            <div className="flex items-center space-x-4">
              <span className={`px-2.5 py-1 rounded-full text-xs font-medium tracking-wide ${getStatusBadgeColor(blog.status)}`}>
                {blog.status.charAt(0).toUpperCase() + blog.status.slice(1)}
              </span>
              
              <div className="flex items-center space-x-2 text-gray-600">
                <Calendar className="h-4 w-4" />
                <span>
                  {blog.published_at 
                    ? `Published: ${formatDate(blog.published_at)}`
                    : `Created: ${formatDate(blog.created_at)}`
                  }
                </span>
              </div>
            </div>
            
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2 text-gray-600">
                <Clock className="h-4 w-4" />
                <span>{blog.read_time || 3} min read</span>
              </div>
              
              <div className="flex items-center space-x-2 text-gray-600">
                <Eye className="h-4 w-4" />
                <span>{blog.view_count?.toLocaleString() || '0'} views</span>
              </div>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-4xl font-bold text-gray-900 mb-6 tracking-tight">
            {blog.title}
          </h1>

          {/* Excerpt */}
          {blog.excerpt && (
            <p className="text-xl text-gray-600 mb-8">
              {blog.excerpt}
            </p>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-between mb-8 p-4 border-y border-gray-200">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setIsBookmarked(!isBookmarked)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  isBookmarked 
                    ? 'bg-gray-100 text-gray-900' 
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Bookmark className={`h-4 w-4 ${isBookmarked ? 'fill-current text-gray-900' : ''}`} />
                <span>{isBookmarked ? 'Bookmarked' : 'Bookmark'}</span>
              </button>
              
              <button
                onClick={handleShare}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <Share2 className="h-4 w-4" />
                <span>Share</span>
              </button>
            </div>
            
            {canEditBlog() ? (
              <button
                onClick={handleEditClick}
                className="btn btn-primary flex items-center space-x-2"
              >
                <Edit className="h-4 w-4" />
                <span>Edit Blog</span>
              </button>
            ) : isAuthenticated ? null : null}
          </div>

          {/* Content */}
          <div 
            className="prose prose-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: blog.content }}
          />

          {/* Video Embed */}
          {blog.video_url && (
            <div className="mt-12">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Video</h3>
              <div className="aspect-w-16 aspect-h-9">
                <iframe
                  src={blog.video_url}
                  title={blog.title}
                  className="w-full h-[500px] rounded-lg"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>
          )}

          {/* Meta Information - Only show for authenticated users */}
          {isAuthenticated && (
            <div className="mt-12 pt-8 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Meta Information</h3>
                  {blog.meta_title && (
                    <div className="mb-2">
                      <span className="text-sm font-medium text-gray-600">Meta Title:</span>
                      <p className="text-gray-800">{blog.meta_title}</p>
                    </div>
                  )}
                  {blog.meta_description && (
                    <div>
                      <span className="text-sm font-medium text-gray-600">Meta Description:</span>
                      <p className="text-gray-800">{blog.meta_description}</p>
                    </div>
                  )}
                </div>
                
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Statistics</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Created:</span>
                      <span className="text-gray-800">{formatDate(blog.created_at)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Last Updated:</span>
                      <span className="text-gray-800">{formatDate(blog.updated_at)}</span>
                    </div>
                    {blog.published_at && (
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Published:</span>
                        <span className="text-gray-800">{formatDate(blog.published_at)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </article>
    </div>
  );
};

export default BlogView;