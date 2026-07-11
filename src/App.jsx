import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import AnimalProfile from './pages/AnimalProfile';
import AddAnimal from './pages/AddAnimal';
import ScanAnimal from './pages/ScanAnimal';
import CaretakerChecklist from './pages/CaretakerChecklist';
import Analytics from './pages/Analytics';
import RescueAssistant from './pages/RescueAssistant';
import AlertsPage from './pages/Alerts';
import ProtectedRoute from './components/ProtectedRoute';
import Toast from './components/Toast';
import socket from './services/socket';
import Help from './pages/Help';
import ScrollToTop from './components/ScrollToTop';

function App() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    // This listener is now attached ONCE for the entire app session —
    // it survives every page navigation, so no alert ever gets missed
    // and toasts persist correctly across route changes.
    const handleNewAlert = (alert) => {
      const toastId = Date.now() + Math.random();
      setToasts((prev) => [...prev, { ...alert, id: toastId }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== toastId));
      }, 6000);
    };

    socket.on('newAlert', handleNewAlert);

    return () => {
      socket.off('newAlert', handleNewAlert);
    };
  }, []);

  return (
     <BrowserRouter>
      <Toast toasts={toasts} />
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/animal/:id" element={<ProtectedRoute><AnimalProfile /></ProtectedRoute>} />
        <Route path="/add-animal" element={<ProtectedRoute><AddAnimal /></ProtectedRoute>} />
        <Route path="/scan" element={<ProtectedRoute><ScanAnimal /></ProtectedRoute>} />
        <Route path="/caretaker/:animalId" element={<ProtectedRoute><CaretakerChecklist /></ProtectedRoute>} />
        <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
        <Route path="/rescue" element={<ProtectedRoute><RescueAssistant /></ProtectedRoute>} />
        <Route path="/alerts" element={<ProtectedRoute><AlertsPage /></ProtectedRoute>} />
        <Route path="/help" element={<ProtectedRoute><Help /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;