/**
 * ==============================================================================
 * ระบบจองห้องซ้อมดนตรี ชมรมดนตรี วทก.
 * ไฟล์: 04_BookingService.gs
 * คำอธิบาย: บริการประมวลผลหลักด้านการจองห้องซ้อม (Core Business Logic)
 *           - ตรวจสอบการจองชนกัน (Overlap Logic) ภายใต้ LockService
 *           - สร้างรหัสจองรูปแบบ MB-YYMM-XXXX (ไม่ใช้อักขระสับสน)
 *           - กติกา: เวลาทำการ, ความยาวจอง, จองล่วงหน้า, โควตาต่อคน/วัน
 *           - ฟังก์ชัน เช็คอิน, เช็คเอาต์, ยกเลิกคิว, ค้นหาคิว, ดึง Public State
 *           - ส่งการแจ้งเตือนอีเมลอัตโนมัติเมื่อเกิดกิจกรรม
 * ==============================================================================
 */

/**
 * สร้างรหัสจองแบบสั้น รูปแบบ MB-YYMM-XXXX
 * อักขระสุ่มเลือกจากชุดที่ไม่สับสน (ไม่ใช้ 0, 1, I, O)
 * @returns {string} เช่น "MB-2609-A3F7"
 */
function generateBookingCode() {
  var now = new Date();
  var yy = Utilities.formatDate(now, Session.getScriptTimeZone() || "GMT+7", "yy");
  var mm = Utilities.formatDate(now, Session.getScriptTimeZone() || "GMT+7", "MM");
  
  // ชุดตัวอักษรที่ตัดตัวสับสนออก
  var chars = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
  var randomPart = "";
  for (var i = 0; i < 4; i++) {
    var idx = Math.floor(Math.random() * chars.length);
    randomPart += chars.charAt(idx);
  }

  return "MB-" + yy + mm + "-" + randomPart;
}

/**
 * ฟังก์ชันตรวจสอบช่วงเวลาซ้อนทับกัน (Overlap Detection)
 * กติกา: ถือว่าชนเมื่อ newStart < oldEnd && newEnd > oldStart
 *        และสถานะเป็น 'booked' หรือ 'checked_in'
 * ห้ามใช้ <= หรือ >= เด็ดขาด เพื่อให้สามารถจองต่อคิวชนขอบเวลาได้
 * @param {string} roomId รหัสห้อง
 * @param {string} dateStr วันที่ (YYYY-MM-DD)
 * @param {string} startTime เวลาเริ่มใหม่ (HH:mm)
 * @param {string} endTime เวลาสิ้นสุดใหม่ (HH:mm)
 * @param {string} [excludeBookingId] รหัสจองที่ต้องการยกเว้น (กรณีแก้ไข)
 * @returns {boolean} true ถ้าชน (ไม่ว่าง), false ถ้าว่าง
 */
function isOverlapping(roomId, dateStr, startTime, endTime, excludeBookingId) {
  var newStartMins = timeToMinutes(startTime);
  var newEndMins = timeToMinutes(endTime);

  if (newStartMins === -1 || newEndMins === -1 || newStartMins >= newEndMins) {
    return true; // เวลาไม่ถูกต้อง ให้ถือว่าไม่สามารถจองได้
  }

  var bookings = getAllRows("Bookings");

  for (var i = 0; i < bookings.length; i++) {
    var b = bookings[i];
    
    // กรองเฉพาะการจองของห้องเดียวกัน และวันที่เดียวกัน
    if (String(b.room_id).trim() !== String(roomId).trim()) {
      continue;
    }
    
    var bDateStr = formatDateToString(b.booking_date);
    if (bDateStr !== dateStr) {
      continue;
    }

    // ข้ามรายการที่ยกเว้น (ถ้ามี)
    if (excludeBookingId && String(b.booking_id).trim() === String(excludeBookingId).trim()) {
      continue;
    }

    // นับเฉพาะสถานะ pending_approval, booked และ checked_in
    var status = String(b.status).trim().toLowerCase();
    if (status !== "pending_approval" && status !== "booked" && status !== "checked_in") {
      continue;
    }

    var oldStartMins = timeToMinutes(String(b.start_time).trim());
    var oldEndMins = timeToMinutes(String(b.end_time).trim());

    if (oldStartMins === -1 || oldEndMins === -1) {
      continue;
    }

    // กฎเหล็ก: newStart < oldEnd && newEnd > oldStart
    if (newStartMins < oldEndMins && newEndMins > oldStartMins) {
      return true; // เกิดการชนกัน
    }
  }

  return false; // ไม่ชน ว่างพร้อมใช้งาน
}

/**
 * ฟังก์ชันช่วยแปลง Date Object หรือ String ใน Sheet ให้เป็นสตริง YYYY-MM-DD
 */
function formatDateToString(val) {
  if (!val) return "";
  if (val instanceof Date) {
    return Utilities.formatDate(val, "Asia/Bangkok", "yyyy-MM-dd");
  }
  var str = String(val).trim();
  if (str.length >= 10) {
    return str.substring(0, 10);
  }
  return str;
}

