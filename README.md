<div align="center">

<h1>🌌 Aryan's 3D Portfolio</h1>

<p><em>A stunning, interactive 3D developer portfolio — built with cutting-edge web tech</em></p>

<br/>

<a href="https://portfolioaryan-chi.vercel.app/" target="_blank">
  <img src="https://img.shields.io/badge/🚀%20LIVE%20DEMO-Click%20to%20Visit-6C63FF?style=for-the-badge&logo=vercel&logoColor=white" alt="Live Demo" height="40"/>
</a>

&nbsp;&nbsp;

<a href="https://github.com/aryan8434/portfolio" target="_blank">
  <img src="https://img.shields.io/badge/GitHub-Source%20Code-181717?style=for-the-badge&logo=github&logoColor=white" alt="GitHub" height="40"/>
</a>

<br/><br/>

<img src="https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black"/>
<img src="https://img.shields.io/badge/Three.js-0.182-black?flat-square&logo=three.js&logoColor=white"/>
<img src="https://img.shields.io/badge/Vite-7-646CFF?flat-square&logo=vite&logoColor=white"/>
<img src="https://img.shields.io/badge/TailwindCSS-3-38BDF8?flat-square&logo=tailwindcss&logoColor=white"/>
<img src="https://img.shields.io/badge/GSAP-3.14-88CE02?flat-square&logo=greensock&logoColor=black"/>

</div>

---

## 🔗 Live Demo

> **👉 [https://portfolioaryan-chi.vercel.app/](https://portfolioaryan-chi.vercel.app/)** — Click to open in a new tab

---

## ✨ Features

| Feature                    | Description                                                        |
| -------------------------- | ------------------------------------------------------------------ |
| 🧊 **3D Animated Avatar**  | Interactive GLB model — rotate, zoom & explore with orbit controls |
| 🌐 **Dot Grid Background** | Canvas particle system that reacts to mouse movement and clicks    |
| 🤖 **AI Chatbot**          | Groq-powered assistant for real-time conversations                 |
| 🌗 **Dark / Light Mode**   | One-click seamless theme switching with smooth transitions         |
| 📬 **Contact Form**        | EmailJS-powered form — sends messages directly to inbox            |
| ✨ **Shiny Text Effects**  | Dynamic shimmer animations on headings                             |
| 🎞️ **GSAP Animations**     | Professional scroll & entrance animations                          |
| 🖱️ **Custom Cursor**       | Unique animated cursor that follows mouse movement                 |
| 📱 **Fully Responsive**    | Optimized layout across all screen sizes                           |

---

## 🛠️ Tech Stack

### ⚛️ Core

| Technology          | Version | Role                                      |
| ------------------- | ------- | ----------------------------------------- |
| **React**           | 19      | UI framework with latest hooks & features |
| **Vite**            | 7       | Lightning-fast dev server & build tool    |
| **JavaScript ES6+** | —       | Modern syntax, async/await, destructuring |

### 🗺️ 3D & Animation

| Technology             | Version | Role                                 |
| ---------------------- | ------- | ------------------------------------ |
| **Three.js**           | 0.182   | WebGL 3D rendering engine            |
| **@react-three/fiber** | 9       | React renderer for Three.js          |
| **@react-three/drei**  | 10      | Orbit controls, loaders & helpers    |
| **GSAP**               | 3.14    | Professional-grade scroll animations |
| **Motion**             | 12      | Declarative React animations         |

### 🎨 Styling

| Technology                 | Version | Role                                |
| -------------------------- | ------- | ----------------------------------- |
| **Tailwind CSS**           | 3       | Utility-first styling               |
| **Custom CSS**             | —       | Component-scoped styles & keyframes |
| **PostCSS + Autoprefixer** | —       | CSS processing pipeline             |

### 📡 Services

| Technology   | Version | Role                                    |
| ------------ | ------- | --------------------------------------- |
| **Groq SDK** | 0.3     | AI chatbot (Llama model)                |
| **EmailJS**  | 4       | Client-side contact form email delivery |
| **Firebase** | 12      | Backend services                        |

---

## 📁 Project Structure

```
threD/
├── public/                  # Static assets (images, 3D models)
├── src/
│   ├── components/
│   │   ├── Navbar.jsx       # Navigation + dark/light toggle
│   │   ├── Home.jsx         # Hero section with 3D avatar
│   │   ├── About.jsx        # About me section
│   │   ├── Projects.jsx     # Portfolio projects carousel
│   │   ├── Contact.jsx      # EmailJS contact form
│   │   ├── AIChat.jsx       # Groq AI chatbot
│   │   ├── Avatar.jsx       # Three.js GLB model loader
│   │   ├── DotGrid.jsx      # Canvas particle system
│   │   ├── CustomCursor.jsx # Animated cursor
│   │   └── ShinyText.jsx    # Shimmer text effect
│   ├── config/              # Firebase config
│   ├── services/            # EmailJS service
│   ├── App.jsx
│   └── main.jsx
├── vercel.json              # SPA routing for Vercel
├── vite.config.js
└── tailwind.config.js
```

---

## 🚀 Getting Started

```bash
# Clone the repo
git clone https://github.com/aryan8434/portfolio.git
cd portfolio

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env
# → Fill in your keys in .env

# Start dev server
npm run dev
```

### 🔐 Environment Variables

```env
VITE_EMAILJS_SERVICE_ID=your_service_id
VITE_EMAILJS_TEMPLATE_ID=your_template_id
VITE_EMAILJS_PUBLIC_KEY=your_public_key
VITE_GROQ_API_KEY=your_groq_api_key
VITE_FIREBASE_API_KEY=your_firebase_key
VITE_ADMIN_PANEL_KEY=your_admin_key
```

Open the admin dashboard by visiting `/#admin` after setting the admin key.

---

## 🌐 Browser Support

| Browser          | Supported |
| ---------------- | --------- |
| Chrome (latest)  | ✅        |
| Firefox (latest) | ✅        |
| Safari (latest)  | ✅        |
| Edge (latest)    | ✅        |

> ⚠️ Requires a browser with **WebGL support** for the 3D avatar.

---

<div align="center">

**Made with ❤️ by Aryan**

<a href="https://portfolioaryan-chi.vercel.app/" target="_blank">
  <img src="https://img.shields.io/badge/🌐%20Visit%20Portfolio-6C63FF?style=for-the-badge&logoColor=white" alt="Visit Portfolio" height="35"/>
</a>

</div>
