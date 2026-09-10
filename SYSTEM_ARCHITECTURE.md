# สถาปัตยกรรมระบบ (System Architecture & Technical Specification)
## ระบบจองห้องซ้อมดนตรี ชมรมดนตรี วทก. (WTK Music Studio Reservation)

---

### 1. แผนภาพสถาปัตยกรรมระบบ (High-Level Architecture)

```
+-------------------------------------------------------------------------------+
|                             CLIENT TIER (Frontend)                            |
|  GitHub Pages (HTTPS CDN) - React 18 + TypeScript + Vite + Tailwind CSS      |
|                                                                               |
|   [ Public View ]           [ Booking Flow ]            [ Admin Console ]     |
|   - Timeline Grid           - 3-Step Modal              - Recharts Dashboard  |
|   - Room Card (Single)      - Instant Avail (0ms)       - Reservations CRUD   |
|   - Quick Status Search     - QR Code & Calendar        - Email Recipients    |
|   - Offline Banner & PDPA   - Form Validation           - System Settings     |
+-------------------------------------------------------------------------------+
                                      |
                                      | HTTPS POST / GET (JSON payload)
                                      | Content-Type: text/plain;charset=utf-8
                                      v
+-------------------------------------------------------------------------------+
|                       API GATEWAY & ROUTER (Apps Script)                      |
|                                                                               |
|   - CORS-free Dispatcher (doGet / doPost)                                     |
|   - Request Sanitizer & Anti-Spam (Honeypot Trap)                             |
|   - Session Token Verifier (requireAuth: JWT / HMAC-SHA256)                   |
|   - Centralized Exception Handler & Audit Logger                              |
+-------------------------------------------------------------------------------+
         |                                                 |
         v                                                 v
+------------------------------------+  +---------------------------------------+
|     CORE SERVICES & BUSINESS LOGIC |  |       NOTIFICATION ENGINE             |
|                                    |  |                                       |
|  - BookingService:                 |  |  - Mailer:                            |
|    * Overlap Detection             |  |    * User Confirmation Email (HTML)   |
|    * Booking Code (MB-YYMM-XXXX)   |  |    * Adviser/Committee Alert Email    |
|    * Quotas & Advance Limits       |  |    * Daily Morning Reminder (07:00)   |
|    * Check-in / Check-out Logic    |  |    * No-Show Alert Notification       |
|  - AdminService:                   |  +---------------------------------------+
|    * KPI Aggregator & Heatmaps     |                     |
|    * Email Recipients Manager      |                     v
|    * Settings & Audit Exporter     |  +---------------------------------------+
+------------------------------------+  |        GOOGLE WORKSPACE APIS          |
         |                              |  - MailApp / GmailApp                 |
         v                              |  - Time-driven Triggers               |
+------------------------------------+  +---------------------------------------+
|       DATA ACCESS LAYER (DAL)      |
|                                    |
|  - LockService (tryLock 20s)       |
|  - Batch Read / Write (No loop)    |
|  - SpreadsheetApp.flush()          |
|  - Self-Healing Auto Sheet Creator |
+------------------------------------+
         |
         v
+-------------------------------------------------------------------------------+
|                         DATABASE TIER (Google Sheets)                         |
|                                                                               |
|   [ Rooms ]            [ Bookings ]          [ Admins ]        [ Logs ]       |
|   [ Settings ]         [ Blackouts ]         [ EmailRecipients ]              |
+-------------------------------------------------------------------------------+
```

---

### 2. หลักการออกแบบสำคัญ (Core Design Principles)

#### 2.1 Zero-Cost & Serverless (ฟรี 100%)
- สถาปัตยกรรมทำงานโดยไม่ต้องเช่า Virtual Machine หรือฐานข้อมูล Cloud จ่ายรายเดือน
- ใช้ความสามารถของ GitHub Pages ร่วมกับ Google Apps Script และ Google Sheets ทำให้องค์กรประหยัดงบประมาณได้ทั้งหมด