/**
 * ตรวจสอบความพร้อมของห้องในช่วงเวลาที่กำหนด (Check Availability)
 * @param {string} roomId รหัสห้อง
 * @param {string} dateStr วันที่ (YYYY-MM-DD)
 * @param {string} startTime เวลาเริ่ม (HH:mm)
 * @param {string} endTime เวลาจบ (HH:mm)
 * @returns {{available: boolean, reason?: string}}
 */
function checkAvailability(roomId, dateStr, startTime, endTime) {
  // 1. ตรวจสอบว่าห้องมีอยู่จริงและเปิดใช้งาน
  var room = findRowById("Rooms", "room_id", roomId);
  if (!room) {
    // Graceful fallback สำหรับระบบห้องเดี่ยว หรือกรณี sheet เป็น ROOM-A / ROOM-01
    var allRooms = getAllRows("Rooms");
    if (allRooms.length > 0) {
      room = allRooms[0];
      roomId = room.room_id;
    }
  }
  if (!room || String(room.is_active).toUpperCase() !== "TRUE") {
    return { available: false, reason: "ห้องซ้อมนี้ไม่เปิดให้บริการ" };
  }

  // 2. ตรวจสอบ Blackout
  if (isBlackoutDate(dateStr, roomId)) {
    return { available: false, reason: "ห้องซ้อมปิดให้บริการหรือปิดปรับปรุงในวันดังกล่าว" };
  }

  // 3. ตรวจสอบเวลาทำการ
  var hoursCheck = validateOperatingHours(dateStr, startTime, endTime);
  if (!hoursCheck.isValid) {
    return { available: false, reason: hoursCheck.message };
  }

  // 4. ตรวจสอบความยาวการจอง
  var durationCheck = validateDuration(startTime, endTime);
  if (!durationCheck.isValid) {
    return { available: false, reason: durationCheck.message };
  }

  // 5. ตรวจสอบ Overlap
  var overlap = isOverlapping(roomId, dateStr, startTime, endTime);
  if (overlap) {
    return { available: false, reason: "ช่วงเวลานี้มีผู้จองไว้แล้ว" };
  }

  return { available: true };
}

/**
 * ตรวจสอบว่าวันที่และห้องนั้นตรงกับ Blackout หรือไม่
 */
function isBlackoutDate(dateStr, roomId) {
  var blackouts = getAllRows("Blackouts");
  for (var i = 0; i < blackouts.length; i++) {
    var b = blackouts[i];
    var fromStr = formatDateToString(b.date_from);
    var toStr = formatDateToString(b.date_to);
    var targetRoom = String(b.room_id || "").trim();

    if (dateStr >= fromStr && dateStr <= toStr) {
      if (!targetRoom || targetRoom === roomId) {
        return true;
      }
    }
  }
  return false;
}

/**
 * ตรวจสอบเวลาทำการตามวันธรรมดา/วันหยุด
 */
function validateOperatingHours(dateStr, startTime, endTime) {
  var settings = getSettingsMap();
  var dateObj = new Date(dateStr + "T00:00:00");
  var dayOfWeek = dateObj.getDay(); // 0 = อาทิตย์, 6 = เสาร์
  var isWeekend = (dayOfWeek === 0 || dayOfWeek === 6);

  var operatingStr = isWeekend 
    ? (settings.operating_hours_weekend || "09:00-18:00") 
    : (settings.operating_hours_weekday || "08:00-20:00");

  var parts = operatingStr.split("-");
  if (parts.length !== 2) {
    parts = ["08:00", "20:00"];
  }

  var opOpen = timeToMinutes(parts[0]);
  var opClose = timeToMinutes(parts[1]);
  var startMins = timeToMinutes(startTime);
  var endMins = timeToMinutes(endTime);

  if (startMins < opOpen || endMins > opClose) {
    return {
      isValid: false,
      message: "เวลาที่เลือกอยู่นอกเวลาทำการ (" + operatingStr + " น.)"
    };
  }

  return { isValid: true };
}

/**
 * ตรวจสอบระยะเวลาจองขั้นต่ำและสูงสุด
 */
function validateDuration(startTime, endTime) {
  var settings = getSettingsMap();
  var minMins = parseInt(settings.min_booking_minutes || "30", 10);
  var maxHours = parseFloat(settings.max_booking_hours || "3");
  var maxMins = maxHours * 60;

  var duration = timeToMinutes(endTime) - timeToMinutes(startTime);
  if (duration < minMins) {
    return { isValid: false, message: "ระยะเวลาจองขั้นต่ำต้องไม่น้อยกว่า " + minMins + " นาที" };
  }
  if (duration > maxMins) {
    return { isValid: false, message: "ระยะเวลาจองต่อครั้งต้องไม่เกิน " + maxHours + " ชั่วโมง" };
  }

  return { isValid: true };
}

/**
 * ฟังก์ชันสร้างการจองใหม่ (Create Booking)
 * ครอบด้วย withLock() และ re-check overlap ซ้ำภายใน lock เพื่อป้องกัน Race Condition
 * @param {Object} rawPayload
 * @param {Object} context ข้อมูลเสริม { userAgent, ipHash }
 * @returns {Object} ผลลัพธ์การจอง
 */
