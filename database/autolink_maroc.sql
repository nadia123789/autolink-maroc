-- ============================================================
-- AutoLink Maroc - Base de données MySQL (XAMPP)
-- ============================================================

CREATE DATABASE IF NOT EXISTS autolink_maroc CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE autolink_maroc;

-- ============================================================
-- UTILISATEURS & AUTHENTIFICATION
-- ============================================================

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nom VARCHAR(100) NOT NULL,
  prenom VARCHAR(100) NOT NULL,
  email VARCHAR(191) NOT NULL UNIQUE,
  telephone VARCHAR(20),
  mot_de_passe VARCHAR(255) NOT NULL,
  role ENUM('visiteur','client','gestionnaire','technicien','admin') NOT NULL DEFAULT 'client',
  avatar VARCHAR(255),
  est_actif BOOLEAN DEFAULT TRUE,
  date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  date_modification TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ============================================================
-- PRESTATAIRES
-- ============================================================

CREATE TABLE prestataires (
  id INT AUTO_INCREMENT PRIMARY KEY,
  gestionnaire_id INT NOT NULL,
  nom VARCHAR(200) NOT NULL,
  slug VARCHAR(200) UNIQUE,
  description TEXT,
  categorie ENUM('garage','carrosserie','electricite','depannage','assurance','controle_technique','autre') NOT NULL,
  telephone VARCHAR(20),
  email VARCHAR(191),
  adresse TEXT,
  ville VARCHAR(100),
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),
  horaires JSON,
  logo VARCHAR(255),
  couverture VARCHAR(255),
  note_moyenne DECIMAL(3,2) DEFAULT 0,
  total_avis INT DEFAULT 0,
  est_verifie BOOLEAN DEFAULT FALSE,
  est_actif BOOLEAN DEFAULT TRUE,
  date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (gestionnaire_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================================
-- TECHNICIENS PAR PRESTATAIRE
-- ============================================================

CREATE TABLE techniciens (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  prestataire_id INT NOT NULL,
  specialites JSON,
  disponible BOOLEAN DEFAULT TRUE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (prestataire_id) REFERENCES prestataires(id) ON DELETE CASCADE
);

-- ============================================================
-- PRESTATIONS & CATALOGUE
-- ============================================================

CREATE TABLE prestations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  prestataire_id INT NOT NULL,
  nom VARCHAR(200) NOT NULL,
  description TEXT,
  categorie VARCHAR(100),
  prix_min DECIMAL(10,2),
  prix_max DECIMAL(10,2),
  duree_minutes INT,
  est_disponible BOOLEAN DEFAULT TRUE,
  date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (prestataire_id) REFERENCES prestataires(id) ON DELETE CASCADE
);

-- ============================================================
-- VEHICULES DES CLIENTS
-- ============================================================

