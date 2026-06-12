import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import LanguageSwitcher from '../components/LanguageSwitcher';

export function ConnexionPage() {
  const { connexion } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [form, setForm]     = useState({ email:'', mot_de_passe:'' });
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      const user = await connexion(form.email, form.mot_de_passe);
      const redirects = { client:'/client', gestionnaire:'/gestionnaire', admin:'/admin', technicien:'/technicien' };
      navigate(redirects[user.role] || '/');
    } catch (err) {
      setError(err.response?.data?.message || t('auth.error_invalid'));
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight:'100vh', background:'var(--bg)', display:'flex', alignItems:'center', justifyContent:'center', padding:'24px' }}>
      <div style={{ width:'100%', maxWidth:'440px' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'32px' }}>
          <Link to="/" style={{ fontFamily:'var(--font-display)', fontSize:'26px', fontWeight:800, color:'var(--accent)' }}>
            AutoLink <span style={{ color:'var(--text)' }}>Maroc</span>
          </Link>
          <LanguageSwitcher compact />
        </div>
        <div className="card">
          <h1 style={{ fontFamily:'var(--font-display)', fontSize:'24px', fontWeight:700, marginBottom:'24px' }}>
            {t('auth.login_title')}
          </h1>
          {error && <div className="alert alert-error">{error}</div>}
          <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:'16px' }}>
            <div className="form-group">
              <label className="form-label">{t('auth.email')}</label>
              <input type="email" className="form-input" required placeholder="votre@email.ma"
                value={form.email} onChange={e => setForm(f => ({...f, email:e.target.value}))} />
            </div>
            <div className="form-group">
              <label className="form-label">{t('auth.password')}</label>
              <input type="password" className="form-input" required placeholder={t('auth.password_placeholder')}
                value={form.mot_de_passe} onChange={e => setForm(f => ({...f, mot_de_passe:e.target.value}))} />
            </div>
            <button type="submit" disabled={loading} className="btn btn-gold btn-full btn-lg" style={{ marginTop:'8px' }}>
              {loading ? t('auth.login_loading') : t('auth.login_btn')}
            </button>
          </form>
          <p style={{ textAlign:'center', marginTop:'20px', fontSize:'14px', color:'var(--gray)' }}>
            {t('auth.no_account')}{' '}
            <Link to="/inscription" style={{ color:'var(--accent)', fontWeight:600 }}>{t('auth.register_link')}</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export function InscriptionPage() {
  const { inscription } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [form, setForm]     = useState({ nom:'', prenom:'', email:'', telephone:'', mot_de_passe:'', role:'client' });
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      const user = await inscription(form);
      navigate(user.role === 'gestionnaire' ? '/gestionnaire' : '/client');
    } catch (err) {
      setError(err.response?.data?.message || t('auth.error_generic'));
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight:'100vh', background:'var(--bg)', display:'flex', alignItems:'center', justifyContent:'center', padding:'24px' }}>
      <div style={{ width:'100%', maxWidth:'480px' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'32px' }}>
          <Link to="/" style={{ fontFamily:'var(--font-display)', fontSize:'26px', fontWeight:800, color:'var(--accent)' }}>
            AutoLink <span style={{ color:'var(--text)' }}>Maroc</span>
          </Link>
          <LanguageSwitcher compact />
        </div>
        <div className="card">
          <h1 style={{ fontFamily:'var(--font-display)', fontSize:'24px', fontWeight:700, marginBottom:'24px' }}>
            {t('auth.register_title')}
          </h1>
          {error && <div className="alert alert-error">{error}</div>}
          <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:'14px' }}>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">{t('auth.firstname')}</label>
                <input type="text" className="form-input" required placeholder="Youssef"
                  value={form.prenom} onChange={e => setForm(f=>({...f,prenom:e.target.value}))} />
              </div>
              <div className="form-group">
                <label className="form-label">{t('auth.lastname')}</label>
                <input type="text" className="form-input" required placeholder="Alami"
                  value={form.nom} onChange={e => setForm(f=>({...f,nom:e.target.value}))} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">{t('auth.email')}</label>
              <input type="email" className="form-input" required placeholder="votre@email.ma"
                value={form.email} onChange={e => setForm(f=>({...f,email:e.target.value}))} />
            </div>
            <div className="form-group">
              <label className="form-label">{t('auth.phone')}</label>
              <input type="tel" className="form-input" placeholder="06 12 34 56 78"
                value={form.telephone} onChange={e => setForm(f=>({...f,telephone:e.target.value}))} />
            </div>
            <div className="form-group">
              <label className="form-label">{t('auth.password')}</label>
              <input type="password" className="form-input" required placeholder={t('auth.password_placeholder')}
                value={form.mot_de_passe} onChange={e => setForm(f=>({...f,mot_de_passe:e.target.value}))} />
            </div>
            <div className="form-group">
              <label className="form-label">{t('auth.iam')}</label>
              <select className="form-select" value={form.role} onChange={e => setForm(f=>({...f,role:e.target.value}))}>
                <option value="client">{t('auth.role_client')}</option>
                <option value="gestionnaire">{t('auth.role_gestionnaire')}</option>
              </select>
            </div>
            <button type="submit" disabled={loading} className="btn btn-gold btn-full btn-lg" style={{ marginTop:'8px' }}>
              {loading ? t('auth.register_loading') : t('auth.register_btn')}
            </button>
          </form>
          <p style={{ textAlign:'center', marginTop:'20px', fontSize:'14px', color:'var(--gray)' }}>
            {t('auth.have_account')}{' '}
            <Link to="/connexion" style={{ color:'var(--accent)', fontWeight:600 }}>{t('auth.login_link')}</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default ConnexionPage;
