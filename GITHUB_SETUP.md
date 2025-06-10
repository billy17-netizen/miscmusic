# 🚀 GitHub Setup Guide

Panduan untuk menghubungkan project ke GitHub repository.

## 📋 Langkah-langkah Setup

### 1. Buat Repository Baru di GitHub

1. Kunjungi [GitHub.com](https://github.com)
2. Klik tombol **"New"** atau **"+"** > **"New repository"**
3. Isi informasi repository:
   - **Repository name:** `anime-music-player`
   - **Description:** `🎵 Modern anime-themed music player with Next.js 15, Web Audio API, and Cloudinary integration`
   - **Visibility:** Public (atau Private sesuai kebutuhan)
   - **JANGAN** centang "Initialize this repository with README" (karena kita sudah punya)

### 2. Connect Local Repository ke GitHub

```bash
# Tambahkan remote origin (ganti YOUR_USERNAME dengan username GitHub Anda)
git remote add origin https://github.com/YOUR_USERNAME/anime-music-player.git

# Verifikasi remote sudah ditambahkan
git remote -v

# Push ke GitHub
git branch -M main
git push -u origin main
```

### 3. Verifikasi Upload

1. Refresh halaman GitHub repository Anda
2. Pastikan semua file sudah terupload
3. README.md akan otomatis ditampilkan di halaman utama

## 🔧 Perintah Git yang Sudah Siap

Jalankan perintah berikut di terminal:

```bash
# 1. Tambahkan remote GitHub (ganti YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/anime-music-player.git

# 2. Push ke GitHub
git branch -M main
git push -u origin main
```

## 📝 Update README (Opsional)

Setelah repository dibuat, Anda bisa update bagian ini di README.md:

```markdown
# Ganti baris ini:
git clone https://github.com/yourusername/anime-music-player.git

# Menjadi:
git clone https://github.com/YOUR_ACTUAL_USERNAME/anime-music-player.git
```

## 🎯 Next Steps

Setelah push berhasil:

1. **Enable GitHub Pages** (jika ingin deploy gratis)
2. **Setup GitHub Actions** untuk auto-deploy
3. **Add collaborators** jika project team
4. **Setup branch protection** untuk main branch
5. **Add topics/tags** untuk discovery

## 🔒 Environment Variables untuk Deployment

Jangan lupa setup environment variables jika deploy ke platform hosting:

- `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY` 
- `CLOUDINARY_API_SECRET`

## 🎉 Selesai!

Repository Anda sekarang sudah siap di GitHub! 🚀 