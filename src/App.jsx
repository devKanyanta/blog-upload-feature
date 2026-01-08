import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import BlogList from './components/BlogList';
import BlogForm from './components/BlogForm';
import BlogView from './components/BlogView';
import Navbar from './components/NavBar';
import PrivateRoute from './components/PrivateRoute';
import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Protected Routes */}
          <Route path="/create" element={
            <PrivateRoute>
              <>
                <Navbar />
                <main className="container mx-auto px-4 py-8">
                  <BlogForm />
                </main>
              </>
            </PrivateRoute>
          } />
          
          <Route path="/edit/:id" element={
            <PrivateRoute>
              <>
                <Navbar />
                <main className="container mx-auto px-4 py-8">
                  <BlogForm />
                </main>
              </>
            </PrivateRoute>
          } />
          
          <Route path="/blog/:id" element={
            <>
                <Navbar />
                <main className="container mx-auto px-4 py-8">
                  <BlogView />
                </main>
              </>
          } />
          <Route path="/" element={
            <> 
              <Navbar />
              <main className="container mx-auto px-4 py-8">
                <BlogList />
              </main>
            </>
          } />
          {/* Redirect root to login if not authenticated */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
        <Toaster 
          position="top-right"
          toastOptions={{
            className: 'border border-gray-200 shadow-sm',
            duration: 3000,
            style: {
              background: '#fff',
              color: '#374151',
            },
          }}
        />
      </div>
    </Router>
  );
}

export default App;