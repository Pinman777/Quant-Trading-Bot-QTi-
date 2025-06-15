from http.server import HTTPServer, SimpleHTTPRequestHandler
import webbrowser
import threading
import time

class CORSRequestHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        # Добавляем заголовки CORS и CSP
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'X-Requested-With, Content-type')
        self.send_header('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; connect-src 'self' http://localhost:8001")
        super().end_headers()

def open_browser():
    time.sleep(1)  # Ждем запуска сервера
    webbrowser.open('http://localhost:3000')

def run_server():
    server_address = ('', 3000)
    httpd = HTTPServer(server_address, CORSRequestHandler)
    print("Фронтенд запущен на http://localhost:3000")
    httpd.serve_forever()

if __name__ == '__main__':
    # Запускаем браузер в отдельном потоке
    threading.Thread(target=open_browser).start()
    # Запускаем сервер
    run_server() 