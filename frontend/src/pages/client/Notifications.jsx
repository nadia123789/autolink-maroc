import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, 
  Calendar, 
  FileText, 
  AlertTriangle, 
  Wrench, 
  MessageSquare, 
  Package, 
  CheckCircle, 
  XCircle,
  Trash2,
  Mail,
  Clock,
  CheckCheck
} from 'lucide-react';
import Sidebar from '../../components/Sidebar';
import api from '../../utils/api';

const TYPE_ICONS = {
  nouveau_rdv: { icon: Calendar, color: '#3b82f6', label: 'Nouveau RDV' },
  devis: { icon: FileText, color: '#f59e0b', label: 'Devis' },
  devis_reponse: { icon: FileText, color: '#10b981', label: 'Réponse devis' },
  anomalie: { icon: AlertTriangle, color: '#ef4444', label: 'Anomalie' },
  assignation: { icon: Wrench, color: '#8b5cf6', label: 'Assignation' },
  chatbot: { icon: MessageSquare, color: '#06b6d4', label: 'Chatbot' },
  stock: { icon: Package, color: '#84cc16', label: 'Stock' },
  default: { icon: Bell, color: '#6b7280', label: 'Notification' },
};

// Animation variants
const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.05
    }
  }
};

export default function Notifications() {
  const [notifs, setNotifs]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  const fetch = async () => {
    setLoading(true);
    const { data } = await api.get('/notifications');
    setNotifs(data.notifications);
    setLoading(false);
  };

  useEffect(() => { fetch(); }, []);

  const lireTout = async () => {
    await api.put('/notifications/lire-tout');
    setNotifs(prev => prev.map(n => ({ ...n, est_lue: true })));
  };

  const supprimer = async (id) => {
    setDeletingId(id);
    await api.delete(`/notifications/${id}`);
    setNotifs(prev => prev.filter(n => n.id !== id));
    setDeletingId(null);
  };

  const nonLues = notifs.filter(n => !n.est_lue).length;

  const getTimeAgo = (date) => {
    const now = new Date();
    const past = new Date(date);
    const diffMs = now - past;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'À l\'instant';
    if (diffMins < 60) return `Il y a ${diffMins} min`;
    if (diffHours < 24) return `Il y a ${diffHours} h`;
    if (diffDays === 1) return 'Hier';
    return past.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  };

  return (
    <div className="dashboard-layout" style={{ background: '#0a0a0a', minHeight: '100vh' }}>
      <Sidebar />
      <main className="dashboard-content" style={{ padding: '32px 40px' }}>
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex-between" 
          style={{ marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}
        >
          <div>
            <motion.h1 
              initial={{ x: -20 }}
              animate={{ x: 0 }}
              style={{ 
                fontFamily: 'var(--font-display)', 
                fontSize: '32px', 
                fontWeight: 800,
                background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}
            >
              <Bell size={32} color="#ef4444" />
              Notifications
              {nonLues > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="badge"
                  style={{ 
                    background: 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)',
                    color: 'white',
                    fontSize: '14px',
                    padding: '4px 10px'
                  }}
                >
                  {nonLues}
                </motion.span>
              )}
            </motion.h1>
            <motion.p 
              initial={{ x: -20 }}
              animate={{ x: 0 }}
              transition={{ delay: 0.1 }}
              style={{ color: '#9ca3af', marginTop: '4px' }}
            >
              {notifs.length} notification(s) au total
            </motion.p>
          </div>
          {nonLues > 0 && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={lireTout}
              className="btn btn-ghost btn-sm"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: '#1a1a1a',
                color: '#ef4444',
                border: '1px solid rgba(220, 38, 38, 0.3)'
              }}
            >
              <CheckCheck size={16} />
              Tout marquer lu
            </motion.button>
          )}
        </motion.div>

        {/* Notifications List */}
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div 
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                style={{
                  width: '50px',
                  height: '50px',
                  border: '3px solid #dc2626',
                  borderTopColor: 'transparent',
                  borderRadius: '50%'
                }}
              />
            </motion.div>
          ) : notifs.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              style={{ 
                textAlign: 'center', 
                padding: '80px', 
                background: '#1a1a1a',
                borderRadius: '24px',
                border: '1px solid rgba(220, 38, 38, 0.2)'
              }}
            >
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Bell size={64} color="#4b5563" style={{ marginBottom: '16px' }} />
              </motion.div>
              <h3 style={{ color: '#ef4444', marginBottom: '12px' }}>Aucune notification</h3>
              <p style={{ color: '#9ca3af' }}>Vous serez notifié des événements importants ici.</p>
            </motion.div>
          ) : (
            <motion.div
              key="list"
              variants={staggerContainer}
              initial="initial"
              animate="animate"
              style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}
            >
              {notifs.map((n, index) => {
                const typeInfo = TYPE_ICONS[n.type] || TYPE_ICONS.default;
                const IconComponent = typeInfo.icon;
                const isUnread = !n.est_lue;
                
                return (
                  <motion.div
                    key={n.id}
                    variants={fadeInUp}
                    layout
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 50 }}
                    whileHover={{ scale: 1.01, x: 5 }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '16px',
                      padding: '20px',
                      background: isUnread ? 'linear-gradient(135deg, #1a1a1a 0%, #1f1f1f 100%)' : '#111111',
                      border: `1px solid ${isUnread ? 'rgba(220, 38, 38, 0.3)' : 'rgba(255,255,255,0.05)'}`,
                      borderRadius: '16px',
                      transition: 'all 0.3s ease',
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                  >
                    {/* Animated background for unread */}
                    {isUnread && (
                      <motion.div
                        animate={{ 
                          scale: [1, 1.1, 1],
                          opacity: [0.3, 0.5, 0.3]
                        }}
                        transition={{ duration: 2, repeat: Infinity }}
                        style={{
                          position: 'absolute',
                          top: '-50%',
                          right: '-50%',
                          width: '200px',
                          height: '200px',
                          background: 'radial-gradient(circle, rgba(220, 38, 38, 0.1) 0%, transparent 70%)',
                          borderRadius: '50%'
                        }}
                      />
                    )}
                    
                    {/* Icon */}
                    <motion.div
                      whileHover={{ rotate: 360, scale: 1.1 }}
                      transition={{ duration: 0.5 }}
                      style={{
                        width: '52px',
                        height: '52px',
                        borderRadius: '14px',
                        background: isUnread ? `linear-gradient(135deg, ${typeInfo.color}20 0%, ${typeInfo.color}10 100%)` : '#1a1a1a',
                        border: `1px solid ${typeInfo.color}30`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        position: 'relative',
                        zIndex: 2
                      }}
                    >
                      <IconComponent size={24} color={typeInfo.color} />
                    </motion.div>
                    
                    {/* Content */}
                    <div style={{ flex: 1, position: 'relative', zIndex: 2 }}>
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '8px', 
                        flexWrap: 'wrap',
                        marginBottom: '6px'
                      }}>
                        <span style={{ 
                          fontWeight: isUnread ? 700 : 500, 
                          fontSize: '15px',
                          color: isUnread ? 'white' : '#9ca3af'
                        }}>
                          {n.titre}
                        </span>
                        <span style={{
                          fontSize: '10px',
                          padding: '2px 8px',
                          borderRadius: '20px',
                          background: `${typeInfo.color}20`,
                          color: typeInfo.color,
                          textTransform: 'uppercase'
                        }}>
                          {typeInfo.label}
                        </span>
                      </div>
                      <div style={{ 
                        color: isUnread ? '#d1d5db' : '#6b7280', 
                        fontSize: '13px', 
                        marginBottom: '8px',
                        lineHeight: 1.4
                      }}>
                        {n.message}
                      </div>
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '8px',
                        color: '#6b7280', 
                        fontSize: '11px' 
                      }}>
                        <Clock size={12} />
                        {getTimeAgo(n.date_creation)}
                      </div>
                    </div>
                    
                    {/* Unread indicator */}
                    {isUnread && (
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 1, repeat: Infinity }}
                        style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          background: '#ef4444',
                          flexShrink: 0,
                          boxShadow: '0 0 0 2px rgba(239, 68, 68, 0.2)'
                        }}
                      />
                    )}
                    
                    {/* Delete button */}
                    <motion.button
                      whileHover={{ scale: 1.1, color: '#ef4444' }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => supprimer(n.id)}
                      disabled={deletingId === n.id}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: '#6b7280',
                        padding: '8px',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.2s',
                        flexShrink: 0
                      }}
                    >
                      {deletingId === n.id ? (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity }}
                        >
                          <Clock size={18} />
                        </motion.div>
                      ) : (
                        <Trash2 size={18} />
                      )}
                    </motion.button>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}