function createBooking(rawPayload, context) {
  var validation = validateBookingPayload(rawPayload);
  if (!validation.isValid) {
    throw new Error(validation.errors.join(", "));
  }

  var payload = validation.sanitized;
  var settings = getSettingsMap();

  // 1. ตรวจสอบสถานะระบบว่าเปิดให้บริการหรือไม่
  if (settings.system_status && settings.system_status.toLowerCase() === "maintenance") {
    throw new Error(settings.system_closed_message || "ระบบปิดปรับปรุงชั่วคราว ไม่สามารถทำการจองได้");
  }

  // 2. ตรวจสอบการจองล่วงหน้าไม่เกินจำนวนวันที่ตั้งค่าไว้
  var maxAdvanceDays = parseInt(settings.advance_booking_days || "14", 10);
  var todayStr = Utilities.formatDate(new Date(), Session.getScriptTimeZone() || "GMT+7", "yyyy-MM-dd");
  var todayObj = new Date(todayStr + "T00:00:00");
  var targetDateObj = new Date(payload.booking_date + "T00:00:00");
  var diffDays = Math.round((targetDateObj.getTime() - todayObj.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    throw new Error("ไม่อนุญาตให้จองวันที่ผ่านมาแล้ว");
  }
  if (diffDays > maxAdvanceDays) {
    throw new Error("สามารถจองล่วงหน้าได้ไม่เกิน " + maxAdvanceDays + " วัน");
  }

  // 3. ตรวจสอบการจองเวลาย้อนหลังของวันปัจจุบัน
  if (diffDays === 0) {
    var currentTimeStr = Utilities.formatDate(new Date(), Session.getScriptTimeZone() || "GMT+7", "HH:mm");
    var currentMins = timeToMinutes(currentTimeStr);
    var startMins = timeToMinutes(payload.start_time);
    if (startMins <= currentMins) {
      throw new Error("ไม่สามารถจองช่วงเวลาที่เริ่มต้นผ่านมาแล้วในวันปัจจุบันได้");
    }
  }

  // 4. ตรวจสอบ Blackout
  if (isBlackoutDate(payload.booking_date, payload.room_id)) {
    throw new Error("ห้องซ้อมปิดให้บริการหรือปิดปรับปรุงในวันดังกล่าว");
  }

  // 5. ตรวจสอบเวลาทำการ และ ความยาวการจอง
  var hoursCheck = validateOperatingHours(payload.booking_date, payload.start_time, payload.end_time);
  if (!hoursCheck.isValid) {
    throw new Error(hoursCheck.message);
  }
  var durationCheck = validateDuration(payload.start_time, payload.end_time);
  if (!durationCheck.isValid) {
    throw new Error(durationCheck.message);
  }

  // 6. ตรวจสอบโควตาต่อคนต่อวัน (ชื่อเดียวกันจองได้ไม่เกินโควตา)
  var maxBookingsPerDay = parseInt(settings.max_bookings_per_user_day || "2", 10);
  var userBookingsToday = findRowsByCondition("Bookings", function(row) {
    var bDateStr = formatDateToString(row.booking_date);
    var isSameUser = String(row.full_name).trim().toLowerCase() === payload.full_name.toLowerCase();
    var activeStatus = (row.status === "pending_approval" || row.status === "booked" || row.status === "checked_in");
    return (bDateStr === payload.booking_date && isSameUser && activeStatus);
  });

  if (userBookingsToday.length >= maxBookingsPerDay) {
    throw new Error("คุณ (" + payload.full_name + ") ได้ทำการจองครบโควตาสูงสุด " + maxBookingsPerDay + " ครั้งสำหรับวันนี้แล้ว");
  }

  // 7. บันทึกข้อมูลลงฐานข้อมูลภายใต้ LockService (ครอบเฉพาะส่วนฐานข้อมูลเพื่อปลด Lock ให้เร็วที่สุด)
  var createdBooking = withLock(function() {
    // Re-check overlap ซ้ำอีกครั้งข้างใน Lock อย่างเคร่งครัด
    var overlap = isOverlapping(payload.room_id, payload.booking_date, payload.start_time, payload.end_time);
    if (overlap) {
      throw new Error("ขออภัย ช่วงเวลานี้เพิ่งถูกจองตัดหน้าไป กรุณาเลือกเวลาอื่น");
    }

    var bookingId = Utilities.getUuid();
    var bookingCode = generateBookingCode();
    var now = new Date();

    var newBookingRow = {
      booking_id: bookingId,
      booking_code: bookingCode,
      room_id: payload.room_id,
      booking_date: payload.booking_date,
      start_time: formatTimeToHHmm(payload.start_time),
      end_time: formatTimeToHHmm(payload.end_time),
      full_name: payload.full_name,
      student_year: payload.student_year,
      major: payload.major,
      phone: payload.phone || "",
      email: payload.email || "",
      party_size: payload.party_size,
      purpose: payload.purpose,
      equipment: payload.equipment || "",
      status: "pending_approval",
      created_at: now,
      checkin_at: "",
      checkout_at: "",
      cancelled_at: "",
      cancel_reason: "",
      admin_note: "",
      updated_at: now,
      updated_by: "public"
    };

    appendRow("Bookings", newBookingRow);
    return newBookingRow;
  });

  // บันทึก Log ภายนอก LockService
  try {
    writeLog(
      "public",
      payload.full_name,
      "CREATE_BOOKING",
      "BOOKING",
      createdBooking.booking_code,
      {
        room_id: payload.room_id,
        date: payload.booking_date,
        time: payload.start_time + "-" + payload.end_time,
        party_size: payload.party_size,
        status: "pending_approval"
      },
      context ? context.userAgent : "",
      context ? context.ipHash : ""
    );
  } catch (logErr) {
    Logger.log("writeLog error: " + logErr.message);
  }

  // ส่งอีเมลแจ้งเตือนภายนอก LockService (Non-blocking)
  // 1. ส่งอีเมลแจ้ง "อยู่ระหว่างรออนุมัติ" ให้ผู้จอง (Priority #1) - ยังไม่ส่งรหัสผ่านห้อง
  if (createdBooking.email) {
    try {
      sendBookingPendingToUser(createdBooking);
    } catch (userMailErr) {
      Logger.log("ไม่สามารถส่งเมลแจ้งรออนุมัติถึงผู้จอง: " + userMailErr.message);
      try {
        writeLog("system", "Mailer", "USER_MAIL_ERROR", "MAIL", createdBooking.booking_code, userMailErr.message);
      } catch (logErr1) {}
    }
  }

  // 2. ส่งอีเมลแจ้งเตือนผู้ดูแลระบบ (แยก try-catch เด็ดขาด ป้องกันไม่ให้กระทบเมลผู้จอง)
  try {
    sendNewBookingNotificationToAdmins(createdBooking);
  } catch (adminMailErr) {
    Logger.log("ไม่สามารถส่งเมลแจ้งเตือนแอดมิน: " + adminMailErr.message);
    try {
      writeLog("system", "Mailer", "ADMIN_MAIL_ERROR", "MAIL", createdBooking.booking_code, adminMailErr.message);
    } catch (logErr2) {}
  }

  return {
    booking_id: createdBooking.booking_id,
    booking_code: createdBooking.booking_code,
    room_id: createdBooking.room_id,
    booking_date: createdBooking.booking_date,
    start_time: formatTimeToHHmm(createdBooking.start_time),
    end_time: formatTimeToHHmm(createdBooking.end_time),
    full_name: createdBooking.full_name,
    status: createdBooking.status,
    created_at: createdBooking.created_at
  };
}

/**
 * ดึงสถานะห้องและการจองสำหรับหน้า Public Dashboard
 * - ไม่เปิดเผย phone, email, admin_note
 * - ย่อชื่อผู้จองเมื่อ privacy_mode เป็น true
 * @param {string} targetDate วันที่ (YYYY-MM-DD)
 * @returns {Object} { rooms: [], bookings: [], settings: {}, blackouts: [] }
 */
function getPublicState(targetDate) {
  var now = new Date();
  var dateStr = targetDate || Utilities.formatDate(now, Session.getScriptTimeZone() || "GMT+7", "yyyy-MM-dd");
  var settings = getSettingsMap();
  var isPrivacy = (String(settings.privacy_mode).toLowerCase() === "true");

  // 1. ดึงห้องทั้งหมดที่ Active และเรียงลำดับตาม sort_order
  var allRooms = getAllRows("Rooms");
  var activeRooms = [];
  for (var i = 0; i < allRooms.length; i++) {
    var r = allRooms[i];
    if (String(r.is_active).toUpperCase() === "TRUE") {
      activeRooms.push({
        room_id: r.room_id,
        room_name: r.room_name,
        capacity: parseInt(r.capacity, 10) || 1,
        equipment_list: r.equipment_list || "",
        color_hex: r.color_hex || "#1B7A8C",
        sort_order: parseInt(r.sort_order, 10) || 1,
        image_url: r.image_url || ""
      });
    }
  }
  activeRooms.sort(function(a, b) { return a.sort_order - b.sort_order; });

  // 2. ดึงการจองของวันที่เลือก (ไม่ส่งเบอร์โทร/อีเมลออกสาธารณะ)
  var allBookings = getAllRows("Bookings");
  var dayBookings = [];
  for (var j = 0; j < allBookings.length; j++) {
    var b = allBookings[j];
    var bDateStr = formatDateToString(b.booking_date);
    if (bDateStr === dateStr) {
      var displayName = isPrivacy ? maskName(String(b.full_name)) : String(b.full_name);
      dayBookings.push({
        booking_id: b.booking_id,
        booking_code: b.booking_code,
        room_id: b.room_id,
        booking_date: bDateStr,
        start_time: formatTimeToHHmm(b.start_time),
        end_time: formatTimeToHHmm(b.end_time),
        full_name: displayName,
        student_year: b.student_year,
        major: b.major,
        party_size: b.party_size,
        purpose: b.purpose,
        status: b.status,
        created_at: b.created_at
      });
    }
  }

  // 3. Blackouts ของวันที่เลือก
  var allBlackouts = getAllRows("Blackouts");
  var dayBlackouts = [];
  for (var k = 0; k < allBlackouts.length; k++) {
    var bo = allBlackouts[k];
    var fromStr = formatDateToString(bo.date_from);
    var toStr = formatDateToString(bo.date_to);
    if (dateStr >= fromStr && dateStr <= toStr) {
      dayBlackouts.push({
        id: bo.id,
        date_from: fromStr,
        date_to: toStr,
        room_id: bo.room_id || "",
        reason: bo.reason
      });
    }
  }

  // 4. รายชื่อหลักสูตรและสาขาวิชา (ดึงจาก Settings หรือใช้ค่าเริ่มต้นมาตรฐาน วทก.)
  var defaultMajors = [
    "หลักสูตรการแพทย์แผนไทยบัณฑิต",
    "หลักสูตรวิทยาศาสตรบัณฑิต สาขาวิชารังสีเทคนิค",
    "หลักสูตรวิทยาศาสตรบัณฑิต สาขาวิชาเทคโนโลยีหัวใจและทรวงอก",
    "หลักสูตรสาธารณสุขศาสตรบัณฑิต สาขาวิชาทันตสาธารณสุข",
    "หลักสูตรสาธารณสุขศาสตรบัณฑิต สาขาวิชาสาธารณสุขชุมชน",
    "หลักสูตรวิทยาศาสตรบัณฑิต สาขาวิชาเวชระเบียน",
    "อาจารย์ / เจ้าหน้าที่ / บุคลากรวิทยาลัย",
    "อื่นๆ / บุคคลภายนอก"
  ];
  var activeMajors = defaultMajors;
  if (settings.majors_list) {
    try {
      var parsed = JSON.parse(settings.majors_list);
      if (Array.isArray(parsed) && parsed.length > 0) {
        activeMajors = parsed;
      }
    } catch (e) {
      var splitArr = String(settings.majors_list).split(",").map(function(s) { return s.trim(); }).filter(Boolean);
      if (splitArr.length > 0) activeMajors = splitArr;
    }
  }

  // 5. ข้อมูลการตั้งค่าที่อนุญาตให้ Public ทราบ
  var publicSettings = {
    operating_hours_weekday: settings.operating_hours_weekday || "08:00-20:00",
    operating_hours_weekend: settings.operating_hours_weekend || "09:00-18:00",
    min_booking_minutes: parseInt(settings.min_booking_minutes || "30", 10),
    max_booking_hours: parseFloat(settings.max_booking_hours || "3"),
    advance_booking_days: parseInt(settings.advance_booking_days || "14", 10),
    grace_period_minutes: parseInt(settings.grace_period_minutes || "30", 10),
    privacy_mode: isPrivacy,
    system_status: settings.system_status || "open",
    announcement_text: settings.announcement_text || "",
    contact_info: settings.contact_info || "",
    majors: activeMajors
  };

  return {
    selected_date: dateStr,
    rooms: activeRooms,
    bookings: dayBookings,
    settings: publicSettings,
    blackouts: dayBlackouts,
    server_time: new Date()
  };
}

/**
 * ค้นหาข้อมูลการจองด้วย booking_code และ full_name
 */
function lookupBooking(bookingCode, fullName) {
  var code = String(bookingCode || "").trim().toUpperCase();
  var name = fullName ? String(fullName).trim() : "";

  if (!code) {
    throw new Error("กรุณากรอกรหัสการจอง");
  }

  var row = findRowById("Bookings", "booking_code", code);
  if (!row) {
    throw new Error("ไม่พบข้อมูลการจองที่ตรงกับรหัส " + code);
  }

  // หากระบุชื่อมาด้วย ให้ตรวจสอบความถูกต้อง
  if (name) {
    var rowName = String(row.full_name || "").trim().toLowerCase();
    var inputName = name.toLowerCase();
    if (rowName !== inputName && rowName.indexOf(inputName) === -1 && inputName.indexOf(rowName) === -1) {
      throw new Error("ชื่อ-นามสกุลไม่ตรงกับรหัสการจองนี้");
    }
  }

  return {
    booking_id: row.booking_id,
    booking_code: row.booking_code,
    room_id: row.room_id,
    booking_date: formatDateToString(row.booking_date),
    start_time: formatTimeToHHmm(row.start_time),
    end_time: formatTimeToHHmm(row.end_time),
    full_name: row.full_name,
    student_year: row.student_year,
    major: row.major,
    phone: row.phone,
    email: row.email,
    party_size: row.party_size,
    purpose: row.purpose,
    equipment: row.equipment,
    status: row.status,
    created_at: row.created_at,
    checkin_at: row.checkin_at,
    checkout_at: row.checkout_at
  };
}

/**
 * ดำเนินการเช็คอิน (Check-in)
 * กติกา: ต้องมี booking_code + full_name ตรงกัน
 *        และอยู่ในช่วงเช็คอิน (15 นาทีก่อนเริ่ม ถึง 30 นาทีหลังเริ่ม)
 */
function checkIn(bookingCode, fullName, context) {
  var booking = lookupBooking(bookingCode, fullName);
  
  if (booking.status === "pending_approval") {
    throw new Error("คิวนี้อยู่ระหว่างรอผู้ดูแลระบบอนุมัติ ยังไม่สามารถเช็คอินได้");
  }
  if (booking.status === "checked_in") {
    throw new Error("คิวนี้ได้ทำการเช็คอินไปแล้วเมื่อ " + booking.checkin_at);
  }
  if (booking.status === "checked_out") {
    throw new Error("คิวนี้ได้สิ้นสุดการใช้งานและเช็คเอาต์ไปแล้ว");
  }
  if (booking.status === "cancelled") {
    throw new Error("คิวนี้ถูกยกเลิกแล้ว ไม่สามารถเช็คอินได้");
  }
  if (booking.status === "no_show") {
    throw new Error("คิวนี้ถูกตัดสิทธิ์ No-show เนื่องจากเลยเวลาเช็คอินที่กำหนดแล้ว");
  }

  var now = new Date();
  var todayStr = Utilities.formatDate(now, Session.getScriptTimeZone() || "GMT+7", "yyyy-MM-dd");
  if (booking.booking_date !== todayStr) {
    throw new Error("ยังไม่ถึงวันที่จอง คิวของคุณคือวันที่ " + booking.booking_date + " (วันนี้คือวันที่ " + todayStr + ")");
  }

  var currentMins = timeToMinutes(Utilities.formatDate(now, Session.getScriptTimeZone() || "GMT+7", "HH:mm"));
  var startMins = timeToMinutes(booking.start_time);
  var settings = getSettingsMap();
  var gracePeriod = parseInt(settings.grace_period_minutes || "30", 10);

  // เช็คอินได้ตั้งแต่ 15 นาทีก่อนเริ่ม
  if (currentMins < startMins - 15) {
    throw new Error("ยังไม่ถึงเวลาเช็คอิน (รอบการจองของคุณคือ " + booking.start_time + " - " + booking.end_time + " น.) สามารถเช็คอินได้ล่วงหน้า 15 นาทีครับ");
  }

  // หากเลย start_time + grace_period ให้ปรับเป็น no_show
  if (currentMins > startMins + gracePeriod) {
    var updatedNs = updateRow("Bookings", "booking_code", booking.booking_code, {
      status: "no_show",
      updated_at: now,
      updated_by: "system"
    });
    writeLog("system", "System Trigger", "MARK_NO_SHOW", "BOOKING", booking.booking_code, "เช็คอินสายเกินกำหนด");
    try {
      sendNoShowNotification(updatedNs || booking);
    } catch (e) {}
    throw new Error("เลยเวลาเช็คอินที่กำหนด (" + gracePeriod + " นาที) ระบบได้ตัดสิทธิ์ No-show เรียบร้อยแล้ว");
  }

  // อัปเดตสถานะเป็น checked_in
  var updated = updateRow("Bookings", "booking_code", booking.booking_code, {
    status: "checked_in",
    checkin_at: now,
    updated_at: now,
    updated_by: "user_checkin"
  });

  writeLog(
    "public",
    booking.full_name,
    "CHECK_IN",
    "BOOKING",
    booking.booking_code,
    { checkin_at: now },
    context ? context.userAgent : "",
    context ? context.ipHash : ""
  );

  // ส่งอีเมลแจ้งเตือน
  try {
    sendCheckInNotification(updated || booking);
  } catch (e) {}

  return {
    success: true,
    message: "เช็คอินสำเร็จ ขอให้มีความสุขกับการซ้อมดนตรีครับ",
    booking: updated
  };
}

/**
 * ดำเนินการเช็คเอาต์ / คืนห้องซ้อม (Check-out)
 * รองรับ:
 * 1) คิวที่กำลังใช้งาน (checked_in) -> บันทึก checkout_at และปรับเป็น checked_out
 * 2) คิวที่ยังไม่ได้เช็คอิน (booked) แต่ผู้ใช้ประสงค์จะคืนห้องหรือสละสิทธิ์ก่อนเวลา -> ปรับเป็นการยกเลิก/คืนห้องว่างทันที
 */
function checkOut(bookingCode, fullName, context) {
  var booking = lookupBooking(bookingCode, fullName);

  // หากสถานะยังเป็น booked ให้แปลงเป็นการคืนห้อง/ยกเลิกคิวก่อนเวลาอัตโนมัติ เพื่อปลดปล่อยสล็อตเวลาให้ผู้อื่น
  if (booking.status === "booked" || booking.status === "confirmed") {
    return cancelBooking(bookingCode, fullName, "ผู้จองประสงค์คืนห้อง/สละสิทธิ์ก่อนเวลา", context);
  }

  if (booking.status !== "checked_in") {
    throw new Error("คิวนี้ไม่ได้อยู่ในสถานะกำลังใช้งาน (สถานะปัจจุบัน: " + booking.status + ")");
  }

  var now = new Date();
  var updated = updateRow("Bookings", "booking_code", booking.booking_code, {
    status: "checked_out",
    checkout_at: now,
    updated_at: now,
    updated_by: "user_checkout"
  });

  writeLog(
    "public",
    booking.full_name,
    "CHECK_OUT",
    "BOOKING",
    booking.booking_code,
    { checkout_at: now },
    context ? context.userAgent : "",
    context ? context.ipHash : ""
  );

  // ส่งอีเมลแจ้งเตือน
  try {
    sendCheckOutNotification(updated || booking);
  } catch (e) {}

  return {
    success: true,
    message: "เช็คเอาต์และคืนห้องซ้อมเรียบร้อยแล้ว ขอบคุณที่ดูแลห้องซ้อมครับ",
    booking: updated
  };
}

/**
 * ยกเลิกการจองโดยผู้ใช้ (Cancel Booking / Early Release)
 * รองรับการยกเลิกคิวที่ยังไม่หมดเวลาซ้อม
 */
function cancelBooking(bookingCode, fullName, cancelReason, context) {
  var booking = lookupBooking(bookingCode, fullName);

  // หากอยู่ในสถานะ checked_in และต้องการยกเลิก ให้ถือเป็นการเช็คเอาต์ออกทันที
  if (booking.status === "checked_in") {
    return checkOut(bookingCode, fullName, context);
  }

  if (booking.status === "cancelled") {
    throw new Error("คิวนี้ถูกยกเลิกไปเรียบร้อยแล้ว");
  }

  if (booking.status === "checked_out") {
    throw new Error("คิวนี้ได้เช็คเอาต์และสิ้นสุดการใช้งานไปแล้ว");
  }

  var now = new Date();
  var todayStr = Utilities.formatDate(now, Session.getScriptTimeZone() || "GMT+7", "yyyy-MM-dd");
  if (booking.booking_date === todayStr) {
    var currentMins = timeToMinutes(Utilities.formatDate(now, Session.getScriptTimeZone() || "GMT+7", "HH:mm"));
    var endMins = timeToMinutes(booking.end_time);
    if (currentMins >= endMins) {
      throw new Error("คิวนี้ได้สิ้นสุดช่วงเวลาการซ้อมไปแล้ว ไม่สามารถยกเลิกได้");
    }
  }

  var updated = updateRow("Bookings", "booking_code", booking.booking_code, {
    status: "cancelled",
    cancelled_at: now,
    cancel_reason: sanitizeInput(cancelReason || "ผู้จองขอยกเลิกด้วยตนเอง"),
    updated_at: now,
    updated_by: "user_cancel"
  });

  writeLog(
    "public",
    booking.full_name,
    "CANCEL_BOOKING",
    "BOOKING",
    booking.booking_code,
    { reason: cancelReason },
    context ? context.userAgent : "",
    context ? context.ipHash : ""
  );

  // ส่งอีเมลแจ้งเตือน
  try {
    sendCancellationNotification(updated || booking);
  } catch (e) {}

  return {
    success: true,
    message: "ยกเลิกการจองและคืนห้องซ้อมว่างให้ผู้อื่นเรียบร้อยแล้ว",
    booking: updated
  };
}

/**
 * ส่งอีเมลยืนยันการจองซ้ำ (Resend Booking Confirmation)
 * @param {string} bookingCode รหัสการจอง เช่น 'MB-2609-XXXX'
 * @param {string} newEmail อีเมลใหม่ที่ต้องการส่ง (หากไม่ระบุจะใช้อีเมลเดิมในคิว)
 */
function resendBookingConfirmation(bookingCode, newEmail) {
  if (!bookingCode) {
    throw new Error("กรุณาระบุรหัสการจอง");
  }
  var booking = findRowById("Bookings", "booking_code", String(bookingCode).trim());
  if (!booking) {
    throw new Error("ไม่พบรายการจองรหัสนี้ในระบบ กรุณาตรวจสอบรหัสการจอง");
  }

  var targetEmail = (newEmail && String(newEmail).trim()) ? String(newEmail).trim() : String(booking.email || "").trim();
  if (!targetEmail) {
    throw new Error("คิวนี้ยังไม่มีข้อมูลอีเมล กรุณาระบุอีเมลที่ต้องการให้จัดส่ง");
  }

  // อัปเดตอีเมลในระบบหากผู้ใช้ระบุอีเมลใหม่
  if (newEmail && String(newEmail).trim() && String(newEmail).trim() !== String(booking.email || "").trim()) {
    updateRow("Bookings", "booking_code", booking.booking_code, {
      email: String(newEmail).trim(),
      updated_at: new Date(),
      updated_by: "user_resend"
    });
    booking.email = String(newEmail).trim();
  }

  sendBookingConfirmationToUser(booking);
  try {
    writeLog("public", booking.full_name, "RESEND_CONFIRMATION_EMAIL", "BOOKING", booking.booking_code, { sent_to: targetEmail });
  } catch (e) {}

  return {
    success: true,
    message: "ระบบได้จัดส่งอีเมลยืนยันการจองไปยัง " + targetEmail + " เรียบร้อยแล้ว",
    sent_to: targetEmail
  };
}

/**
 * สร้าง Approval Security Token สำหรับลิงก์อนุมัติในอีเมล
 * @param {Object} booking
 * @returns {string} token
 */
function generateApprovalToken(booking) {
  var bId = String(booking.booking_id || "").trim();
  var bCode = String(booking.booking_code || "").trim();
  var raw = bId + "_" + bCode + "_wtk_approval_secret";
  var signature = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, raw);
  var tokenStr = "";
  for (var i = 0; i < signature.length; i++) {
    var b = signature[i];
    if (b < 0) b += 256;
    var hex = b.toString(16);
    if (hex.length === 1) hex = "0" + hex;
    tokenStr += hex;
  }
  return tokenStr.substring(0, 32);
}

