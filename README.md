# ระบบจองห้องซ้อมดนตรี ชมรมดนตรี วทก. (WTK Music Studio Reservation)

ระบบจองห้องซ้อมดนตรีออนไลน์สำหรับชมรมดนตรี วิทยาลัยเทคโนโลยีทางการแพทย์และสาธารณสุข กาญจนาภิเษก (วทก.)

## 🎯 สถาปัตยกรรม
- **Frontend:** React 18 + Vite + TypeScript + Tailwind CSS + shadcn/ui (GitHub Pages)
- **Backend / Database:** Google Sheets (7 แท็บ) + Google Apps Script Web App
- **Email Notifications:** Google MailApp ในตัว (ไม่เสียค่าใช้จ่าย)
- **Web App API URL:** `https://script.google.com/macros/s/AKfycbxhyoxEr6_YKysnI272d_O047z2cFXMixyAXrvi_jWTVJkXyXjFSrrVkRZ_G6brt5vY/exec`

## 📌 แผนการดำเนินงาน 10 เฟส
- [x] **PHASE 0:** วางรากฐานและยืนยันสเปก (User flows, Business rules, Edge cases 16 ข้อ)
- [x] **PHASE 1:** Data Layer (Google Sheets 7 แท็บ Schema, `00_Setup.gs`, `01_Repository.gs`)
- [x] **PHASE 2:** Backend Core (Apps Script API - `02_Router.gs`, `03_Validation.gs`, `04_BookingService.gs`, `05_Logger.gs`, `99_Test.gs`)
- [x] **PHASE 3:** Backend Admin + Auth (`06_Auth.gs`, `07_AdminService.gs`)
- [ ] **PHASE 4:** ระบบอีเมล + Trigger อัตโนมัติ (`08_Mailer.gs`, `09_Triggers.gs`)
- [ ] **PHASE 5:** Frontend Setup + Design System (Vite + React + TS + Tailwind + shadcn/ui)
- [ ] **PHASE 6:** หน้าหลัก (Public Dashboard & Timeline Grid)
- [ ] **PHASE 7:** Flow การจอง + เช็คอิน/เช็คเอาต์
- [ ] **PHASE 8:** หลังบ้านแอดมิน (Admin Console)
- [ ] **PHASE 9:** คุณภาพ ความปลอดภัย และการเข้าถึง
- [ ] **PHASE 10:** Deploy และส่งมอบ (GitHub Pages Actions + เอกสาร 4 ฉบับ)