CREATE TABLE vehicules (
  id INT AUTO_INCREMENT PRIMARY KEY,
  client_id INT NOT NULL,
  marque VARCHAR(100) NOT NULL,
  modele VARCHAR(100) NOT NULL,
  annee INT,
  immatriculation VARCHAR(50),
  couleur VARCHAR(50),
  kilometrage INT DEFAULT 0,
  carburant ENUM('essence','diesel','hybride','electrique','gpl') DEFAULT 'essence',
  vin VARCHAR(17),
  date_achat DATE,
  date_vignette DATE,
  date_assurance DATE,
  date_visite_technique DATE,
  prochain_entretien_km INT,
  prochaine_vidange_date DATE,
  notes TEXT,
  date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (client_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================================
-- DOCUMENTS VEHICULES
-- ============================================================

CREATE TABLE documents_vehicules (
  id INT AUTO_INCREMENT PRIMARY KEY,
  vehicule_id INT NOT NULL,
  type ENUM('carte_grise','assurance','controle_technique','facture','autre') NOT NULL,
  nom VARCHAR(255),
  fichier VARCHAR(255),
  date_expiration DATE,
  date_upload TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (vehicule_id) REFERENCES vehicules(id) ON DELETE CASCADE
);

-- ============================================================
-- RENDEZ-VOUS
-- ============================================================

CREATE TABLE rendez_vous (
  id INT AUTO_INCREMENT PRIMARY KEY,
  client_id INT NOT NULL,
  prestataire_id INT NOT NULL,
  vehicule_id INT NOT NULL,
  technicien_id INT,
  prestation_id INT,
  date_rdv DATETIME NOT NULL,
  duree_estimee INT,
  statut ENUM('en_attente','confirme','en_cours','termine','annule') DEFAULT 'en_attente',
  description_probleme TEXT,
  notes_internes TEXT,
  prix_estime DECIMAL(10,2),
  prix_final DECIMAL(10,2),
  date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  date_modification TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (client_id) REFERENCES users(id),
  FOREIGN KEY (prestataire_id) REFERENCES prestataires(id),
  FOREIGN KEY (vehicule_id) REFERENCES vehicules(id),
  FOREIGN KEY (technicien_id) REFERENCES techniciens(id),
  FOREIGN KEY (prestation_id) REFERENCES prestations(id)
);

-- ============================================================
-- ORDRES D'INTERVENTION
-- ============================================================

CREATE TABLE ordres_intervention (
  id INT AUTO_INCREMENT PRIMARY KEY,
  rendez_vous_id INT NOT NULL,
  technicien_id INT,
  statut ENUM('ouvert','en_cours','en_attente_pieces','termine') DEFAULT 'ouvert',
  diagnostic TEXT,
  travaux_effectues TEXT,
  kilometrage_entree INT,
  kilometrage_sortie INT,
  date_debut DATETIME,
  date_fin DATETIME,
  FOREIGN KEY (rendez_vous_id) REFERENCES rendez_vous(id) ON DELETE CASCADE,
  FOREIGN KEY (technicien_id) REFERENCES techniciens(id)
);

-- ============================================================
-- DEVIS & FACTURES
-- ============================================================

CREATE TABLE devis (
  id INT AUTO_INCREMENT PRIMARY KEY,
  rendez_vous_id INT NOT NULL,
  numero VARCHAR(50) UNIQUE,
  statut ENUM('brouillon','envoye','accepte','refuse','expire') DEFAULT 'brouillon',
  sous_total DECIMAL(10,2) DEFAULT 0,
  tva DECIMAL(5,2) DEFAULT 20,
  total_ttc DECIMAL(10,2) DEFAULT 0,
  validite_jours INT DEFAULT 15,
  notes TEXT,
  date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (rendez_vous_id) REFERENCES rendez_vous(id)
);

CREATE TABLE devis_lignes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  devis_id INT NOT NULL,
  description VARCHAR(255) NOT NULL,
  quantite DECIMAL(10,2) DEFAULT 1,
  prix_unitaire DECIMAL(10,2) NOT NULL,
  total DECIMAL(10,2) NOT NULL,
  FOREIGN KEY (devis_id) REFERENCES devis(id) ON DELETE CASCADE
);

CREATE TABLE factures (
  id INT AUTO_INCREMENT PRIMARY KEY,
  rendez_vous_id INT NOT NULL,
  devis_id INT,
  numero VARCHAR(50) UNIQUE,
  statut ENUM('emise','payee','annulee') DEFAULT 'emise',
  mode_paiement ENUM('especes','virement','cmi','cheque') DEFAULT 'especes',
  sous_total DECIMAL(10,2) DEFAULT 0,
  tva DECIMAL(5,2) DEFAULT 20,
  total_ttc DECIMAL(10,2) DEFAULT 0,
  date_paiement DATETIME,
  date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (rendez_vous_id) REFERENCES rendez_vous(id),
  FOREIGN KEY (devis_id) REFERENCES devis(id)
);

-- ============================================================
-- STOCK PIECES DETACHEES
-- ============================================================

CREATE TABLE pieces (
  id INT AUTO_INCREMENT PRIMARY KEY,
  prestataire_id INT NOT NULL,
  reference VARCHAR(100),
  nom VARCHAR(200) NOT NULL,
  marque VARCHAR(100),
  categorie VARCHAR(100),
  quantite_stock INT DEFAULT 0,
  seuil_alerte INT DEFAULT 5,
  prix_achat DECIMAL(10,2),
  prix_vente DECIMAL(10,2),
  fournisseur VARCHAR(200),
  date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (prestataire_id) REFERENCES prestataires(id) ON DELETE CASCADE
);

CREATE TABLE pieces_utilisees (
  id INT AUTO_INCREMENT PRIMARY KEY,
  ordre_id INT NOT NULL,
  piece_id INT NOT NULL,
  quantite INT NOT NULL DEFAULT 1,
  prix_unitaire DECIMAL(10,2),
  FOREIGN KEY (ordre_id) REFERENCES ordres_intervention(id) ON DELETE CASCADE,
  FOREIGN KEY (piece_id) REFERENCES pieces(id)
);

-- ============================================================
-- AVIS & NOTATIONS
-- ============================================================

CREATE TABLE avis (
  id INT AUTO_INCREMENT PRIMARY KEY,
  client_id INT NOT NULL,
  prestataire_id INT NOT NULL,
  rendez_vous_id INT,
  note INT NOT NULL CHECK (note BETWEEN 1 AND 5),
  commentaire TEXT,
  reponse_prestataire TEXT,
  est_publie BOOLEAN DEFAULT TRUE,
  date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (client_id) REFERENCES users(id),
  FOREIGN KEY (prestataire_id) REFERENCES prestataires(id),
  FOREIGN KEY (rendez_vous_id) REFERENCES rendez_vous(id)
);

-- ============================================================
-- PROMOTIONS
-- ============================================================

CREATE TABLE promotions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  prestataire_id INT NOT NULL,
  code VARCHAR(50) UNIQUE,
  nom VARCHAR(200) NOT NULL,
  description TEXT,
  type ENUM('pourcentage','montant_fixe') DEFAULT 'pourcentage',
  valeur DECIMAL(10,2) NOT NULL,
  min_commande DECIMAL(10,2) DEFAULT 0,
  date_debut DATE,
  date_fin DATE,
  utilisations_max INT,
  utilisations_actuelles INT DEFAULT 0,
  est_actif BOOLEAN DEFAULT TRUE,
  FOREIGN KEY (prestataire_id) REFERENCES prestataires(id) ON DELETE CASCADE
);

