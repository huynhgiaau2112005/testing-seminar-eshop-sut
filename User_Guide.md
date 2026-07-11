# EShop Database Testing Lab Manual

> Mục tiêu: sau khi hoàn thành, một nhóm khác có thể tự cài môi trường, reset/seed EShop, chạy **đúng 5 SQL invariant tests** (có cả PASS và FAIL), chạy và kiểm chứng migration/rollback mô phỏng, mask `users.email`/`users.phone`, rồi smoke-test lại database và API mà không cần người viết hướng dẫn trực tiếp.

> Phạm vi an toàn: toàn bộ lệnh tác động dữ liệu trong tài liệu chỉ dùng cho **SQLite local** `backend/database.sqlite`. `reset-db` xóa database local hiện có. Không dùng các lệnh này với dữ liệu thật/production.

## 1. Bản đồ lab

```mermaid
flowchart LR
    A[Cài Node.js, SQLite CLI, Flyway] --> B[npm ci]
    B --> C[Reset + seed database.sqlite]
    C --> D[5 SQL invariants: PASS]
    D --> E[Cố ý sửa price: FAIL]
    E --> C
    C --> F[Flyway target=1: áp dụng V1]
    F --> G[Kiểm tra schema V1]
    G --> H[Flyway migrate: áp dụng V2 bù trừ]
    H --> I[Mask email + phone]
    I --> J[Verify masking + 5 invariants]
    J --> K[Functional API smoke tests]
```

*Hình 1 — Chuỗi thao tác của lab. Các nút quay về Reset là chủ đích: dữ liệu phải luôn xác định trước mỗi phần kiểm thử.*

## 2. Điều kiện đầu vào và cài công cụ từ đầu

| Công cụ | Dùng để làm gì | Kiểm tra sau khi cài |
| --- | --- | --- |
| Git | lấy mã nguồn | `git --version` |
| Node.js LTS **>= 20.19** và npm >= 10 | backend, Faker, frontend | `node --version` và `npm --version` |
| SQLite CLI 3 | chạy SQL, xem schema | `sqlite3 --version` |
| Flyway CLI | chạy migration | `flyway -v` |
| `curl` | functional smoke test API | `curl --version` |

### 2.1 Cài đặt

