# 🏫 QR-Based School System — Backend

This repository contains the backend server for the **QR-Based School Management System**.  
The backend is built using **Django** and **Django REST Framework (DRF)**, providing APIs for:
- 🔐 Authentication (SimpleJWT)
- 👨‍🏫 User Management (Admin, Teacher, Parent)
- 📋 Student Attendance
- 🍱 RMT (Rancangan Makanan Tambahan)
- ⭐ Sahsiah (Student Character Evaluation)
- ⭐ Record Discipline (Student Bad Deeds Evaluation)
- 📊 Reporting & Analytics

---

## ⚙️ 1. Prerequisites

Before starting, ensure you have the following installed:

| Tool | Version | Check Command |
|------|----------|----------------|
| Docker | latest | docker version |

---

## 📦 2. Create docker compose
note: make sure you already on the `project-ad` directory when creating or activating the virtual environment
to create docker compose, simply use this command:

```bash 
docker compose -f compose.yaml up --build -d
```
 
once all of the container are running, the backend will be host in `http://127.0.0.1:8080`

---

## Note
- if you have any issue where the docker can't find the run.sh, simply change the end of line segment of "run.sh" to LF if you are on windows

---