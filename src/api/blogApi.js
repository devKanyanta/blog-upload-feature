import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for auth tokens
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error.response?.data || error.message);
  }
);

// Blog API functions
export const blogApi = {
  // Get all blogs with pagination
  getAllBlogs: (params = {}) => 
    api.get('/blogs', { params }),

  // Get blog by ID
  getBlogById: (id) => 
    api.get(`/blogs/${id}`),

  // Get blog by slug
  getBlogBySlug: (slug) => 
    api.get(`/blogs/slug/${slug}`),

  // Create blog
  createBlog: (blogData) => {
    const formData = new FormData();
    
    // Append text fields
    Object.keys(blogData).forEach(key => {
      if (key !== 'featured_image') {
        formData.append(key, blogData[key]);
      }
    });
    
    // Append image if exists
    if (blogData.featured_image instanceof File) {
      formData.append('featured_image', blogData.featured_image);
    }

    return api.post('/blogs', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // Update blog
  updateBlog: (id, blogData) => {
    const formData = new FormData();
    
    // Append text fields
    Object.keys(blogData).forEach(key => {
      if (key !== 'featured_image') {
        formData.append(key, blogData[key]);
      }
    });
    
    // Append image if it's a new file
    if (blogData.featured_image instanceof File) {
      formData.append('featured_image', blogData.featured_image);
    }

    return api.put(`/blogs/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // Delete blog
  deleteBlog: (id) => 
    api.delete(`/blogs/${id}`),

  // Upload image for editor
  uploadImage: (file) => {
    const formData = new FormData();
    formData.append('image', file);
    
    return api.post('/blogs/upload-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }
};

// Health check
export const checkHealth = () => 
  api.get('/health');

export default api;