const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const SensorData = require('./models/sensor-data');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3010;

// Middleware untuk parsing JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Koneksi ke MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/db_irrigation').then(() => {
  console.log('✅ Terhubung ke MongoDB');
}).catch(err => {
  console.error('❌ Gagal terhubung ke MongoDB:', err);
});


// Endpoint POST untuk menerima data dari STM32
app.post('/api/data', async (req, res) => {
  console.log('📥 Data diterima:', req.body);

  try {
    // Membuat instance baru dari model SensorData dengan data dari body request
    const newData = new SensorData({
      kelembaban: req.body.kelembaban,
      flow1: req.body.flow1,
      flow2: req.body.flow2,
      // Mengonversi nilai 0/1 dari C++ menjadi true/false
      pompa1_status: Boolean(req.body.pompa1_status),
      pompa2_status: Boolean(req.body.pompa2_status)
    });

    // Menyimpan data ke database
    const savedData = await newData.save();
    
    console.log('Data berhasil disimpan:', savedData);

    // Mengirim respons kembali ke perangkat bahwa data berhasil diterima dan disimpan
    res.status(201).json({ message: 'Data berhasil disimpan'});

  } catch (error) {
    console.error('Gagal menyimpan data:', error.message);
    // Jika terjadi error, kirim respons error
    res.status(400).json({ message: 'Gagal menyimpan data', error: error.message });
  }
});

// Endpoint GET untuk mengambil semua data sensor
// Endpoint GET dengan Filter Tanggal
app.get('/sensor-data', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    let query = {};

    // Jika ada parameter tanggal dari Frontend, kita filter query-nya
    if (startDate && endDate) {
      // Set waktu dari awal hari (00:00) sampai akhir hari (23:59)
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);

      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);

      query.timestamp = {
        $gte: start, // Greater Than or Equal (>=)
        $lte: end    // Less Than or Equal (<=)
      };
    }

    // Ambil data sesuai query, urutkan dari yang terbaru
    const allData = await SensorData.find(query).sort({ timestamp: -1 });
    res.json(allData);

  } catch (err) {
    res.status(500).json({ message: '❌ Gagal mengambil data', error: err.message });
  }
});

app.get('/', (req, res) => {
  res.send('🎉 Server IoT berjalan! Kirim data POST ke /api/data.');
});

// Menjalankan server
app.listen(PORT, () => {
  console.log(`🚀 Server berjalan di http://localhost:${PORT}`);
});
