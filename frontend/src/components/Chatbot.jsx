import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../utils/api';

function Message({ msg }) {
  const isBot = msg.role === 'assistant';

  return (
    <div style={{
      display: 'flex',
      justifyContent: isBot ? 'flex-start' : 'flex-end',
      marginBottom: '12px',
      gap: '8px',
      alignItems: 'flex-end',
    }}>
      {isBot && (
        <div style={{
          width: '32px',
          height: '32px',
          flexShrink: 0,
          background: 'linear-gradient(135deg, var(--accent-dark), var(--accent))',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '16px',
        }}>
          🤖
        </div>
      )}

      <div style={{
        maxWidth: '78%',
        padding: '12px 16px',
        borderRadius: isBot ? '4px 16px 16px 16px' : '16px 16px 4px 16px',
        background: isBot ? 'var(--bg-3)' : 'linear-gradient(135deg, var(--accent-dark), var(--accent))',
        color: isBot ? 'var(--text)' : '#fff',
        fontSize: '14px',
        lineHeight: 1.6,
        border: isBot ? '1.5px solid var(--bg-4)' : 'none',
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word',
      }}>
        {msg.content}

        {msg.loading && (
          <span style={{
            display: 'inline-flex',
            gap: '3px',
            marginLeft: '6px',
          }}>
            {[0, 1, 2].map(i => (
              <span key={i} style={{
                width: '5px',
                height: '5px',
                borderRadius: '50%',
                background: 'var(--gray)',
                display: 'inline-block',
                animation: `bounce 1s ease-in-out ${i * 0.15}s infinite`,
              }} />
            ))}
          </span>
        )}
      </div>
    </div>
  );
}

export default function Chatbot() {
  const { t } = useTranslation();

  const [ouvert, setOuvert] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [notification, setNotification] = useState(true);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Load suggestions
  useEffect(() => {
    api.get('/chatbot/suggestions')
      .then(r => setSuggestions(r.data))
      .catch(() => {});
  }, []);

  // Welcome message
  useEffect(() => {
    if (ouvert && messages.length === 0) {
      setMessages([{
        role: 'assistant',
        content: t('chatbot.welcome')
      }]);
    }
  }, [ouvert, messages.length, t]);

  // Scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input
  useEffect(() => {
    if (ouvert) setTimeout(() => inputRef.current?.focus(), 100);
  }, [ouvert]);

  const envoyerMessage = async (texte) => {
    const msgTexte = texte || input.trim();
    if (!msgTexte || loading) return;

    setInput('');
    setNotification(false);

    const historique = messages.filter(m => !m.loading);
    const nouveaux = [...historique, { role: 'user', content: msgTexte }];

    setMessages([...nouveaux, { role: 'assistant', content: '', loading: true }]);
    setLoading(true);

    try {
      // ✅ Backend Gemini call ONLY
      const { data } = await api.post('/chatbot', {
        message: msgTexte,
        historique,
      });

      setMessages([
        ...nouveaux,
        {
          role: 'assistant',
          content: data.reponse
        }
      ]);

    } catch (err) {
      console.error(err);

      setMessages([
        ...nouveaux,
        {
          role: 'assistant',
          content: "❌ Erreur serveur chatbot"
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      envoyerMessage();
    }
  };

  const afficherSuggestions = messages.length <= 1;

  return (
    <>
      {/* Animations */}
      <style>{`
        @keyframes bounce {
          0%,100%{transform:translateY(0);opacity:0.4}
          50%{transform:translateY(-4px);opacity:1}
        }
        @keyframes slideUp {
          from{opacity:0;transform:translateY(20px) scale(0.95)}
          to{opacity:1;transform:translateY(0) scale(1)}
        }
        @keyframes pulse {
          0%,100%{transform:scale(1)}
          50%{transform:scale(1.05)}
        }
      `}</style>

      {/* CHAT WINDOW */}
      {ouvert && (
        <div style={{
          position: 'fixed',
          bottom: '96px',
          right: '24px',
          width: '380px',
          height: '580px',
          background: 'var(--bg-2)',
          border: '1.5px solid var(--bg-4)',
          borderRadius: '20px',
          boxShadow: 'var(--shadow-lg)',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 9999,
          animation: 'slideUp 0.25s ease',
          overflow: 'hidden',
        }}>

          {/* Header */}
          <div style={{
            padding: '14px 18px',
            background: 'linear-gradient(135deg, var(--accent-dark), var(--accent))',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              background: 'rgba(255,255,255,0.2)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '20px',
            }}>
              🤖
            </div>

            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, color: '#fff' }}>
                {t('chatbot.title')}
              </div>
              <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.8)' }}>
                🟢 {t('chatbot.online')}
              </div>
            </div>

            <button
              onClick={() => setMessages([])}
              style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '8px', cursor: 'pointer', color: '#fff' }}
            >
              🗑️
            </button>

            <button
              onClick={() => setOuvert(false)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#fff', fontSize: '22px' }}
            >
              ×
            </button>
          </div>

          {/* Messages */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '16px',
          }}>
            {messages.map((msg, i) => (
              <Message key={i} msg={msg} />
            ))}

            {/* Suggestions */}
            {afficherSuggestions && suggestions.length > 0 && (
              <div style={{ marginTop: '10px' }}>
                <div style={{ fontSize: '12px', color: 'var(--gray)', marginBottom: '8px' }}>
                  {t('chatbot.frequent')}
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {suggestions.map((s, i) => (
                    <button
                      key={i}
                      onClick={() => envoyerMessage(s.texte)}
                      style={{
                        background: 'var(--bg-3)',
                        border: '1.5px solid var(--bg-4)',
                        padding: '7px 12px',
                        borderRadius: '20px',
                        cursor: 'pointer',
                        fontSize: '12px',
                      }}
                    >
                      {s.icon} {s.texte}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div style={{
            padding: '12px',
            borderTop: '1.5px solid var(--bg-4)',
            display: 'flex',
            gap: '8px',
            background: 'var(--bg-3)',
          }}>
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t('chatbot.placeholder')}
              disabled={loading}
              rows={1}
              style={{
                flex: 1,
                borderRadius: '12px',
                padding: '10px',
                border: '1.5px solid var(--bg-4)',
                resize: 'none',
              }}
            />

            <button
              onClick={() => envoyerMessage()}
              disabled={loading || !input.trim()}
              style={{
                width: '40px',
                borderRadius: '12px',
                border: 'none',
                background: loading ? 'var(--bg-4)' : 'var(--accent)',
                color: '#fff',
                cursor: 'pointer',
              }}
            >
              {loading ? '⏳' : '➤'}
            </button>
          </div>
        </div>
      )}

      {/* FLOAT BUTTON */}
      <button
        onClick={() => {
          setOuvert(o => !o);
          setNotification(false);
        }}
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, var(--accent-dark), var(--accent))',
          border: 'none',
          color: '#fff',
          fontSize: '28px',
          cursor: 'pointer',
          zIndex: 10000,
          animation: !ouvert ? 'pulse 3s infinite' : 'none',
        }}
      >
        {ouvert ? '✕' : '🤖'}
      </button>
    </>
  );
}