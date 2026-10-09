# Galeries clients Google Drive — ZakyPhoto

Cette version ajoute la création de galeries clients depuis `/admin` et des pages `/galerie/<identifiant-unique>`. Les images restent dans Google Drive ; le navigateur les reçoit via des fonctions serveur. Le dossier Drive n'a pas besoin d'être public.

## 1. Appliquer la base Supabase

Dans Supabase → SQL Editor, exécute le fichier `supabase-setup.sql` complet (y compris la partie `client_galleries` ajoutée à la fin). Ne place jamais la clé `service_role` dans une variable `VITE_`.

## 2. Créer un compte de service Google

1. Dans Google Cloud Console, crée un projet ou sélectionne-en un.
2. Active **Google Drive API**.
3. Crée un compte de service et génère une clé JSON.
4. Pour chaque dossier client, partage le dossier Google Drive avec l'adresse e-mail du compte de service en **Lecteur**. Ne sélectionne pas « Tous les utilisateurs disposant du lien ».
5. Copie le JSON entier de la clé (sans le publier dans GitHub).

## 3. Variables d'environnement Vercel

Conserve `VITE_SUPABASE_URL` et `VITE_SUPABASE_ANON_KEY` déjà utilisées par le site. Ajoute ces variables côté serveur dans Vercel (Production et Preview selon besoin) :

- `SUPABASE_SERVICE_ROLE_KEY` : clé secrète `service_role` du projet Supabase. **Jamais** préfixée par `VITE_`.
- `GOOGLE_SERVICE_ACCOUNT_JSON` : contenu intégral du fichier JSON du compte de service, sur une seule variable (coller le JSON complet).

Redéploie après avoir ajouté les variables.

## 4. Créer une galerie

1. Ouvre `https://ton-domaine.fr/admin` et connecte-toi.
2. Dans **Galeries clients · Google Drive**, renseigne le nom du client, le titre et l'URL complète du dossier Drive (ou son ID).
3. Clique **Créer la galerie**, puis **Copier le lien**.
4. Envoie le lien `/galerie/...` au client. Tu peux désactiver une galerie à tout moment.

La galerie liste les fichiers image placés directement dans le dossier choisi. Les sous-dossiers ne sont pas parcourus. Limite de liste actuelle : 1 000 images par dossier.

## Confidentialité

Le lien est non devinable facilement et la galerie peut être désactivée, mais il s'agit d'un **lien secret sans mot de passe** : toute personne qui reçoit/transfère le lien peut consulter les photos tant que la galerie est active. Pour une confidentialité renforcée, ajoute une authentification client ou un code d'accès avant d'utiliser cette fonction pour des photos sensibles. Les fichiers Drive ne sont pas rendus publics ; le serveur contrôle que la galerie est publiée et que l'image demandée appartient au dossier associé.