#### 2.2 ระบบห้องเดี่ยว (Single Room Constraint)
- ชมรมดนตรี วทก. มีห้องซ้อมดนตรีประจำชมรม 1 ห้อง (`ROOM-01`: ความจุ 8–10 คน)
- หน้า UI ถูกออกแบบให้เน้นเฉพาะห้องนี้อย่างชัดเจน สบายตา และมีระบบ Graceful Fallback ในโค้ดหลังบ้านเพื่อรองรับกรณีฐานข้อมูลชีตเก่ามีรหัสต่างกัน

#### 2.3 การป้องกัน Race Condition และการจองชนกัน (LockService & Overlap Matrix)
- ใช้ `LockService.getScriptLock()` ครอบการเขียนข้อมูลด้วย `tryLock(20000)`
- ตรวจสอบช่วงเวลาทับซ้อน (Overlap Detection) ซ้ำสองชั้น:
  1. ชั้นนอก (Client-side 0ms instant check) เพื่อ UX ที่รวดเร็ว
  2. ชั้นใน (Atomic Backend Re-check ภายใต้ ScriptLock) โดยใช้สมการ:
     $$\text{Overlap} = (\text{NewStart} < \text{ExistingEnd}) \land (\text{NewEnd} > \text{ExistingStart})$$
     สำหรับรายการที่มีสถานะ `booked` หรือ `checked_in`

#### 2.4 ความเป็นส่วนตัวตามมาตรฐาน PDPA (Privacy & Compliance)
- ข้อมูลชื่อใน Timeline สาธารณะจะถูกย่อชื่ออัตโนมัติ (เช่น `นายสมชาย ใจดี` $\rightarrow$ `สมชาย จ.`)
- เบอร์โทรศัพท์และอีเมลของผู้จอง **จะไม่ถูกส่งออกไปยัง Public API เด็ดขาด** (สามารถดูได้เฉพาะแอดมินที่ล็อกอินแล้วเท่านั้น)

#### 2.5 ประสิทธิภาพและความเร็วโครงข่าย (Network Optimization)
- **CORS Bypass:** ส่งคำขอด้วย `Content-Type: text/plain;charset=utf-8` เพื่อหลีกเลี่ยง OPTIONS Preflight Roundtrip ทำให้คำขอเร็วกว่าเดิมเท่าตัว
- **Zero Retry on Logic Errors:** ปรับ `api.ts` ไม่ให้ Retry ซ้ำเมื่อเกิดข้อผิดพลาดทางตรรกะ (เช่น ห้องไม่ว่าง หรือรหัสผ่านผิด) ลดเวลาค้างจาก 30s เหลือ ~1s ทันที
- **Code Splitting & Chunks:** แยก Vendor Recharts (522 kB) ออกจาก Main Bundle (260 kB) ทำให้หน้าแรกโหลดไวขึ้น 69%

#### 2.6 ระบบซ่อมแซมฐานข้อมูลอัตโนมัติ (Self-Healing Sheets)
- หากชีตใดถูกลบโดยไม่ตั้งใจ หรือสร้างชีตใหม่โดยยังไม่ได้รันสคริปต์ ตัวฟังก์ชัน `getSheet()` จะตรวจจับและแทรกแท็บพร้อมเขียนคอลัมน์ Header ให้โดยอัตโนมัติ
- หากแท็บ `Rooms` ว่างเปล่า ระบบจะสร้างข้อมูลห้อง `ROOM-01` เริ่มต้นให้อัตโนมัติในทันที

---

### 3. โครงสร้างฐานข้อมูล (Google Sheets Schema 7 แท็บ)

