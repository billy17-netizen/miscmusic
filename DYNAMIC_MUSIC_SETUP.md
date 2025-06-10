# 🎵 Setup Dynamic Music Loading dari Cloudinary

## ✨ Fitur Baru: Automatic Music Detection

Sekarang music player Anda bisa **otomatis mendeteksi semua musik** yang ada di Cloudinary tanpa perlu manual input URL satu per satu!

## 🚀 Cara Setup

### 1. Dapatkan API Credentials dari Cloudinary

1. Login ke [Cloudinary Console](https://cloudinary.com/console)
2. Di dashboard, cari section **API Environment variable**
3. Copy **API Key** dan **API Secret**

### 2. Update File `.env.local`

Tambahkan credentials ke file `.env.local`:

```env
# Cloudinary Configuration
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=dczwrcbws

# Cloudinary API Credentials (Required for dynamic music loading)
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=abcdefghijklmnopqrstuvwxyz1234567890abcd
```

### 3. Upload Musik ke Cloudinary

Upload musik Anda ke Cloudinary dengan format:
- **MP3**, **WAV**, **M4A**, **FLAC**, atau **OGG**
- Nama file sebaiknya format: `Artist - Title.mp3`
- Contoh: `Bruno Mars - Die With A Smile.mp3`

### 4. Restart Development Server

```bash
npm run dev
```

## 🎯 Cara Kerja

### Automatic Detection
- System akan **scan semua audio files** di Cloudinary Anda
- **Auto-generate** title, artist dari nama file
- **Auto-create** cover image dengan warna random
- **Sort** berdasarkan tanggal upload terbaru

### Smart Naming
- File: `Bruno Mars - Die With A Smile.mp3` 
  - **Artist**: Bruno Mars
  - **Title**: Die With A Smile
- File: `My_Song_Title.mp3`
  - **Artist**: Unknown Artist  
  - **Title**: My Song Title

### Fallback System
1. **Primary**: Dynamic fetch dari Cloudinary API
2. **Secondary**: Static tracks (jika API gagal)
3. **Tertiary**: Demo tracks (jika tidak ada musik)

## 🔧 Testing

### Cek Koneksi
- Pastikan file `.env.local` sudah benar
- Restart development server setelah update credentials
- Upload musik ke Cloudinary
- Refresh halaman untuk melihat musik baru

## 🎨 Customizations

### Custom Cover Images
Upload cover image dengan nama yang sama:
- Music: `song.mp3`
- Cover: `song.jpg` atau `song.png`

### Metadata di Filename
Format yang didukung:
- `Artist - Title.mp3`
- `Title - Artist.mp3`  
- `Artist_Title.mp3`
- `Title.mp3`

### Folder Structure
Organize musik dalam folder:
- `/music/pop/song.mp3`
- `/music/rock/song.mp3`
- `/albums/2024/song.mp3`

## 🚨 Troubleshooting

### Musik Tidak Muncul
1. ✅ Cek API credentials di `.env.local`
2. ✅ Restart server setelah update env
3. ✅ Pastikan file format didukung (MP3, WAV, M4A, FLAC, OGG)
4. ✅ Cek console browser untuk error

### Musik Tidak Play
1. ✅ Cek URL di Network tab
2. ✅ Pastikan file tidak corrupted
3. ✅ Test URL langsung di browser

### Cover Image Tidak Muncul
- System akan auto-generate cover jika tidak ada
- Upload file image dengan nama yang sama untuk custom cover

## 🎉 Selesai!

Sekarang setiap kali Anda upload musik baru ke Cloudinary, music player akan otomatis mendeteksinya tanpa perlu edit code!

**Upload musik → Refresh page → Musik baru muncul! ✨** 