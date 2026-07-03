# Kế hoạch triển khai kiểm tra tính toàn vẹn cơ sở dữ liệu (Database Integrity Testing)

Kế hoạch này đề xuất 5 câu truy vấn SQL để kiểm tra tính toàn vẹn của dữ liệu trong cơ sở dữ liệu SQLite của ứng dụng EShop, đồng thời thiết lập Jest làm Test Runner để tự động chạy các kiểm tra này trong file [databaseIntegrity.test.js](file:///d:/HCMUS/Nam_III_HK3/Software%20Testing/Seminar/backend/tests/databaseIntegrity.test.js).

## Đề xuất 5 Câu SQL kiểm tra Tính toàn vẹn Dữ liệu

Dựa trên cấu trúc bảng hiện tại trong `database.js` (không khai báo trực tiếp `FOREIGN KEY` hay các ràng buộc `CHECK`, `UNIQUE` phức tạp ở mức cơ sở dữ liệu), chúng ta sẽ sử dụng các câu truy vấn để phát hiện các bản ghi vi phạm tính toàn vẹn nghiệp vụ:

### 1. Kiểm tra tính toàn vẹn tham chiếu của Sản phẩm (Product -> Category)
- **Mục tiêu:** Đảm bảo mọi sản phẩm đều thuộc về một danh mục (category) tồn tại.
- **SQL Query:**
  ```sql
  SELECT id, name, category_id 
  FROM products 
  WHERE category_id IS NOT NULL 
    AND category_id NOT IN (SELECT id FROM categories);
  ```
- **Ý nghĩa:** Kết quả trả về phải rỗng. Nếu có hàng dữ liệu, nghĩa là tồn tại sản phẩm mồ côi (không có danh mục hợp lệ).

### 2. Kiểm tra tính toàn vẹn tham chiếu của Đơn hàng (Order -> User)
- **Mục tiêu:** Đảm bảo mọi đơn hàng đều gắn với một tài khoản người dùng tồn tại.
- **SQL Query:**
  ```sql
  SELECT id, user_id, total_amount 
  FROM orders 
  WHERE user_id NOT IN (SELECT id FROM users);
  ```
- **Ý nghĩa:** Kết quả trả về phải rỗng. Nếu có hàng dữ liệu, nghĩa là có đơn hàng của một user không tồn tại.

### 3. Kiểm tra tính duy nhất của Email Người dùng (Unique Email Constraint)
- **Mục tiêu:** Đảm bảo không có hai người dùng trùng email (do bảng `users` hiện tại không có ràng buộc `UNIQUE` trên cột `email`).
- **SQL Query:**
  ```sql
  SELECT email, COUNT(*) as count 
  FROM users 
  GROUP BY email 
  HAVING count > 1;
  ```
- **Ý nghĩa:** Kết quả trả về phải rỗng. Nếu có hàng dữ liệu, nghĩa là có trùng lặp tài khoản.

### 4. Kiểm tra giới hạn số lần sử dụng Coupon của Người dùng (Coupon Usage Limit)
- **Mục tiêu:** Đảm bảo mỗi người dùng không sử dụng vượt quá số lần tối đa quy định của một mã giảm giá (`max_uses_per_user`).
- **SQL Query:**
  ```sql
  SELECT cu.user_id, cu.coupon_id, COUNT(*) as usage_count, c.max_uses_per_user
  FROM coupon_usage cu
  JOIN coupons c ON cu.coupon_id = c.id
  GROUP BY cu.user_id, cu.coupon_id
  HAVING usage_count > c.max_uses_per_user;
  ```
- **Ý nghĩa:** Kết quả trả về phải rỗng. Nếu có hàng, nghĩa là hệ thống đã cho phép một user áp dụng coupon đó vượt quá giới hạn.

### 5. Kiểm tra ràng buộc miền giá trị của Giá sản phẩm và Tổng tiền đơn hàng (Domain Constraints)
- **Mục tiêu:** Đảm bảo giá của sản phẩm phải lớn hơn 0 và tổng tiền đơn hàng phải không âm.
- **SQL Query:**
  ```sql
  SELECT 'product' as type, id, price as invalid_value FROM products WHERE price <= 0
  UNION ALL
  SELECT 'order' as type, id, total_amount as invalid_value FROM orders WHERE total_amount < 0;
  ```
- **Ý nghĩa:** Kết quả trả về phải rỗng. Phát hiện các lỗi logic nghiệp vụ làm dữ liệu tiền tệ bị âm hoặc bằng 0 bất thường.


