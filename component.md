# I. Tên component: PropertyCard
### 1. Thuộc tính (Props API)
| Tên Prop | Kiểu dữ liệu (Type) | Bắt buộc? | Giá trị mặc định | Mô tả / Chức năng |
| :--- | :--- | :---: | :--- | :--- |
| `imageUrl` | `string` | **Yes** | *Không có* | Đường dẫn URL của hình ảnh bất động sản / mặt bằng |
| `price` | `string` | **Yes** | *Không có* | Giá thuê hiển thị trên nhãn (ví dụ: "45tr/tháng") |
| `rating` | `number` | No | `4.8` | Điểm đánh giá hiển thị ở góc trên bên phải (ví dụ: `4.8`). Nếu không có sẽ ẩn phần đánh giá. |
| `title` | `string` | **Yes** | *Không có* | Tiêu đề của mặt bằng / bất động sản |
| `location` | `string` | **Yes** | *Không có* | Địa chỉ hoặc vị trí cụ thể (hiển thị kèm icon định vị) |
| `onClick` | `() => void` | **Yes** | *Không có* | Hàm xử lý sự kiện khi nhấn vào thẻ component |
### 2. Hình ảnh (Trang chủ)
![alt text](image.png)
# II. Tên component: ProductRow
### 1. Thuộc tính (Props API)
| Tên Prop | Kiểu dữ liệu (Type) | Bắt buộc? | Giá trị mặc định | Mô tả / Chức năng |
| :--- | :--- | :---: | :--- | :--- |
| `imageUrl` | `string` | **Yes** | *Không có* | Đường dẫn URL hình ảnh sản phẩm |
| `title` | `string` | **Yes** | *Không có* | Tên của sản phẩm (ví dụ: "Máy pha cà phê Nuova") |
| `category` | `string` | **Yes** | *Không có* | Danh mục / loại sản phẩm (ví dụ: "Thiết bị Coffee") |
| `price` | `number` | **Yes** | *Không có* | Giá tiền hiển thị (ví dụ: `12500000` hoặc `"12.500.000đ"`) |
| `status` | `string` | No | `'Đã duyệt'` | Trạng thái phê duyệt (ví dụ: "Đã duyệt"). Nếu không truyền thì ẩn badge trạng thái. |
| `onClick` | `() => void` | No | `undefined` | Hàm xử lý sự kiện khi nhấn vào thẻ component |
### 2. Hình ảnh (Trang chủ)
![alt text](image-1.png)
# III. Tên component: StatCard
### 1. Thuộc tính (Props API)
| Tên Prop | Kiểu dữ liệu (Type) | Bắt buộc? | Giá trị mặc định | Mô tả / Chức năng |
| :--- | :--- | :---: | :--- | :--- |
| `value` | `string` | **Yes** | *Không có* | Giá trị số liệu hiển thị nổi bật phía trên (ví dụ: "45.2M", "+12%", "03") |
| `label` | `string` | **Yes** | *Không có* | Nhãn hoặc mô tả số liệu hiển thị phía dưới (ví dụ: "DOANH THU", "TĂNG TRƯỞNG", "CẢNH BÁO") |
| `textColor` | `string` | No | `'#0086FF'` | Mã màu |
| `onClick` | `() => void` | No | `undefined` | Hàm xử lý khi nhấn vào thẻ thống kê |
### 2. Hình ảnh
![alt text](image-2.png)
# IV. Tên component: NavigationItem
### 1. Thuộc tính (Props API)
| Tên Prop | Kiểu dữ liệu (Type) | Bắt buộc? | Giá trị mặc định | Mô tả / Chức năng |
| :--- | :--- | :---: | :--- | :--- |
| `icon` | `React.ElementStyle` | **Yes** | *Không có* | Icon hiển thị phía bên trái (ví dụ: icon ngôi nhà, sản phẩm, tin nhắn...) |
| `title` | `string` | **Yes** | *Không có* | Nhãn tiêu đề hiển thị của mục điều hướng (ví dụ: "Mặt bằng", "Sản phẩm") |
| `onClick` | `() => void` | **Yes** | *Không có* | Hàm xử lý sự kiện khi nhấn vào mục điều hướng này |
### 2. Hình ảnh
![alt text](image-3.png)
# V. Tên component: NotificationCard
### 1. Thuộc tính (Props API)
| Tên Prop | Kiểu dữ liệu (Type) | Bắt buộc? | Giá trị mặc định | Mô tả / Chức năng |
| :--- | :--- | :---: | :--- | :--- |
| `icon` | `React.ElementStyle` | No | `undefined` | Icon đại diện bên trái |
| `title` | `string` | **Yes** | *Không có* | Tiêu đề thông báo / công việc (ví dụ: "Gia hạn hợp đồng #HG1025") |
| `subtitle` | `string` | **Yes** | *Không có* | Nội dung chi tiết / Tên đối tác (ví dụ: "Đối tác: Công ty TNHH...") |
| `time` | `string` | **Yes** | *Không có* | Mốc thời gian xảy ra sự kiện (ví dụ: "2 giờ trước") |
| `onClick` | `() => void` | No | `undefined` | Hàm sự kiện khi nhấn "XEM CHI TIẾT ->" |
### 2. Hình ảnh
![alt text](image-4.png)
# VI. Tên component: SettingRow
### 1. Thuộc tính (Props API)
| Tên Prop | Kiểu dữ liệu (Type) | Bắt buộc? | Giá trị mặc định | Mô tả / Chức năng |
| :--- | :--- | :---: | :--- | :--- |
| `icon` | `React.ElementStyle` | No | `undefined` | Icon đại diện bên trái (ví dụ: Icon thông tin cá nhân) |
| `title` | `string` | **Yes** | *Không có* | Tiêu đề của mục cài đặt (ví dụ: "Thông tin cá nhân") |
| `subtitle` | `string` | No | `'Email, số điện thoại, địa chỉ'` | Mô tả ngắn gọn dưới tiêu đề (ví dụ: "Email, số điện thoại, địa chỉ") |
| `colorIcon` | `string` | No | `'#0086FF'` | Màu sắc của icon xanh lam |
| `backgroundColorIcon` | `string` | No | `'#E8F2FF'` | Màu nền của icon xanh lam nhạt |
| `onClick` | `() => void` | **Yes** | *Không có* | Hàm xử lý sự kiện khi nhấn vào dòng cài đặt |
### 2. Hình ảnh
![alt text](image-6.png)
# VII. Tên component: Button
### 1. Thuộc tính (Props API)
| Tên Prop | Kiểu dữ liệu (Type) | Bắt buộc? | Giá trị mặc định | Mô tả / Chức năng |
| :--- | :--- | :---: | :--- | :--- |
| `title` | `string` | **Yes** | *Không có* | Văn bản hiển thị trên nút (ví dụ: "Đăng xuất") |
| `icon` | `React.ElementStyle` | No | `undefined` | Icon hiển thị bên trái văn bản (ví dụ: Icon đăng xuất) |
| `isDisplayIcon` | `boolean` | No | `true` | Xác định có hiển thị icon hay không |
| `backgroundColor` | `string` | No | `'#0086FF'` | Màu nền của nút (ví dụ: màu xanh lam) |
| `color` | `string` | No | `'#ffffff'` | Màu chữ và màu icon của nút |
| `onClick` | `() => void` | **Yes** | *Không có* | Hàm xử lý sự kiện khi nhấn nút |
### 2. Hình ảnh
![alt text](image-5.png)
# VIII. Tên component: ReviewCard
### 1. Thuộc tính (Props API)
| Tên Prop | Kiểu dữ liệu (Type) | Bắt buộc? | Giá trị mặc định | Mô tả / Chức năng |
| :--- | :--- | :---: | :--- | :--- |
| `imageUrl` | `string` | **Yes** | *Không có* | Đường dẫn hình ảnh sản phẩm/đối tượng được đánh giá bên trái |
| `imageTag` | `string` | No | `'Đã gửi'` | Nhãn hiển thị đè lên góc hình ảnh (ví dụ: "Đã gửi", "Đã nhận") |
| `title` | `string` | **Yes** | *Không có* | Tiêu đề của đánh giá (ví dụ: "Cửa hàng Gốm Việt") |
| `rating` | `number` | No | `5` | Số sao đánh giá từ 1 đến 5 (ví dụ: `5`) |
| `date` | `string` | **Yes** | *Không có* | Ngày gửi đánh giá (ví dụ: "12/06/2024") |
| `comment` | `string` | **Yes** | *Không có* | Nội dung nhận xét chi tiết |
| `tag` | `string` | No | `'Mặt bằng kinh doanh'` | Nhãn phân loại loại hình bất động sản/sản phẩm dưới cùng |
| `onClick` | `() => void` | No | `undefined` | Hàm xử lý sự kiện khi nhấn vào thẻ đánh giá |
### 2. Hình ảnh
![alt text](image-6.png)

