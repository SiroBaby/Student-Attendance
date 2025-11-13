# 🎓 Hệ thống điểm danh học sinh

Ứng dụng quản lý điểm danh và tính học phí cho học sinh.

## 🚀 Cài đặt Database

### 1. Cài đặt MySQL

Đảm bảo bạn đã cài đặt MySQL trên máy tính.

### 2. Tạo Database

```sql
CREATE DATABASE tinhtienhocsinh CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 3. Cấu hình môi trường

Copy file `.env.example` thành `.env` và cập nhật thông tin database:

```bash
cp .env.example .env
```

Sửa file `.env`:
```env
DATABASE_URL="mysql://username:password@localhost:3306/tinhtienhocsinh"
```

### 4. Chạy Migration

```bash
# Generate Prisma Client
npm run db:generate

# Tạo database schema
npm run db:push

# Hoặc sử dụng migration (khuyến khích cho production)
npm run db:migrate

# Seed dữ liệu mẫu
npm run db:seed
```

### 5. Xem dữ liệu (tuỳ chọn)

```bash
# Mở Prisma Studio để xem và chỉnh sửa dữ liệu
npm run db:studio
```

## 📋 Database Schema

### Tables:

1. **students** - Thông tin học sinh
2. **attendance_records** - Bản ghi điểm danh hàng ngày
3. **app_settings** - Cấu hình ứng dụng

### Relationships:

- Một học sinh có thể có nhiều bản ghi điểm danh
- Unique constraint: Một học sinh chỉ có thể có một bản ghi điểm danh cho mỗi ngày

## 🛠️ Prisma Commands

```bash
# Generate client sau khi thay đổi schema
npm run db:generate

# Push schema changes to database
npm run db:push

# Create và run migration
npm run db:migrate

# Reset database (⚠️ XÓA TẤT CẢ DỮ LIỆU)
npm run db:migrate:reset

# Mở Prisma Studio
npm run db:studio

# Seed dữ liệu
npm run db:seed
```

## 🔧 Development

```bash
# Chạy development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## 📱 Features

- ✅ Điểm danh học sinh hàng ngày
- ✅ Tính toán học phí tự động
- ✅ Calendar hiển thị lịch sử học tập
- ✅ Responsive design cho mobile
- ✅ Múi giờ Hồ Chí Minh
- ✅ Chỉnh sửa thông tin học sinh
- ✅ Database với Prisma ORM (MySQL)
- ✅ Quản lý học sinh và điểm danh
- ✅ Cấu hình linh hoạt qua app_settings

## 🎯 Upcoming Features

- 💰 Quản lý thanh toán học phí
- 📊 Báo cáo thống kê chi tiết
- 👤 Thông tin chi tiết học sinh
- 📅 Lên lịch học tập
- 🔔 Thông báo và nhắc nhở