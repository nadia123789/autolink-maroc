import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import './index.css';

// Publiques
import HomePage            from './pages/HomePage';
import PrestatairesPage    from './pages/PrestatairesPage';
import PrestatairePage     from './pages/PrestatairePage';
import ConnexionPage       from './pages/ConnexionPage';
import InscriptionPage     from './pages/InscriptionPage';

// Client
import ClientDashboard     from './pages/client/Dashboard';
import MesVehicules        from './pages/client/MesVehicules';
import MesRdv              from './pages/client/MesRdv';
import NouveauRdv          from './pages/client/NouveauRdv';
import SuiviTempsReel      from './pages/client/SuiviTempsReel';
import Notifications       from './pages/client/Notifications';
import MesDevis            from './pages/client/MesDevis';
import HistoriqueVehicule  from './pages/client/HistoriqueVehicule';
import PaiementFidelite    from './pages/client/PaiementFidelite';

// Gestionnaire
import GestDashboard       from './pages/gestionnaire/Dashboard';
import GestRdv             from './pages/gestionnaire/Rdv';
import GestStock           from './pages/gestionnaire/Stock';
import GestProfil          from './pages/gestionnaire/Profil';
import GestTechniciens     from './pages/gestionnaire/Techniciens';
import { GestDevis, GestPromotions, GestClients } from './pages/gestionnaire/DevisPromoClients';
import GestDiagnostic from './pages/gestionnaire/Diagnostic';

// Technicien
import TechnicienDashboard from './pages/technicien/Dashboard';
import GuidesReparation    from './pages/technicien/Guides';

// Admin
import { AdminDashboard, AdminUtilisateurs, AdminPrestataires } from './pages/admin/Admin';

// Global
import Navbar  from './components/Navbar';
import Chatbot from './components/Chatbot';

const ProtectedRoute = ({ children, roles }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/connexion" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
};

function AppInner() {
  return (
    <>
      <Routes>
        {/* PUBLIQUES */}
        <Route path="/"                 element={<><Navbar /><HomePage /></>} />
        <Route path="/prestataires"     element={<><Navbar /><PrestatairesPage /></>} />
        <Route path="/prestataires/:id" element={<><Navbar /><PrestatairePage /></>} />
        <Route path="/connexion"        element={<ConnexionPage />} />
        <Route path="/inscription"      element={<InscriptionPage />} />

        {/* CLIENT */}
        <Route path="/client"                        element={<ProtectedRoute roles={['client']}><ClientDashboard /></ProtectedRoute>} />
        <Route path="/client/vehicules"              element={<ProtectedRoute roles={['client']}><MesVehicules /></ProtectedRoute>} />
        <Route path="/client/vehicules/:id/historique" element={<ProtectedRoute roles={['client']}><HistoriqueVehicule /></ProtectedRoute>} />
        <Route path="/client/rdv"                    element={<ProtectedRoute roles={['client']}><MesRdv /></ProtectedRoute>} />
        <Route path="/client/rdv/nouveau"            element={<ProtectedRoute roles={['client']}><NouveauRdv /></ProtectedRoute>} />
        <Route path="/client/suivi"                  element={<ProtectedRoute roles={['client']}><SuiviTempsReel /></ProtectedRoute>} />
        <Route path="/client/notifications"          element={<ProtectedRoute roles={['client']}><Notifications /></ProtectedRoute>} />
        <Route path="/client/devis"                  element={<ProtectedRoute roles={['client']}><MesDevis /></ProtectedRoute>} />
        <Route path="/client/paiement"               element={<ProtectedRoute roles={['client']}><PaiementFidelite /></ProtectedRoute>} />

        {/* GESTIONNAIRE */}
        <Route path="/gestionnaire"             element={<ProtectedRoute roles={['gestionnaire']}><GestDashboard /></ProtectedRoute>} />
        <Route path="/gestionnaire/rdv"         element={<ProtectedRoute roles={['gestionnaire']}><GestRdv /></ProtectedRoute>} />
        <Route path="/gestionnaire/stock"       element={<ProtectedRoute roles={['gestionnaire']}><GestStock /></ProtectedRoute>} />
        <Route path="/gestionnaire/profil"      element={<ProtectedRoute roles={['gestionnaire']}><GestProfil /></ProtectedRoute>} />
        <Route path="/gestionnaire/techniciens" element={<ProtectedRoute roles={['gestionnaire']}><GestTechniciens /></ProtectedRoute>} />
        <Route path="/gestionnaire/devis"       element={<ProtectedRoute roles={['gestionnaire']}><GestDevis /></ProtectedRoute>} />
        <Route path="/gestionnaire/promotions"  element={<ProtectedRoute roles={['gestionnaire']}><GestPromotions /></ProtectedRoute>} />
        <Route path="/gestionnaire/clients"     element={<ProtectedRoute roles={['gestionnaire']}><GestClients /></ProtectedRoute>} />
        <Route
  path="/gestionnaire/diagnostic"
  element={
    <ProtectedRoute roles={['gestionnaire']}>
      <GestDiagnostic />
    </ProtectedRoute>
  }
/>
        {/* TECHNICIEN */}
        <Route path="/technicien"        element={<ProtectedRoute roles={['technicien']}><TechnicienDashboard /></ProtectedRoute>} />
        <Route path="/technicien/guides" element={<ProtectedRoute roles={['technicien']}><GuidesReparation /></ProtectedRoute>} />

        {/* ADMIN */}
        <Route path="/admin"              element={<ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/utilisateurs" element={<ProtectedRoute roles={['admin']}><AdminUtilisateurs /></ProtectedRoute>} />
        <Route path="/admin/prestataires" element={<ProtectedRoute roles={['admin']}><AdminPrestataires /></ProtectedRoute>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Chatbot />
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppInner />
      </BrowserRouter>
    </AuthProvider>
  );
}