#### 3.1 แท็บ `Rooms` (ข้อมูลห้องซ้อม)
| คอลัมน์ | ชนิดข้อมูล | ตัวอย่าง | คำอธิบาย |
| :--- | :--- | :--- | :--- |
| `room_id` | String (PK) | `ROOM-01` | รหัสห้องซ้อม |
| `room_name` | String | `ห้องซ้อมดนตรี ชมรมดนตรี วทก.` | ชื่อห้องซ้อม |
| `capacity` | Integer | `10` | ความจุคนสูงสุด |
| `equipment_list` | String | `กลองชุด Pearl, แอมป์กีตาร์...` | รายการเครื่องดนตรี |
| `color_hex` | String | `#0F3D5C` | รหัสสีธีมห้อง |
| `is_active` | Boolean String | `TRUE` | สถานะเปิด/ปิดใช้งาน |
| `sort_order` | Integer | `1` | ลำดับการแสดงผล |
| `image_url` | String | `https://...` | ลิงก์รูปภาพห้อง |

#### 3.2 แท็บ `Bookings` (รายการจอง)
| คอลัมน์ | ชนิดข้อมูล | ตัวอย่าง | คำอธิบาย |
| :--- | :--- | :--- | :--- |
| `booking_id` | UUID | `e7a1b8...` | รหัสอ้างอิงภายใน |
| `booking_code` | String (Unique) | `MB-2609-A3F7` | รหัสคิวสำหรับผู้ใช้งาน |
| `room_id` | String (FK) | `ROOM-01` | รหัสห้อง |
| `booking_date` | Date (YYYY-MM-DD) | `2026-09-11` | วันที่ใช้งาน |
| `start_time` | String (HH:mm) | `13:00` | เวลาเริ่มต้น |
| `end_time` | String (HH:mm) | `15:00` | เวลาสิ้นสุด |
| `full_name` | String | `ภูมิภัทร สว่างเวียง` | ชื่อผู้จอง |
| `student_year` | String | `ปี 1` | ชั้นปี |
| `major` | String | `รังสีเทคนิค` | สาขาวิชา |
| `phone` | String | `0648587699` | เบอร์โทรศัพท์ |
| `email` | String | `user@gmail.com` | อีเมลรับบัตรคิว |
| `party_size` | Integer | `4` | จำนวนคนร่วมซ้อม |
| `purpose` | String | `ซ้อมวงดนตรี` | วัตถุประสงค์ |
| `equipment` | String | `แอมป์กีตาร์ x2, คีย์บอร์ด` | อุปกรณ์เสริม |
| `status` | Enum | `booked` | `booked`, `checked_in`, `completed`, `cancelled`, `no_show` |
| `created_at` | DateTime | `2026-09-10 22:00:00` | วันเวลาที่ทำรายการ |
| `check_in_at` | DateTime | `2026-09-11 13:05:00` | วันเวลาที่เช็คอิน |
| `check_out_at` | DateTime | `2026-09-11 14:55:00` | วันเวลาที่เช็คเอาต์ |
| `cancel_reason`| String | `ติดสอบปฏิบัติ` | เหตุผลการยกเลิก |

#### 3.3 แท็บ `Admins` (ผู้ดูแลระบบ)
| คอลัมน์ | ชนิดข้อมูล | คำอธิบาย |
| :--- | :--- | :--- |
| `admin_id` | String (PK) | รหัสแอดมิน |
| `username` | String (Unique) | ชื่อผู้ใช้เข้าสู่ระบบ (เช่น `admin`) |
| `password_hash` | String | แฮชรหัสผ่าน (SHA-256 + Salt) |
| `salt` | String | Salt ป้องกัน Rainbow table |
| `display_name` | String | ชื่อแสดงในระบบ |
| `role` | Enum | `super_admin` หรือ `staff` |
| `is_active` | Boolean String | สถานะการอนุญาต |
| `last_login_at`| DateTime | วันเวลาที่เข้าสู่ระบบล่าสุด |

