import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider } from '@/lib/AuthContext';
import ScrollToTop from './components/ScrollToTop';
import Layout from '@/components/flux/Layout';
import Dashboard from '@/pages/Dashboard';
import SignalDetail from '@/pages/SignalDetail';
import Brief from '@/pages/Brief';
import Validate from '@/pages/Validate';
import Compare from '@/pages/Compare';
import Templates from '@/pages/Templates';
import Alerts from '@/pages/Alerts';
import Reports from '@/pages/Reports';
import HealthMonitor from '@/pages/HealthMonitor';

const AuthenticatedApp = () => (
  <Routes>
    <Route element={<Layout />}>
      <Route path="/" element={<Dashboard />} />
      <Route path="/signals/:id" element={<SignalDetail />} />
      <Route path="/signals/:id/brief" element={<Brief />} />
      <Route path="/validate" element={<Validate />} />
      <Route path="/compare" element={<Compare />} />
      <Route path="/templates" element={<Templates />} />
      <Route path="/alerts" element={<Alerts />} />
      <Route path="/reports" element={<Reports />} />
      <Route path="/health" element={<HealthMonitor />} />
    </Route>
    <Route path="*" element={<PageNotFound />} />
  </Routes>
);


function App() {

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <ScrollToTop />
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App