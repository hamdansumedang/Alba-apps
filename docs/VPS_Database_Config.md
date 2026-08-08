# Konfigurasi Database PostgreSQL di VPS

Detail koneksi PostgreSQL yang berjalan di VPS Anda:

- **Host/IP**: `72.61.210.185`
- **Port**: `33090` (sesuai mapping port Docker)
- **Database Name (`POSTGRES_DB`)**: `alba-apps`
- **Username (`POSTGRES_USER`)**: `superadmin`
- **Password (`POSTGRES_PASSWORD`)**: `B-5millahberkah`

## Docker Compose Setup
```yaml
services:
  postgresql:
    image: postgres:17
    restart: unless-stopped
    ports:
      - "33090:5432" # pastikan mapping port disesuaikan jika diakses dari luar container
    environment:
      - POSTGRES_USER=superadmin
      - POSTGRES_PASSWORD=B-5millahberkah
      - POSTGRES_DB=alba-apps
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

## Arsitektur Penghubung (Tanpa Supabase)
Karena aplikasi menggunakan Frontend (React + Vite) yang berjalan di browser, koneksi langsung dari browser ke PostgreSQL VPS tidak disarankan demi keamanan (Credential Exposure & CORS). Oleh karena itu, kita perlu menyiapkan:
1. **Backend API (Node.js/Express atau NestJS)** yang berjalan di VPS atau server terpisah untuk menerima request dari Frontend.
2. **Driver PostgreSQL (`pg` library)** di dalam Backend API untuk melakukan query ke database `alba-apps`.
