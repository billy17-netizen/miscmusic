# 🎵 Anime Music Player

Aplikasi music player modern dengan tema anime yang dibangun menggunakan Next.js 15, TypeScript, dan Tailwind CSS. Dilengkapi dengan fitur-fitur canggih seperti Web Audio API untuk efek pan stereo, video background dinamis, dan dukungan lyrics format LRC.

## ✨ Fitur Utama

### 🎧 Audio Player Advanced
- **Web Audio API Integration** - Kontrol audio tingkat rendah untuk kualitas suara terbaik
- **Auto Pan Effect** - Efek stereo panning otomatis yang tersinkronisasi dengan musik
- **Multiple Audio Format Support** - MP3, WAV, M4A, FLAC, OGG
- **Real-time Progress Tracking** - Progress bar yang smooth dan responsif

### 🎬 Visual Experience
- **Dynamic Video Backgrounds** - Video background yang berubah sesuai dengan track yang dipilih
- **Animated Gradients Fallback** - Gradient animasi sebagai fallback jika video tidak tersedia
- **Responsive Design** - Tampilan yang optimal di semua device (desktop, tablet, mobile)
- **Modern UI/UX** - Interface yang clean dengan animasi Framer Motion

### 📝 Lyrics Support
- **LRC Format Support** - Lyrics tersinkronisasi dengan timing yang akurat
- **Auto-scroll Lyrics** - Lyrics otomatis scroll mengikuti progress lagu
- **Multiple Format Support** - Text, LRC, dan JSON format
- **Click-to-seek** - Klik pada lyrics untuk jump ke bagian tertentu

### 🔧 Technical Features
- **Cloudinary Integration** - Otomatis fetch audio, video, dan cover art dari Cloudinary
- **Smart Matching Algorithm** - Algoritma pintar untuk mencocokkan audio dengan cover dan video
- **Intelligent Fallback System** - Sistem fallback berlapis untuk memastikan aplikasi selalu berjalan
- **Error Handling** - Penanganan error yang robust, termasuk Cloudinary 423 errors

## 🛠️ Teknologi yang Digunakan

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Animations:** Framer Motion
- **Icons:** Lucide React
- **Storage:** Cloudinary (Audio, Video, Images)
- **Audio Processing:** Web Audio API
- **State Management:** React Context + useReducer

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm atau yarn
- Akun Cloudinary (untuk storage media)

### Installation

1. **Clone repository**
```bash
git clone https://github.com/yourusername/anime-music-player.git
cd anime-music-player
```

2. **Install dependencies**
```bash
npm install
# atau
yarn install
```

3. **Setup Environment Variables**
Buat file `.env.local` di root project:
```env
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

4. **Run Development Server**
```bash
npm run dev
# atau
yarn dev
```

5. **Open Browser**
Buka [http://localhost:3000](http://localhost:3000)

## ⚙️ Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | Nama cloud Cloudinary Anda | ✅ |
| `CLOUDINARY_API_KEY` | API Key dari Cloudinary | ✅ |
| `CLOUDINARY_API_SECRET` | API Secret dari Cloudinary | ✅ |

## 📁 Struktur Project

```
anime-music-player/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API Routes
│   │   │   └── cloudinary/    # Cloudinary integration
│   │   ├── track/[id]/        # Dynamic track pages
│   │   ├── globals.css        # Global styles
│   │   ├── layout.tsx         # Root layout
│   │   ├── page.tsx          # Homepage
│   │   └── not-found.tsx     # 404 page
│   ├── components/            # React components
│   │   ├── MiniPlayer.tsx     # Mini player overlay
│   │   ├── MusicPlayer.tsx    # Main player controls
│   │   └── TrackList.tsx      # Track listing
│   ├── lib/                   # Utilities and hooks
│   │   ├── useMusicPlayer.tsx # Main player hook
│   │   ├── cloudinary.ts      # Cloudinary utilities
│   │   └── audioUtils.ts      # Audio utilities
│   └── types/                 # TypeScript type definitions
└── public/                    # Static assets
```

## 🎮 Cara Penggunaan

### Upload Media ke Cloudinary

1. **Audio Files:** Upload file audio (MP3, WAV, M4A, FLAC, OGG) ke folder `audio/`
2. **Cover Images:** Upload cover art dengan nama yang sama dengan audio file
3. **Video Backgrounds:** Upload video dengan nama yang sama untuk background dinamis
4. **Lyrics Files:** Upload file lyrics (.lrc, .txt, .json) dengan nama yang sama

### Naming Convention
Untuk matching otomatis, gunakan naming convention yang konsisten:
```
audio: song-title.mp3
cover: song-title.jpg
video: song-title.mp4
lyrics: song-title.lrc
```

## 🎨 Customization

### Warna Theme
Edit file `tailwind.config.js` untuk mengubah color scheme:
```javascript
theme: {
  extend: {
    colors: {
      'neon-purple': '#8B5CF6',
      'neon-pink': '#EC4899',
      // Tambah warna custom Anda
    }
  }
}
```

### Font
Aplikasi menggunakan font custom "Kulture". Anda bisa menggantinya di `globals.css`.

## 🐛 Troubleshooting

### Cloudinary 423 Error
Jika mendapat error 423 dari Cloudinary:
- Periksa quota account Cloudinary Anda
- Coba gunakan transformasi yang lebih sederhana
- Aplikasi otomatis fallback ke video original

### Audio Tidak Terputar
- Pastikan file audio dalam format yang didukung
- Periksa CORS settings di Cloudinary
- Coba refresh halaman untuk reinitialize Web Audio API

### Video Background Tidak Muncul
- Pastikan video dalam format MP4/WebM
- Periksa ukuran file (maksimal 100MB)
- Pastikan filename matching dengan audio file

## 📜 Scripts

```bash
npm run dev          # Jalankan development server
npm run build        # Build untuk production
npm run start        # Jalankan production server
npm run lint         # Jalankan ESLint
npm run type-check   # Cek TypeScript errors
```

## 🤝 Contributing

1. Fork repository
2. Buat feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push ke branch (`git push origin feature/amazing-feature`)
5. Buat Pull Request

## 📄 License

Distributed under the MIT License. See `LICENSE` file for more information.

## 👨‍💻 Author

**Your Name**
- GitHub: [@yourusername](https://github.com/yourusername)
- Email: your.email@example.com

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - React framework terbaik
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [Framer Motion](https://www.framer.com/motion/) - Animation library yang powerful
- [Cloudinary](https://cloudinary.com/) - Media storage dan transformasi
- [Lucide](https://lucide.dev/) - Beautiful icon library

---

⭐ **Star repository ini jika bermanfaat!** ⭐
