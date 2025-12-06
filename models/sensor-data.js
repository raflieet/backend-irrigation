const mongoose = require('mongoose');

const sensorDataSchema = new mongoose.Schema({
  kelembaban: { type: Number, required: true },
  flow1: { type: Number, required: true },
  flow2: { type: Number, required: true },
  pompa1_status: { type: Boolean, required: true },
  pompa2_status: { type: Boolean, required: true },
  timestamp: { type: Date, default: Date.now } // Tambahan: Otomatis mencatat waktu data diterima
});

module.exports = mongoose.model('SensorData', sensorDataSchema);

// database ke 
