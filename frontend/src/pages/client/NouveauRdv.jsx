import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, 
  Car, 
  Wrench, 
  CheckCircle, 
  ArrowRight, 
  ChevronRight,
  ChevronLeft,
  AlertCircle,
  MapPin,
  Clock,
  User,
  Phone,
  DollarSign,
  FileText,
  X
} from 'lucide-react';
import Sidebar from '../../components/Sidebar';
import api from '../../utils/api';

// Animation variants
const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
};

const slideIn = {
  initial: { opacity: 0, x: 50 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -50 }
};

const steps = [
  { id: 1, name: 'Véhicule', icon: Car },
  { id: 2, name: 'Prestataire', icon: Wrench },
  { id: 3, name: 'Date & Détails', icon: Calendar }
];

export default function NouveauRdv() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [vehicules, setVehicules] = useState([]);
  const [prestataires, setPrestataires] = useState([]);
  const [prestations, setPrestations] = useState([]);
  const [selectedPrestataire, setSelectedPrestataire] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  const [form, setForm] = useState({
    vehicule_id: '',
    prestataire_id: searchParams.get('prestataire') || '',
    prestation_id: '',
    date_rdv: '',
    description_probleme: '',
  });

  useEffect(() => {
    Promise.all([
      api.get('/vehicules'),
      api.get('/prestataires', { params: { limit: 100 } }),
    ]).then(([v, p]) => {
      setVehicules(v.data);
      setPrestataires(p.data.data);
      
      // If prestataire is pre-selected, load its details
      if (searchParams.get('prestataire')) {
        const selected = p.data.data.find(p => p.id === parseInt(searchParams.get('prestataire')));
        setSelectedPrestataire(selected);
      }
    });
  }, [searchParams]);

  // Charger les prestations quand on choisit un prestataire
  useEffect(() => {
    if (!form.prestataire_id) { 
      setPrestations([]); 
      setSelectedPrestataire(null);
      return; 
    }
    api.get(`/prestataires/${form.prestataire_id}`)
      .then(r => {
        setPrestations(r.data.prestations || []);
        setSelectedPrestataire(r.data);
      });
  }, [form.prestataire_id]);

  const f = (field) => ({
    value: form[field],
    onChange: e => setForm(p => ({ ...p, [field]: e.target.value })),
  });

  const handleNext = () => {
    if (currentStep === 1 && !form.vehicule_id) {
      setError('Veuillez sélectionner un véhicule');
      return;
    }
    if (currentStep === 2 && !form.prestataire_id) {
      setError('Veuillez sélectionner un prestataire');
      return;
    }
    setError('');
    setCurrentStep(currentStep + 1);
  };

  const handlePrev = () => {
    setError('');
    setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.date_rdv) {
      setError('Veuillez choisir une date et heure');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await api.post('/rdv', form);
      setSuccess(true);
      setTimeout(() => navigate('/client/rdv'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la réservation.');
    } finally {
      setLoading(false);
    }
  };

  const minDate = new Date(Date.now() + 3600000).toISOString().slice(0, 16);
  const selectedVehicle = vehicules.find(v => v.id === parseInt(form.vehicule_id));

  return (
    <div className="dashboard-layout" style={{ background: '#0a0a0a', minHeight: '100vh' }}>
      <Sidebar />
      <main className="dashboard-content" style={{ padding: '32px 40px' }}>
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ maxWidth: '800px', margin: '0 auto' }}
        >
          {/* Header */}
          <div style={{ marginBottom: '32px', textAlign: 'center' }}>
            <motion.h1 
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              style={{ 
                fontFamily: 'var(--font-display)', 
                fontSize: '32px', 
                fontWeight: 800,
                background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}
            >
              Nouveau rendez-vous
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              style={{ color: '#9ca3af', marginTop: '8px' }}
            >
              Réservez votre créneau en quelques étapes
            </motion.p>
          </div>

          {/* Progress Steps */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            style={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              marginBottom: '40px',
              position: 'relative'
            }}
          >
            {steps.map((step, idx) => {
              const StepIcon = step.icon;
              const isCompleted = currentStep > step.id;
              const isActive = currentStep === step.id;
              
              return (
                <div key={step.id} style={{ flex: 1, position: 'relative' }}>
                  {idx < steps.length - 1 && (
                    <div style={{
                      position: 'absolute',
                      top: '24px',
                      left: '50%',
                      width: 'calc(100% - 40px)',
                      height: '2px',
                      background: currentStep > step.id ? '#dc2626' : '#2a2a2a',
                      transition: 'all 0.3s ease'
                    }} />
                  )}
                  <div style={{ textAlign: 'center' }}>
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '50%',
                        margin: '0 auto 12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: isCompleted ? '#dc2626' : isActive ? '#dc2626' : '#2a2a2a',
                        color: isCompleted || isActive ? 'white' : '#6b7280',
                        border: isActive ? '2px solid #ef4444' : 'none',
                        boxShadow: isActive ? '0 0 0 4px rgba(220, 38, 38, 0.2)' : 'none'
                      }}
                    >
                      {isCompleted ? <CheckCircle size={24} /> : <StepIcon size={24} />}
                    </motion.div>
                    <div style={{ 
                      fontSize: '12px', 
                      fontWeight: isActive ? '600' : '400',
                      color: isActive ? '#ef4444' : '#6b7280'
                    }}>
                      {step.name}
                    </div>
                  </div>
                </div>
              );
            })}
          </motion.div>

          {/* Success Message */}
          <AnimatePresence>
            {success && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="alert alert-success"
                style={{ 
                  background: '#064e3b', 
                  color: '#10b981', 
                  border: '1px solid #10b981',
                  marginBottom: '24px',
                  padding: '16px',
                  borderRadius: '12px'
                }}
              >
                <CheckCircle size={18} style={{ display: 'inline', marginRight: '8px' }} />
                ✅ Rendez-vous créé avec succès ! Redirection en cours…
              </motion.div>
            )}
          </AnimatePresence>

          {/* Error Message */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="alert alert-error"
                style={{ 
                  background: '#7f1d1d', 
                  color: '#fca5a5', 
                  border: '1px solid #ef4444',
                  marginBottom: '24px',
                  padding: '16px',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <AlertCircle size={18} />
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit}>
            <AnimatePresence mode="wait">
              {/* Step 1 - Vehicle Selection */}
              {currentStep === 1 && (
                <motion.div
                  key="step1"
                  variants={fadeInUp}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className="card"
                  style={{
                    background: '#1a1a1a',
                    borderRadius: '20px',
                    padding: '28px',
                    border: '1px solid rgba(220, 38, 38, 0.2)',
                    marginBottom: '24px'
                  }}
                >
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '12px', 
                    marginBottom: '24px',
                    color: '#ef4444'
                  }}>
                    <Car size={24} />
                    <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '18px' }}>
                      Sélectionnez votre véhicule
                    </h3>
                  </div>

                  {vehicules.length === 0 ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      style={{
                        background: '#7f1d1d',
                        borderRadius: '12px',
                        padding: '20px',
                        textAlign: 'center'
                      }}
                    >
                      <AlertCircle size={24} color="#fca5a5" />
                      <p style={{ color: '#fca5a5', marginTop: '12px' }}>
                        Aucun véhicule enregistré.
                      </p>
                      <a href="/client/vehicules" style={{ 
                        color: '#fca5a5', 
                        fontWeight: 600,
                        display: 'inline-block',
                        marginTop: '12px'
                      }}>
                        Ajouter un véhicule →
                      </a>
                    </motion.div>
                  ) : (
                    <div className="form-group">
                      <label className="form-label" style={{ color: '#ef4444', marginBottom: '8px', display: 'block' }}>
                        Choisissez votre véhicule
                      </label>
                      <select className="form-select" required {...f('vehicule_id')} style={{
                        background: '#2a2a2a',
                        border: '1px solid #3a3a3a',
                        color: 'white',
                        padding: '12px',
                        borderRadius: '10px',
                        width: '100%'
                      }}>
                        <option value="">— Choisir un véhicule —</option>
                        {vehicules.map(v => (
                          <option key={v.id} value={v.id}>
                            {v.marque} {v.modele} {v.annee ? `(${v.annee})` : ''} {v.immatriculation ? `— ${v.immatriculation}` : ''}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </motion.div>
              )}

              {/* Step 2 - Provider Selection */}
              {currentStep === 2 && (
                <motion.div
                  key="step2"
                  variants={fadeInUp}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className="card"
                  style={{
                    background: '#1a1a1a',
                    borderRadius: '20px',
                    padding: '28px',
                    border: '1px solid rgba(220, 38, 38, 0.2)',
                    marginBottom: '24px'
                  }}
                >
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '12px', 
                    marginBottom: '24px',
                    color: '#ef4444'
                  }}>
                    <Wrench size={24} />
                    <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '18px' }}>
                      Choisissez un prestataire
                    </h3>
                  </div>

                  <div className="form-group" style={{ marginBottom: '20px' }}>
                    <label className="form-label" style={{ color: '#ef4444', marginBottom: '8px', display: 'block' }}>
                      Sélectionnez le garage
                    </label>
                    <select className="form-select" required {...f('prestataire_id')} style={{
                      background: '#2a2a2a',
                      border: '1px solid #3a3a3a',
                      color: 'white',
                      padding: '12px',
                      borderRadius: '10px',
                      width: '100%'
                    }}>
                      <option value="">— Choisir un prestataire —</option>
                      {prestataires.map(p => (
                        <option key={p.id} value={p.id}>
                          {p.nom} — {p.ville}
                        </option>
                      ))}
                    </select>
                  </div>

                  {selectedPrestataire && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      style={{
                        background: '#0f0f0f',
                        borderRadius: '12px',
                        padding: '16px',
                        marginTop: '16px'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                        <div style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '10px',
                          background: 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <User size={20} color="white" />
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, color: 'white' }}>{selectedPrestataire.nom}</div>
                          <div style={{ fontSize: '12px', color: '#9ca3af', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <MapPin size={12} /> {selectedPrestataire.ville}
                          </div>
                        </div>
                      </div>
                      
                      {selectedPrestataire.telephone && (
                        <div style={{ fontSize: '13px', color: '#9ca3af', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                          <Phone size={12} />
                          {selectedPrestataire.telephone}
                        </div>
                      )}
                    </motion.div>
                  )}

                  {prestations.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="form-group"
                      style={{ marginTop: '20px' }}
                    >
                      <label className="form-label" style={{ color: '#ef4444', marginBottom: '8px', display: 'block' }}>
                        Type de prestation
                      </label>
                      <select className="form-select" {...f('prestation_id')} style={{
                        background: '#2a2a2a',
                        border: '1px solid #3a3a3a',
                        color: 'white',
                        padding: '12px',
                        borderRadius: '10px',
                        width: '100%'
                      }}>
                        <option value="">— Choisir une prestation —</option>
                        {prestations.map(p => (
                          <option key={p.id} value={p.id}>
                            {p.nom} {p.prix_min ? `— à partir de ${p.prix_min} MAD` : ''}
                          </option>
                        ))}
                      </select>
                    </motion.div>
                  )}
                </motion.div>
              )}

              {/* Step 3 - Date & Details */}
              {currentStep === 3 && (
                <motion.div
                  key="step3"
                  variants={fadeInUp}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className="card"
                  style={{
                    background: '#1a1a1a',
                    borderRadius: '20px',
                    padding: '28px',
                    border: '1px solid rgba(220, 38, 38, 0.2)',
                    marginBottom: '24px'
                  }}
                >
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '12px', 
                    marginBottom: '24px',
                    color: '#ef4444'
                  }}>
                    <Calendar size={24} />
                    <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '18px' }}>
                      Date & Détails
                    </h3>
                  </div>

                  {/* Selected Vehicle & Provider Summary */}
                  <div style={{
                    background: '#0f0f0f',
                    borderRadius: '12px',
                    padding: '16px',
                    marginBottom: '24px'
                  }}>
                    <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                      {selectedVehicle && (
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '11px', color: '#6b7280', marginBottom: '4px' }}>VÉHICULE</div>
                          <div style={{ color: 'white', fontSize: '14px', fontWeight: 500 }}>
                            {selectedVehicle.marque} {selectedVehicle.modele}
                          </div>
                          <div style={{ color: '#9ca3af', fontSize: '12px' }}>{selectedVehicle.immatriculation}</div>
                        </div>
                      )}
                      {selectedPrestataire && (
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '11px', color: '#6b7280', marginBottom: '4px' }}>PRESTATAIRE</div>
                          <div style={{ color: 'white', fontSize: '14px', fontWeight: 500 }}>{selectedPrestataire.nom}</div>
                          <div style={{ color: '#9ca3af', fontSize: '12px' }}>{selectedPrestataire.ville}</div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="form-group" style={{ marginBottom: '20px' }}>
                    <label className="form-label" style={{ color: '#ef4444', marginBottom: '8px', display: 'block' }}>
                      <Clock size={14} style={{ display: 'inline', marginRight: '6px' }} />
                      Date et heure du rendez-vous
                    </label>
                    <input
                      type="datetime-local"
                      className="form-input"
                      required
                      min={minDate}
                      {...f('date_rdv')}
                      style={{
                        background: '#2a2a2a',
                        border: '1px solid #3a3a3a',
                        color: 'white',
                        padding: '12px',
                        borderRadius: '10px',
                        width: '100%'
                      }}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" style={{ color: '#ef4444', marginBottom: '8px', display: 'block' }}>
                      <FileText size={14} style={{ display: 'inline', marginRight: '6px' }} />
                      Description du problème (optionnel)
                    </label>
                    <textarea
                      className="form-textarea"
                      rows="4"
                      placeholder="Décrivez le problème ou le service souhaité…"
                      {...f('description_probleme')}
                      style={{
                        background: '#2a2a2a',
                        border: '1px solid #3a3a3a',
                        color: 'white',
                        padding: '12px',
                        borderRadius: '10px',
                        width: '100%',
                        resize: 'vertical'
                      }}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Navigation Buttons */}
            <div className="flex gap-md" style={{ justifyContent: 'space-between' }}>
              {currentStep > 1 && (
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handlePrev}
                  className="btn btn-ghost"
                  style={{
                    padding: '12px 24px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    background: '#2a2a2a',
                    color: 'white'
                  }}
                >
                  <ChevronLeft size={18} />
                  Précédent
                </motion.button>
              )}
              
              {currentStep < 3 ? (
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleNext}
                  className="btn btn-gold"
                  style={{
                    padding: '12px 24px',
                    marginLeft: 'auto',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    background: 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)'
                  }}
                >
                  Suivant
                  <ChevronRight size={18} />
                </motion.button>
              ) : (
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={loading || success}
                  className="btn btn-gold"
                  style={{
                    padding: '12px 24px',
                    marginLeft: 'auto',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    background: 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)'
                  }}
                >
                  {loading ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity }}
                      >
                        <Clock size={18} />
                      </motion.div>
                      Réservation en cours…
                    </>
                  ) : (
                    <>
                      <CheckCircle size={18} />
                      Confirmer le rendez-vous
                    </>
                  )}
                </motion.button>
              )}
            </div>

            {/* Cancel Button */}
            {currentStep === 1 && (
              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/client/rdv')}
                className="btn btn-ghost"
                style={{
                  marginTop: '16px',
                  width: '100%',
                  padding: '12px',
                  background: '#2a2a2a',
                  color: '#9ca3af'
                }}
              >
                Annuler
              </motion.button>
            )}
          </form>
        </motion.div>
      </main>
    </div>
  );
}