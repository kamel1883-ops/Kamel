# خزنة بيانات جدارة السعودية (Saudi Data Vault)

تطبيق مستقل يُستضاف على سيرفر داخل المملكة العربية السعودية، يخزّن **كل البيانات الحساسة** (الهويات، الإقامات، الجوازات، الحسابات البنكية، الرواتب، البدلات، التأمينات، والمستندات المُولّدة) مشفّرةً داخل المملكة، ولا يُرسل أي قيمة حساسة إلى Base44 — فقط رموز معتمة (opaque refs).

الهدف: الامتثال لمتطلبات سدايا (SDAYA) وهيئة الأمن السيبراني (NCA) في سيادة البيانات.

---

## البنية الأمنية

- **التشفير عند السكون:** AES-256-GCM لكل حقل حساس في PostgreSQL.
- **التشفير أثناء النقل:** TLS إلزامي عبر reverse proxy (Nginx/Caddy) — لا يُكشف المنفذ مباشرة.
- **المصادقة:** مفتاح API مشترك (`X-Vault-Key`) بين Base44 والخزنة، ولا يُكشف للعملاء.
- **عزل المستأجر:** كل استعلام مُقيّد بـ `tenant_id` من ترويسة الطلب.
- **روابط المستندات:** JWT قصير العمر (5 دقائق) — لا يحتاج مفتاح API، يُفتح في المتصفح.
- **عدم تسجيل الحمولة:** سجلات الخادم لا تحوي أي قيمة حساسة، فقط المسار والطريقة.

---

## الـdeploy على سيرفرك السعودي

### 1) المتطلبات
- Docker + Docker Compose
- نطاق سعودي (مثلاً `vault.jadara.sa`) موجه لسيرفرك
- شهادة TLS (Let's Encrypt مجانية عبر Caddy أو Certbot)

### 2) التجهيز
```bash
git clone <repo-url> saudi-vault
cd saudi-vault
cp .env.example .env
```

املأ `.env`:
```bash
# ولّد مفتاح التشفير (32 بايت hex)
openssl rand -hex 32   # → VAULT_ENCRYPTION_KEY

# ولّد مفتاح API مشترك
openssl rand -hex 32   # → VAULT_API_KEY (انسخه أيضاً إلى Base44 Secrets)

# كلمة مرور قاعدة البيانات
echo "PGPASSWORD=$(openssl rand -hex 16)"
```

### 3) التشغيل
```bash
docker compose up -d --build
# التهجير يتم تلقائياً داخل الحاوية
docker compose logs -f vault
```

### 4) reverse proxy مع TLS (مثال Nginx)
```nginx
server {
    listen 443 ssl http2;
    server_name vault.jadara.sa;

    ssl_certificate     /etc/letsencrypt/live/vault.jadara.sa/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/vault.jadara.sa/privkey.pem;

    # إلزامي: أرشِد فقط IP من داخل المملكة إن لزم (اختياري)
    location / {
        proxy_pass http://127.0.0.1:4000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto https;
        client_max_body_size 30m;
    }
}
```

### 5) فحص الصحة
```bash
curl https://vault.jadara.sa/health
# → {"status":"ok"}
```

---

## واجهة API

كل المسارات تحت `/api/vault/` وتتطلب `X-Vault-Key` و `X-Tenant-Id` إلا التنزيل (رمز JWT).

| الطريقة | المسار | الوصف |
|---|---|---|
| POST | `/employees` | تخزين بيانات موظف حساسة → `emp_ref` |
| POST | `/employees/bulk` | تخزين جماعي (استيراد) |
| GET | `/employees/:empRef` | استرجاع القيم الحساسة المفكوكة |
| PUT | `/employees/:empRef` | تحديث |
| DELETE | `/employees/:empRef` | حذف |
| POST | `/payroll` | تخزين قيم مالية → `payroll_ref` |
| GET | `/payroll/:payrollRef` | استرجاع قيم مالية |
| POST | `/documents` | رفع مستند (multipart) → `doc_ref` |
| POST | `/documents/:docRef/link` | توليد رابط تنزيل مؤقت |
| GET | `/documents/download/:token` | تنزيل عام بالرمز المؤقت |

### مثال (تخزين موظف)
```bash
curl -X POST https://vault.jadara.sa/api/vault/employees \
  -H "X-Vault-Key: $VAULT_API_KEY" \
  -H "X-Tenant-Id: tenant_123" \
  -H "Content-Type: application/json" \
  -d '{"full_name":"محمد","national_id":"1098765432","bank_account":"SA12345"}'
# → {"emp_ref":"emp_a1b2c3..."}
```

---

## ملاحظات
- مفتاح `VAULT_API_KEY` نفسه يُضبط في Base44 كـ secret ليستخدمه الـvaultProxy.
- مفتاح `VAULT_ENCRYPTION_KEY` يبقى **هنا فقط** — لا يُرسل إلى Base44 إطلاقاً.
- النسخ الاحتياطي: اعمل `pg_dump` دورياً وارفع النسخة لمخزن مشفّر داخل المملكة.