#### 3.4 แท็บ `EmailRecipients` (รายชื่อรับแจ้งเตือน)
| คอลัมน์ | ชนิดข้อมูล | คำอธิบาย |
| :--- | :--- | :--- |
| `recipient_id` | String (PK) | รหัสผู้รับ |
| `name` | String | ชื่อ-นามสกุล อาจารย์/กรรมการ |
| `email` | String | ที่อยู่อีเมล |
| `role` | String | `อาจารย์ที่ปรึกษา` หรือ `กรรมการชมรม` |
| `notify_new_booking` | Boolean String | รับแจ้งเตือนเมื่อมีคนจอง |
| `notify_no_show` | Boolean String | รับแจ้งเตือนเมื่อมีคนผิดนัด |
| `notify_weekly_digest` | Boolean String | รับสรุปสัปดาห์ |
| `is_active` | Boolean String | สถานะการส่ง |

#### 3.5 แท็บ `Settings` (การตั้งค่าระบบ)
ตาราง Key-Value เก็บพารามิเตอร์ระบบ เช่น `operating_hours_weekday`, `min_booking_minutes`, `max_booking_hours`, `advance_booking_days`, `grace_period_minutes`, `system_status`, `announcement_text`

#### 3.6 แท็บ `Blackouts` (วันปิดปรับปรุง/วันหยุด)
เก็บช่วงวัน (`date_from`, `date_to`) และเหตุผลที่ปิดให้บริการ

#### 3.7 แท็บ `Logs` (Audit Trail)
บันทึกประวัติการกระทำ (`log_id`, `timestamp`, `actor_type`, `actor_name`, `action`, `target_type`, `target_id`, `detail_json`, `user_agent`, `ip_hash`)

---

### 4. สรุปรายการคำขอ API (API Specification)

| Action | สิทธิ์ | คำอธิบาย |
| :--- | :--- | :--- |
| `getPublicState` | สาธารณะ | ดึงข้อมูลห้อง, ตารางการจองของวันที่เลือก (Masked PDPA) และการตั้งค่า |
| `checkAvailability` | สาธารณะ | ตรวจสอบความว่างของห้องในช่วงเวลาที่กำหนด |
| `createBooking` | สาธารณะ | จองห้องซ้อมดนตรี (มี Lock ป้องกันแย่งคิว + ส่งอีเมล) |
| `lookupBooking` | สาธารณะ | ตรวจสอบสถานะการจองด้วยรหัสคิวและชื่อ |
| `checkIn` | สาธารณะ | เช็คอินเข้าห้องซ้อมดนตรี |
| `checkOut` | สาธารณะ | เช็คเอาต์และคืนห้องซ้อม |
| `cancelBooking` | สาธารณะ | ยกเลิกคิวการจองโดยผู้ใช้งาน |
| `adminLogin` | สาธารณะ | ยืนยันตัวตนแอดมินและออก Session Token |
| `adminLogout` | แอดมิน | ยกเลิกเซสชัน |
| `adminGetDashboard`| แอดมิน | ดึงสถิติ KPI, 30-Day Trend, Heatmap และ Demographics |
| `adminListBookings` | แอดมิน | ค้นหาและกรองรายการจองทั้งหมด |
| `adminUpdateBooking`| แอดมิน | แก้ไขสถานะการจองหรือหมายเหตุ |
| `adminForceCheckout`| แอดมิน | บังคับคืนห้อง |
| `adminGetLogs` | แอดมิน | ดึงประวัติ Audit Trail |
| `adminCrudRecipients`| แอดมิน | เพิ่ม/ลบ/แก้ไข รายชื่ออีเมลอาจารย์ที่ปรึกษา |
| `adminUpdateSettings`| แอดมิน | ปรับแต่งค่าตั้งระบบ |
| `adminExportCSV` | แอดมิน | ส่งออกไฟล์ CSV สำหรับทำรายงาน |
| `adminSendTestEmail`| แอดมิน | ส่งอีเมลทดสอบระบบ |