/**
 * ตรวจสอบความถูกต้องของ Approval Token
 */
function verifyApprovalToken(booking, token) {
  if (!token) return false;
  var expected = generateApprovalToken(booking);
  return expected === String(token).trim();
}

/**
 * อนุมัติการจองโดยตรงผ่านลิงก์ 1-Click ในอีเมล
 * @param {string} bookingId
 * @param {string} token
 * @returns {Object} ผลลัพธ์
 */
function approveBookingDirect(bookingId, token) {
  var cleanId = String(bookingId || "").trim();
  var booking = findRowById("Bookings", "booking_id", cleanId);
  if (!booking) {
    throw new Error("ไม่พบข้อมูลการจองในระบบ");
  }

  if (!verifyApprovalToken(booking, token)) {
    throw new Error("ลิงก์อนุมัติไม่ถูกต้อง หรือหมดอายุแล้ว");
  }

  var currentStatus = String(booking.status || "").toLowerCase();
  if (currentStatus === "booked" || currentStatus === "checked_in" || currentStatus === "checked_out") {
    return {
      alreadyProcessed: true,
      message: "รายการจองนี้ได้รับการอนุมัติเรียบร้อยแล้ว",
      booking: booking
    };
  }
  if (currentStatus === "cancelled") {
    throw new Error("รายการจองนี้ถูกยกเลิกไปแล้ว ไม่สามารถอนุมัติได้");
  }

  var now = new Date();
  var updated = updateRow("Bookings", "booking_id", cleanId, {
    status: "booked",
    updated_at: now,
    updated_by: "email_approval"
  });

  writeLog("admin", "email_approval", "APPROVE_BOOKING", "BOOKING", booking.booking_code, { via: "email_1click" });

  // ส่งอีเมลยืนยันการจองตัวจริง (พร้อมรหัสห้องและ QR Code) ให้ผู้จอง
  try {
    sendBookingConfirmationToUser(updated);
  } catch (mailErr) {
    Logger.log("ส่งเมลยืนยันหลังอนุมัติไม่สำเร็จ: " + mailErr.message);
  }

  return {
    success: true,
    message: "อนุมัติการจองห้องซ้อมดนตรีเรียบร้อยแล้ว",
    booking: updated
  };
}

