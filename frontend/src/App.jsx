import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Sidebar from './components/Sidebar';
import BottomNav from './components/BottomNav';
import UploadModal from './components/UploadModal';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Budgeting from './pages/Budgeting';
import Reports from './pages/Reports';

const AppContent = () => {
  const location = useLocation();
  const isLoginPage = location.pathname === '/login';
  
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [uploadTrigger, setUploadTrigger] = useState(0);

  const handleUploadSuccess = () => {
    setUploadTrigger((prev) => prev + 1);
  };

  return (
    <div className="flex min-h-screen bg-background text-on-background" style={{ width: '100vw', overflowX: 'hidden' }}>
      {/* Sidebar Navigation */}
      {!isLoginPage && <Sidebar onOpenUpload={() => setIsUploadOpen(true)} />}

      {/* Main Panel */}
      <div className={`flex-1 flex flex-col ${!isLoginPage ? 'md:ml-64 pb-20 md:pb-0' : ''}`} style={{ width: '100%' }}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Dashboard uploadTrigger={uploadTrigger} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/transactions"
            element={
              <ProtectedRoute>
                <Transactions uploadTrigger={uploadTrigger} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/budgeting"
            element={
              <ProtectedRoute>
                <Budgeting uploadTrigger={uploadTrigger} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports"
            element={
              <ProtectedRoute>
                <Reports uploadTrigger={uploadTrigger} />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>

      {/* Mobile Bottom Navigation */}
      {!isLoginPage && <BottomNav onOpenUpload={() => setIsUploadOpen(true)} />}

      {/* Drag & Drop Statement Uploader Modal */}
      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onUploadSuccess={handleUploadSuccess}
      />
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;
