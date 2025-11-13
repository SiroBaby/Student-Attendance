# 📚 Quản Lý Học Sinh - Hệ Thống Điểm Danh

Ứng dụng quản lý điểm danh học sinh với tính năng theo dõi tài chính và lịch sử học tập.

## ✨ Tính năng chính

- **Điểm danh hàng ngày**: Đánh dấu có mặt/vắng mặt cho từng học sinh
- **Quản lý học sinh**: Thêm, sửa, xóa thông tin học sinh (soft delete)
- **Theo dõi tài chính**: Tính toán học phí theo ngày với lịch sử giá
- **Thống kê theo tháng**: Xem báo cáo tài chính và điểm danh theo từng tháng
- **Cài đặt linh hoạt**: Thay đổi mức phí hàng ngày
- **Giao diện responsive**: Hoạt động tốt trên desktop và mobile

## 🚀 Technology Stack

- **Frontend**: Next.js 16.0.3, React 19.2.0, Material-UI 7.3.5
- **Backend**: Next.js API Routes, TypeScript
- **Database**: MySQL với Prisma ORM 6.19.0
- **Styling**: Material-UI + Custom CSS
- **Timezone**: GMT+7 (Asia/Ho_Chi_Minh)

## 🔧 Installation & Setup

### Prerequisites
- Node.js 20+
- MySQL database
- npm hoặc yarn

### 1. Clone repository
\`\`\`bash
git clone <your-repo>
cd tinhtienhocsinh
\`\`\`

### 2. Install dependencies
\`\`\`bash
npm install
\`\`\`

### 3. Setup environment variables
Tạo file \`.env\` từ \`.env.example\`:
\`\`\`bash
cp .env.example .env
\`\`\`

Cập nhật \`DATABASE_URL\` trong \`.env\`:
\`\`\`bash
DATABASE_URL="mysql://username:password@host:port/database"
\`\`\`

### 4. Setup database
\`\`\`bash
# Generate Prisma client
npm run db:generate

# Run migrations
npm run db:migrate:deploy

# Seed initial data (optional)
npm run db:seed
\`\`\`

### 5. Run development server
\`\`\`bash
npm run dev
\`\`\`

Mở [http://localhost:3000](http://localhost:3000) để xem ứng dụng.

## 🚀 Production Deployment

### Build for production
\`\`\`bash
npm run build
npm start
\`\`\`

### Environment Variables cần thiết
- \`DATABASE_URL\`: MySQL connection string
- \`NODE_ENV\`: "production"

### Deploy trên Vercel
1. Push code lên GitHub/GitLab
2. Import project vào Vercel
3. Thêm environment variables
4. Deploy

### Deploy trên VPS/Server
\`\`\`bash
# Build project
npm run build

# Start production server
npm start

# Hoặc sử dụng PM2
pm2 start npm --name "tinhtienhocsinh" -- start
\`\`\`

## 📂 Project Structure

\`\`\`
├── app/                    # Next.js App Router
│   ├── api/               # API endpoints
│   ├── components/        # Reusable components  
│   ├── settings/          # Settings page
│   ├── student/[id]/      # Student detail page
│   └── page.tsx          # Homepage
├── lib/                   # API utilities
├── prisma/               # Database schema & migrations
├── types/                # TypeScript types
├── utils/                # Helper functions
└── public/              # Static assets
\`\`\`

## 🗄️ Database Schema

- **Student**: Thông tin học sinh (có soft delete)
- **AttendanceRecord**: Bản ghi điểm danh hàng ngày với mức phí
- **AppSetting**: Cài đặt ứng dụng (phí hàng ngày)

## 🎨 Features Overview

### Trang chủ
- Danh sách học sinh với điểm danh nhanh
- Hiển thị ngày hiện tại (GMT+7)
- Thêm học sinh mới

### Chi tiết học sinh  
- Lịch điểm danh theo tháng
- Thống kê tài chính với dropdown chọn tháng
- Chi tiết hóa đơn từng ngày
- Chỉnh sửa/xóa học sinh

### Cài đặt
- Thay đổi mức phí hàng ngày
- Lưu trữ lịch sử giá

## 🔒 Security Features

- Input validation & sanitization
- SQL injection protection (Prisma)
- XSS protection headers
- CORS configuration
- Environment variables cho sensitive data

## 📱 Browser Compatibility

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 🐛 Troubleshooting

### Hydration warnings
- App đã implement client-side hydration checks
- Browser extensions có thể gây warnings (an toàn để ignore)

### Database connection issues
- Kiểm tra DATABASE_URL format
- Đảm bảo MySQL server đang chạy
- Check firewall/network access

## 📄 License

Private project - All rights reserved.

---

Được phát triển với ❤️ bằng Next.js và Material-UI
