# Developer Portfolio

A modern, full-stack portfolio web app built with React, TypeScript, Supabase, and Tailwind CSS.
Showcase your skills, projects, certifications, and more, with a secure admin panel for live editing.

---

## 🚀 Features

- **Responsive Design:** Mobile-first, beautiful UI with Tailwind CSS.
- **Admin Panel:** Secure dashboard for editing profile, about, skills, projects, and certifications.
- **Authentication:** Supabase Auth for secure login and admin access.
- **Data Storage:** All portfolio data stored in Supabase.
- **Image Uploads:** Profile and project images stored in Supabase Storage.
- **Smooth Navigation:** Animated, scroll-linked navigation and sections.
- **Notifications:** Toast and Sonner notifications for user feedback.
- **Modern Stack:** React, TypeScript, Vite, Supabase, Framer Motion, Lucide Icons.

---

## 🛠️ Project Structure

```
chinmay-portfolio-main/
├── public/
│   ├── favicon.ico
│   ├── robots.txt
│   └── lovable-uploads/         # Uploaded images
├── src/
│   ├── assets/                  # Static assets
│   ├── components/              # Reusable UI and admin components
│   ├── contexts/                # React context providers
│   ├── hooks/                   # Custom React hooks
│   ├── integrations/            # Supabase client setup
│   ├── lib/                     # Utility libraries
│   ├── pages/                   # Main pages (Index, Admin, Login, etc.)
│   ├── types/                   # TypeScript types
│   ├── utils/                   # Utility functions
│   ├── App.tsx                  # Main app component
│   ├── index.tsx                # Entry point
│   └── index.css                # Global styles
├── supabase/                    # Supabase config and migrations
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── vite.config.ts
```

---

## ⚡ Getting Started

### 1. **Clone the repository**

```sh
git clone <your-repo-url>
cd chinmay-portfolio-main
```

### 2. **Install dependencies**

```sh
npm install
# or
bun install
```

### 3. **Set up Supabase**

- Create a [Supabase](https://supabase.com/) project.
- Copy your Supabase URL and anon/public key.
- Create a `.env` file in the root and add:
  ```
  VITE_SUPABASE_URL=your-supabase-url
  VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
  ```
- Run Supabase migrations if needed.

### 4. **Run the development server**

```sh
npm run dev
# or
bun run dev
```

Visit [http://localhost:5173](http://localhost:5173) to view the app.

---

## 🔑 Admin Access

- The admin panel is protected. Only users with the configured admin email can access `/admin`.
- Update the admin email in the code if needed.

---

## 🖼️ Image Uploads

- Uploaded images are stored in the `lovable-uploads` bucket in Supabase Storage.
- Make sure your Supabase Storage rules allow authenticated uploads.

---

## 🧩 Customization

- **Update content:** Use the admin panel to edit your profile, about, skills, projects, and certifications.
- **Change theme/colors:** Edit `tailwind.config.ts` and CSS files.
- **Add sections:** Add new components and update navigation in `Header.tsx` and `Index.tsx`.

---

## 📝 Scripts

- `npm run dev` — Start development server
- `npm run build` — Build for production
- `npm run lint` — Lint code with ESLint

---

## 🤝 Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

---

## 📄 License

MIT

---

## 🙏 Credits

- [Supabase](https://supabase.com/)
- [React](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Lucide Icons](https://lucide.dev/)
- [Framer Motion](https://www.framer.com/motion/)

---

**Made with ❤️ by the project Chinmay**
