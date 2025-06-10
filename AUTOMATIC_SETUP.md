# 🎌 Panduan Sistem Otomatis Anime Music Player

## ✨ Sistem Sepenuhnya Otomatis

Music player ini sekarang **sepenuhnya otomatis**! Tidak perlu lagi manual input URL atau nama file.

## 🎵 Cara Kerja

1. **Upload File ke Cloudinary**: Upload musik dan cover image ke akun Cloudinary Anda
2. **Sistem Otomatis Detect**: Aplikasi akan otomatis mendeteksi semua file
3. **Smart Matching**: Cover image akan otomatis di-match dengan musik berdasarkan nama file

## 📁 Format File yang Didukung

### Musik:
- `.mp3`
- `.wav` 
- `.m4a`

### Cover Image:
- `.jpg` / `.jpeg`
- `.png`
- `.webp`
- `.avif`

## 🎯 Tips untuk Matching Otomatis

### ✅ Contoh Nama File yang Baik:
```
die_with_a_smile.mp3  →  die_with_a_smile.jpg
attack_on_titan.wav   →  attack_on_titan.png
naruto_theme.mp3      →  naruto_theme.webp
```

### ⚡ Sistem Akan Mencocokkan:
- **Exact Match**: Nama file sama persis
- **Partial Match**: Sebagian nama file cocok
- **Smart Algorithm**: Menggunakan scoring system untuk match terbaik

## 🔧 Setup Environment

Pastikan file `.env.local` berisi:
```env
CLOUDINARY_CLOUD_NAME=dszmfao0h
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

## 🚀 Hasil

- ✅ Musik terdeteksi otomatis dari Cloudinary
- ✅ Cover image otomatis ter-match dengan musik
- ✅ Metadata otomatis (title, duration, dll)
- ✅ Tidak perlu manual input apapun

## 🎊 Selesai!

Upload file musik dan cover ke Cloudinary → Refresh website → Semua otomatis terdeteksi!

---

*Sistem ini menggunakan Cloudinary API untuk deteksi real-time dan smart matching algorithm untuk cover image.* 