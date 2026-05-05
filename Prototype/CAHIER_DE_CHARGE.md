# CAHIER DES CHARGES PROFESSIONNEL : PROJET BRAV_QoS
**Thème : Conception et Mise en Œuvre d’une Plateforme Web d’Autodiagnostic et d’Optimisation de la Qualité de Service (QoS) Réseau**

## 1. PRÉSENTATION DU PROJET
### 1.1 Contexte
Dans le cadre de l’optimisation des performances du réseau mobile de **Huawei Cameroun (Département NPM)**, il est crucial de surveiller la Qualité de Service (QoS) pour garantir une expérience utilisateur optimale (appels fluides, navigation rapide). Cette surveillance repose sur l'analyse de données massives générées par des équipements multi-vendeurs.

### 1.2 Objectif Global
Développer **BRAV_QoS**, une plateforme web centralisée capable d’ingérer des données hétérogènes, de les visualiser de manière dynamique et de fournir un diagnostic automatisé sur l'état de santé des sites mobiles (antennes) à travers le Cameroun.

---

## 2. ANALYSE DE LA PROBLÉMATIQUE
Actuellement, l'équipe NPM fait face à plusieurs défis :
*   **Fragmentation des données** : Les KPIs sont isolés dans des dizaines de fichiers Excel (Huawei, ZTE, Nokia) avec des structures différentes.
*   **Performance limitée** : Le traitement de fichiers volumineux (~30 Mo) sature les outils bureautiques classiques, entraînant des lenteurs et des plantages.
*   **Complexité d'analyse** : Le calcul des indicateurs agrégés (ex: CSSR pondéré) et la localisation géographique des pannes sont des processus manuels chronophages.
*   **Absence d'aide à la décision** : L'identification des causes racines des pannes dépend uniquement de l'expertise humaine, sans automatisation du diagnostic.

---

## 3. SPÉCIFICATIONS FONCTIONNELLES

### 3.1 Module d'Ingestion de Données (ETL)
La plateforme doit permettre l'importation simplifiée de 7 types de rapports de performance :
*   **HUAWEI** : Rapports 2G, 3G, 4G (Indicateurs Voix et Data).
*   **ZTE** : Rapports 2G, 3G, 4G (Sheet0).
*   **NOKIA** : Fichier consolidé avec feuilles dédiées par technologie.
**Fonctionnalité clé** : Reconnaissance automatique des sites via Regex (`(EXN|NRD|ADM|...)_XXXX`) et mapping intelligent des colonnes (CSSR, DCR, Trafic).

### 3.2 Tableau de Bord Analytics
*   **Visualisation Temporelle** : Graphiques de tendances (Line Charts) pour le CSSR, le DCR et le Trafic (Voix/Data).
*   **Filtrage Multi-niveaux** :
    *   **Vendeur** : Huawei, ZTE, Nokia.
    *   **Technologie** : 2G, 3G, 4G.
    *   **Géographique** : Filtrage par région ou par site spécifique.
    *   **Temporel** : 1 jour, 7 jours, 14 jours, 1 mois.
*   **Calcul de Précision** : Implémentation du CSSR pondéré par le trafic pour une vision réaliste de la performance régionale.

### 3.3 Module d'Autodiagnostic (Expert System)
Intelligence embarquée permettant de :
*   **Évaluer l'état du site** : Déterminer si le site est *Normal*, *Dégradé* (KPIs hors seuil) ou *Down* (0 trafic).
*   **Identifier la cause** : Congestion, perte de paquets, problème de transmission ou d'énergie.
*   **Recommander** : Proposer une solution technique adaptée au problème détecté.
*   **Orienter** : Désigner le sous-service responsable de l'intervention.

### 3.4 Cartographie Interactive
Une carte dynamique du Cameroun permettant de :
*   Sélectionner l'une des 10 régions par clic.
*   Afficher instantanément la liste des sites de la région avec leurs métadonnées (Site Code, Town, Vendor, Typology).

---

## 4. SPÉCIFICATIONS TECHNIQUES

### 4.1 Architecture logicielle
*   **Frontend** : **React.js** (Vite) pour une interface réactive et moderne.
*   **Style** : **Tailwind CSS v4** (Mode sombre natif, design épuré).
*   **Data Viz** : **Recharts** pour des courbes fluides et interactives.

### 4.2 Gestion des données (Haute Performance)
*   **Stockage local** : **IndexedDB** via **Dexie.js**.
    *   *Avantage* : Permet de stocker et requêter des milliers de lignes de KPIs directement dans le navigateur sans dépendre d'un serveur backend, éliminant les problèmes de lenteur du prototype initial.
*   **Base de connaissances** : Fichier JSON statique regroupant les métadonnées des 2600+ sites macro.

---

## 5. MÉTHODOLOGIE ET ORGANISATION
Le projet est conduit selon la méthode **Agile** :
1.  **Phase 1 (Conception)** : Analyse des headers Excel et modélisation du schéma de données.
2.  **Phase 2 (Fondation)** : Mise en place de l'architecture IndexedDB et du moteur de parsing.
3.  **Phase 3 (Développement UI)** : Création du dashboard, de la carte et du système de thèmes.
4.  **Phase 4 (Expertise)** : Codage de la logique d'autodiagnostic.
5.  **Phase 5 (Validation)** : Tests de performance avec des données réelles Huawei.

---

## 6. PERSPECTIVES
*   **Automatisation API** : Connexion directe aux OSS/EMS pour supprimer l'upload manuel.
*   **Predictive Maintenance** : Utilisation du Machine Learning pour anticiper les dégradations avant qu'elles n'impactent l'abonné.
