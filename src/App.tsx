import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MenuIcon } from 'lucide-react';
import Navigation from './components/Navigation';
import UserMenu from './components/UserMenu';
import Dashboard from './pages/Dashboard';
import Members from './pages/Members';
import BillDetails from './pages/BillDetails';
import MemberDetails from './pages/MemberDetails';
import UserDashboard from './pages/UserDashboard';
import UserSettings from './pages/UserSettings';

const queryClient = new QueryClient();

function App() {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="min-h-screen flex flex-col bg-gray-50">
          <header className="bg-blue-700 text-white shadow-lg">
            <div className="container mx-auto px-4 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="md:hidden"
                  >
                    <MenuIcon className="h-6 w-6" />
                  </button>
                  <h1 className="text-2xl font-bold">Congress Tracker</h1>
                </div>
                <div className="hidden md:flex items-center space-x-6">
                  <Navigation />
                </div>
                <div className="flex items-center space-x-6">
                  <UserMenu />
                </div>
              </div>
            </div>
          </header>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="md:hidden bg-blue-600 text-white">
              <div className="container mx-auto px-4 py-2">
                <Navigation />
              </div>
            </div>
          )}

          <main className="container mx-auto px-4 py-8 flex-grow">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/members" element={<Members />} />
              <Route path="/bill/:congress/:type/:number" element={<BillDetails />} />
              <Route path="/member/:bioguideId" element={<MemberDetails />} />
              <Route path="/dashboard" element={<UserDashboard />} />
              <Route path="/settings" element={<UserSettings />} />
            </Routes>
          </main>

          <footer className="bg-gray-800 text-white py-8 mt-auto">
            <div className="container mx-auto px-4">
              <p className="text-center text-gray-400">
                Powered by the Congress.gov API. This is not an official government website.
              </p>
            </div>
          </footer>
        </div>
      </Router>
    </QueryClientProvider>
  );
}

export default App;