# IX. Tên component: StoreCard

### 1. Thuộc tính (Props API)

| Tên Prop | Kiểu dữ liệu (Type) | Bắt buộc? | Giá trị mặc định | Mô tả / Chức năng |
| :--- | :--- | :---: | :--- | :--- |
| `imageUrl` | `string` | **Yes** | *Không có* | Đường dẫn hình ảnh đại diện cửa hàng bên trái (ví dụ: Logo cửa hàng) |
| `name` | `string` | **Yes** | *Không có* | Tên cửa hàng (ví dụ: "Cửa hàng Quận 1") |
| `status` | `string` | **Yes** | *Không có* | Trạng thái ký gửi (ví dụ: "Đang nhận ký gửi") |
| `productCount` | `number` | **Yes** | *Không có* | Số lượng sản phẩm của cửa hàng (ví dụ: `18`) |
| `isOpen` | `boolean` | No | `true` | Trạng thái hoạt động của cửa hàng (nếu `true` hiển thị "Đang mở" và nút "Dừng", ngược lại hiển thị "Tạm dừng" và nút "Mở") |
| `onButtonClick` | `() => void` | **Yes** | *Không có* | Hàm xử lý sự kiện khi nhấn nút hành động (Dừng/Mở) |

### 2. Hình ảnh
![alt text](image-7.png)

