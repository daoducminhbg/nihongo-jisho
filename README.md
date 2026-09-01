# Nihongo Jisho (日本語辞書) 🌸

**Web App học tiếng Nhật thông minh từ Anime, Manga & Game dành cho người học từ N5 lên N3.**  
Tích hợp AI nhận diện ngữ cảnh (**Google Gemini 3.7 Flash**), Từ điển cá nhân đa năng có che cột kiểm tra trí nhớ, Từ điển Hán tự tương tác nét vẽ (**KanjiVG**), và Hệ thống Flashcard thuật toán **FSRS (chuẩn Anki hiện đại nhất)**.

100% Miễn phí trọn đời (Zero-cost Architecture).

---

## ✨ Tính năng Nổi bật

### 1. 📷 AI Vision Scanner & Extractor (Gemini 3.7 Flash)
- **Tải ảnh hoặc dán trực tiếp (`Ctrl + V`)**: Hỗ trợ ảnh chụp màn hình anime, game, manga.
- **Khung cắt ảnh trực quan (Crop Box)**: Khoanh đúng bóng thoại nhân vật để AI nhận diện chuẩn xác 100%.
- **Nhập câu/văn bản trực tiếp**: Dán câu tiếng Nhật bất kỳ.
- **Phân tích bóc tách tự động**:
  - **Từ vựng**: Đưa về thể từ điển, dạng chia trong câu, Furigana, Kanji, Nghĩa tiếng Việt, Cấp độ JLPT (N5 - N1), Từ loại.
  - **Hán tự (Kanji)**: Bóc tách từng chữ Hán, Âm Hán-Việt in hoa, Âm On, Âm Kun, Nghĩa tiếng Việt.
  - **Ngữ pháp**: Mẫu ngữ pháp, Công thức, Giải thích, Câu ví dụ, Sắc thái (anime slang, khẩu ngữ, trang trọng).
- **Chống trùng lặp thông minh (Deduplication)**: Tự động đối chiếu với kho từ vựng đã có của bạn, hiển thị tag `[Mới]` hoặc `[Đã học - Lần thứ N]`, tự động cập nhật câu ngữ cảnh mới mà không tạo dữ liệu rác.

### 2. 📖 Từ điển Cá nhân Đa năng (Personal Notebook)
- **Từ điển Từ vựng**:
  - Bảng danh sách với các cột: Từ vựng, Furigana, Hán tự, Nghĩa, JLPT, Tần suất gặp, Phát âm, Thao tác.
  - **Bật/Tắt ẩn cột (Toggle Visibility)**: Ẩn cách đọc (Furigana) hoặc ẩn Nghĩa tiếng Việt để tự dò mắt kiểm tra trí nhớ trực tiếp trên bảng.
  - Xem chi tiết danh sách câu ngữ cảnh trích xuất từ anime/game đi kèm từng từ.
- **Từ điển Hán Tự (Kanji Vault)**:
  - Danh sách chữ Hán đã học với bộ lọc JLPT (N5 - N1).
  - **Interactive Stroke Order**: Animation mô phỏng thứ tự từng nét viết chuẩn mực (dữ liệu SVG mã nguồn mở từ KanjiVG) kèm nút phát lại nét vẽ.
  - Liệt kê các từ ghép mẫu thường gặp.
- **Từ điển Ngữ pháp (Grammar Hub)**:
  - Cấu trúc công thức, phân tích chi tiết, sắc thái bối cảnh và câu ví dụ có kèm audio.

### 3. 🔍 Công cụ Tìm kiếm Toàn năng (Omni-Search)
- **Fuzzy Search & Chuyển đổi Romaji tự động**: Gõ `taberu` hệ thống tự động tìm cả `たべる` và `食べる`. Tìm kiếm được bằng cả chữ Hán, âm Hán-Việt (ví dụ `THỰC`), hoặc nghĩa tiếng Việt.
- **Tìm kiếm bằng hình ảnh / câu văn**: Dán một ảnh hoặc câu mới, hệ thống tự động quét và lọc ra tất cả những từ vựng, kanji, ngữ pháp bạn **ĐÃ TỪNG HỌC** có mặt trong ảnh/câu đó!

### 4. 🃏 Hệ thống Flashcard Thuật toán Anki Hiện đại (FSRS)
- **Tùy chỉnh bộ thẻ**: Chọn học riêng Từ vựng, Kanji, Ngữ pháp hoặc trộn lẫn; lọc theo cấp độ JLPT.
- **Đổi chiều thẻ hai chiều**:
  - **Nhật ➔ Việt**: Nhìn chữ tiếng Nhật đoán nghĩa.
  - **Việt ➔ Nhật**: Gợi nhớ chủ động chữ tiếng Nhật và Kanji từ nghĩa tiếng Việt.
- **Thuật toán FSRS (Free Spaced Repetition Scheduler)**:
  - Chuẩn hiện đại thay thế SM-2 cũ của Anki, tính toán chính xác độ bền trí nhớ (Stability) và độ khó (Difficulty).
  - 4 nút đánh giá: **Học lại (Again)**, **Khó (Hard)**, **Tốt (Good)**, **Dễ (Easy)** hiển thị dự đoán thời gian ôn tập tiếp theo tương ứng.
  - Nếu chọn "Học lại", thẻ tự động quay lại hàng đợi cuối phiên để học thuộc ngay trong ngày.
- **Phím tắt nhanh**: Phím `Space`/`Enter` để lật thẻ, phím `1`, `2`, `3`, `4` để đánh giá.
- **Phát âm Native**: Tích hợp Web Speech API tiếng Nhật bản xứ (`ja-JP`) hoàn toàn miễn phí.
- **Hàng đợi ôn tập (Review Queue Dashboard)**: Thống kê số thẻ đến hạn hôm nay, thẻ mới và thẻ đang ghi nhớ.

---

## 🚀 Hướng Dẫn Cài Đặt & Chạy Ứng Dụng

### 1. Chuẩn bị biến môi trường
Tạo file `.env.local` ở thư mục gốc dự án:
```env
# Supabase (Lấy tại https://supabase.com/ -> Project Settings -> API)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Google Gemini API Key (Lấy miễn phí 100% tại https://aistudio.google.com/)
GOOGLE_AI_API_KEY=your-gemini-api-key-here
```

### 2. Khởi tạo Database trên Supabase
1. Vào dự án Supabase của bạn tại [supabase.com](https://supabase.com/).
2. Mở mục **SQL Editor**.
3. Copy toàn bộ nội dung file `supabase/migrations/001_initial_schema.sql` và nhấn **Run**.
4. Toàn bộ bảng, index pg_trgm, RLS bảo mật và hàm tìm kiếm sẽ được tạo tự động.

### 3. Cài đặt thư viện & Khởi chạy
```bash
# Cài đặt dependencies (nếu chưa có)
npm install

# Khởi chạy môi trường phát triển
npm run dev
```

Mở trình duyệt tại: `http://localhost:3000`

---

## 🛠️ Công Nghệ Sử Dụng (Tech Stack)
- **Frontend / Backend**: Next.js 16 (App Router, Server Actions, TypeScript)
- **Styling**: Tailwind CSS + Shadcn UI + Framer Motion
- **Database & Auth**: Supabase PostgreSQL 16 (`pg_trgm`, RLS)
- **AI Engine**: Google Gemini 3.7 Flash API (Structured Outputs JSON Schema)
- **SRS Algorithm**: `ts-fsrs` (FSRS-5/6 Engine)
- **Utilities**: `wanakana` (Romaji/Kana), `react-image-crop`, Web Speech API, KanjiVG SVG paths
