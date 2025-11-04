# 🏫 QR-Based School System — Backend

This repository contains the backend server for the **QR-Based School Management System**.  
The backend is built using **Django** and **Django REST Framework (DRF)**, providing APIs for:
- 🔐 Authentication (SimpleJWT)
- 👨‍🏫 User Management (Admin, Teacher, Parent)
- 📋 Student Attendance
- 🍱 RMT (Rancangan Makanan Tambahan)
- ⭐ Sahsiah (Student Character Evaluation)
- 📊 Reporting & Analytics

---

## ⚙️ 1. Prerequisites

Before starting, ensure you have the following installed:

| Tool | Version | Check Command |
|------|----------|----------------|
| Python | 3.10+ | `python --version` |
| pip | Latest | `pip --version` |
| Git | Latest | `git --version` |
| Virtualenv (optional but recommended) | Latest | `pip install virtualenv` |

---

## 📦 2. Create and Activate Virtual Environment
note: make sure you already on the `backend` directory when creating or activating the virtual environment

### Create
```bash
python -m venv env
```

### Activate (Windows)
note: the following command should be run on powershell
``` bash
.\env\bin\activate
```

### Activate (Mac/Linux)
```bash
source venv/bin/activate
```

## 📥 3. Install Dependencies
```bash
pip install -r requirements.txt
```

## 🧩 4. Run Migrations
```bash
python manage.py makemigrations
python manage.py migrate
```

## 💾 5. Loadding Dummy Data
```bash
python manage.py loaddata fixtures/dummydata.json
```

## 🚀 6. Run the Development Server
```bash
python manage.py runserver
```
for the development purpose, the backend will be hosted on `localhost:8000`