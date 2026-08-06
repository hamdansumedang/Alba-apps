# Database Schema - ALBA-APPS

**Database**: PostgreSQL (Supabase)

---

## Tabel: users

```sql
id uuid PRIMARY KEY DEFAULT gen_random_uuid()
name text NOT NULL
email text UNIQUE NOT NULL
role text CHECK (role IN ('admin','staff')) DEFAULT 'staff'
unit_id uuid REFERENCES units(id)
created_at timestamptz DEFAULT now()
```

---

## Tabel: units

```sql
id uuid PRIMARY KEY DEFAULT gen_random_uuid()
name text NOT NULL          -- Kantor Keuangan, Kantin, Koperasi
code text UNIQUE NOT NULL   -- KANTOR, KANTIN, KOPERASI
created_at timestamptz DEFAULT now()
```

---

## Tabel: categories

```sql
id uuid PRIMARY KEY DEFAULT gen_random_uuid()
name text NOT NULL
type text CHECK (type IN ('income','expense'))
code text
created_at timestamptz DEFAULT now()
```

---

## Tabel: payment_methods

```sql
id uuid PRIMARY KEY DEFAULT gen_random_uuid()
name text NOT NULL
code text UNIQUE
created_at timestamptz DEFAULT now()
```

---

## Tabel: transactions (Paling Penting)

```sql
id uuid PRIMARY KEY DEFAULT gen_random_uuid()
transaction_date date NOT NULL
user_id uuid REFERENCES users(id) NOT NULL
unit_id uuid REFERENCES units(id) NOT NULL
category_id uuid REFERENCES categories(id) NOT NULL
payment_method_id uuid REFERENCES payment_methods(id)
amount numeric(15,2) NOT NULL
type text CHECK (type IN ('debit','credit')) NOT NULL
description text
photo_url text
running_balance numeric(15,2)
created_at timestamptz DEFAULT now()
updated_at timestamptz DEFAULT now()
```

---

## Index yang Direkomendasikan

```sql
CREATE INDEX idx_transactions_date ON transactions(transaction_date);
CREATE INDEX idx_transactions_unit ON transactions(unit_id);
CREATE INDEX idx_transactions_category ON transactions(category_id);
```

---

## Seed Data Awal (contoh)

**units**:
- Kantor Keuangan
- Kantin
- Koperasi

**payment_methods**:
- Transfer (TF)
- Tunai

**categories** (contoh):
- Perlunasan Kampus
- HER Bulan Juli
- Operasional Kantin
- dll.