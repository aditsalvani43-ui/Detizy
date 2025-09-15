// public/index.js
document.addEventListener('DOMContentLoaded', () => {
  const isAdult = document.getElementById('isAdult');
  const getIpBtn = document.getElementById('getIpBtn');
  const result = document.getElementById('result');
  const resultText = document.getElementById('resultText');
  const clearBtn = document.getElementById('clearBtn');

  isAdult.addEventListener('change', () => {
    getIpBtn.disabled = !isAdult.checked;
  });

  getIpBtn.addEventListener('click', async () => {
    getIpBtn.disabled = true;
    result.classList.remove('hidden');
    resultText.textContent = 'Mengambil...';

    try {
      // Panggil endpoint serverless yang membaca IP dari request server (bukan dari browser).
      const res = await fetch('/api/get-ip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          consent: true,
          purpose: 'contoh pengujian'
        })
      });

      if (!res.ok) {
        const err = await res.text();
        resultText.textContent = `Gagal: ${res.status} - ${err}`;
      } else {
        const data = await res.json();
        // Jangan menampilkan terlalu banyak detail produksi. Untuk demo, kita tunjukkan IP.
        resultText.textContent = JSON.stringify(data, null, 2);
      }
    } catch (e) {
      resultText.textContent = `Error: ${e.message}`;
    } finally {
      getIpBtn.disabled = false;
    }
  });

  clearBtn.addEventListener('click', () => {
    result.classList.add('hidden');
    resultText.textContent = 'Belum ada aksi.';
  });
});
