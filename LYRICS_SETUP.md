# 🎤 Setup Lyrics Feature

## 📝 Cara Upload Lyrics ke Cloudinary

### 1. Format yang Didukung:
- **.txt** - Plain text lyrics
- **.lrc** - Synchronized lyrics dengan timestamps
- **.json** - Structured lyrics data

### 2. Penamaan File untuk Auto-Match:
```
✅ BENAR:
- Audio: Bruno_Mars_-_Die_With_A_Smile.mp3
- Lyrics: Bruno_Mars_-_Die_With_A_Smile.txt

✅ BENAR JUGA:
- Audio: die_with_a_smile.mp3  
- Lyrics: die_with_a_smile.lrc

❌ SALAH:
- Audio: Bruno_Mars_-_Die_With_A_Smile.mp3
- Lyrics: random_lyrics.txt
```

### 3. Upload ke Cloudinary:
1. Buka [Cloudinary Media Library](https://cloudinary.com/console/media_library)
2. Upload file lyrics sebagai **"Raw"** file type
3. Pastikan nama file match dengan audio file

### 4. Format File Lyrics:

#### Plain Text (.txt):
```
Die With A Smile
by Bruno Mars ft. Lady Gaga

Nobody's gonna hurt you, baby
Nobody's gonna dare to try
You want a reason to keep believin'
I can give you that tonight
...
```

#### LRC Format (.lrc) - Synchronized:
```
[ti:Die With A Smile]
[ar:Bruno Mars ft. Lady Gaga]

[00:16.50]Nobody's gonna hurt you, baby
[00:20.20]Nobody's gonna dare to try
[00:24.10]You want a reason to keep believin'
[00:28.00]I can give you that tonight
...
```

## 🎨 UI Features

### ✅ Fitur yang Tersedia:
- **Auto-detection** lyrics berdasarkan nama track
- **Toggle button** untuk show/hide lyrics
- **Beautiful overlay** dengan blur background
- **Support LRC format** (synchronized lyrics)
- **Loading indicator** saat fetch lyrics
- **Responsive design** untuk mobile & desktop

### 🎯 Cara Penggunaan:
1. **Upload lyrics file** ke Cloudinary dengan nama yang match
2. **Buka track detail page** 
3. **Klik tombol lyrics** (📄 icon) di control panel
4. **Lyrics akan muncul** dalam overlay yang elegan

## 🔧 Technical Details

### API Endpoint:
- **POST** `/api/cloudinary/lyrics`
- **Input:** `trackName`, `trackId`, `filename`
- **Output:** `lyrics`, `lyricsType`, `matchScore`

### Matching Algorithm:
1. **Exact filename match** (100% score)
2. **Partial filename match** (80% score)  
3. **Similarity matching** menggunakan Levenshtein distance
4. **Minimum 50% similarity** untuk dianggap match

### Error Handling:
- **Graceful fallback** jika lyrics tidak ditemukan
- **Loading states** dengan spinner animation
- **Disable button** jika tidak ada lyrics
- **Auto-retry** jika API call gagal

## 🚀 Advanced Features (Coming Soon)

### 📍 Synchronized Lyrics:
- **Real-time highlighting** berdasarkan currentTime
- **Auto-scroll** mengikuti musik
- **Click to seek** ke bagian tertentu

### 🎨 Customization:
- **Font size options**
- **Color themes**
- **Background blur intensity**
- **Animation preferences**

## 💡 Tips & Best Practices

### 📝 Lyrics Quality:
- **Gunakan lyrics yang akurat** dan lengkap
- **Include artist & song info** di bagian atas
- **Format dengan rapi** untuk readability
- **Test different formats** (.txt vs .lrc)

### 🔗 File Organization:
- **Konsisten dengan naming** convention
- **Group by artist** atau album
- **Backup lyrics files** secara teratur
- **Version control** untuk lyrics updates

---

**Enjoy your enhanced music experience with lyrics! 🎵📝** 