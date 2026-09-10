/**
 * ==============================================================================
 * ระบบจองห้องซ้อมดนตรี ชมรมดนตรี วทก.
 * ไฟล์: 03_Validation.gs
 * คำอธิบาย: โมดูลตรวจสอบความถูกต้องของข้อมูล (Validation & Sanitization)
 *           - ป้องกัน Formula Injection ใน Google Sheets (=, +, -, @)
 *           - ตรวจสอบรูปแบบวันที่, เวลา, ชั้นปี, สาขา, ชื่อ-นามสกุล
 *           - ฟังก์ชันย่อชื่อ (Mask Name) เพื่อความเป็นส่วนตัว (PDPA)
 * ==============================================================================
 */

/**
 * ทำความสะอาดข้อความเพื่อป้องกัน Formula Injection และตัดช่องว่างส่วนเกิน
 * หากขึ้นต้นด้วย =, +, -, @ จะเติม Single Quote (') นำหน้า
 * @param {*} val ข้อความนำเข้า
 * @returns {string} ข้อความที่ปลอดภัย
 */
function sanitizeInput(val) {
  if (val === null || typeof val === "undefined") {
    return "";
  }
  var str = String(val).trim();
  if (str.length > 0) {
    var firstChar = str.charAt(0);
    if (firstChar === "=" || firstChar === "+" || firstChar === "-" || firstChar === "@") {
      str = "'" + str;
    }
  }
  return str;
}

/**
 * แปลงสตริงเวลา 'HH:mm' หรือ Date เป็นจำนวนนาทีนับจากเที่ยงคืน
 * @param {string|Date} timeVal เช่น "08:30" หรือ Date object
 * @returns {number} เช่น 510
 */
function timeToMinutes(timeVal) {
  if (!timeVal) return -1;
  if (timeVal instanceof Date) {
    return timeVal.getHours() * 60 + timeVal.getMinutes();
  }
  var timeStr = String(timeVal).trim();
  // หากเป็นสตริงรูปแบบยาวที่มีเครื่องหมาย :
  var parts = timeStr.split(":");
  if (parts.length >= 2) {
    // ดึงเฉพาะตัวเลขชั่วโมงและนาที
    var hStr = parts[0].replace(/[^0-9]/g, "");
    var mStr = parts[1].replace(/[^0-9]/g, "");
    if (hStr.length > 2) hStr = hStr.slice(-2);
    if (mStr.length > 2) mStr = mStr.slice(0, 2);
    var hours = parseInt(hStr, 10);
    var minutes = parseInt(mStr, 10);
    if (!isNaN(hours) && !isNaN(minutes) && hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59) {
      return hours * 60 + minutes;
    }
  }
  return -1;
}

/**
 * แปลงค่าเวลาใดๆ ให้เป็นสตริงมาตรฐาน 'HH:mm' เสมอ
 * @param {*} timeVal Date object หรือ สตริงเวลา
 * @returns {string} เช่น "16:00"
 */
function formatTimeToHHmm(timeVal) {
  if (!timeVal) return "";
  if (timeVal instanceof Date) {
    var h = ("0" + timeVal.getHours()).slice(-2);
    var m = ("0" + timeVal.getMinutes()).slice(-2);
    return h + ":" + m;
  }
  var s = String(timeVal).trim();
  if (s.indexOf(":") !== -1) {
    var parts = s.split(":");
    if (parts.length >= 2) {
      var h2 = parts[0].replace(/[^0-9]/g, "");
      var m2 = parts[1].replace(/[^0-9]/g, "");
      if (h2.length > 2) h2 = h2.slice(-2);
      if (m2.length > 2) m2 = m2.slice(0, 2);
      if (h2.length > 0 && m2.length > 0) {
        return ("0" + h2).slice(-2) + ":" + ("0" + m2).slice(-2);
      }
    }
  }
  return s;
}

/**
 * แปลงจำนวนนาทีเป็นสตริงเวลา 'HH:mm'
 * @param {number} totalMinutes เช่น 510
 * @returns {string} เช่น "08:30"
 */
function minutesToTime(totalMinutes) {
  var hours = Math.floor(totalMinutes / 60);
  var minutes = totalMinutes % 60;
  var hh = hours < 10 ? "0" + hours : String(hours);
  var mm = minutes < 10 ? "0" + minutes : String(minutes);
  return hh + ":" + mm;
}

/**
 * ย่อชื่อ-นามสกุลเพื่อคุ้มครองข้อมูลส่วนบุคคล (PDPA)
 * ตัวอย่าง: "นายสมชาย ใจดี" -> "สมชาย จ."
 * @param {string} fullName ชื่อเต็ม
 * @returns {string} ชื่อที่ย่อแล้ว
 */
