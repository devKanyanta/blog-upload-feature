import React, { useRef, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Link from '@tiptap/extension-link';
import toast from 'react-hot-toast';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Heading1,
  Heading2,
  List,
  ListOrdered,
  Image as ImageIcon,
  Video,
  Link as LinkIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Quote,
  Upload,
  Loader2,
  X
} from 'lucide-react';
import { blogApi } from '../api/blogApi';

const MenuBar = ({ editor, onUploadImage, onUploadVideo, isUploading }) => {
  if (!editor) {
    return null;
  }

  const imageInputRef = useRef(null);
  const videoInputRef = useRef(null);

  const handleImageUpload = () => {
    if (imageInputRef.current) {
      imageInputRef.current.click();
    }
  };

  const handleVideoUpload = () => {
    if (videoInputRef.current) {
      videoInputRef.current.click();
    }
  };

  const setLink = () => {
    const url = window.prompt('Enter URL:');
    if (url) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  };

  return (
    <>
      {/* Hidden file inputs */}
      <input
        type="file"
        ref={imageInputRef}
        accept="image/*"
        className="hidden"
        onChange={(e) => onUploadImage(e.target.files[0])}
      />
      <input
        type="file"
        ref={videoInputRef}
        accept="video/*"
        className="hidden"
        onChange={(e) => onUploadVideo(e.target.files[0])}
      />

      <div className="flex flex-wrap items-center gap-1 p-2 border-b border-gray-200 bg-gray-50">
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('bold') ? 'bg-gray-300' : ''}`}
          title="Bold"
          type="button"
        >
          <Bold className="h-4 w-4" />
        </button>
        
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('italic') ? 'bg-gray-300' : ''}`}
          title="Italic"
          type="button"
        >
          <Italic className="h-4 w-4" />
        </button>
        
        <button
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('underline') ? 'bg-gray-300' : ''}`}
          title="Underline"
          type="button"
        >
          <UnderlineIcon className="h-4 w-4" />
        </button>
        
        <div className="w-px h-6 bg-gray-300 mx-1"></div>
        
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('heading', { level: 1 }) ? 'bg-gray-300' : ''}`}
          title="Heading 1"
          type="button"
        >
          <Heading1 className="h-4 w-4" />
        </button>
        
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('heading', { level: 2 }) ? 'bg-gray-300' : ''}`}
          title="Heading 2"
          type="button"
        >
          <Heading2 className="h-4 w-4" />
        </button>
        
        <div className="w-px h-6 bg-gray-300 mx-1"></div>
        
        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('bulletList') ? 'bg-gray-300' : ''}`}
          title="Bullet List"
          type="button"
        >
          <List className="h-4 w-4" />
        </button>
        
        <button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('orderedList') ? 'bg-gray-300' : ''}`}
          title="Numbered List"
          type="button"
        >
          <ListOrdered className="h-4 w-4" />
        </button>
        
        <div className="w-px h-6 bg-gray-300 mx-1"></div>
        
        <button
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          className={`p-2 rounded hover:bg-gray-200 ${editor.isActive({ textAlign: 'left' }) ? 'bg-gray-300' : ''}`}
          title="Align Left"
          type="button"
        >
          <AlignLeft className="h-4 w-4" />
        </button>
        
        <button
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          className={`p-2 rounded hover:bg-gray-200 ${editor.isActive({ textAlign: 'center' }) ? 'bg-gray-300' : ''}`}
          title="Align Center"
          type="button"
        >
          <AlignCenter className="h-4 w-4" />
        </button>
        
        <button
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          className={`p-2 rounded hover:bg-gray-200 ${editor.isActive({ textAlign: 'right' }) ? 'bg-gray-300' : ''}`}
          title="Align Right"
          type="button"
        >
          <AlignRight className="h-4 w-4" />
        </button>
        
        <div className="w-px h-6 bg-gray-300 mx-1"></div>
        
        <button
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('blockquote') ? 'bg-gray-300' : ''}`}
          title="Blockquote"
          type="button"
        >
          <Quote className="h-4 w-4" />
        </button>
        
        <button
          onClick={setLink}
          className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('link') ? 'bg-gray-300' : ''}`}
          title="Insert Link"
          type="button"
        >
          <LinkIcon className="h-4 w-4" />
        </button>
        
        <button
          onClick={handleImageUpload}
          disabled={isUploading}
          className={`p-2 rounded hover:bg-gray-200 ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
          title="Upload Image"
          type="button"
        >
          {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImageIcon className="h-4 w-4" />}
        </button>
        
        <button
          onClick={handleVideoUpload}
          disabled={isUploading}
          className={`p-2 rounded hover:bg-gray-200 ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
          title="Upload Video"
          type="button"
        >
          {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Video className="h-4 w-4" />}
        </button>
      </div>
    </>
  );
};

const TipTapEditor = ({ content, onChange }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Image.configure({
        inline: true,
        allowBase64: false,
        HTMLAttributes: {
          class: 'max-w-full h-auto rounded-lg my-2',
        },
      }),
      Link.configure({
        openOnClick: true,
        HTMLAttributes: {
          class: 'text-blue-600 underline hover:text-blue-800',
        },
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
    ],
    content: content || '<p>Start writing your blog post here...</p>',
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-lg max-w-none focus:outline-none min-h-[300px] p-4',
      },
    },
  });

  const uploadImage = async (file) => {
    if (!file) return;

    // Validate file
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      toast.error('Image size should be less than 10MB');
      return;
    }

    try {
      setIsUploading(true);
      setUploadProgress(0);

      // Show loading
      const loadingToast = toast.loading('Uploading image...');

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 100);

      // Upload image to backend
      const response = await blogApi.uploadImage(file);

      if (response.success) {
        clearInterval(progressInterval);
        setUploadProgress(100);

        // Insert image into editor
        if (editor) {
          editor.chain().focus().setImage({ src: response.data.url }).run();
        }

        toast.dismiss(loadingToast);
        toast.success('Image uploaded successfully!');
      } else {
        throw new Error(response.error || 'Upload failed');
      }
    } catch (error) {
      console.error('Image upload error:', error);
      toast.error(error.message || 'Failed to upload image');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const uploadVideo = async (file) => {
    if (!file) return;

    // Validate file
    if (!file.type.startsWith('video/')) {
      toast.error('Please select a video file');
      return;
    }

    if (file.size > 50 * 1024 * 1024) { // 50MB limit for videos
      toast.error('Video size should be less than 50MB');
      return;
    }

    try {
      setIsUploading(true);
      setUploadProgress(0);

      // Show loading
      const loadingToast = toast.loading('Uploading video...');

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 100);

      // In a real implementation, you would upload to your backend
      // For now, we'll create a local object URL for preview
      const videoUrl = URL.createObjectURL(file);

      // Create video player HTML
      const videoHtml = `
        <div class="video-container my-4">
          <video controls class="w-full max-w-2xl mx-auto rounded-lg">
            <source src="${videoUrl}" type="${file.type}">
            Your browser does not support the video tag.
          </video>
          <p class="text-sm text-gray-500 text-center mt-2">Uploaded video: ${file.name}</p>
        </div>
      `;

      // Insert video into editor
      if (editor) {
        editor.chain().focus().insertContent(videoHtml).run();
      }

      clearInterval(progressInterval);
      setUploadProgress(100);
      toast.dismiss(loadingToast);
      toast.success('Video uploaded successfully!');

      // Note: In production, you would upload to your backend and get a permanent URL
      // For now, we're using object URLs which are only valid in this session
    } catch (error) {
      console.error('Video upload error:', error);
      toast.error('Failed to upload video');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  // Function to handle drag and drop
  const handleDrop = (event) => {
    event.preventDefault();
    
    const files = event.dataTransfer.files;
    if (files.length === 0) return;

    const file = files[0];

    if (file.type.startsWith('image/')) {
      uploadImage(file);
    } else if (file.type.startsWith('video/')) {
      uploadVideo(file);
    } else {
      toast.error('Please drop an image or video file');
    }
  };

  // Function to handle paste (for pasting images from clipboard)
  const handlePaste = (event) => {
    const items = event.clipboardData?.items;
    if (!items) return;

    for (const item of items) {
      if (item.type.indexOf('image') !== -1) {
        const file = item.getAsFile();
        if (file) {
          event.preventDefault();
          uploadImage(file);
          break;
        }
      }
    }
  };

  return (
    <div 
      className="border border-gray-300 rounded-lg overflow-hidden"
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      onPaste={handlePaste}
    >
      <MenuBar 
        editor={editor} 
        onUploadImage={uploadImage}
        onUploadVideo={uploadVideo}
        isUploading={isUploading}
      />

      {/* Upload Progress Bar */}
      {isUploading && (
        <div className="px-4 py-2 bg-blue-50 border-b border-blue-100">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm text-blue-700 font-medium">
              Uploading... {uploadProgress}%
            </span>
            <button
              onClick={() => {
                setIsUploading(false);
                setUploadProgress(0);
                toast('Upload cancelled');
              }}
              className="text-blue-700 hover:text-blue-900"
              type="button"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="w-full bg-blue-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Editor Area with Drop Zone Overlay */}
      <div className="relative">
        <EditorContent editor={editor} />
        
        {/* Drop Zone Overlay */}
        <div className="absolute inset-0 pointer-events-none">
          <div className={`hidden w-full h-full border-2 border-dashed border-blue-400 bg-blue-50 bg-opacity-50 items-center justify-center ${isUploading ? 'flex' : ''}`}>
            <div className="text-center">
              <Upload className="h-12 w-12 text-blue-400 mx-auto mb-2" />
              <p className="text-blue-700 font-medium">Uploading...</p>
              <p className="text-blue-600 text-sm">Please wait</p>
            </div>
          </div>
        </div>
      </div>

      {/* Help Text */}
      <div className="px-4 py-2 bg-gray-50 border-t border-gray-200 text-sm text-gray-500">
        <div className="flex flex-wrap items-center gap-4">
          <span>💡 Tips:</span>
          <span>• Drag & drop images/videos directly into editor</span>
          <span>• Paste images from clipboard</span>
          <span>• Use buttons above to upload files</span>
        </div>
      </div>
    </div>
  );
};

export default TipTapEditor;