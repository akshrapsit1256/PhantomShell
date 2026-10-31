import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import ToastContainer from './components/Toast';

// Pages
import Dashboard from './pages/Dashboard';
import HauntedTerminal from './pages/HauntedTerminal';
import ErrorExorcist from './pages/ErrorExorcist';
import CommandOracle from './pages/CommandOracle';
import CodeCrypt from './pages/CodeCrypt';
import SessionJournal from './pages/SessionJournal';
import Settings from './pages/Settings';
import About from './pages/About';

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <div className="app-container">
          <Sidebar />
          <div className="main-content">
            <Navbar />
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/terminal" element={<HauntedTerminal />} />
              <Route path="/errors" element={<ErrorExorcist />} />
              <Route path="/commands" element={<CommandOracle />} />
              <Route path="/code-crypt" element={<CodeCrypt />} />
              <Route path="/journal" element={<SessionJournal />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/about" element={<About />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
          <ToastContainer />
        </div>
      </BrowserRouter>
    </AppProvider>
  );
}
