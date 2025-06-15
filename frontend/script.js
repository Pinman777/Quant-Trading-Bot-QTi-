// Проверка соединения с бэкендом
fetch('http://localhost:8001/api/health')
    .then(response => response.json())
    .then(data => {
        document.getElementById('status').textContent = 'Соединение с сервером установлено!';
        document.getElementById('status').classList.add('success');
    })
    .catch(error => {
        document.getElementById('status').textContent = 'Ошибка соединения с сервером';
        document.getElementById('status').style.backgroundColor = '#f8d7da';
        document.getElementById('status').style.color = '#721c24';
    }); 