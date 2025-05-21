import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Header from './components/Header';
import DietPlanner from './components/Dietplanner';
import Dashboard from './components/Dashboard';
import IndentCreation from './components/Indent';
import UserCreation from './components/UserCreation';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Header />

        <main className="max-w-7xl mx-auto px-4 py-8">
          <Routes>
            <Route path="/create" element={<DietPlanner />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/indent" element={<IndentCreation />} />
           <Route path="/user-creation" element={<UserCreation />} />
          </Routes>
        </main>
      </div>
    </Router>
  //  <IndentCreation></IndentCreation>
  );
}

export default App;
