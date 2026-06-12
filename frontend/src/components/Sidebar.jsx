import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Car,
  Calendar,
  Wrench,
  FileText,
  CreditCard,
  Bell,
  Building2,
  Users,
  Package,
  Gift,
  BookOpen,
  UserCog,
  Store,
  LogOut,
  UserCircle
} from 'lucide-react';

const menuClient = [
  { label: 'Tableau de bord',   icon: LayoutDashboard, to: '/client',              end: true },
  { label: 'Mes véhicules',     icon: Car,             to: '/client/vehicules' },
  { label: 'Mes rendez-vous',   icon: Calendar,        to: '/client/rdv' },
  { label: 'Suivi temps réel',  icon: Wrench,          to: '/client/suivi' },
  { label: 'Mes devis',         icon: FileText,        to: '/client/devis' },
  { label: 'Paiements',icon: CreditCard,      to: '/client/paiement' },
  { label: 'Notifications',     icon: Bell,            to: '/client/notifications' },
];

const menuGestionnaire = [
  { label: 'Tableau de bord',   icon: LayoutDashboard, to: '/gestionnaire',             end: true },
  { label: 'Mon établissement', icon: Building2,       to: '/gestionnaire/profil' },
  { label: 'Rendez-vous',       icon: Calendar,        to: '/gestionnaire/rdv' },
  { label: 'Techniciens',       icon: Users,           to: '/gestionnaire/techniciens' },
  { label: 'Fiches clients',    icon: UserCircle,      to: '/gestionnaire/clients' },
  { label: 'Diagnostic',        icon: Wrench,          to: '/gestionnaire/diagnostic' },
  { label: 'Devis & Factures',  icon: FileText,        to: '/gestionnaire/devis' },
  { label: 'Stock pièces',      icon: Package,         to: '/gestionnaire/stock' },
  { label: 'Promotions',        icon: Gift,            to: '/gestionnaire/promotions' },
  
];

const menuTechnicien = [
  { label: 'Mes interventions',    icon: Wrench,    to: '/technicien', end: true },
  { label: 'Guides de réparation', icon: BookOpen,  to: '/technicien/guides' },
];

const menuAdmin = [
  { label: 'Tableau de bord',  icon: LayoutDashboard, to: '/admin',              end: true },
  { label: 'Utilisateurs',     icon: Users,           to: '/admin/utilisateurs' },
  { label: 'Prestataires',     icon: Store,           to: '/admin/prestataires' },
];

export default function Sidebar() {
  const { user, deconnexion } = useAuth();
  const navigate = useNavigate();

  const menu =
    user?.role === 'gestionnaire' ? menuGestionnaire :
    user?.role === 'technicien'   ? menuTechnicien   :
    user?.role === 'admin'        ? menuAdmin         :
    menuClient;

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        AutoLink <span style={{ color: 'var(--white)', fontWeight: 400 }}>Maroc</span>
      </div>
      <div style={{ padding: '0 16px 16px', borderBottom: '1px solid var(--dark-4)' }}>
        <div style={{ fontSize: '13px', color: 'var(--gray-light)' }}>Connecté en tant que</div>
        <div style={{ fontWeight: 600, marginTop: '2px' }}>{user?.prenom} {user?.nom}</div>
        <span className="badge badge-gold" style={{ marginTop: '6px' }}>{user?.role}</span>
      </div>
      <nav className="sidebar-section" style={{ flex: 1 }}>
        {menu.map(item => {
          const IconComponent = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
            >
              <span className="sidebar-icon">
                <IconComponent size={20} strokeWidth={1.5} />
              </span>
              {item.label}
            </NavLink>
          );
        })}
      </nav>
      <div style={{ padding: '16px', borderTop: '1px solid var(--dark-4)' }}>
        <button
          onClick={() => { deconnexion(); navigate('/'); }}
          className="btn btn-ghost btn-sm btn-full"
        >
          <LogOut size={18} style={{ marginRight: '8px' }} />
          Déconnexion
        </button>
      </div>
    </aside>
  );
}