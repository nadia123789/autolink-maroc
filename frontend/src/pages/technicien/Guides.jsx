import React, { useState } from 'react';
import TechnicienDashboard from './Dashboard';

const GUIDES = [
  {
    id:1, categorie:'Vidange', titre:'Vidange moteur complète', duree:'45-60 min', niveau:'Débutant',
    icon:'🛢️',
    etapes:[
      { n:1, titre:'Préparer le véhicule', desc:'Monter le véhicule sur le pont élévateur. Faire tourner le moteur 2-3 min pour chauffer l\'huile. Couper le moteur et attendre 5 min.' },
      { n:2, titre:'Vidanger l\'huile', desc:'Placer le bac de récupération. Dévisser le bouchon de vidange (sens antihoraire). Laisser l\'huile s\'écouler complètement (5-10 min).' },
      { n:3, titre:'Changer le filtre à huile', desc:'Retirer le vieux filtre à huile avec la clé filtre. Huiler légèrement le joint du nouveau filtre. Visser à la main + 3/4 de tour.' },
      { n:4, titre:'Remettre le bouchon', desc:'Nettoyer le filetage. Changer le joint de vidange si nécessaire. Revisser le bouchon au couple (25-30 Nm).' },
      { n:5, titre:'Remplir l\'huile neuve', desc:'Vérifier la contenance (voir fiche technique). Verser l\'huile via le bouchon de remplissage. Vérifier le niveau avec la jauge.' },
      { n:6, titre:'Vérification finale', desc:'Démarrer le moteur 1 min. Vérifier qu\'il n\'y a pas de fuite. Vérifier le niveau à froid après 5 min. Coller l\'étiquette de vidange.' },
    ],
    points_attention:['Ne jamais visser le filtre avec une clé (risque de fuite)','Respecter la viscosité d\'huile préconisée','Éliminer l\'huile usagée dans un point de collecte agréé'],
  },
  {
    id:2, categorie:'Freinage', titre:'Changement plaquettes de frein', duree:'60-90 min', niveau:'Intermédiaire',
    icon:'🛑',
    etapes:[
      { n:1, titre:'Sécuriser le véhicule', desc:'Serrer le frein à main. Caler les roues. Dévisser légèrement les écrous de roue avant de lever le véhicule.' },
      { n:2, titre:'Démonter la roue', desc:'Soulever le véhicule avec le cric. Poser chandelles de sécurité. Retirer la roue.' },
      { n:3, titre:'Accéder à l\'étrier', desc:'Identifier l\'étrier de frein. Déposer les vis de fixation de l\'étrier (généralement 2 boulons au dos). Suspendre l\'étrier sans tendre le flexible.' },
      { n:4, titre:'Retirer les vieilles plaquettes', desc:'Sortir les plaquettes usées. Noter leur orientation pour la remise en place. Nettoyer l\'étrier avec spray frein.' },
      { n:5, titre:'Repousser le piston', desc:'Utiliser un repousse-piston ou une grande pince. Repousser le piston doucement jusqu\'en fond d\'étrier. Surveiller le niveau du bocal de frein (retirer du liquide si nécessaire).' },
      { n:6, titre:'Monter les nouvelles plaquettes', desc:'Graisser légèrement les glissières (pas la surface de friction !). Installer les nouvelles plaquettes. Remonter l\'étrier et serrer les boulons au couple.' },
      { n:7, titre:'Rodage', desc:'Remonter la roue. Pomper la pédale de frein jusqu\'à ce qu\'elle soit dure. Effectuer 5-6 freinages progressifs de 60 à 20 km/h pour le rodage.' },
    ],
    points_attention:['Ne jamais graisser la surface de frottement','Changer toujours par essieu (les 2 côtés)','Vérifier l\'épaisseur du disque (min. indiqué sur le disque)'],
  },
  {
    id:3, categorie:'Climatisation', titre:'Recharge climatisation (R134a/R1234yf)', duree:'30-45 min', niveau:'Intermédiaire',
    icon:'❄️',
    etapes:[
      { n:1, titre:'Diagnostic préalable', desc:'Connecter la station de clim aux raccords HP et BP. Vérifier les pressions à l\'arrêt et en fonctionnement. Identifier le type de fluide (R134a ou R1234yf).' },
      { n:2, titre:'Récupération du fluide résiduel', desc:'Lancer la récupération automatique via la station. Récupérer tout le fluide restant (obligatoire avant toute intervention). Peser la quantité récupérée.' },
      { n:3, titre:'Test d\'étanchéité', desc:'Faire le vide pendant 30 min minimum. Vérifier que le vide tient (absence de fuite). Si chute de vide : rechercher la fuite avec détecteur ou UV.' },
      { n:4, titre:'Injection d\'huile PAG', desc:'Injecter la quantité d\'huile compresseur prescrite. Utiliser uniquement l\'huile compatible avec le fluide utilisé.' },
      { n:5, titre:'Recharge en fluide', desc:'Injecter la quantité exacte indiquée sur l\'étiquette du véhicule. Ne jamais surcharger (risque de détérioration compresseur).' },
      { n:6, titre:'Contrôle final', desc:'Démarrer le véhicule et allumer la clim au max. Vérifier les pressions HP et BP en fonctionnement. Mesurer la température de soufflage (doit descendre sous 10°C).' },
    ],
    points_attention:['Utiliser uniquement le fluide homologué pour le véhicule','Ne jamais mélanger R134a et R1234yf','La récupération du fluide est obligatoire par la loi'],
  },
  {
    id:4, categorie:'Électricité', titre:'Diagnostic panne électrique / voyant', duree:'Variable', niveau:'Avancé',
    icon:'⚡',
    etapes:[
      { n:1, titre:'Lecture des codes défauts', desc:'Connecter le scanner OBD2 sur la prise OBD (sous le tableau de bord côté conducteur). Lire tous les codes défauts de tous les calculateurs. Noter les codes et leur description.' },
      { n:2, titre:'Analyse des codes', desc:'Distinguer défauts actifs (problème actuel) et passifs (ancien). Rechercher les codes dans la documentation technique. Identifier le système concerné (injection, ABS, airbag, etc.).' },
      { n:3, titre:'Contrôle alimentation', desc:'Vérifier la tension batterie (12.4-12.7V repos, 13.8-14.4V moteur tournant). Contrôler les masses (connexions propres et serrées). Vérifier les fusibles et relais du circuit concerné.' },
      { n:4, titre:'Contrôle du composant défaillant', desc:'Mesurer la résistance du capteur/actionneur (comparer aux valeurs constructeur). Vérifier le câblage avec multimètre (continuité, court-circuit). Effectuer les tests dynamiques prescrits.' },
      { n:5, titre:'Réparation et effacement', desc:'Remplacer le composant défaillant. Réparer les faisceaux si nécessaire. Effacer les codes défauts après réparation. Vérifier l\'absence de nouveaux codes après essai.' },
    ],
    points_attention:['Toujours débrancher la batterie avant travaux sur airbag','Attendre 30 min après débranchement batterie (airbag)','Ne jamais effacer les codes sans avoir résolu la cause'],
  },
  {
    id:5, categorie:'Entretien', titre:'Révision complète (30 000 km)', duree:'3-4h', niveau:'Intermédiaire',
    icon:'🔧',
    etapes:[
      { n:1, titre:'Vidange huile + filtre', desc:'Effectuer la vidange moteur complète (voir guide vidange). Remplacer le filtre à huile.' },
      { n:2, titre:'Remplacement filtres', desc:'Filtre à air moteur : contrôler, remplacer si encrassé. Filtre habitacle/pollen : remplacer systématiquement. Filtre à carburant : selon préconisation constructeur.' },
      { n:3, titre:'Vérification freins', desc:'Contrôler épaisseur plaquettes avant et arrière (min 3mm). Mesurer épaisseur disques (comparer au min gravé sur le disque). Vérifier le niveau et état du liquide de frein.' },
      { n:4, titre:'Vérification pneumatiques', desc:'Contrôler la pression de chaque pneu (y compris roue de secours). Vérifier l\'usure et l\'état des flancs. Permuter si usure inégale.' },
      { n:5, titre:'Vérification niveaux', desc:'Liquide refroidissement, direction assistée, boîte vitesses. Liquide lave-glace. Niveau batterie (si non scellée).' },
      { n:6, titre:'Vérification éclairage et équipements', desc:'Tester tous les feux (route, croisement, stop, clignotants, recul). Essuie-glaces, avertisseur, ceintures. Contrôle visuel sous-caisse (fuites, corrosion, soufflets).' },
      { n:7, titre:'Mise à jour carnet et rapport', desc:'Tamponner le carnet d\'entretien. Renseigner le kilométrage et les travaux effectués. Remettre le rapport d\'inspection au client.' },
    ],
    points_attention:['Toujours respecter les préconisations du constructeur','Photographier les éléments usés pour montrer au client','Signaler par écrit toute anomalie non traitée'],
  },
];