# X. Tên component: KpiIconCard

### 1. Thuộc tính (Props API)

| Tên Prop | Kiểu dữ liệu (Type) | Bắt buộc? | Giá trị mặc định | Mô tả / Chức năng |
| :--- | :--- | :---: | :--- | :--- |
| `icon` | `React.ElementStyle` | **Yes** | *Không có* | Icon thống kê hiển thị trên cùng (ví dụ: icon hộp hàng, khiên uy tín, tài liệu...) |
| `value` | `string` \| `number` | **Yes** | *Không có* | Giá trị số liệu thống kê ở giữa (ví dụ: `18`, `4.8`, `3`) |
| `label` | `string` | **Yes** | *Không có* | Nhãn tiêu đề hiển thị dưới cùng (ví dụ: "SẢN PHẨM", "UY TÍN", "HỢP ĐỒNG") |
| `onClick` | `() => void` | No | `undefined` | Hàm xử lý khi nhấn vào thẻ thống kê |

### 2. Hình ảnh
![alt text](image-8.png)

# XI. Tên component: InventoryCard

### 1. Thuộc tính (Props API)

| Tên Prop | Kiểu dữ liệu (Type) | Bắt buộc? | Giá trị mặc định | Mô tả / Chức năng |
| :--- | :--- | :---: | :--- | :--- |
| `imageUrl` | `string` | **Yes** | *Không có* | Đường dẫn hình ảnh sản phẩm bên trái |
| `title` | `string` | **Yes** | *Không có* | Tên sản phẩm (ví dụ: "Túi cói thủ công") |
| `stock` | `number` | **Yes** | *Không có* | Số lượng tồn kho (ví dụ: `24`) |
| `outlets` | `number` | **Yes** | *Không có* | Số lượng điểm bán (ví dụ: `3`) |
| `status` | `string` | No | `'Đang bán'` | Trạng thái hiển thị góc phải trên (ví dụ: "Đang bán") |
| `onMenuClick` | `() => void` | No | `undefined` | Hàm xử lý khi nhấn nút tùy chọn 3 chấm góc phải dưới |