function maskName(fullName) {
  if (!fullName || typeof fullName !== "string") {
    return "ผู้ใช้งาน";
  }
  var cleaned = fullName.trim();
  // ตัดคำนำหน้านามทั่วไปออก
  var titles = ["นาย", "นางสาว", "นาง", "อาจารย์", "ดร.", "ผศ.", "รศ."];
  for (var i = 0; i < titles.length; i++) {
    if (cleaned.indexOf(titles[i]) === 0) {
      cleaned = cleaned.substring(titles[i].length).trim();
      break;
    }
  }

  var parts = cleaned.split(/\s+/);
  if (parts.length === 1) {
    return parts[0];
  }
  var firstName = parts[0];
  var lastName = parts[parts.length - 1];
  var initial = lastName.charAt(0);
  return firstName + " " + initial + ".";
}

/**
 * ตรวจสอบความถูกต้องของข้อมูลการจองห้องซ้อม (Create Booking Payload)
 * @param {Object} payload ข้อมูลที่ส่งมาจากหน้าบ้าน
 * @returns {{isValid: boolean, errors: Array<string>, sanitized: Object}}
 */
function validateBookingPayload(payload) {
  var errors = [];
  var sanitized = {};

  if (!payload || typeof payload !== "object") {
    return { isValid: false, errors: ["ข้อมูลคำขอไม่ถูกต้อง"], sanitized: {} };
  }

  // 1. ตรวจสอบ Honeypot field (_hp หรือ website) หากมีค่าให้ถือเป็นบอท
  if (payload._hp || payload.website) {
    return { isValid: false, errors: ["SPAM_DETECTED"], sanitized: {} };
  }

  // 2. ชื่อ-นามสกุล
  var fullName = sanitizeInput(payload.full_name);
  if (!fullName || fullName.length < 3) {
    errors.push("กรุณาระบุชื่อ-นามสกุลจริงอย่างน้อย 3 ตัวอักษร");
  } else if (fullName.length > 100) {
    errors.push("ชื่อ-นามสกุลยาวเกิน 100 ตัวอักษร");
  }
  sanitized.full_name = fullName;

  // 3. ชั้นปี
  var validYears = ["ปี 1", "ปี 2", "ปี 3", "ปี 4", "บุคลากร"];
  var studentYear = sanitizeInput(payload.student_year);
  if (validYears.indexOf(studentYear) === -1) {
    errors.push("ชั้นปีไม่ถูกต้อง กรุณาเลือก: " + validYears.join(", "));
  }
  sanitized.student_year = studentYear;

  // 4. สาขาวิชา
  var major = sanitizeInput(payload.major);
  if (!major || major.length < 2) {
    errors.push("กรุณาระบุสาขาวิชา");
  }
  sanitized.major = major;

  // 5. รหัสห้อง
  var roomId = sanitizeInput(payload.room_id);
  if (!roomId) {
    errors.push("กรุณาระบุห้องซ้อม");
  }
  sanitized.room_id = roomId;

  // 6. วันที่จอง (YYYY-MM-DD)
  var dateStr = sanitizeInput(payload.booking_date);
  var dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(dateStr)) {
    errors.push("รูปแบบวันที่ไม่ถูกต้อง (ต้องเป็น YYYY-MM-DD)");
  }
  sanitized.booking_date = dateStr;

  // 7. เวลาเริ่ม และ เวลาสิ้นสุด (HH:mm)
  var startTime = sanitizeInput(payload.start_time);
  var endTime = sanitizeInput(payload.end_time);
  var startMins = timeToMinutes(startTime);
  var endMins = timeToMinutes(endTime);

  if (startMins === -1) {
    errors.push("รูปแบบเวลาเริ่มต้นไม่ถูกต้อง (ต้องเป็น HH:mm)");
  }
  if (endMins === -1) {
    errors.push("รูปแบบเวลาสิ้นสุดไม่ถูกต้อง (ต้องเป็น HH:mm)");
  }
  if (startMins !== -1 && endMins !== -1) {
    if (startMins >= endMins) {
      errors.push("เวลาสิ้นสุดต้องมากกว่าเวลาเริ่มต้น");
    }
  }
  sanitized.start_time = startTime;
  sanitized.end_time = endTime;

  // 8. จำนวนคน (Party Size)
  var partySize = parseInt(payload.party_size, 10);
  if (isNaN(partySize) || partySize < 1 || partySize > 50) {
    errors.push("จำนวนผู้ใช้งานต้องเป็นตัวเลขตั้งแต่ 1 ถึง 50 คน");
  }
  sanitized.party_size = partySize;

  // 9. วัตถุประสงค์
  var purpose = sanitizeInput(payload.purpose);
  if (!purpose) {
    errors.push("กรุณาระบุวัตถุประสงค์การใช้งาน");
  }
  sanitized.purpose = purpose;

  // 10. ฟิลด์เสริม: เบอร์โทร, อีเมล, อุปกรณ์
  sanitized.phone = sanitizeInput(payload.phone || "");
  var email = sanitizeInput(payload.email || "");
  if (email) {
    var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      errors.push("รูปแบบอีเมลไม่ถูกต้อง");
    }
  }
  sanitized.email = email;
  sanitized.equipment = sanitizeInput(payload.equipment || "");

  return {
    isValid: errors.length === 0,
    errors: errors,
    sanitized: sanitized
  };
}