1. Cài **Node.js LTS** từ [trang Download chính thức của Node.js](https://nodejs.org/en/download). Máy lab hiện dùng Node 22.17; dùng Node **20.19+** (hoặc Node 22 LTS) vì `@faker-js/faker@10.5.0` trong `package-lock.json` khai báo engine Node từ 20.19. `README` cũ ghi >=18, nhưng mức đó không đủ để bảo đảm chạy được masking hiện tại.
2. Cài SQLite CLI. macOS có thể dùng Homebrew: `brew install sqlite`; Ubuntu/Debian: `sudo apt install sqlite3`. Trên Windows, tải **sqlite-tools** từ [trang tải chính thức SQLite](https://www.sqlite.org/download.html), giải nén và thêm thư mục chứa `sqlite3.exe` vào `PATH`.
3. Cài Flyway CLI theo [hướng dẫn cài đặt chính thức](https://documentation.red-gate.com/flyway/reference/usage/command-line): tải gói CLI cho hệ điều hành, giải nén và thêm thư mục chứa `flyway`/`flyway.cmd` vào `PATH`. Trên macOS có Homebrew, `brew install flyway` là lựa chọn tiện dụng.
4. Kiểm tra lại tất cả các lệnh trong cột thứ ba ở bảng trên. Nếu lệnh nào báo `command not found`, đóng/mở lại terminal sau khi cập nhật `PATH`.

### 2.2 Lấy mã nguồn và cài dependencies

Thay `<repo-url>` bằng URL repository được nhóm cung cấp. Nếu đã mở đúng thư mục dự án, bỏ qua hai lệnh `git`/`cd` đầu.

```bash
git clone <repo-url> eshop-sut
cd eshop-sut
npm ci
cd backend
npm ci
```

`npm ci` dùng đúng phiên bản đã khóa trong `package-lock.json`. Lệnh ở thư mục gốc rất quan trọng vì package `@faker-js/faker`, được script masking sử dụng, được khai báo tại `package.json` gốc.

Kiểm tra cấu hình migration trước khi làm tiếp:

```bash
cat flyway.conf
flyway -configFiles=flyway.conf info
```

Bạn đang ở `backend/` từ bước cài dependency. Kết quả phải chỉ tới `jdbc:sqlite:database.sqlite` và location `filesystem:migration`. Flyway đọc đường dẫn tương đối theo **thư mục hiện tại**, vì vậy mọi lệnh Flyway trong tài liệu này đều phải chạy tại `backend/`.

## 3. Reset và seed database EShop

Tại `backend/`, dừng server Node nếu đang chạy (nhấn `Ctrl+C` ở terminal chạy server), sau đó:

```bash
npm run reset-db
sqlite3 database.sqlite "SELECT 'users' AS table_name, COUNT(*) AS rows FROM users
UNION ALL SELECT 'products', COUNT(*) FROM products
UNION ALL SELECT 'orders', COUNT(*) FROM orders
UNION ALL SELECT 'coupons', COUNT(*) FROM coupons;"
```

Kết quả mong đợi sau seed hiện tại:

```text
users|2
products|18
orders|10
coupons|4
```

Tài khoản seed thực tế là:

| Vai trò | Email | Mật khẩu |
| --- | --- | --- |
| Admin | `admin@eshop.com` | `Admin123!` |
| User | `test@eshop.com` | `Test1234!` |

> Lưu ý: `setup_guide.md` ghi `admin123` cho admin, nhưng dữ liệu nguồn [`backend/seed-data.json`](backend/seed-data.json) ghi `Admin123!`. Trong lab phải tin dữ liệu seed.

**Ảnh minh họa terminal — reset thành công**

```text
$ npm run reset-db
Removed existing database file: .../backend/database.sqlite
Connected to database
Database initialized and seeded from seed-data.json.
Database reset and seeded from seed-data.json.

$ sqlite3 database.sqlite "SELECT COUNT(*) FROM products;"
18
```

## 4. Chạy đủ 5 SQL invariant tests

**Invariant** là điều phải luôn đúng với database. Một query trả `PASS` khi số bản ghi vi phạm là `0`; không dùng việc “query không lỗi” làm bằng chứng dữ liệu đúng.

Chạy nguyên khối sau tại `backend/`. Đây là **5 test** độc lập, mỗi dòng kết quả tương ứng một invariant.

```bash
sqlite3 -header -box database.sqlite <<'SQL'
SELECT
  'INV-01: product price is positive' AS test,
  CASE WHEN COUNT(*) = 0 THEN 'PASS' ELSE 'FAIL' END AS status,
  COUNT(*) AS violating_rows
FROM products
WHERE price IS NULL OR price <= 0;

SELECT
  'INV-02: product has existing category' AS test,
  CASE WHEN COUNT(*) = 0 THEN 'PASS' ELSE 'FAIL' END AS status,
  COUNT(*) AS violating_rows
FROM products p
LEFT JOIN categories c ON c.id = p.category_id
WHERE p.category_id IS NULL OR c.id IS NULL;

SELECT
  'INV-03: order has existing user' AS test,
  CASE WHEN COUNT(*) = 0 THEN 'PASS' ELSE 'FAIL' END AS status,
  COUNT(*) AS violating_rows
FROM orders o
LEFT JOIN users u ON u.id = o.user_id
WHERE o.user_id IS NULL OR u.id IS NULL;

SELECT
  'INV-04: coupon usage has coupon and user' AS test,
  CASE WHEN COUNT(*) = 0 THEN 'PASS' ELSE 'FAIL' END AS status,
  COUNT(*) AS violating_rows
FROM coupon_usage cu
LEFT JOIN coupons c ON c.id = cu.coupon_id
LEFT JOIN users u ON u.id = cu.user_id
WHERE cu.coupon_id IS NULL OR c.id IS NULL OR cu.user_id IS NULL OR u.id IS NULL;

WITH invalid_email AS (
  SELECT COUNT(*) AS n
  FROM users
  WHERE email IS NULL OR TRIM(email) = '' OR email NOT LIKE '%_@_%._%'
), duplicate_email AS (
  SELECT COUNT(*) AS n
  FROM (SELECT email FROM users GROUP BY email HAVING COUNT(*) > 1)
)
SELECT
  'INV-05: user email is present, shaped, unique' AS test,
  CASE WHEN (SELECT n FROM invalid_email) + (SELECT n FROM duplicate_email) = 0
       THEN 'PASS' ELSE 'FAIL' END AS status,
  (SELECT n FROM invalid_email) + (SELECT n FROM duplicate_email) AS violating_rows;
SQL
```

Kết quả mong đợi ngay sau reset là 5 dòng `PASS` và `violating_rows` đều bằng `0`.

| ID | Điều mà test phát hiện | Vì sao cần test ở mức DB |
| --- | --- | --- |
| INV-01 | giá sản phẩm rỗng/không dương | UI validation có thể bị bỏ qua khi gọi API trực tiếp |
| INV-02 | product mồ côi category | schema hiện không khai báo foreign key cho quan hệ này |
| INV-03 | order mồ côi user | bảo vệ báo cáo/lịch sử đơn hàng |
| INV-04 | coupon usage tham chiếu dữ liệu không tồn tại | bảo vệ tính đúng đắn của giới hạn coupon |
| INV-05 | email rỗng, sai dạng đơn giản hoặc trùng | `users.email` hiện không có `UNIQUE`/`NOT NULL` trong schema |

### 4.1 Bắt buộc quan sát một test FAIL

Không đủ để chỉ có test xanh. Cố ý làm hỏng dữ liệu test, chạy lại test INV-01, rồi reset để khôi phục:

```bash
sqlite3 database.sqlite "UPDATE products SET price = 0 WHERE id = 1;"
sqlite3 -header -box database.sqlite "
  SELECT 'INV-01: product price is positive' AS test,
         CASE WHEN COUNT(*) = 0 THEN 'PASS' ELSE 'FAIL' END AS status,
         COUNT(*) AS violating_rows
  FROM products
  WHERE price IS NULL OR price <= 0;"
```

**Ảnh minh họa terminal — bằng chứng test phát hiện lỗi**

```text
┌─────────────────────────────────────┬────────┬────────────────┐
│ test                                │ status │ violating_rows │
├─────────────────────────────────────┼────────┼────────────────┤
│ INV-01: product price is positive   │ FAIL   │ 1              │
└─────────────────────────────────────┴────────┴────────────────┘
```

Khôi phục **ngay** bằng reset (đồng thời xóa luôn lịch sử Flyway của file SQLite vừa reset):

```bash
npm run reset-db
```

Chạy lại khối 5 test ở phần 4; cả 5 phải trở về `PASS` trước khi làm migration.

## 5. Chạy migration và mô phỏng rollback có kiểm chứng

### 5.1 Hiểu migration của repository này

- `V1__standardize_schema_column_names_and_add_audit_log.sql` đổi tên nhiều cột, thêm bảng `audit_logs` và 5 index.
- `V2__rollback_standardize_schema_column_names_and_drop_audit_log.sql.sql` là **forward/compensating migration**: nó xóa phần thêm ở V1 và đổi tên cột trở lại như schema ban đầu.
- Tên file V2 có hậu tố `.sql.sql` trong repository. Flyway hiện vẫn nhận diện nó; **không tự đổi tên file đã được áp dụng**, vì metadata/description trong `flyway_schema_history` có thể không còn khớp. Nếu cần sửa tên, lập kế hoạch migration mới hoặc dùng quy trình `repair` được review, không làm giữa lab.

Vì V1 đổi `phone` thành `phone_number`, `imageUrl` thành `image_url`, ... nên backend hiện tại (vẫn query tên cột cũ) không tương thích với schema ở version 1. Chỉ khởi động backend **sau khi V2 hoàn tất**.

### 5.2 Áp dụng V1 và kiểm tra trạng thái thay đổi

Sau reset ở phần 4, database là schema cũ và chưa có Flyway history. Áp dụng đến version 1, không đi tiếp V2:

```bash
flyway -configFiles=flyway.conf -target=1 migrate
flyway -configFiles=flyway.conf info
sqlite3 database.sqlite ".schema users"
sqlite3 database.sqlite ".schema products"
sqlite3 database.sqlite ".tables audit_logs"
```

Kết quả cần ghi nhận:

| Kiểm tra | Dấu hiệu V1 đã chạy |
| --- | --- |
| `info` | baseline `0` và version `1` có state `Success`; V2 còn `Pending` |
| `.schema users` | có `phone_number`, không còn `phone` |
| `.schema products` | có `image_url`, không còn `imageUrl` |
| `.tables audit_logs` | hiển thị `audit_logs` |

`-target=1` bảo Flyway chỉ chạy các versioned migration tới và gồm version 1; đây là cách quan sát V1 trước khi V2 được chạy. Theo tài liệu Flyway, `migrate` bình thường áp dụng migration pending theo thứ tự và `target` giới hạn version đích.

### 5.3 Mô phỏng rollback bằng V2 và kiểm chứng schema

Chạy migration bình thường để V2 được áp dụng như một migration tiến mới:

```bash
flyway -configFiles=flyway.conf migrate
flyway -configFiles=flyway.conf validate
flyway -configFiles=flyway.conf info
sqlite3 database.sqlite ".schema users"
sqlite3 database.sqlite ".schema products"
sqlite3 database.sqlite ".tables audit_logs"
sqlite3 database.sqlite "SELECT version, description, success FROM flyway_schema_history ORDER BY installed_rank;"
```

**Tiêu chí pass cho rollback mô phỏng:**

- `phone` và `imageUrl` xuất hiện lại trong schema; `phone_number`/`image_url` không còn.
- `.tables audit_logs` không in ra `audit_logs`.
- `validate` kết thúc thành công và `info` cho version `2` là `Success`.
- `flyway_schema_history` giữ audit trail baseline 0, V1 và V2; không xóa lịch sử V1.

```text
Trước V2: users.phone_number + products.image_url + audit_logs
Sau  V2: users.phone        + products.imageUrl  + (không audit_logs)
```

Đây là **mô phỏng rollback**, không phải `flyway undo`. `flyway undo` là tính năng Flyway Teams, còn dự án đang dùng Flyway OSS; vì vậy V2 là cách an toàn, truy vết được để trả schema về tương thích với backend. Khi migration có thao tác phá hủy dữ liệu, phải có backup/restore đã thử nghiệm; migration bù trừ không tự khôi phục dữ liệu đã bị xóa.

## 6. Mask `users.email` và `users.phone`, rồi kiểm tra dữ liệu

Chỉ thực hiện phần này khi V2 đã hoàn tất, vì script masking đang query cột `phone` gốc. Trong phần kiểm tra database này, giữ backend Node đang dừng để tránh một restart bất ngờ làm seed lại database, rồi chạy:

```bash
npm run mask-data
node verify_masking.js
sqlite3 -header -box database.sqlite "SELECT id, name, email, phone FROM users ORDER BY id;"
```

Ví dụ đầu ra (chuỗi Faker là ngẫu nhiên nên không cần trùng y hệt):

```text
===== BEFORE =====
[1] admin@eshop.com | (null)
[2] test@eshop.com | (null)

===== AFTER =====
[1] user1_aB39xQ@faker.test | 0912345678
[2] user2_k8LmN2@faker.test | 0987654321

Data masking completed successfully.

========== VERIFY ==========
Total users: 2
Null email: PASS
Null phone: PASS
Duplicate email: PASS
Masked email: PASS
```

Script chạy `BEGIN TRANSACTION` và `COMMIT`; nếu một update lỗi, nhánh lỗi gọi `ROLLBACK`. Nó chỉ thay `email` và `phone`, không thay `id`, `role`, `password`, orders hay coupon usage.

Tiếp tục chạy lại **khối 5 SQL invariant tests ở phần 4**. Mọi test phải `PASS`; INV-05 vẫn đúng vì địa chỉ mới có hậu tố `@faker.test` và là duy nhất. Kiểm tra database-level bổ sung cho masking:

```bash
sqlite3 -header -box database.sqlite "
SELECT
  COUNT(*) AS total_users,
  SUM(email LIKE '%@faker.test') AS masked_emails,
  SUM(phone GLOB '09[0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9]') AS valid_masked_phones
FROM users;"
```

Kết quả mong đợi: `total_users = masked_emails = valid_masked_phones = 2`.

> Masking là không đảo ngược được trong lab này: reset/seed là cách quay về email gốc. Không commit `database.sqlite` đã mask nếu nó chứa dữ liệu ngoài dữ liệu mẫu.

## 7. Chạy lại functional và database tests sau masking

Repository chưa có automated test runner: `backend/package.json` đặt `npm test` thành lệnh báo lỗi “no test specified”. Vì vậy lab dùng (1) 5 database invariants ở phần 4 và (2) functional API smoke test bên dưới. Đây là giới hạn hiện tại cần ghi rõ, không được báo cáo nhầm là một Jest/Mocha suite đã chạy.

### 7.1 Khởi động backend

Mở terminal A tại `backend/`:

```bash
npm run dev
```

Chờ dòng `Server is running on http://localhost:3000` (hoặc thông báo server tương đương). Do `server.js` import `database.js`, database sẽ được tạo lại/seed mỗi lần khởi động server. Điều đó làm mất masking đã kiểm tra ở phần 6. Vì functional test bên dưới phải quan sát PII đã mask, **không restart Terminal A nữa** và mở Terminal B tại `backend/` để mask lại ngay:

```bash
npm run mask-data
node verify_masking.js
```

Kết quả phải có 4 dòng `PASS`. SQLite cho phép process server mở kết nối khi không có transaction; nếu hiếm khi gặp `SQLITE_BUSY`, dừng server, khởi động lại, rồi lặp ngay hai lệnh trên trước khi test API.

### 7.2 Functional smoke test dùng user đã mask

Mở terminal B tại `backend/`. Không dùng `test@eshop.com` nữa: email đó đã bị thay. Lấy email của user id 2, login bằng mật khẩu seed không đổi, rồi gọi API:

```bash
USER_EMAIL="$(sqlite3 database.sqlite 'SELECT email FROM users WHERE id = 2;')"
TOKEN="$(curl -sS -X POST http://localhost:3000/api/login \
  -H 'Content-Type: application/json' \
  -d "{\"email\":\"$USER_EMAIL\",\"password\":\"Test1234!\"}" \
  | node -pe "JSON.parse(require('fs').readFileSync(0, 'utf8')).token")"

curl -i http://localhost:3000/api/cart
curl -sS -H "Authorization: Bearer $TOKEN" http://localhost:3000/api/users/me
curl -sS http://localhost:3000/api/products
```

| Request | Kết quả mong đợi | Bằng chứng chức năng |
| --- | --- | --- |
| `GET /api/cart` không token | `HTTP/1.1 401` | endpoint bảo vệ route |
| `GET /api/users/me` có token | JSON user id 2, `email` kết thúc `@faker.test`, `phone` 10 số bắt đầu `09` | login vẫn hoạt động với PII đã mask |
| `GET /api/products` | JSON mảng 18 products | read API vẫn hoạt động sau V2/masking |

Sau smoke test, chạy lại khối 5 SQL invariants một lần cuối và lưu terminal output vào báo cáo lab. Điều kiện hoàn thành: **5 PASS + verify_masking 4 PASS + API profile trả PII đã mask**.

## 8. AI đã được dùng ở đâu?

AI không được gọi ở runtime khi chạy EShop. Dấu vết trong code là dòng tiêu đề `ChatGPT-assisted Data Masking` của [`backend/mask_sensitive_data_faker.js`](backend/mask_sensitive_data_faker.js); AI được dùng để hỗ trợ **thiết kế/viết** script masking. Khi chạy thực tế, script dùng thư viện cục bộ `@faker-js/faker` để sinh email/phone giả và SQLite transaction để cập nhật. Không có OpenAI API key, HTTP request tới mô hình, prompt hay quyết định AI nào trong luồng chạy.

| Bước | AI có tham gia runtime? | Cơ chế thực tế |
| --- | --- | --- |
| Reset/seed, 5 SQL tests | Không | Node.js, JSON seed, SQLite CLI |
| Flyway V1/V2 | Không | Flyway CLI thực thi SQL versioned |
| Mask dữ liệu | Không | JavaScript + Faker + transaction SQLite; script được AI hỗ trợ soạn trước |
| Verify/API smoke | Không | SQLite CLI và `curl` |

Điều này quan trọng cho khả năng tái lập: kết quả cấu trúc/điều kiện PASS-FAIL không phụ thuộc vào mô hình AI; chỉ giá trị email/phone giả cụ thể là ngẫu nhiên.

## 9. Failure modes và cách xử lý lỗi phổ biến

| Failure mode / dấu hiệu | Nguyên nhân trong repo | Cách xác nhận và khắc phục |
| --- | --- | --- |
| Backend trả `no such column: phone`, `imageUrl`, `total_amount` sau migration | chỉ chạy V1 nên DB và `server.js` không cùng schema | dừng server, chạy `flyway -configFiles=flyway.conf migrate` để chạy V2; kiểm tra `.schema users` có `phone` trước khi restart |
| `flyway ...` báo không tìm thấy migration hoặc tạo nhầm DB | chạy lệnh ngoài `backend/`, nên đường dẫn tương đối trong `flyway.conf` sai | `pwd` phải kết thúc `/backend`; dùng đúng `-configFiles=flyway.conf`; chạy `flyway ... info` để xem JDBC URL |
| `Validate failed` sau khi đổi tên/chỉnh sửa V1/V2 | Flyway lưu checksum và description của migration đã áp dụng | khôi phục file migration từ version control. Không sửa history bằng tay; với DB disposable, `npm run reset-db` rồi chạy migration lại. Với DB quan trọng, backup + review `flyway repair` theo [tài liệu Repair](https://documentation.red-gate.com/flyway/reference/commands/repair) |
| `SQLITE_BUSY: database is locked` khi mask/reset | server, SQLite shell hoặc process khác đang giữ file | dừng `npm run dev`, đóng `sqlite3` interactive shell, chạy lại một tiến trình thao tác DB; không reset/mask song song |
| `Cannot find module '@faker-js/faker'` | chưa chạy `npm ci` ở root | từ root chạy `npm ci`, sau đó trở lại `backend` chạy `npm run mask-data` |
| Login bằng `test@eshop.com` trả 401 sau masking | email seed đã bị thay có chủ ý | lấy email mới bằng `sqlite3 database.sqlite 'SELECT email FROM users WHERE id=2;'`; mật khẩu vẫn là `Test1234!` |
| Profile không còn masked sau khi restart backend | `server.js` import `database.js`, script này drop/create/seed các bảng mỗi lần process khởi động | không restart backend giữa mask và API verification; nếu đã restart, mask lại rồi test ngay |
| V2 không được áp dụng khi chạy `migrate` | database còn đang bị target override bởi command/config hoặc V2 bị lỗi | chạy `flyway -configFiles=flyway.conf info`, rồi chạy lại không có `-target=1`; xem output và `validate` |

Ba failure modes tối thiểu cần trình bày trong báo cáo là: schema mismatch sau V1, SQLite lock khi thao tác đồng thời, và login seed thất bại sau masking. Bảng trên cung cấp thêm các trường hợp thường gặp để tái lập/khắc phục.

## 10. Checklist bàn giao

- [ ] Đã kiểm tra phiên bản Git/Node/npm/sqlite3/Flyway.
- [ ] `npm ci` tại root và `backend/` hoàn tất.
- [ ] Reset/seed cho đúng 2 users, 18 products, 10 orders, 4 coupons.
- [ ] Đã chạy 5 invariant và lưu 5 `PASS`.
- [ ] Đã làm `INV-01` thành `FAIL 1`, chụp/lưu output, rồi reset về `PASS`.
- [ ] Đã chạy V1 với `-target=1`, kiểm tra cột mới và `audit_logs`.
- [ ] Đã chạy V2, `validate` thành công, schema quay về tên cột cũ và không còn `audit_logs`.
- [ ] Đã mask `email`/`phone`, `verify_masking.js` có 4 `PASS`, kiểm tra query có 2 records mask.
- [ ] Đã chạy lại 5 invariant sau masking và functional smoke test API.
- [ ] Đã ghi tối thiểu 3 failure modes cùng evidence/cách khắc phục.

## 11. Nguồn chính thức để kiểm chứng

- [Node.js Download / LTS](https://nodejs.org/en/download) — tải Node và kiểm tra trạng thái LTS.
- [SQLite Command-Line Shell](https://www.sqlite.org/cli.html) — cách mở file SQLite, `.schema`, `.tables` và định dạng output CLI.
- [Flyway Command-line](https://documentation.red-gate.com/flyway/reference/usage/command-line) và [Migrate](https://documentation.red-gate.com/flyway/reference/commands/migrate) — cài/thi hành migration.
- [Flyway Target setting](https://documentation.red-gate.com/flyway/reference/configuration/flyway-namespace/flyway-target-setting) — ý nghĩa `-target=1` trong phần quan sát V1.
- [Flyway Baseline on Migrate](https://documentation.red-gate.com/fd/flyway-baseline-on-migrate-setting-277578974.html) — lý do `baselineOnMigrate=true` trong `flyway.conf` cần dùng cẩn thận.
- [Flyway Undo migrations](https://documentation.red-gate.com/flyway/flyway-concepts/migrations/undo-migrations) và [bảng edition/commands](https://documentation.red-gate.com/flyway/reference/commands) — xác nhận `undo` thuộc Teams, khác với V2 compensating migration của lab.

Các nguồn trên chỉ xác nhận cách dùng công cụ. “Expected results” trong lab được xác nhận từ source của repository, đặc biệt `backend/database.js`, `backend/seed-data.json`, hai migration SQL và hai script masking/verify.