-- ============================================================
-- NOTIFICATIONS
-- ============================================================

CREATE TABLE notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  type VARCHAR(100),
  titre VARCHAR(255),
  message TEXT,
  lien VARCHAR(255),
  est_lue BOOLEAN DEFAULT FALSE,
  date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================================
-- PHOTOS PRESTATAIRES
-- ============================================================

CREATE TABLE photos_prestataires (
  id INT AUTO_INCREMENT PRIMARY KEY,
  prestataire_id INT NOT NULL,
  url VARCHAR(255) NOT NULL,
  legende VARCHAR(255),
  est_principale BOOLEAN DEFAULT FALSE,
  date_upload TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (prestataire_id) REFERENCES prestataires(id) ON DELETE CASCADE
);

-- ============================================================
-- TRIGGERS - Mise à jour note moyenne
-- ============================================================

DELIMITER //
CREATE TRIGGER update_note_moyenne
AFTER INSERT ON avis
FOR EACH ROW
BEGIN
  UPDATE prestataires p
  SET
    note_moyenne = (SELECT AVG(note) FROM avis WHERE prestataire_id = NEW.prestataire_id AND est_publie = TRUE),
    total_avis   = (SELECT COUNT(*) FROM avis WHERE prestataire_id = NEW.prestataire_id AND est_publie = TRUE)
  WHERE p.id = NEW.prestataire_id;
END;
//
DELIMITER ;

-- ============================================================
-- DONNÉES DE TEST
-- ============================================================

-- Admin
INSERT INTO users (nom, prenom, email, telephone, mot_de_passe, role) VALUES
('Admin', 'AutoLink', 'admin@autolink.ma', '0600000000', '$2b$10$examplehashedpassword', 'admin');

-- Client test
INSERT INTO users (nom, prenom, email, telephone, mot_de_passe, role) VALUES
('Alami', 'Youssef', 'youssef@example.ma', '0612345678', '$2b$10$examplehashedpassword', 'client');

