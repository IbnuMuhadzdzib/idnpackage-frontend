import './App.css'
import { useState, useEffect } from 'react'

function App() {

      useEffect(() => {
            document.title = "Admin - IDN Paketku";
        }, []);

  const [message, setMessage] = useState('Loading...');

  useEffect(() => {
    // Gunakan satu endpoint saja untuk mengetes
    fetch('http://localhost:8080/packages')
      .then((response) => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json(); // Gunakan .json() jika API mengembalikan data JSON
      })
      .then((data) => {
        // Mengubah objek menjadi string agar bisa ditampilkan di layar
        setMessage(JSON.stringify(data));
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
        setMessage('Gagal terhubung ke backend: ' + error.message);
      });
  }, []);

  return (
    <div>
      <h2>Koneksi React & NestJS</h2>
      <p>Pesan dari Backend: {message}</p>
    </div>
  )
}

export default App
