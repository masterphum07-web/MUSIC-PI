# คู่มือการติดตั้งและดูแลรักษาระบบ (Deployment & Operations Runbook)
## ระบบจองห้องซ้อมดนตรี ชมรมดนตรี วทก. (WTK Music Studio Reservation)

---

### 📌 ภาพรวมสถาปัตยกรรม (Architecture Summary)
- **Frontend SPA:** React 18 + Vite + TypeScript + Tailwind CSS (โฮสต์ฟรีบน **GitHub Pages**)
- **Backend API & Database:** Google Sheets (ฐานข้อมูล 7 แท็บ) + Google Apps Script Web App (API Engine ไร้ Server)
- **Email Engine:** Google Workspace MailApp (ส่งอีเมลยืนยัน/แจ้งเตือนอาจารย์ฟรี 100–1,500 ฉบับ/วัน)
- **ค่าใช้จ่าย:** **0 บาท (ฟรี 100%)** ไม่มีค่า Server หรือค่า Domain รายเดือน

---

### 📋 สารบัญขั้นตอน
1. [การติดตั้งและตั้งค่า Google Sheets & Apps Script](#1-การติดตั้งและตั้งค่า-google-sheets--apps-script)
2. [การตั้งค่า Time-driven Triggers (ระบบอัตโนมัติ)](#2-การตั้งค่า-time-driven-triggers-ระบบอัตโนมัติ)
3. [การตั้งค่า Frontend และ Environment Variables](#3-การตั้งค่า-frontend-และ-environment-variables)
4. [การ Build และ Deploy ขึ้น GitHub Pages](#4-การ-build-และ-deploy-ขึ้น-github-pages)
5. [การอัปเดตโค้ดในอนาคต (Updating Guide)](#5-การอัปเดตโค้ดในอนาคต-updating-guide)
6. [การสำรองข้อมูลและการกู้คืน (Backup & Recovery)](#6-การสำรองข้อมูลและการกู้คืน-backup--recovery)
7. [การแก้ไขปัญหาที่พบบ่อย (Troubleshooting)](#7-การแก้ไขปัญหาที่พบบ่อย-troubleshooting)

---

### 1. การติดตั้งและตั้งค่า Google Sheets & Apps Script

#### ขั้นตอนที่ 1.1: สร้าง Google Spreadsheet
1. ไปที่ [Google Sheets](https://sheets.new) และสร้าง Spreadsheet ใหม่
2. ตั้งชื่อไฟล์ เช่น `ระบบจองห้องซ้อมดนตรี ชมรมดนตรี วทก.`
3. ไปที่เมนู **ส่วนขยาย (Extensions)** ➡️ **Apps Script**

#### ขั้นตอนที่ 1.2: นำโค้ดเข้า Apps Script
1. ลบโค้ดเริ่มต้นในไฟล์ `Code.gs` ออกทั้งหมด
2. เปิดไฟล์ `apps-script/Code.gs` จากโปรเจกต์นี้ คัดลอกโค้ดทั้งหมด (All-In-One Bundle) แล้ววางลงไป
3. กดไอคอน **💾 บันทึกโครงการ (Save)**

#### ขั้นตอนที่ 1.3: รันคำสั่งเริ่มต้นฐานข้อมูล (Setup Spreadsheet)
1. ในหน้าต่าง Apps Script ที่แถบเครื่องมือด้านบน จะมีช่องดรอปดาวน์เลือกฟังก์ชัน
2. เลือกฟังก์ชันชื่อ `setupSpreadsheet`
3. คลิกปุ่ม **▶️ เรียกใช้ (Run)**
4. Google จะขอสิทธิ์การเข้าถึง (Authorization Required):
   - คลิก **ตรวจสอบสิทธิ์ (Review Permissions)**
   - เลือกบัญชี Google ของท่าน
   - คลิก **ขั้นสูง (Advanced)** ➡️ คลิก **ไปที่ ... (ไม่ปลอดภัย) / Go to ... (unsafe)**
   - คลิก **อนุญาต (Allow)**
5. เมื่อรันเสร็จ ให้กลับไปดูที่ Google Spreadsheet จะพบทั้ง 7 แท็บถูกสร้างและจัดรูปแบบอย่างสวยงาม:
   - `Rooms`: ข้อมูลห้องซ้อมดนตรี วทก.
   - `Bookings`: ตารางเก็บประวัติการจองทั้งหมด
   - `Admins`: บัญชีผู้ดูแลระบบ (ค่าเริ่มต้น: `admin` / `Admin@WTK2026`)
   - `Logs`: ประวัติการทำงานและความปลอดภัย (Audit Logs)
   - `Settings`: ค่าการตั้งค่าระบบและกติกา
   - `Blackouts`: วันปิดทำการหรือปิดปรับปรุง
   - `EmailRecipients`: รายชื่ออาจารย์และกรรมการที่รับอีเมลแจ้งเตือน

#### ขั้นตอนที่ 1.4: เผยแพร่เป็น Web App (Deploy)
1. คลิกปุ่มสีน้ำเงิน **การทำให้ใช้งานได้ (Deploy)** ที่มุมบนขวา ➡️ เลือก **การทำให้ใช้งานได้รายการใหม่ (New deployment)**
2. คลิกไอคอนรูปเฟือง ⚙️ ด้านซ้าย ➡️ เลือกประเภท **เว็บแอป (Web app)**
3. กรอกข้อมูล:
   - **คำอธิบาย (Description):** `WTK Music Reservation API Production v1`
   - **ดำเนินการในฐานะ (Execute as):** `ฉัน (Me - your.email@gmail.com)` ⭐
   - **ผู้มีสิทธิ์เข้าถึง (Who has access):** `ทุกคน (Anyone)` ⭐ *(สำคัญมาก ห้ามเลือกเฉพาะฉัน)*
4. คลิก **ทำให้ใช้งานได้ (Deploy)**
5. คัดลอก **URL เว็บแอป (Web app URL)** ที่ได้ (รูปแบบ `https://script.google.com/macros/s/XXXXX/exec`) เก็บไว้

---

### 2. การตั้งค่า Time-driven Triggers (ระบบอัตโนมัติ)

เพื่อให้ระบบสามารถ **ตัดสิทธิ์คนไม่มาเช็คอินใน 30 นาที (Auto Cancel No-show)** และ **ส่งอีเมลเตือนก่อนถึงเวลาซ้อม (Daily Reminder)** ได้อย่างอัตโนมัติ:
1. ในหน้า Apps Script ให้เลือกฟังก์ชัน `setupTriggers` ในช่องดรอปดาวน์
2. คลิกปุ่ม **▶️ เรียกใช้ (Run)**
3. ระบบจะสร้าง Time-driven Triggers ให้โดยอัตโนมัติ:
   - `triggerAutoCancelNoShow`: ตรวจเช็คทุก 10 นาที
   - `triggerDailyReminder`: ตรวจเช็คทุกเช้าเวลา 07:00 น.

---

### 3. การตั้งค่า Frontend และ Environment Variables

1. เปิดไฟล์ `.env` ที่รากของโปรเจกต์
2. นำ URL เว็บแอปที่ได้จากขั้นตอนที่ 1.4 มาใส่ในตัวแปร `VITE_API_URL`:
   ```env
   VITE_API_URL=https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec
   ```
3. บันทึกไฟล์ `.env`

---

### 4. การ Build และ Deploy ขึ้น GitHub Pages

#### คำสั่ง Build:
```bash
npm run build
```
- ระบบจะคอมไพล์ TypeScript และบันทึกไฟล์ผลลัพธ์ลงในโฟลเดอร์ `dist/`
- ทำการคัดลอก `dist/index.html` ไปเป็น `dist/404.html` เพื่อให้รองรับ Client-side Routing บน GitHub Pages:
  ```powershell
  Copy-Item dist\index.html dist\404.html -Force
  ```

#### การพุชขึ้น GitHub Pages (Branch: `gh-pages`):
```bash
git -C dist add -A
git -C dist commit -m "deploy: release production build"
git -C dist push origin gh-pages
```
- เมื่อพุชแล้ว GitHub Pages จะอัปเดตเว็บไซต์ออนไลน์ให้อัตโนมัติภายใน 1–2 นาที ที่:
  `https://masterphum07-web.github.io/MUSIC-PI/`

---

### 5. การอัปเดตโค้ดในอนาคต (Updating Guide)

> ⚠️ **กฎเหล็กของ Google Apps Script:** เมื่อมีการแก้ไขโค้ดใน Apps Script การกดบันทึก (Save) อย่างเดียวจะไม่ทำให้เว็บแอปอัปเดต!

**วิธีอัปเดตที่ถูกต้อง:**
1. อัปเดตโค้ดในหน้า Apps Script แล้วกด **บันทึก (Save)**
2. คลิก **การทำให้ใช้งานได้ (Deploy)** ➡️ **จัดการการทำให้ใช้งานได้ (Manage deployments)**
3. คลิกไอคอน **✏️ แก้ไข (รูปดินสอ)** ที่รายการ Web app เดิม
4. ที่ช่อง **เวอร์ชัน (Version)** ให้เปลี่ยนเป็น **"เวอร์ชันใหม่" (New version)**
5. คลิก **การทำให้ใช้งานได้ (Deploy)** ➡️ URL จะคงเดิม และโค้ดใหม่จะมีผลทันที!

---

### 6. การสำรองข้อมูลและการกู้คืน (Backup & Recovery)

1. **Google Sheets Version History:**
   - Google Sheets บันทึกประวัติการแก้ไขทุกวินาทีอัตโนมัติ
   - หากต้องการย้อนคืนข้อมูล ให้ไปที่เมนู **ไฟล์ (File)** ➡️ **ประวัติเวอร์ชัน (Version history)** ➡️ **ดูประวัติเวอร์ชัน**
2. **การสำรองข้อมูลเป็นไฟล์ Excel / CSV:**
   - สามารถดาวน์โหลดชีตเป็น `.xlsx` หรือ `.csv` เก็บไว้รายเดือนได้ที่เมนู **ไฟล์ ➡️ ดาวน์โหลด**
   - หรือใช้ปุ่ม **Export CSV** ในหน้า Admin Console ของเว็บ

---

### 7. การแก้ไขปัญหาที่พบบ่อย (Troubleshooting)

| ปัญหา | สาเหตุ | วิธีแก้ไข |
| :--- | :--- | :--- |
| **หน้าเว็บแจ้งว่า "ไม่รู้จักคำสั่ง action"** | Web App ยังรันโค้ดเก่าอยู่ | ทำตามข้อ 5 (Deploy -> Manage deployments -> เลือก New version) |
| **ติดปัญหา CORS Error** | Header ในการยิงเป็น `application/json` | ระบบใช้ `text/plain;charset=utf-8` ใน `api.ts` เพื่อข้าม CORS Preflight ซึ่งถูกต้องแล้ว |
| **ขึ้น Lock Timeout ในการจอง** | โค้ดเก่าใช้ `waitLock` ที่คืนค่า void | อัปเดตเป็นโค้ดใน `apps-script/Code.gs` ตัวล่าสุดที่ใช้ `tryLock` |
| **เข้าหน้าเว็บไม่ได้ / หน้าขาว** | ขาดไฟล์ `404.html` | ก๊อปปี้ `dist/index.html` ไปเป็น `dist/404.html` แล้ว Deploy ใหม่ |