/**
 * ปฏิเสธการจองโดยตรงผ่านลิงก์ในอีเมล
 * @param {string} bookingId
 * @param {string} token
 * @param {string} [reason]
 * @returns {Object} ผลลัพธ์
 */
function rejectBookingDirect(bookingId, token, reason) {
  var cleanId = String(bookingId || "").trim();
  var booking = findRowById("Bookings", "booking_id", cleanId);
  if (!booking) {
    throw new Error("ไม่พบข้อมูลการจองในระบบ");
  }

  if (!verifyApprovalToken(booking, token)) {
    throw new Error("ลิงก์ไม่ถูกต้อง หรือหมดอายุแล้ว");
  }

  var currentStatus = String(booking.status || "").toLowerCase();
  if (currentStatus === "cancelled") {
    return {
      alreadyProcessed: true,
      message: "รายการจองนี้ถูกยกเลิก/ปฏิเสธเรียบร้อยแล้ว",
      booking: booking
    };
  }

  var rejectReason = reason || "ผู้ดูแลระบบปฏิเสธคำขอการจอง";
  var now = new Date();
  var updated = updateRow("Bookings", "booking_id", cleanId, {
    status: "cancelled",
    cancelled_at: now,
    cancel_reason: rejectReason,
    updated_at: now,
    updated_by: "email_rejection"
  });

  writeLog("admin", "email_rejection", "REJECT_BOOKING", "BOOKING", booking.booking_code, { reason: rejectReason, via: "email_1click" });

  // ส่งอีเมลแจ้งผู้จองว่าคำขอถูกปฏิเสธ
  try {
    sendBookingRejectionToUser(updated, rejectReason);
  } catch (mailErr) {
    Logger.log("ส่งเมลแจ้งปฏิเสธไม่สำเร็จ: " + mailErr.message);
  }

  return {
    success: true,
    message: "ปฏิเสธคำขอการจองเรียบร้อยแล้ว",
    booking: updated
  };
}
