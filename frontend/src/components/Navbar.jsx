import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import LanguageSwitcher from './LanguageSwitcher';

export default function Navbar() {
  const { user, deconnexion } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleDeconnexion = () => { deconnexion(); navigate('/'); };

  const getDashboardLink = () => {
    if (!user) return null;
    const links = { client:'/client', gestionnaire:'/gestionnaire', admin:'/admin', technicien:'/technicien' };
    return links[user.role] || null;
  };

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-logo">
        Auto<span>Link</span>
      </Link>

      <div className="navbar-links">
        <NavLink to="/prestataires" className={({ isActive }) => `navbar-link${isActive ? ' active' : ''}`}>
          {t('nav.prestataires')}
        </NavLink>
        <NavLink to="/#comment-ca-marche" className="navbar-link">
          {t('nav.howItWorks')}
        </NavLink>
      </div>

      <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
        <LanguageSwitcher compact />
        {user ? (
          <>
            {getDashboardLink() && (
              <Link to={getDashboardLink()} className="btn btn-ghost btn-sm">{t('nav.mySpace')}</Link>
            )}
            <button onClick={handleDeconnexion} className="btn btn-outline btn-sm">{t('nav.logout')}</button>
          </>
        ) : (
          <>
            <Link to="/connexion"   className="btn btn-ghost btn-sm">{t('nav.login')}</Link>
            <Link to="/inscription" className="btn btn-gold btn-sm">{t('nav.register')}</Link>
          </>
        )}
      </div>
    </nav>
  );
}
