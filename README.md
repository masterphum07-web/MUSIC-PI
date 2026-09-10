# ระบบจองห้องซ้อมดนตรี ชมรมดนตรี วทก. (WTK Music Studio Reservation)

ระบบจองห้องซ้อมดนตรีออนไลน์ที่ออกแบบมาโดยเฉพาะสำหรับ **ชมรมดนตรี วิทยาลัยเทคโนโลยีทางการแพทย์และสาธารณสุข กาญจนาภิเษก (วทก.)** โดยพัฒนาตามหลัก Modern Web Application, Zero-Cost Architecture (ฟรี 100%), รองรับมาตรฐานการคุ้มครองข้อมูลส่วนบุคคล (PDPA), มีระบบป้องกันสแปม (Honeypot), ระบบล็อคป้องกันการจองชนกัน (LockService), ระบบแจ้งเตือนทางอีเมลอัตโนมัติถึงนักศึกษาและอาจารย์ที่ปรึกษา, และระบบจัดการหลังบ้าน (Admin Console) พร้อมแดชบอร์ดสถิติครบวงจร

---

### 🌐 ลิงก์ระบบออนไลน์
- **เว็บไซต์หลัก (Live URL):** [https://masterphum07-web.github.io/MUSIC-PI/](https://masterphum07-web.github.io/MUSIC-PI/)
- **API หลังบ้าน (Google Apps Script):** `https://script.google.com/macros/s/AKfycbxhyoxEr6_YKysnI272d_O047z2cFXMixyAXrvi_jWTVJkXyXjFSrrVkRZ_G6brt5vY/exec`
- **ระบบหลังบ้าน (Admin Console):** คลิกปุ่ม "ผู้ดูแลระบบ" บนหน้าเว็บ หรือเข้าผ่าน `#admin`
  - **Username:** `admin`
  - **Password:** `Admin@WTK2026`

---

### 📚 เอกสารคู่มือระบบฉบับสมบูรณ์ (Documentation Suite)

ระบบมีเอกสารคู่มือจัดทำเป็นภาษาไทยครบถ้วน 4 เล่ม เพื่อการใช้งานและการดูแลรักษาอย่างยั่งยืน:

1. 📖 **[คู่มือผู้ใช้งานทั่วไป (USER_MANUAL.md)](USER_MANUAL.md)**
   - กติกาการใช้งานห้องซ้อมดนตรี
   - ขั้นตอนการจองห้องซ้อม 3 ขั้นตอนอย่างละเอียด
   - การค้นหาคิวจอง และการเพิ่มลงใน Google Calendar
   - วิธีการเช็คอินด้วย QR Code / เว็บไซต์ และการเช็คเอาต์คืนห้อง
   - การยกเลิกคิวจอง และคำถามที่พบบ่อย (FAQ)

2. 🛡️ **[คู่มือผู้ดูแลระบบ (ADMIN_GUIDE.md)](ADMIN_GUIDE.md)**
   - การเข้าสู่ระบบแอดมินและการจัดการสิทธิ์
   - การดูแดชบอร์ดสถิติ (KPIs, แนวโน้ม 30 วัน, 7x24 Peak Heatmap, สถิติชั้นปีและสาขาวิชา)
   - การจัดการคิวจอง: เช็คอินแทน, บังคับคืนห้อง, ยกเลิกคิวฉุกเฉิน
   - การเพิ่ม/ลบ อีเมลอาจารย์ที่ปรึกษาและกรรมการชมรม พร้อมระบบทดสอบส่งอีเมล
   - การตั้งค่าเวลาเปิด-ปิดห้อง, โควตา, และการเปิดโหมดปิดปรับปรุงชั่วคราว
   - การตรวจสอบประวัติความปลอดภัย (Audit Logs) และการ Export ข้อมูลเป็น CSV

3. 🚀 **[คู่มือการติดตั้งและ Deploy (DEPLOY_RUNBOOK.md)](DEPLOY_RUNBOOK.md)**
   - ขั้นตอนการติดตั้ง Google Sheets Database 7 แท็บ ด้วย `setupSpreadsheet()`
   - ขั้นตอนการตั้งค่า Time-driven Triggers อัตโนมัติ (ตัดสิทธิ์ No-show 30 นาที, อีเมลเตือนยามเช้า)
   - การเผยแพร่ Google Apps Script Web App (New version vs New deployment)
   - การตั้งค่า Environment Variables (`.env`) และการ Build Frontend
   - การ Deploy ขึ้น GitHub Pages (Branch `gh-pages`) พร้อมรองรับ 404 Client-side Routing
   - แนวทางการสำรองข้อมูลและกู้คืน (Backup & Recovery)

4. 🏛️ **[สถาปัตยกรรมระบบ (SYSTEM_ARCHITECTURE.md)](SYSTEM_ARCHITECTURE.md)**
   - แผนภาพสถาปัตยกรรมระดับสูง (Client SPA ↔ Apps Script ↔ Google Sheets)
   - หลักการออกแบบ: Zero-Cost, Single Room Constraint, LockService Race Condition Prevention, PDPA Masking, Network Optimization
   - โครงสร้างฐานข้อมูลอย่างละเอียด 7 แท็บ (Data Dictionary)
   - ตารางข้อกำหนด API ทั้งหมด (Public & Admin Actions)

---

### 📌 สถานะการดำเนินงาน (10 Phases Completion)

- [x] **PHASE 0: Foundations & Architecture Baseline** — ออกแบบ User Flows, Business Rules, Edge Cases 16 ข้อ
- [x] **PHASE 1: Data Layer (Google Sheets Schema)** — วางโครงสร้าง 7 แท็บ, Data Validation, Color Theme, `01_Repository.gs`
- [x] **PHASE 2: Backend Core (Apps Script API Engine)** — Gateway Dispatcher, Overlap Detection, Sanitizer, `04_BookingService.gs`
- [x] **PHASE 3: Backend Admin & Auth** — HMAC-SHA256 Password Hash, JWT Session Token, KPI Aggregator, `07_AdminService.gs`
- [x] **PHASE 4: Email Engine & Automated Triggers** — MailApp HTML Templates, Auto-Cancel No-show 30m, Daily Reminder
- [x] **PHASE 5: Frontend Foundations & Design System** — React 18 + Vite + TS + Tailwind CSS + Font Prompt + shadcn UI
- [x] **PHASE 6: Public Dashboard & Timeline View** — Single Room Card, 15-min Slot Timeline, Quick Status Lookup, Calendar Picker
- [x] **PHASE 7: Booking Flow & Check-in/out** — 3-Step Modal, 0ms Instant Availability, QR Code Ticket, Calendar Sync, Self Check-in/out
- [x] **PHASE 8: Admin Console & Operations** — Recharts Analytics, Heatmap, Reservations Manager, Email Recipients CRUD, System Settings
- [x] **PHASE 9: Security, Performance & Offline Support** — Bundle Chunk Splitting (-69%), Retry Lag Fix, ErrorBoundary, Offline Banner
- [x] **PHASE 10: Final Deployment & Documentation Suite** — GitHub Pages Live Release, Documentation 4 ฉบับ, Final Handover

---

### 💻 คำสั่งสำหรับนักพัฒนา (Developer Commands)

```bash
# ติดตั้ง Dependencies
npm install

# รันโหมด Development (Hot Reload)
npm run dev

# คอมไพล์และ Build สำหรับ Production
npm run build

# ทดสอบรัน Production Build ในเครื่อง
npm run preview
```

---

*พัฒนาและดูแลโดย ชมรมดนตรี วิทยาลัยเทคโนโลยีทางการแพทย์และสาธารณสุข กาญจนาภิเษก (วทก.)*