-- Gestionnaire test
INSERT INTO users (nom, prenom, email, telephone, mot_de_passe, role) VALUES
('Benali', 'Karim', 'karim@garage.ma', '0622345678', '$2b$10$examplehashedpassword', 'gestionnaire');

-- Prestataire test
INSERT INTO prestataires (gestionnaire_id, nom, slug, description, categorie, telephone, email, adresse, ville, latitude, longitude, est_verifie, est_actif) VALUES
(3, 'Garage Benali Premium', 'garage-benali-premium', 'Garage automobile spécialisé toutes marques, révision, vidange, freins, climatisation.', 'garage', '0522123456', 'contact@garagebenali.ma', 'Bd Zerktouni, Casablanca', 'Casablanca', 33.5898, -7.6137, TRUE, TRUE);

-- Véhicule test
INSERT INTO vehicules (client_id, marque, modele, annee, immatriculation, couleur, kilometrage, carburant) VALUES
(2, 'Dacia', 'Logan', 2019, '123-A-45', 'Blanc', 75000, 'diesel');

-- Prestations test
INSERT INTO prestations (prestataire_id, nom, categorie, prix_min, prix_max, duree_minutes) VALUES
(1, 'Vidange moteur complète', 'Entretien', 350, 600, 60),
(1, 'Révision complète', 'Entretien', 800, 1500, 180),
(1, 'Climatisation - recharge gaz', 'Climatisation', 400, 600, 90),
(1, 'Freins - changement plaquettes', 'Freinage', 500, 900, 120);

-- ============================================================
-- AJOUT : Technicien de test lié au prestataire
-- ============================================================

-- User technicien
INSERT INTO users (nom, prenom, email, telephone, mot_de_passe, role) VALUES
('Tahiri', 'Hassan', 'hassan@garagebenali.ma', '0633456789', '$2b$10$examplehashedpassword', 'technicien');

-- Profil technicien lié au prestataire 1
INSERT INTO techniciens (user_id, prestataire_id, specialites, disponible) VALUES
(4, 1, '["Mécanique générale", "Vidange", "Freins"]', TRUE);

-- Ordre d\'intervention de test
INSERT INTO ordres_intervention (rendez_vous_id, technicien_id, statut, diagnostic)
SELECT r.id, 1, 'ouvert', 'Diagnostic initial en attente'
FROM rendez_vous r LIMIT 1;

-- ============================================================
-- AJOUT : Table points fidélité
-- ============================================================
CREATE TABLE IF NOT EXISTS points_fidelite (
  id INT AUTO_INCREMENT PRIMARY KEY,
  client_id INT NOT NULL,
  rendez_vous_id INT,
  points INT NOT NULL,
  type ENUM('gain','depense') NOT NULL DEFAULT 'gain',
  description VARCHAR(255),
  date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (client_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (rendez_vous_id) REFERENCES rendez_vous(id) ON DELETE SET NULL
);

-- AJOUT : Table avis enrichie (déjà existante, ajout index)
CREATE INDEX IF NOT EXISTS idx_avis_prestataire ON avis(prestataire_id);
CREATE INDEX IF NOT EXISTS idx_rdv_client ON rendez_vous(client_id);
CREATE INDEX IF NOT EXISTS idx_rdv_prestataire ON rendez_vous(prestataire_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, est_lue);

-- Trigger points fidélité automatiques quand RDV terminé
DELIMITER //
CREATE TRIGGER IF NOT EXISTS ajouter_points_fidelite
AFTER UPDATE ON rendez_vous
FOR EACH ROW
BEGIN
  IF NEW.statut = 'termine' AND OLD.statut != 'termine' AND NEW.prix_final IS NOT NULL THEN
    INSERT INTO points_fidelite (client_id, rendez_vous_id, points, type, description)
    VALUES (NEW.client_id, NEW.id, FLOOR(NEW.prix_final / 10), 'gain',
            CONCAT('Points gagnés - Intervention #', NEW.id));
  END IF;
END;
//
DELIMITER ;
