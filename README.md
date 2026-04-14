# Quản lý Ký túc xá - Đại học Tây Bắc

Ứng dụng web quản lý ký túc xá với:

- Backend: FastAPI, SQLAlchemy, Alembic, PostgreSQL
- Frontend: React, Vite, TypeScript, Tailwind CSS
- Auth: JWT access token + refresh token, lưu access token trong cookie HttpOnly

## Cấu trúc

- `be/`: backend FastAPI
- `fe/`: frontend React

## Chạy bằng Docker

1. Tạo file môi trường cho backend:

```bash
cp be/.env.example be/.env
```

2. Khởi động PostgreSQL + backend:

```bash
cd be
docker compose up --build
```

Backend sẽ chạy tại `http://localhost:8000`.

## Chạy frontend

```bash
cd fe
npm install
npm run dev
```

Frontend sẽ chạy tại `http://localhost:5173`.

## Chạy thủ công backend

```bash
cd be
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
alembic upgrade head
python alembic/seed_data.py
python server.py
```

## Seed data mặc định

- 2 tòa nhà: K1, K2
- Mỗi tòa nhà 10 phòng
- 1 admin, 2 staff, 5 sinh viên mẫu

## Tài khoản mẫu

| Vai trò | Email | Mật khẩu |
| --- | --- | --- |
| Admin | `admin@utb.edu.vn` | `Admin@123` |
| Staff | `staff1@utb.edu.vn` | `Staff@123` |
| Staff | `staff2@utb.edu.vn` | `Staff@123` |
| Sinh viên | `sv1@utb.edu.vn` | `Student@123` |

## API auth

- `POST /auth/register`
- `POST /auth/login`
- `GET /auth/me`
- `POST /auth/refresh`
- `POST /auth/logout`

## Ghi chú

- Access token được set trong cookie HttpOnly.
- Frontend cần gọi API với `withCredentials: true`.
- Nếu đổi domain hoặc cổng, nhớ cập nhật `be/.env` và `fe/.env` tương ứng.