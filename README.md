# AI Fitness Coach Chatbot

![Version](https://img.shields.io/badge/version-1.0-blue)
![Year](https://img.shields.io/badge/year-2026-green)

---

## 👥 Team Members

| Thành viên 1 — Node.js BE | Thành viên 2 — .NET AI |
|---------------------------|------------------------|
| **Tech Stack:**<br/>Node.js · ReactJS · MySQL · SQL Server · RabbitMQ | **Tech Stack:**<br/>.NET · ReactJS · MySQL · Redis · Qdrant · RabbitMQ |
| **Responsibilities:**<ul><li>Auth, User Profile, Workout Log, Streak</li><li>RabbitMQ consumer, Notification</li></ul> | **Responsibilities:**<ul><li>AI Plan Generator, Prompt Engineering</li><li>Nutrition / TDEE API, Progress Analytics</li><li>AI Chat Streaming (SSE), RAG + Qdrant</li><li>Tool Calling (8 tools), Feedback Loop AI</li></ul> |

## 📋 Table of Contents

1. [Tổng quan dự án](#1-tổng-quan-dự-án)
2. [Mục tiêu đề tài](#2-mục-tiêu-đề-tài)
3. [Kiến trúc hệ thống](#3-kiến-trúc-hệ-thống)
4. [Danh sách tính năng](#4-danh-sách-tính-năng)
5. [Dữ liệu hệ thống](#5-dữ-liệu-hệ-thống)
6. [Thiết kế Database](#6-thiết-kế-database)
7. [Tech Stack](#7-tech-stack)
8. [Timeline 8 tuần](#8-timeline-8-tuần)

---

## 1. Tổng quan dự án

**AI Fitness Coach Chatbot** là một nền tảng luyện tập cá nhân hoá thông minh, ứng dụng **Large Language Model (LLM)** kết hợp với kỹ thuật **Retrieval-Augmented Generation (RAG)** và **Function/Tool Calling** để tạo ra trải nghiệm tập luyện giống như có một huấn luyện viên cá nhân ngay trong điện thoại.

Thay vì cung cấp các bài tập chung chung, hệ thống thu thập thông tin chi tiết về từng ngưới dùng — từ thể trạng, môi trường tập luyện, mục tiêu cá nhân cho đến lịch sử chấn thương — và từ đó **tự động sinh ra kế hoạch tập luyện riêng biệt** cho từng ngưới. AI Coach không chỉ trả lờ câu hỏi mà còn **chủ động gọi các công cụ (tool calls)** để tạo plan mới, điều chỉnh lịch tập, tính toán dinh dưỡng và ghi nhận buổi tập — tất cả ngay trong giao diện chat.

Dữ liệu bài tập được xây dựng từ nguồn **wger.de** (800+ bài tập, đã clean và bổ sung mô tả kỹ thuật thực hiện), được nhúng vào **Qdrant vector database** để phục vụ RAG. Ngưới dùng hỏi kỹ thuật squat hay cách tập khi chấn thương, AI sẽ truy xuất đúng tài liệu chuyên môn và trả lờ chính xác thay vì bịa đặt.

---

## 2. Mục tiêu đề tài

### 2.1 Mục tiêu kỹ thuật

- Xây dựng hệ thống AI Chatbot tích hợp LLM (GPT-4o) với khả năng streaming response realtime qua Server-Sent Events (SSE)
- Triển khai RAG pipeline: embed dữ liệu bài tập → Qdrant → retrieve context → inject vào prompt LLM
- Implement OpenAI Function Calling (Tool Calling) để AI chủ động tạo, sửa, lên lịch kế hoạch tập
- Thiết kế kiến trúc microservice: Node.js BE (CRUD, Auth) + .NET BE (AI/ML) + RabbitMQ message queue
- Cá nhân hoá sâu: AI sinh plan dựa trên profile đầy đủ (môi trường, thiết bị, chấn thương, lịch rảnh)

### 2.2 Mục tiêu sản phẩm

- Ngưới dùng tạo được kế hoạch tập luyện cá nhân hoá trong vòng 30 giây sau khi điền profile
- AI Coach trả lờ câu hỏi kỹ thuật dựa trên knowledge base thật, không hallucinate
- Hệ thống tracking buổi tập + streak giúp ngưới dùng duy trì thói quen luyện tập
- AI tự điều chỉnh plan khi ngưới dùng phản hồi bài quá dễ / quá khó

---

## 3. Kiến trúc hệ thống

Hệ thống được tách thành hai backend service độc lập, giao tiếp qua REST API nội bộ và RabbitMQ message queue:

| Component | Description |
|-----------|-------------|
| **Node.js Service** | Xử lý toàn bộ nghiệp vụ CRUD: Auth (JWT), User Profile, Workout Log, Streak, Nutrition API, Progress Analytics, WebSocket notification. Kết nối MySQL + RabbitMQ. |
| **.NET 8 Service** | Xử lý toàn bộ AI: gọi OpenAI GPT-4o, RAG retrieval từ Qdrant, Tool Calling, Plan Generator, Feedback Loop, chat history trong Redis. SSE streaming về FE. |
| **ReactJS Frontend** | SPA duy nhất, gọi API từ cả hai service. Chat UI với SSE reader, calendar plan view, dashboard biểu đồ, form log buổi tập. |
| **RabbitMQ** | Message broker bất đồng bộ: .NET publish event (plan.generated, plan.adjusted) → Node consumer nhận → WebSocket push thông báo tới FE. |

---

## 4. Danh sách tính năng

### 4.1 Onboarding & User Profile

Thu thập thông tin ngưới dùng qua form 4 bước ngay lần đầu đăng ký. Đây là input cốt lõi để AI cá nhân hoá mọi thứ:

- **Thông tin cá nhân:** giới tính, ngày sinh (tính tuổi tự động), cân nặng (kg), chiều cao (cm)
- **Môi trường tập luyện:** Phòng gym (đủ thiết bị) / Tại nhà (có hoặc không có dụng cụ) / Ngoài trờ (bodyweight, chạy bộ)
- **Thiết bị hiện có:** Tạ đòn, tạ đơn, dây kháng lực, xà đơn, tạ bình, máy tập — ngưới dùng tick nhiều lựa chọn
- **Mục tiêu luyện tập (Workout Goal):** Giảm mỡ / Tăng cơ / Tăng sức bền / Giữ dáng / Cải thiện sức khoẻ tổng thể
- **Cấp độ luyện tập:** Chưa từng tập / Mới bắt đầu (&lt; 6 tháng) / Trung cấp (6–24 tháng) / Nâng cao (&gt; 2 năm)
- **Lịch rảnh trong tuần:** chọn ngày + số phút mỗi buổi (30 / 45 / 60 / 90 phút)
- **Chấn thương / hạn chế vùng cơ:** nhập tự do, AI sẽ tránh bài tập ảnh hưởng vùng đó

### 4.2 AI Workout Plan Generator

AI tự động sinh kế hoạch tập luyện cá nhân hoá dựa trên toàn bộ profile. Plan được cấu trúc theo tuần, mỗi ngày ghi rõ nhóm cơ cần tập và danh sách bài tập cụ thể:

- Tự động chia nhóm cơ theo ngày hợp lý: Push/Pull/Legs, Upper/Lower, hoặc Full Body tuỳ số ngày rảnh
- Mỗi bài tập có đầy đủ: tên, số set, số rep, thờ gian nghỉ, ghi chú kỹ thuật, nhóm cơ tác động
- Lọc bài tập theo môi trường: gym user nhận bài với barbell/cable; home user chỉ nhận dumbbell/bodyweight; outdoor user nhận calisthenics/chạy bộ
- Ngưới dùng có thể yêu cầu AI tạo lại plan nếu không hài lòng, hoặc điều chỉnh ngày cụ thể
- Plan tháng = 4 plan tuần liên tiếp, tự động tăng dần volume theo nguyên tắc progressive overload

### 4.3 AI Chat Coach (Streaming Realtime)

Giao diện chat với AI Coach hoạt động như một huấn luyện viên cá nhân luôn sẵn sàng. Response được stream từng từ như ChatGPT:

- Chat context-aware: AI biết profile, plan hiện tại, lịch sử tập và streak của user trong mỗi phiên hội thoại
- Trả lờ câu hỏi kỹ thuật: cách thực hiện đúng một bài tập, nhóm cơ nào được tác động, lỗi thường gặp
- **RAG Knowledge Base:** AI tìm kiếm trong cơ sở dữ liệu 900+ bài tập để trả lờ dựa trên tài liệu thật, không bịa. Câu trả lờ có badge 'Dựa trên knowledge base'
- **Tool Calling — AI gọi công cụ:** thay vì chỉ nói, AI thực sự thực hiện hành động khi cần (xem 4.4)
- Chat history lưu trong Redis (7 ngày) để duy trì ngữ cảnh xuyên suốt cuộc trò chuyện
- Lưu lịch sử chat dài hạn vào MySQL để user xem lại các phiên hội thoại cũ

### 4.4 AI Tool Calling (8 công cụ)

Đây là tính năng phân biệt hệ thống với chatbot thông thường. AI không chỉ tư vấn — nó thực sự thực hiện hành động:

| Tool | Description |
|------|-------------|
| `generate_workout_plan()` | Tạo mới hoặc tạo lại toàn bộ plan khi user yêu cầu qua chat |
| `adjust_plan_difficulty()` | Tăng/giảm cường độ plan hiện tại theo phản hồi của user |
| `search_exercise()` | Tìm bài tập theo nhóm cơ + thiết bị + môi trường từ database |
| `get_exercise_form()` | Retrieve hướng dẫn kỹ thuật thực hiện đúng từ RAG/Qdrant |
| `reschedule_workout()` | Dờ buổi tập sang ngày khác trong tuần theo yêu cầu |
| `calculate_calories()` | Tính TDEE + macro split (protein/carb/fat) theo goal và profile |
| `log_workout()` | Ghi nhận buổi tập nhanh qua chat, không cần vào form |
| `get_progress_summary()` | Lấy tóm tắt tiến trình: streak, nhóm cơ chưa tập, completion rate |

### 4.5 Workout Tracking & Streak

- Log buổi tập chi tiết: ngày tập, từng bài tập, số set thực tế, số rep, cân nặng (kg), thờ gian buổi tập
- Phản hồi sau buổi tập: 3 nút Quá dễ / Vừa / Quá khó — AI dùng phản hồi này để điều chỉnh plan tiếp theo
- Streak (chuỗi ngày tập liên tiếp): hiển thị streak hiện tại và streak dài nhất từ trước đến nay
- Calendar view: lịch tuần hiển thị ngày nào tập gì, tick xanh nếu đã hoàn thành, đỏ nếu bỏ lỡ
- Completion rate: tỷ lệ % buổi tập thực hiện so với plan đề ra theo tuần/tháng

### 4.6 Progress Dashboard

- 4 metric card tổng quan: Streak hiện tại, Số buổi tập tuần này, Tổng volume nâng (kg), Completion rate (%)
- Biểu đồ line chart: số buổi tập 4 tuần gần nhất theo thờ gian
- Biểu đồ bar chart: volume tập chia theo nhóm cơ (ngực/lưng/chân/vai/tay) — biết nhóm cơ nào đang bỏ bê
- Heatmap calendar (kiểu GitHub contribution): mỗi ô là 1 ngày, màu đậm = tập nhiều, nhạt = ít hoặc bỏ

### 4.7 Dinh dưỡng & Calorie (Scope gọn)

Tính năng dinh dưỡng tập trung vào tư vấn — không yêu cầu user tracking từng bữa ăn. Scope phù hợp với thờ gian 2 tháng:

- Tính TDEE (Total Daily Energy Expenditure) tự động từ profile: tuổi, cân nặng, chiều cao, giới tính, mức độ hoạt động
- Gợi ý macro split theo goal: Giảm mỡ (protein cao, deficit calo) / Tăng cơ (surplus calo, protein cao) / Giữ dáng (maintenance)
- Database ~5900 món ăn phổ biến trên thới giới: cơm, phở, bánh mì, bún bò... với calories/100g, protein, carb, fat
- AI gợi ý thực đơn mẫu phù hợp với TDEE qua chat — không cần user tự tính

---

## 5. Dữ liệu hệ thống

### 5.1 Exercise Database

| Property | Value |
|----------|-------|
| **Nguồn** | wger.de REST API — crawl bằng Python script, lưu vào MySQL |
| **Số lượng** | ~900 bài tập tiếng Anh đã clean, có đủ tên + nhóm cơ + hướng dẫn thực hiện |
| **Phân loại môi trường** | Gym / Home / Outdoor — tự động từ equipment_list bằng script SQL |
| **Mô tả kỹ thuật** | Bài có sẵn từ wger giữ nguyên; bài thiếu được AI generate bằng GPT-4o mini |
| **RAG Embedding** | description + muscles + category → text-embedding-3-small → Qdrant (1536 dims, cosine similarity) |

### 5.2 Muscle Groups (12 nhóm cơ)

- **Upper Body:** Chest (ngực) · Back (lưng) · Shoulders (vai) · Biceps (tay trước) · Triceps (tay sau)
- **Lower Body:** Quads (đùi trước) · Hamstrings (đùi sau) · Glutes (mông) · Calves (bắp chân)
- **Core & Others:** Abs/Core (bụng) · Forearms (cẳng tay) · Full Body (toàn thân)

### 5.3 Nutrition Database

- ~150 món ăn Việt Nam phổ biến + thực phẩm cơ bản (gạo, thịt, rau, trứng...)
- Mỗi món: tên, calories/100g, protein (g), carbohydrate (g), fat (g)
- Nguồn tham khảo: fatsecret.vn + nutritionvalue.org, seed thủ công vào MySQL

---

## 6. Thiết kế Database

Toàn bộ dữ liệu nghiệp vụ lưu trong MySQL. Redis dùng cho chat history (TTL). Qdrant là vector store riêng cho RAG.

### Bảng `users` — Tài khoản ngưới dùng

| Tên cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
|---------|--------------|-----------|-------|
| id | UUID | PK | Khoá chính, tự sinh |
| email | VARCHAR(255) | UNIQUE NOT NULL | Email đăng nhập |
| password_hash | VARCHAR(255) | NOT NULL | Mật khẩu đã hash bằng bcrypt |
| full_name | VARCHAR(150) | NOT NULL | Tên hiển thị |
| is_active | BOOLEAN | DEFAULT TRUE | Tài khoản có đang hoạt động không |
| created_at | TIMESTAMP | NOT NULL | Thờ điểm tạo tài khoản |
| updated_at | TIMESTAMP | AUTO UPDATE | Lần cập nhật cuối |

### Bảng `user_profiles` — Profile luyện tập

| Tên cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
|---------|--------------|-----------|-------|
| id | UUID | PK | Khoá chính |
| user_id | UUID | FK → users | Tham chiếu tài khoản |
| gender | ENUM | NOT NULL | male / female / other |
| date_of_birth | DATE | NOT NULL | Ngày sinh (tính tuổi tự động) |
| weight_kg | DECIMAL(5,1) | NOT NULL | Cân nặng (kg) |
| height_cm | DECIMAL(5,1) | NOT NULL | Chiều cao (cm) |
| environment | ENUM | NOT NULL | gym / home / outdoor |
| fitness_goal | ENUM | NOT NULL | fat_loss / muscle_gain / endurance / maintain / health |
| fitness_level | ENUM | NOT NULL | beginner / novice / intermediate / advanced |
| session_minutes | INT | DEFAULT 60 | Số phút mỗi buổi tập |
| equipment | JSON | NOT NULL | Danh sách thiết bị user có: `["Dumbbell","Pull-up bar"]` |
| injuries | TEXT | NULLABLE | Mô tả chấn thương / hạn chế vùng cơ |
| updated_at | TIMESTAMP | AUTO UPDATE | Lần cập nhật cuối |

### Bảng `available_days` — Lịch rảnh trong tuần

| Tên cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
|---------|--------------|-----------|-------|
| id | UUID | PK | Khoá chính |
| user_id | UUID | FK → users | Tham chiếu tài khoản |
| day_of_week | ENUM | NOT NULL | Monday / Tuesday / ... / Sunday |

### Bảng `refresh_tokens` — JWT Refresh Token

| Tên cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
|---------|--------------|-----------|-------|
| id | UUID | PK | Khoá chính |
| user_id | UUID | FK → users | Tham chiếu tài khoản |
| token_hash | VARCHAR(255) | NOT NULL | Hash của refresh token |
| expires_at | TIMESTAMP | NOT NULL | Thờ điểm hết hạn |
| is_revoked | BOOLEAN | DEFAULT FALSE | Đã thu hồi chưa |
| created_at | TIMESTAMP | NOT NULL | Thờ điểm tạo |

### Bảng `exercises` — Kho bài tập (seed từ wger)

| Tên cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
|---------|--------------|-----------|-------|
| id | INT | PK | ID từ wger |
| name | VARCHAR(200) | NOT NULL | Tên bài tập tiếng Anh |
| description | TEXT | NULLABLE | Hướng dẫn thực hiện (đã clean HTML) |
| description_source | ENUM | NOT NULL | wger / gpt_generated / manual |
| category_id | INT | FK → categories | Nhóm bài tập (Chest, Legs...) |
| environment | ENUM | NOT NULL | gym / home / outdoor / any |
| muscles_primary | JSON | NOT NULL | Nhóm cơ chính: `["Quadriceps"]` |
| muscles_secondary | JSON | NULLABLE | Nhóm cơ phụ: `["Glutes"]` |
| equipment_list | JSON | NULLABLE | Thiết bị cần: `["Barbell","Bench"]` |
| image_url | VARCHAR(500) | NULLABLE | URL ảnh minh hoạ từ wger |
| embed_status | ENUM | DEFAULT pending | pending / embedded / skip (Qdrant) |

### Bảng `workout_plans` — Kế hoạch tập luyện

| Tên cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
|---------|--------------|-----------|-------|
| id | UUID | PK | Khoá chính |
| user_id | UUID | FK → users | Chủ sở hữu plan |
| title | VARCHAR(200) | NOT NULL | VD: 'Kế hoạch tăng cơ tuần 1' |
| plan_type | ENUM | NOT NULL | weekly / monthly |
| week_number | INT | NOT NULL | Tuần thứ mấy (1, 2, 3, 4) |
| status | ENUM | DEFAULT active | active / completed / archived |
| ai_model_used | VARCHAR(50) | NOT NULL | VD: gpt-4o — để track chi phí |
| starts_at | DATE | NOT NULL | Ngày bắt đầu plan |
| generated_at | TIMESTAMP | NOT NULL | Thờ điểm AI tạo plan |

### Bảng `workout_days` — Ngày tập trong plan

| Tên cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
|---------|--------------|-----------|-------|
| id | UUID | PK | Khoá chính |
| plan_id | UUID | FK → workout_plans | Thuộc plan nào |
| day_of_week | ENUM | NOT NULL | Monday / Tuesday... |
| muscle_focus | VARCHAR(200) | NOT NULL | VD: 'Chest & Triceps' |
| order_index | INT | NOT NULL | Thứ tự ngày trong plan (1,2,3...) |

### Bảng `exercises_in_day` — Bài tập trong ngày

| Tên cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
|---------|--------------|-----------|-------|
| id | UUID | PK | Khoá chính |
| day_id | UUID | FK → workout_days | Thuộc ngày tập nào |
| exercise_id | INT | FK → exercises | Bài tập nào |
| sets | INT | NOT NULL | Số set: 3, 4... |
| reps | VARCHAR(20) | NOT NULL | VD: '8-12' hoặc '10' |
| rest_seconds | INT | DEFAULT 60 | Nghỉ bao nhiêu giây giữa set |
| notes | TEXT | NULLABLE | Ghi chú kỹ thuật từ AI |
| order_index | INT | NOT NULL | Thứ tự bài trong ngày |

### Bảng `workout_logs` — Ghi nhận buổi tập

| Tên cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
|---------|--------------|-----------|-------|
| id | UUID | PK | Khoá chính |
| user_id | UUID | FK → users | Ngưới tập |
| plan_id | UUID | FK → workout_plans | Thuộc plan nào |
| day_id | UUID | FK → workout_days | Ngày tập nào trong plan |
| logged_date | DATE | NOT NULL | Ngày thực sự tập (có thể khác lịch) |
| duration_minutes | INT | NULLABLE | Thờ gian buổi tập (phút) |
| difficulty_feedback | ENUM | NULLABLE | easy / ok / hard |
| notes | TEXT | NULLABLE | Ghi chú tự do của user |
| created_at | TIMESTAMP | NOT NULL | Thờ điểm log |

### Bảng `exercise_logs` — Chi tiết từng bài trong buổi tập

| Tên cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
|---------|--------------|-----------|-------|
| id | UUID | PK | Khoá chính |
| log_id | UUID | FK → workout_logs | Thuộc buổi tập nào |
| exercise_id | INT | FK → exercises | Bài tập nào |
| sets_done | INT | NOT NULL | Set đã thực hiện |
| reps_done | VARCHAR(50) | NOT NULL | Rep thực tế: '10,10,8' |
| weight_kg | DECIMAL(5,1) | NULLABLE | Cân nặng thực tế (kg) |
| is_completed | BOOLEAN | DEFAULT FALSE | Đã hoàn thành bài này chưa |

### Bảng `chat_sessions` — Phiên hội thoại

| Tên cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
|---------|--------------|-----------|-------|
| id | UUID | PK | Khoá chính |
| user_id | UUID | FK → users | Chủ sở hữu |
| title | VARCHAR(200) | NULLABLE | Tên phiên (auto từ câu đầu) |
| created_at | TIMESTAMP | NOT NULL | Thờ điểm tạo |
| last_message_at | TIMESTAMP | NOT NULL | Tin nhắn cuối lúc nào |

### Bảng `chat_messages` — Tin nhắn trong chat

| Tên cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
|---------|--------------|-----------|-------|
| id | UUID | PK | Khoá chính |
| session_id | UUID | FK → chat_sessions | Thuộc phiên nào |
| role | ENUM | NOT NULL | user / assistant |
| content | TEXT | NOT NULL | Nội dung tin nhắn |
| used_rag | BOOLEAN | DEFAULT FALSE | Có dùng RAG Qdrant không — phục vụ thống kê |
| tokens_used | INT | NULLABLE | Số token đã dùng — track chi phí OpenAI |
| created_at | TIMESTAMP | NOT NULL | Thờ điểm gửi |

### Bảng `foods` — Cơ sở dữ liệu thực phẩm

| Tên cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
|---------|--------------|-----------|-------|
| id | INT | PK AUTO_INCREMENT | Khoá chính |
| name | VARCHAR(200) | NOT NULL | Tên món/thực phẩm |
| name_vn | VARCHAR(200) | NULLABLE | Tên tiếng Việt |
| calories_per_100g | DECIMAL(7,2) | NOT NULL | Calo trên 100g |
| protein_g | DECIMAL(6,2) | NOT NULL | Protein (g/100g) |
| carb_g | DECIMAL(6,2) | NOT NULL | Carbohydrate (g/100g) |
| fat_g | DECIMAL(6,2) | NOT NULL | Chất béo (g/100g) |
| category | VARCHAR(100) | NULLABLE | Cơm / Bún-phở / Thịt / Rau / Trái cây... |

---

## 7. Tech Stack

| Layer | Technology | Mục đích |
|-------|------------|----------|
| **AI Service** | .NET 8 API | Backend AI: LLM, RAG, Tool Calling, SSE stream |
| **AI Engine** | OpenAI GPT-4o / 4o-mini | Sinh plan, chat, tool calling, vision (bonus) |
| **Embedding** | text-embedding-3-small | Embed exercise description → vector 1536 dims |
| **Vector DB** | Qdrant Cloud (free tier) | Lưu vector + semantic search cho RAG |
| **AI SDK** | Semantic Kernel (.NET) | Wrapper gọi LLM, định nghĩa tools, memory |
| **CRUD Service** | Node.js + Express/Fastify | Auth, User, Log, Nutrition, Analytics API |
| **Frontend** | ReactJS + Vite + Tailwind | SPA: chat UI, calendar, dashboard, form |
| **UI Components** | shadcn/ui | Component library nhất quán, dark mode |
| **Charts** | Recharts | Biểu đồ tiến trình, streak heatmap |
| **Primary DB** | MySQL 8.0 | Toàn bộ dữ liệu nghiệp vụ |
| **Cache / Chat** | Redis 7 | Chat history (TTL 7 ngày), session cache |
| **Message Queue** | RabbitMQ | Async events: plan.generated → notification |
| **Container** | Docker Compose | Dev environment đồng nhất 2 ngưới |
| **Deploy** | Railway.app + Vercel | Free tier đủ cho demo hội đồng |

---

## 8. Timeline 8 tuần

| Sprint | Mục tiêu | Node.js (TV1) | .NET AI (TV2) |
|--------|----------|---------------|---------------|
| **S1 Tuần 1–2** | **Setup + Auth + Data** | Auth API, Profile CRUD, Exercise API, Environment classification script | Project setup, Qdrant embed, Seed món ăn, Docker Compose |
| **S2 Tuần 3–4** | **Plan + Log + Streak** | Workout Log CRUD, Streak calculation, Plan CRUD | AI Plan Generator, Prompt Engineering, Plan day schedule logic, Nutrition/TDEE API |
| **S3 Tuần 5–6** | **AI Chat + RAG + Tools** | Feedback API, Analytics API, Chat session API, RabbitMQ consumer | AI Chat SSE streaming, RAG pipeline, 8 Tool Calls, Feedback loop |
| **S4 Tuần 7–8** | **Deploy + Báo cáo** | Deploy Railway, Seed demo data, Rate limiting, Viết báo cáo BE | Deploy Railway, LLM cost control, Viết báo cáo AI, Bonus: Vision API |

---
