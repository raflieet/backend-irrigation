const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const SensorData = require('./models/sensor-data');
const path = require('path'); // Pastikan ini ada

const app = express();
const PORT = process.env.PORT || 3010;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// --- [BARU 1] Konfigurasi Folder Statis (Frontend) ---
// Memberitahu Express bahwa file website ada di folder 'dist'
app.use(express.static(path.join(__dirname, 'dist')));


// Koneksi ke MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/db_irrigation').then(() => {
  console.log('✅ Terhubung ke MongoDB');
}).catch(err => {
  console.error('❌ Gagal terhubung ke MongoDB:', err);
});

// Endpoint POST Data
app.post('/api/data', async (req, res) => {
  // ... (Isi logika POST kamu tetap sama, tidak berubah) ...
    try {
    const newData = new SensorData({
      kelembaban: req.body.kelembaban,
      flow1: req.body.flow1,
      flow2: req.body.flow2,
      pompa1_status: Boolean(req.body.pompa1_status), // Saran: Gunakan req.body.pompa1_status == 1
      pompa2_status: Boolean(req.body.pompa2_status)
    });
    const savedData = await newData.save();
    console.log('Data berhasil disimpan:', savedData);
    res.status(201).json({ message: 'Data berhasil disimpan'});
  } catch (error) {
    console.error('Gagal menyimpan data:', error.message);
    res.status(400).json({ message: 'Gagal menyimpan data', error: error.message });
  }
});

// Endpoint GET Data
app.get('/sensor-data', async (req, res) => {
   // ... (Isi logika GET kamu tetap sama) ...
   try {
    const { startDate, endDate } = req.query;
    let query = {};
    if (startDate && endDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      query.timestamp = { $gte: start, $lte: end };
    }
    const allData = await SensorData.find(query).sort({ timestamp: -1 });
    res.json(allData);
  } catch (err) {
    res.status(500).json({ message: '❌ Gagal mengambil data', error: err.message });
  }
});

// --- [HAPUS BAGIAN INI] ---
// app.get('/', (req, res) => {
//   res.send('Server IoT berjalan! Kirim data POST ke /api/data.');
// });
// Kenapa dihapus? Karena kalau tidak, saat buka browser yang muncul teks ini, bukan website React.


// --- [BARU 2] Handle React Routing (Catch-All) ---
// Letakkan ini PALING BAWAH sebelum app.listen.
// Fungsinya: Apapun URL yang dibuka user (selain /api/...), kembalikan index.html React
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});


// Menjalankan server
app.listen(PORT, () => {
  console.log(`🚀 Server berjalan di http://localhost:${PORT}`);
});