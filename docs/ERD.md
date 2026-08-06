# ERD - ALBA-APPS (Entity Relationship Diagram)

**Format**: Mermaid (bisa copy ke https://mermaid.live)

```mermaid
erDiagram
    USERS ||--o{ TRANSACTIONS : "input"
    UNITS ||--o{ TRANSACTIONS : "milik"
    CATEGORIES ||--o{ TRANSACTIONS : "punya"
    PAYMENT_METHODS ||--o{ TRANSACTIONS : "gunakan"

    USERS {
        uuid id PK
        string name
        string email
        string role
        uuid unit_id FK
        timestamp created_at
    }

    UNITS {
        uuid id PK
        string name
        string code
    }

    CATEGORIES {
        uuid id PK
        string name
        string type
        string code
    }

    PAYMENT_METHODS {
        uuid id PK
        string name
        string code
    }

    TRANSACTIONS {
        uuid id PK
        date transaction_date
        uuid user_id FK
        uuid unit_id FK
        uuid category_id FK
        uuid payment_method_id FK
        decimal amount
        string type
        string description
        string photo_url
        decimal running_balance
        timestamp created_at
        timestamp updated_at
    }
```

---

## Ringkasan Tabel Utama

| Tabel | Fungsi Utama | Relasi |
|-------|--------------|--------|
| `users` | Login + Role | 1 user → banyak transaksi |
| `units` | Kantor, Kantin, Koperasi | 1 unit → banyak transaksi |
| `categories` | Jenis pengeluaran/pemasukan | 1 kategori → banyak transaksi |
| `payment_methods` | TF, Tunai, dll | 1 metode → banyak transaksi |
| `transactions` | Data inti buku besar | Core table |

---

## Catatan Penting
- `running_balance` dihitung otomatis setelah setiap transaksi
- `photo_url` menyimpan link foto bukti (Supabase Storage)
- Semua tabel pakai `uuid` sebagai primary key
- Soft delete disarankan untuk transaksi (bukan hard delete)