### 2. Hình ảnh
![alt text](image-9.png)

# XII. Tên component: ShopProfileCard
### 1. Thuộc tính (Props API)
| Tên Prop | Kiểu dữ liệu (Type) | Bắt buộc? | Giá trị mặc định | Mô tả / Chức năng |
| :--- | :--- | :---: | :--- | :--- |
| `avatarUrl` | `string` | **Yes** | *Không có* | Đường dẫn hình ảnh đại diện (avatar) của cửa hàng |
| `name` | `string` | **Yes** | *Không có* | Tên cửa hàng (ví dụ: "Cửa hàng Quận 1") |
| `rating` | `number` | No | `4.9` | Điểm đánh giá trung bình của cửa hàng (hiển thị kèm icon ngôi sao) |
| `productCount` | `number` | **Yes** | *Không có* | Số lượng sản phẩm của cửa hàng (ví dụ: `12`) |
| `onButtonClick` | `() => void` | **Yes** | *Không có* | Hàm xử lý sự kiện khi nhấn vào nút "Chi tiết" dưới cùng |
### 2. Hình ảnh
![alt text](image-10.png)

# XIII. Tên component: ContractCard
### 1. Thuộc tính (Props API)
| Tên Prop | Kiểu dữ liệu (Type) | Bắt buộc? | Giá trị mặc định | Mô tả / Chức năng |
| :--- | :--- | :---: | :--- | :--- |
| `contractCode` | `string` | **Yes** | *Không có* | Mã số hợp đồng hiển thị trên cùng (ví dụ: "HD-0626-018") |
| `status` | `string` | No | `'HIỆU LỰC'` | Trạng thái của hợp đồng hiển thị ở badge (ví dụ: "HIỆU LỰC") |
| `partnerName` | `string` | **Yes** | *Không có* | Tên đối tác (ví dụ: "Nguyễn Minh") |
| `imageUrl` | `string` | **Yes** | *Không có* | Ảnh đại diện cửa hàng/đối tác bên trong khung thông tin |
| `title` | `string` | **Yes** | *Không có* | Tiêu đề nội dung hợp tác (ví dụ: "Cửa hàng Quận 1 - Túi cói thủ công") |
| `updatedAt` | `string` | **Yes** | *Không có* | Ngày cập nhật hợp đồng hiển thị kèm icon lịch |
| `hasAttachment` | `boolean` | No | `true` | Xác định có hiển thị icon tệp tài liệu ở góc trái dưới hay không |
| `onClick` | `() => void` | **Yes** | *Không có* | Hàm xử lý sự kiện khi nhấn vào hợp đồng hoặc chữ "Xem chi tiết" |
### 2. Hình ảnh
![alt text](image-11.png)

# XIV. Tên component: SegmentedControl
### 1. Thuộc tính (Props API)
| Tên Prop | Kiểu dữ liệu (Type) | Bắt buộc? | Giá trị mặc định | Mô tả / Chức năng |
| :--- | :--- | :---: | :--- | :--- |
| `options` | `string[]` | **Yes** | *Không có* | Danh sách các nhãn hiển thị cho các tab (ví dụ: `['Tất cả', 'Hiệu lực', 'Chờ ký', 'Bản nháp']`) |
| `selectedValue` | `string` | No | `'Tất cả'` | Nhãn của tab đang được lựa chọn và kích hoạt màu nền xanh dương |
| `onChange` | `(value: string) => void` | **Yes** | *Không có* | Hàm xử lý sự kiện khi thay đổi lựa chọn tab |
### 2. Hình ảnh
![alt text](image-12.png)