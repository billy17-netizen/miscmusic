# 🖼️ Setup Cover Image Detection dari Cloudinary

## 🎯 Masalah Cover Image

Berdasarkan URL yang Anda berikan: `https://res.cloudinary.com/dszmfao0h/image/upload/hqdefault_tmb5zn.avif`

**Cloud Name Anda:** `dszmfao0h`

## 🔧 Langkah Perbaikan

### 1. Update Cloud Name di `.env.local`

```env
# Cloudinary Configuration  
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=dszmfao0h

# API Credentials (wajib untuk auto-detection)
CLOUDINARY_API_KEY=your_api_key_here
CLOUDINARY_API_SECRET=your_api_secret_here
```

### 2. Cara Upload Cover Image yang Benar

#### Format Penamaan File:
- **Audio file:** `song_name.mp3`
- **Cover image:** `song_name.jpg` (atau .png, .webp, .avif)

#### Contoh:
```
✅ BENAR:
- Audio: die_with_a_smile.mp3
- Cover: die_with_a_smile.jpg

❌ SALAH:
- Audio: die_with_a_smile.mp3  
- Cover: hqdefault_tmb5zn.avif (nama tidak cocok)
```

### 3. Strategy Matching yang Diterapkan

System akan mencari cover image dengan urutan:

1. **Exact Public ID Match**
   - Mencari image dengan public_id yang sama persis

2. **Filename Match** 
   - Mencari berdasarkan nama file tanpa extension
   - `song.mp3` → cari `song.jpg`, `song.png`, dll

3. **Partial Match**
   - Mencari kesamaan sebagian nama file
   - `bruno_mars_song.mp3` → bisa match dengan `bruno_mars.jpg`

4. **Fallback**
   - Jika tidak ada yang cocok, generate cover otomatis

### 4. Testing Cover Detection

Gunakan komponen debug yang sudah ditambahkan di halaman utama untuk melihat:
- ✅ Berapa audio files terdeteksi
- ✅ Berapa image files terdeteksi  
- ✅ Cover mana yang berhasil di-match
- ✅ Cover mana yang masih generated

### 5. Manual Override (Sementara)

Jika ingin menggunakan cover spesifik untuk sementara, edit file `src/lib/cloudinary.ts`:

```typescript
export const userCloudinaryTracks: Track[] = [
  {
    id: '1',
    title: 'Die With A Smile',
    artist: 'Your Artist',
    album: 'Your Album',
    duration: 240,
    url: 'https://res.cloudinary.com/dszmfao0h/video/upload/your_audio_file.mp3',
    coverImage: 'https://res.cloudinary.com/dszmfao0h/image/upload/hqdefault_tmb5zn.avif', // ✅ URL asli Anda
    genre: 'Pop',
    year: 2024,
  },
];
```

## 🚀 Rekomendasi

### Untuk Hasil Terbaik:

1. **Rename Files** - Beri nama yang sama untuk audio dan cover
2. **Upload Ulang** - Upload dengan nama yang konsisten
3. **Test Detection** - Gunakan debug component untuk verify
4. **Setup API** - Pastikan API credentials sudah benar

### Format File yang Didukung:

**Audio:** MP3, WAV, M4A, FLAC, OGG
**Image:** JPG, JPEG, PNG, WebP, AVIF

## ✅ Checklist

- [ ] Update `.env.local` dengan cloud name `dszmfao0h`
- [ ] Tambahkan CLOUDINARY_API_KEY dan CLOUDINARY_API_SECRET
- [ ] Rename audio dan cover files dengan nama yang sama
- [ ] Test menggunakan debug component
- [ ] Restart development server

Setelah setup ini, sistem akan otomatis mendeteksi dan mencocokkan cover image dengan audio files! 🎉 