import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

const LANGS = [
  { code: 'fr', label: 'Français', flag: '🇫🇷', short: 'FR' },
  { code: 'ar', label: 'العربية',  flag: '🇲🇦', short: 'ع' },
  { code: 'en', label: 'English',  flag: '🇬🇧', short: 'EN' },
];

export default function LanguageSwitcher({ compact = false }) {
  const { i18n } = useTranslation();
  const [open, setOpen] = useState(false);

  const current = LANGS.find(l => l.code === i18n.language) || LANGS[0];

  const changeLanguage = (code) => {
    i18n.changeLanguage(code);
    setOpen(false);
  };

  if (compact) {
    // Version compacte pour la navbar
    return (
      <div style={{ position: 'relative' }}>
        <button
          onClick={() => setOpen(o => !o)}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '7px 12px', borderRadius: '8px',
            background: 'var(--bg-3)', border: '1.5px solid var(--bg-4)',
            cursor: 'pointer', fontSize: '13px', fontWeight: 600,
            color: 'var(--text-2)', fontFamily: 'var(--font-body)',
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
          onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--bg-4)'}
        >
          <span style={{ fontSize: '16px' }}>{current.flag}</span>
          <span>{current.short}</span>
          <span style={{ fontSize: '10px', opacity: 0.6 }}>▾</span>
        </button>

        {open && (
          <>
            {/* Overlay pour fermer */}
            <div
              onClick={() => setOpen(false)}
              style={{ position: 'fixed', inset: 0, zIndex: 998 }}
            />
            <div style={{
              position: 'absolute',
              top: 'calc(100% + 8px)',
              right: 0,
              background: 'var(--bg-2)',
              border: '1.5px solid var(--bg-4)',
              borderRadius: '12px',
              boxShadow: 'var(--shadow-lg)',
              overflow: 'hidden',
              zIndex: 999,
              minWidth: '160px',
            }}>
              {LANGS.map(lang => (
                <button
                  key={lang.code}
                  onClick={() => changeLanguage(lang.code)}
                  style={{
                    width: '100%',
                    display: 'flex', alignItems: 'center', gap: '10px',
                    padding: '11px 16px',
                    background: lang.code === i18n.language ? 'var(--accent-soft)' : 'transparent',
                    border: 'none', cursor: 'pointer',
                    color: lang.code === i18n.language ? 'var(--accent)' : 'var(--text)',
                    fontFamily: 'var(--font-body)', fontSize: '14px', fontWeight: 500,
                    textAlign: i18n.language === 'ar' ? 'right' : 'left',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={e => { if (lang.code !== i18n.language) e.currentTarget.style.background = 'var(--bg-3)'; }}
                  onMouseLeave={e => { if (lang.code !== i18n.language) e.currentTarget.style.background = 'transparent'; }}
                >
                  <span style={{ fontSize: '18px' }}>{lang.flag}</span>
                  <span>{lang.label}</span>
                  {lang.code === i18n.language && (
                    <span style={{ marginLeft: 'auto', color: 'var(--accent)', fontWeight: 700 }}>✓</span>
                  )}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    );
  }

  // Version complète (settings page)
  return (
    <div style={{ display: 'flex', gap: '10px' }}>
      {LANGS.map(lang => (
        <button
          key={lang.code}
          onClick={() => changeLanguage(lang.code)}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '10px 18px', borderRadius: '10px',
            background: lang.code === i18n.language ? 'var(--accent-soft)' : 'var(--bg-3)',
            border: `1.5px solid ${lang.code === i18n.language ? 'var(--accent)' : 'var(--bg-4)'}`,
            cursor: 'pointer', fontSize: '14px', fontWeight: 600,
            color: lang.code === i18n.language ? 'var(--accent)' : 'var(--text-2)',
            fontFamily: 'var(--font-body)', transition: 'all 0.2s',
          }}
        >
          <span style={{ fontSize: '20px' }}>{lang.flag}</span>
          {lang.label}
        </button>
      ))}
    </div>
  );
}
