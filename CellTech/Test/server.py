import http.server
import socketserver

PORT = 5000
HOST = "0.0.0.0"

class Handler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, format, *args):
        print(format % args)

with socketserver.TCPServer((HOST, PORT), Handler) as httpd:
    print(f"Serving on {HOST}:{PORT}")
    httpd.serve_forever()
