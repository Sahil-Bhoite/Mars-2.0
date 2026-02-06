# Deployment Guide

You can deploy MARS using Docker (recommended) or manual setup.

## 🐳 Option 1: Docker (Recommended)

Run the entire stack with a single command.

### Prerequisites
- Docker & Docker Compose installed
- `GOOGLE_API_KEY` in your environment (or `.env` file)

### Steps

1. **Create .env file** (if you haven't):
   ```bash
   echo "GOOGLE_API_KEY=your_key_here" > .env
   ```

2. **Run Docker Compose**:
   ```bash
   docker-compose up --build
   ```

3. **Access**:
   - Frontend: http://localhost:3000
   - Backend: http://localhost:8000

---

## ☁️ Option 2: Render (Blueprint)

The easiest way to deploy is using the `render.yaml` Blueprint.

1. **Dashboard**: Go to [Render Dashboard](https://dashboard.render.com/).
2. **New Blueprint**: Click **New +** -> **Blueprint**.
3. **Connect Repo**: Select your `Mars-2.0` repository.
4. **Environment Variables**:
   - `GOOGLE_API_KEY`: Enter your Gemini API Key.
   - `VITE_API_URL`: This will be auto-filled by the backend URL (ensure it has `/api` at the end if needed, though the blueprint tries to link these).
   *Note: If auto-linking fails, deploy Backend first, copy its URL, and update Frontend's `VITE_API_URL` variable manually.*
5. **Apply**: Click **Apply Blueprint**.

Render will deploy both services! 🚀

---

## 💻 Option 3: Manual (VPS/Local)

Follow the `README.md` instructions to install Python/Node dependencies and run services manually.