export default function GuidesReparation() {
  const [selected, setSelected] = useState(null);
  const [search, setSearch]     = useState('');
  const [categorie, setCategorie] = useState('');

  const categories = [...new Set(GUIDES.map(g => g.categorie))];
  const filtres = GUIDES.filter(g =>
    (!categorie || g.categorie === categorie) &&
    (!search || g.titre.toLowerCase().includes(search.toLowerCase()))
  );

  const NIVEAUX = { 'Débutant':'badge-success', 'Intermédiaire':'badge-warning', 'Avancé':'badge-danger' };

  return (
    <div className="dashboard-layout">
      {/* Réutilise le layout technicien */}
      <aside className="sidebar">
        <div className="sidebar-logo">AutoLink <span style={{ color:'var(--white)', fontWeight:400 }}>Maroc</span></div>
        <nav className="sidebar-section" style={{ flex:1 }}>
          <a href="/technicien" className="sidebar-link">⊞ Mes interventions</a>
          <a href="/technicien/guides" className="sidebar-link active">📖 Guides de réparation</a>
        </nav>
      </aside>

      {selected && (
        <div style={{ position:'fixed', inset:0, zIndex:1000, background:'rgba(0,0,0,0.9)', display:'flex', alignItems:'center', justifyContent:'center', padding:'24px' }}>
          <div className="card" style={{ width:'100%', maxWidth:'760px', maxHeight:'92vh', overflowY:'auto' }}>
            <div className="flex-between" style={{ marginBottom:'20px' }}>
              <div>
                <div style={{ fontSize:'40px', marginBottom:'8px' }}>{selected.icon}</div>
                <h2 style={{ fontFamily:'var(--font-display)', fontSize:'22px', fontWeight:700 }}>{selected.titre}</h2>
                <div className="flex gap-sm" style={{ marginTop:'8px', flexWrap:'wrap' }}>
                  <span className="badge badge-gold">{selected.categorie}</span>
                  <span className={`badge ${NIVEAUX[selected.niveau]}`}>{selected.niveau}</span>
                  <span className="badge badge-gray">⏱ {selected.duree}</span>
                </div>
              </div>
              <button onClick={() => setSelected(null)} style={{ background:'none', border:'none', cursor:'pointer', fontSize:'28px', color:'var(--gray-light)', alignSelf:'flex-start' }}>×</button>
            </div>

            <div style={{ display:'flex', flexDirection:'column', gap:'16px', marginBottom:'24px' }}>
              {selected.etapes.map(e => (
                <div key={e.n} style={{ display:'flex', gap:'16px' }}>
                  <div style={{
                    width:'36px', height:'36px', borderRadius:'50%', flexShrink:0,
                    background:'linear-gradient(135deg, var(--gold-dark), var(--gold))',
                    display:'flex', alignItems:'center', justifyContent:'center',
                    fontFamily:'var(--font-display)', fontWeight:800, color:'var(--dark)', fontSize:'14px',
                  }}>{e.n}</div>
                  <div>
                    <div style={{ fontFamily:'var(--font-display)', fontWeight:700, marginBottom:'6px' }}>{e.titre}</div>
                    <p style={{ color:'var(--gray-light)', fontSize:'14px', lineHeight:1.7 }}>{e.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {selected.points_attention?.length > 0 && (
              <div style={{ background:'rgba(224,82,82,0.08)', border:'1px solid rgba(224,82,82,0.25)', borderRadius:'12px', padding:'16px' }}>
                <div style={{ fontFamily:'var(--font-display)', fontWeight:700, color:'var(--danger)', marginBottom:'10px' }}>⚠️ Points d'attention</div>
                {selected.points_attention.map((p,i) => (
                  <div key={i} style={{ color:'var(--gray-light)', fontSize:'13px', marginBottom:'6px', paddingLeft:'12px', borderLeft:'3px solid var(--danger)' }}>
                    {p}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <main className="dashboard-content">
        <div style={{ marginBottom:'32px' }}>
          <h1 style={{ fontFamily:'var(--font-display)', fontSize:'28px', fontWeight:800 }}>📖 Guides de réparation</h1>
          <p style={{ color:'var(--gray-light)', marginTop:'4px' }}>Fiches techniques et procédures d'intervention</p>
        </div>

        <div className="flex gap-md" style={{ marginBottom:'28px', flexWrap:'wrap' }}>
          <input className="form-input" placeholder="Rechercher un guide…" value={search} onChange={e=>setSearch(e.target.value)} style={{ flex:'1 1 220px' }} />
          <div className="flex gap-sm" style={{ flexWrap:'wrap' }}>
            <button onClick={() => setCategorie('')} className={`btn btn-sm ${!categorie ? 'btn-gold' : 'btn-ghost'}`}>Tous</button>
            {categories.map(c => <button key={c} onClick={() => setCategorie(c)} className={`btn btn-sm ${categorie===c ? 'btn-gold' : 'btn-ghost'}`}>{c}</button>)}
          </div>
        </div>

        <div className="grid-2">
          {filtres.map(g => (
            <div key={g.id} className="card card-hover" style={{ cursor:'pointer' }} onClick={() => setSelected(g)}>
              <div style={{ fontSize:'40px', marginBottom:'12px' }}>{g.icon}</div>
              <div className="flex gap-sm" style={{ marginBottom:'10px', flexWrap:'wrap' }}>
                <span className="badge badge-gold" style={{ fontSize:'11px' }}>{g.categorie}</span>
                <span className={`badge ${NIVEAUX[g.niveau]}`} style={{ fontSize:'11px' }}>{g.niveau}</span>
              </div>
              <h3 style={{ fontFamily:'var(--font-display)', fontSize:'17px', fontWeight:700, marginBottom:'8px' }}>{g.titre}</h3>
              <div style={{ color:'var(--gray-light)', fontSize:'13px', marginBottom:'12px' }}>⏱ {g.duree} · {g.etapes.length} étapes</div>
              <div className="btn btn-ghost btn-sm" style={{ display:'inline-flex' }}>Voir le guide →</div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
