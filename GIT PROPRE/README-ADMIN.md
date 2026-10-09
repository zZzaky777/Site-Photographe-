# ZakyPhoto — panneau d'administration

Le panneau est accessible sur `/admin`. Il utilise Supabase pour l'authentification, la base de données et le stockage photo. Le site public conserve son design actuel ; dès qu'au moins une photo est publiée dans Supabase, la galerie publique utilise cette bibliothèque.

## Mise en route

1. Crée un projet sur https://supabase.com.
2. Dans **SQL Editor**, exécute intégralement `supabase-setup.sql`.
3. Dans **Authentication > Providers / Sign In**, désactive les inscriptions publiques (Allow new users to sign up). Crée toi-même un utilisateur administrateur depuis **Authentication > Users**.
4. Dans les paramètres API du projet Supabase, récupère l'URL du projet et la clé publique `anon` / publishable.
5. Ajoute dans les variables d'environnement de Vercel :
   - `VITE_SUPABASE_URL` = URL du projet
   - `VITE_SUPABASE_ANON_KEY` = clé publique anon/publishable
   Puis redéploie.
6. Installe la dépendance avec `pnpm install` (ou `pnpm add @supabase/supabase-js` si le gestionnaire le demande), puis lance `pnpm run build` pour vérifier avant déploiement.
7. Ouvre `https://ton-domaine.fr/admin`, connecte-toi avec l'utilisateur administrateur, puis ajoute tes photos.

## Sécurité

- Ne mets jamais la clé `service_role` dans les variables `VITE_` ou dans le code du navigateur.
- Laisse les inscriptions publiques désactivées. Les politiques SQL autorisent les opérations d'écriture aux utilisateurs connectés ; c'est pourquoi il ne faut pas autoriser les visiteurs à créer eux-mêmes un compte.
- Les photos publiques sont dans le bucket `portfolio`. Les images ne doivent pas dépasser 12 Mo chacune.
- Si Supabase n'est pas encore configuré, `/admin` affiche les étapes de configuration au lieu de planter.

## Ce que gère cette première version

- Connexion par e-mail et mot de passe.
- Ajout d'images, catégorie, légende et texte alternatif.
- Bibliothèque filtrable par catégorie.
- Publication/masquage et suppression d'images.
- Affichage des photos publiées dans la galerie publique du site.

Les textes des sections et le réglage libre du design ne sont pas encore éditables depuis cette première version du panneau.
