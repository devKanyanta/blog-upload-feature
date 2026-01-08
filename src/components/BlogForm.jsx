import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import TipTapEditor from './TipTapEditor';
import toast from 'react-hot-toast';
import { 
  Save, 
  X, 
  Upload, 
  Globe, 
  Eye, 
  EyeOff
} from 'lucide-react';
import { blogApi } from '../api/blogApi';

const BlogForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;
  
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '<p>Start writing your blog post here...</p>',
    status: 'draft',
    featured_image: null,
    video_url: '',
    meta_title: '',
    meta_description: ''
  });
  
  const [imagePreview, setImagePreview] = useState('');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isEditMode) {
      fetchBlog();
    }
  }, [id]);

  const fetchBlog = async () => {
    try {
      setLoading(true);
      const response = await blogApi.getBlogById(id);
      
      if (response.success) {
        const blog = response.data;
        setFormData({
          title: blog.title || '',
          content: blog.content || '<p>Start writing your blog post here...</p>',
          status: blog.status || 'draft',
          featured_image: blog.featured_image || null,
          video_url: blog.video_url || '',
          meta_title: blog.meta_title || '',
          meta_description: blog.meta_description || ''
        });
        
        if (blog.featured_image) {
          setImagePreview(blog.featured_image);
        }
      } else {
        toast.error('Failed to fetch blog');
        navigate('/');
      }
    } catch (error) {
      toast.error('Failed to fetch blog');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.content.trim() || formData.content === '<p></p>') {
      newErrors.content = 'Content is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const generateExcerpt = (content, length = 150) => {
    const plainText = content.replace(/<[^>]*>/g, '');
    return plainText.length > length 
      ? plainText.substring(0, length) + '...' 
      : plainText;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast.error('Image size should be less than 10MB');
        return;
      }
      setFormData(prev => ({ ...prev, featured_image: file }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleContentChange = (content) => {
    setFormData(prev => ({ ...prev, content }));
    if (errors.content) {
      setErrors(prev => ({ ...prev, content: '' }));
    }
  };

  // Add this function to extract base64 images from content and convert them to files
const extractAndConvertBase64Images = async (htmlContent) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlContent, 'text/html');
  const images = doc.querySelectorAll('img[src^="data:image"]');
  
  let updatedContent = htmlContent;
  
  for (const img of images) {
    const base64Data = img.src;
    try {
      // Convert base64 to blob
      const response = await fetch(base64Data);
      const blob = await response.blob();
      
      // Create file from blob
      const fileName = `image-${Date.now()}.${blob.type.split('/')[1]}`;
      const file = new File([blob], fileName, { type: blob.type });
      
      // Upload the file
      const uploadResult = await blogApi.uploadImage(file);
      
      if (uploadResult.success) {
        // Replace base64 with uploaded URL in content
        updatedContent = updatedContent.replace(base64Data, uploadResult.data.url);
      }
    } catch (error) {
      console.error('Failed to convert base64 image:', error);
    }
  }
  
  return updatedContent;
};

// Update the handleSubmit function to process base64 images before saving
const handleSubmit = async (e) => {
  e.preventDefault();
  
  if (!validateForm()) {
    toast.error('Please fix the errors in the form');
    return;
  }

  try {
    setLoading(true);
    
    // Process content to handle base64 images
    let processedContent = formData.content;
    
    // Check if content contains base64 images
    if (formData.content.includes('data:image')) {
      toast.loading('Processing images...');
      processedContent = await extractAndConvertBase64Images(formData.content);
      toast.dismiss();
    }
    
    // Prepare blog data
    const blogData = {
      title: formData.title,
      content: processedContent,
      status: formData.status,
      video_url: formData.video_url,
      meta_title: formData.meta_title || formData.title,
      meta_description: formData.meta_description || generateExcerpt(processedContent)
    };

    // Handle featured image
    if (formData.featured_image instanceof File) {
      blogData.featured_image = formData.featured_image;
    } else if (formData.featured_image && typeof formData.featured_image === 'string') {
      // Keep existing image URL
      blogData.featured_image = formData.featured_image;
    }

    let response;
    if (isEditMode) {
      response = await blogApi.updateBlog(id, blogData);
      toast.success('Blog updated successfully!');
    } else {
      response = await blogApi.createBlog(blogData);
      toast.success('Blog created successfully!');
    }
    
    if (response.success) {
      navigate('/');
    } else {
      throw new Error(response.error || 'Failed to save blog');
    }
  } catch (error) {
    console.error('Error saving blog:', error);
    toast.error(error.error || error.message || 'Failed to save blog. Please try again.');
  } finally {
    setLoading(false);
  }
};

  if (loading && isEditMode) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          {isEditMode ? 'Edit Blog Post' : 'Create New Blog Post'}
        </h1>
        <p className="text-gray-600 mt-2">
          {isEditMode ? 'Update your blog post details' : 'Fill in the details to create a new blog post'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Title *
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            className={`input ${errors.title ? 'border-red-500' : ''}`}
            placeholder="Enter blog title"
            disabled={loading}
          />
          {errors.title && (
            <p className="mt-1 text-sm text-red-600">{errors.title}</p>
          )}
        </div>

        {/* Meta Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Meta Title (Optional)
          </label>
          <input
            type="text"
            name="meta_title"
            value={formData.meta_title}
            onChange={handleInputChange}
            className="input"
            placeholder="SEO title for search engines"
            disabled={loading}
          />
          <p className="mt-1 text-sm text-gray-500">
            Leave blank to use blog title
          </p>
        </div>

        {/* Meta Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Meta Description (Optional)
          </label>
          <textarea
            name="meta_description"
            value={formData.meta_description}
            onChange={handleInputChange}
            className="input min-h-[100px]"
            placeholder="SEO description for search engines"
            disabled={loading}
            rows="3"
          />
          <p className="mt-1 text-sm text-gray-500">
            Leave blank to generate from content
          </p>
        </div>

        {/* Featured Image */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Featured Image
          </label>
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <label className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                <Upload className="h-5 w-5 mr-2 text-gray-500" />
                <span>Upload Image</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  disabled={loading}
                />
              </label>
              <span className="text-sm text-gray-500">
                JPEG, PNG, GIF, WEBP, SVG up to 10MB
              </span>
            </div>
            
            {imagePreview && (
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Preview:</p>
                <div className="relative w-full max-w-md h-64 rounded-lg overflow-hidden">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Video URL */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Video URL (Optional)
          </label>
          <div className="flex items-center space-x-2">
            <Globe className="h-5 w-5 text-gray-400" />
            <input
              type="url"
              name="video_url"
              value={formData.video_url}
              onChange={handleInputChange}
              className="input"
              placeholder="https://www.youtube.com/embed/..."
              disabled={loading}
            />
          </div>
          <p className="mt-1 text-sm text-gray-500">
            Enter embed URL for YouTube, Vimeo, etc.
          </p>
        </div>

        {/* Content Editor */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700">
              Content *
            </label>
            {errors.content && (
              <span className="text-sm text-red-600">{errors.content}</span>
            )}
          </div>
          <TipTapEditor
            content={formData.content}
            onChange={handleContentChange}
          />
        </div>

        {/* Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Status
          </label>
          <div className="flex space-x-4">
            <label className="flex items-center">
              <input
                type="radio"
                name="status"
                value="draft"
                checked={formData.status === 'draft'}
                onChange={handleInputChange}
                className="h-4 w-4 text-primary-600"
                disabled={loading}
              />
              <span className="ml-2 flex items-center">
                <EyeOff className="h-4 w-4 mr-1" />
                Draft
              </span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="status"
                value="published"
                checked={formData.status === 'published'}
                onChange={handleInputChange}
                className="h-4 w-4 text-primary-600"
                disabled={loading}
              />
              <span className="ml-2 flex items-center">
                <Eye className="h-4 w-4 mr-1" />
                Published
              </span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="status"
                value="archived"
                checked={formData.status === 'archived'}
                onChange={handleInputChange}
                className="h-4 w-4 text-primary-600"
                disabled={loading}
              />
              <span className="ml-2 flex items-center">
                <EyeOff className="h-4 w-4 mr-1" />
                Archived
              </span>
            </label>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="btn btn-secondary flex items-center space-x-2"
            disabled={loading}
          >
            <X className="h-4 w-4" />
            <span>Cancel</span>
          </button>
          
          <button
            type="submit"
            className="btn btn-primary flex items-center space-x-2"
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                <span>{isEditMode ? 'Update' : 'Publish'} Blog</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default BlogForm;