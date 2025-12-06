const axios = require('axios');
const { MongoClient } = require('mongodb');

// Konfigurasi MongoDB
const mongoUri = 'mongodb://localhost:2000'; // Ganti dengan URL MongoDB kamu
const dbName = 'sensorData'; // Nama database
const collectionName = 'humidityData'; // Nama koleksi

// URL ESP32 (Ganti dengan IP ESP32 kamu)
const esp32Url = 'http://192.168.4.1/data'; // Ganti dengan IP dan endpoint ESP32

// Fungsi untuk menyimpan data ke MongoDB
async function saveToMongoDB(humidity) {
  const client = new MongoClient(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db(dbName);
    const collection = db.collection(collectionName);

    const data = {
      humidity: humidity,
      timestamp: new Date()
    };

    const result = await collection.insertOne(data);
    console.log('Data saved to MongoDB:', result);
  } catch (error) {
    console.error('Error saving data to MongoDB:', error);
  } finally {
    await client.close();
  }
}

// Fungsi untuk mengambil data kelembaban dari ESP32 dan menyimpannya ke MongoDB
async function fetchAndStoreHumidity() {
  try {
    const response = await axios.get(esp32Url);
    
    if (response.data) {
      console.log('Received Data:', response.data);
      const humidity = parseFloat(response.data.match(/Humidity: (\d+\.\d+)/)[1]); // Ambil kelembaban dari response
      console.log('Humidity Value:', humidity);

      // Simpan ke MongoDB
      await saveToMongoDB(humidity);
    } else {
      console.log('No data received from ESP32');
    }
  } catch (error) {
    console.error('Error fetching data from ESP32:', error);
  }
}

// Ambil data setiap 10 detik (10000ms)
setInterval(fetchAndStoreHumidity, 10000);
