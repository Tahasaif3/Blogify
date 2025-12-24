# Blog Web App

A modern, lightweight blogging platform built with **Next.js (App Router)** and **Supabase**. This project provides authenticated user accounts, post creation (drafts/publish), comments, emoji reactions, profiles, and a simple explore feed.

---

## 📌 Quick Overview

- **Framework:** Next.js (TypeScript, App Router)
- **Backend:** Supabase (Auth, Postgres, RLS policies)
- **Features:** Authentication (email/password, OAuth & magic link), create/edit/publish posts, comments, reactions, profile management, paginated explore feed
- **Code Structure:** `app/` (pages & components), `components/`, `context/` (Auth & Blog providers), `lib/` (Supabase client & services)

---

## 🚀 Features

- User authentication using **Supabase Auth** (sign up, sign in, OAuth, magic links)
- Create and manage posts (drafts & publish workflow)
- Post detail pages with **comments** and **emoji reactions**
- User profiles (username, full name, avatar, bio)
- Explore feed with pagination and post metadata
- Clean separation of concerns via `BlogContext` and `AuthContext`

---

## 🧭 Project Structure (high level)

- `app/` - Next.js App Router pages (e.g., `create`, `explore`, `post/[id]`, `profile`)
- `components/` - Reusable UI components (`BlogCard`, `CommentSection`, `Navbar`, ...)
- `context/` - React Contexts for auth and blog state
- `lib/` - `supabase` client, `supabase-server` helper, and `blog-service` (posts/comments/reactions)
- `supabase/schema.sql` - DB schema and RLS policies
- `types/` - TypeScript models used across the app

---

## ⚙️ Local Setup

Prerequisites: Node.js 18+ and a Supabase project.

1. Clone the repo

```bash
git clone <repo-url>
cd blog-web
```

2. Install dependencies

```bash
npm install
# or yarn
```

3. Create `.env.local` in the project root and add your Supabase keys

```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

> If you run server-side scripts that require elevated privileges you may also need a service role key — keep it secret and **do not** commit it to the repo.

4. Initialize the database

- Option A: Use the Supabase dashboard and run the SQL from `supabase/schema.sql`.
- Option B: Use the Supabase CLI to push your schema (depends on your workflow).

5. Start the dev server

```bash
npm run dev
```

Open http://localhost:3000

---

## 🔬 Development Notes

- The app uses two Supabase clients:
  - `lib/supabase.ts` for client-side calls (requires public ANON key)
  - `lib/supabase-server.ts` for server-side requests in the Next.js server runtime
- Business logic for posts, comments, and reactions is implemented in `lib/blog-service.ts` (recommended place to add/adjust queries)
- Authentication state and helpers live in `context/AuthContext.tsx` and are consumed by UI components

---

## 📁 Database Schema (summary)

Core tables defined in `supabase/schema.sql`:

- `posts` — id, title, content, excerpt, author_id, image, tags, published, timestamps
- `comments` — id, post_id, user_id, content, parent_id, timestamps
- `reactions` — id, post_id, user_id, emoji, timestamps (unique constraint per user/post/emoji)
- `profiles` — user profile data synced from Supabase Auth

Row-Level Security (RLS) policies are included to protect and allow appropriate access.

---

## 🧪 Scripts

- `npm run dev` — Start development server
- `npm run build` — Build for production
- `npm run start` — Start production server

---

## ⬇️ Deployment

- Vercel is a recommended option for deploying Next.js apps. Add the environment variables (`NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`) to your Vercel project settings and deploy.
- Ensure your Supabase project has the schema and RLS policies applied.

---

## ✅ Known Limitations & TODOs

- Image upload handling and storage integration can be improved (Supabase Storage not used by default)
- Rich-text editor for post content (currently stores raw HTML or text)
- Pagination and caching strategies can be optimized for large datasets

---

## 🤝 Contributing

Contributions are welcome. Please open an issue or submit a pull request with a clear description of changes and reasoning.

---

## 📄 License

This project is provided under the **MIT License**. Replace or update the license as needed.

---

## 📫 Contact

If you have questions or want to collaborate, open an issue or contact the repository owner.

---

Thank you for checking out this project! ✨
