/**
 * ==============================================================================
 * ระบบจองห้องซ้อมดนตรี ชมรมดนตรี วทก.
 * ไฟล์: 99_Test.gs
 * คำอธิบาย: ชุดทดสอบ Unit Test สำหรับตรวจสอบความถูกต้องของ Core Logic
 *           - ทดสอบ Overlap Logic ครอบคลุม 15 เคส (เกินเกณฑ์ขั้นต่ำ 12 เคส)
 *           - ทดสอบการแปลงเวลา timeToMinutes / minutesToTime
 *           - ทดสอบการย่อชื่อเพื่อคุ้มครองสิทธิส่วนบุคคล (PDPA Masking)
 *           - ทดสอบการสร้างรหัสจอง Booking Code
 * ==============================================================================
 */

/**
 * ฟังก์ชันเพียวลอจิกสำหรับทดสอบการชนกันของเวลา โดยรับ Mock Bookings ได้โดยตรง
 * ไม่ต้องแก้ไขหรือแทรกข้อมูลปลอมลงใน Google Sheets จริง
 */
function testIsOverlappingPure(mockBookings, roomId, dateStr, startTime, endTime, excludeBookingId) {
  var newStartMins = timeToMinutes(startTime);
  var newEndMins = timeToMinutes(endTime);

  if (newStartMins === -1 || newEndMins === -1 || newStartMins >= newEndMins) {
    return true;
  }

  for (var i = 0; i < mockBookings.length; i++) {
    var b = mockBookings[i];
    
    if (String(b.room_id).trim() !== String(roomId).trim()) {
      continue;
    }
    if (String(b.booking_date).trim() !== String(dateStr).trim()) {
      continue;
    }
    if (excludeBookingId && String(b.booking_id).trim() === String(excludeBookingId).trim()) {
      continue;
    }

    var status = String(b.status).trim().toLowerCase();
    if (status !== "booked" && status !== "checked_in") {
      continue;
    }

    var oldStartMins = timeToMinutes(String(b.start_time).trim());
    var oldEndMins = timeToMinutes(String(b.end_time).trim());

    if (oldStartMins === -1 || oldEndMins === -1) {
      continue;
    }

    // สูตรหัวใจ: newStart < oldEnd && newEnd > oldStart
    if (newStartMins < oldEndMins && newEndMins > oldStartMins) {
      return true;
    }
  }

  return false;
}

/**
 * รันการทดสอบ Unit Tests ทั้งหมด
 * สามารถเลือกฟังก์ชันนี้ในหน้า Apps Script Editor แล้วกด "เรียกใช้ (Run)" เพื่อดูผลลัพธ์
 */
function runAllUnitTests() {
  Logger.log("==================================================");
  Logger.log(">>> เริ่มต้นการรัน UNIT TESTS: ระบบจองห้องซ้อมดนตรี วทก. <<<");
  Logger.log("==================================================");

  var totalTests = 0;
  var passedTests = 0;
  var failedTests = 0;

  function assert(testName, condition, expected, actual) {
    totalTests++;
    if (condition) {
      passedTests++;
      Logger.log("✅ PASS: " + testName);
    } else {
      failedTests++;
      Logger.log("❌ FAIL: " + testName + " | คาดหวัง: " + expected + " แต่ได้: " + actual);
    }
  }

  // ----------------------------------------------------
  // ชุดทดสอบที่ 1: Overlap Logic (15 กรณีทดสอบ)
  // ----------------------------------------------------
  Logger.log("\n--- [ชุดที่ 1: ทดสอบการกันจองชน (Overlap Detection)] ---");

  // ข้อมูลจำลองการจองเดิมในระบบ (ห้อง ROOM-01 วันที่ 2026-09-15 เวลา 10:00 - 12:00)
  var baseMock = [
    {
      booking_id: "B-001",
      room_id: "ROOM-01",
      booking_date: "2026-09-15",
      start_time: "10:00",
      end_time: "12:00",
      status: "booked"
    }
  ];

  // Case 1: มาก่อนเวลาชัดเจน ไม่ชน (08:00 - 09:30)
  assert(
    "Case 1: จองก่อนเวลาเดิมโดยสมบูรณ์ (08:00-09:30 vs 10:00-12:00) -> ต้องไม่ชน",
    testIsOverlappingPure(baseMock, "ROOM-01", "2026-09-15", "08:00", "09:30") === false,
    false, true
  );

  // Case 2: มาหลังเวลาชัดเจน ไม่ชน (13:00 - 15:00)
  assert(
    "Case 2: จองหลังเวลาเดิมโดยสมบูรณ์ (13:00-15:00 vs 10:00-12:00) -> ต้องไม่ชน",
    testIsOverlappingPure(baseMock, "ROOM-01", "2026-09-15", "13:00", "15:00") === false,
    false, true
  );

  // Case 3: จบพอดีกับเวลาเริ่มของคิวเดิม (08:00 - 10:00 ชนขอบ 10:00 พอดี)
  assert(
    "Case 3: ต่อคิวก่อนหน้าพอดี (08:00-10:00 vs 10:00-12:00) -> ต้องไม่ชน (อนุญาต)",
    testIsOverlappingPure(baseMock, "ROOM-01", "2026-09-15", "08:00", "10:00") === false,
    false, true
  );

  // Case 4: เริ่มพอดีกับเวลาจบของคิวเดิม (12:00 - 14:00 ชนขอบ 12:00 พอดี)
  assert(
    "Case 4: ต่อคิวถัดไปพอดี (12:00-14:00 vs 10:00-12:00) -> ต้องไม่ชน (อนุญาต)",
    testIsOverlappingPure(baseMock, "ROOM-01", "2026-09-15", "12:00", "14:00") === false,
    false, true
  );

  // Case 5: เริ่มคาบเกี่ยวกับช่วงท้ายของคิวเดิม (11:30 - 13:00)
  assert(
    "Case 5: เริ่มคาบเกี่ยวช่วงท้าย (11:30-13:00 vs 10:00-12:00) -> ต้องชน",
    testIsOverlappingPure(baseMock, "ROOM-01", "2026-09-15", "11:30", "13:00") === true,
    true, false
  );

  // Case 6: จบคาบเกี่ยวกับช่วงเริ่มของคิวเดิม (09:00 - 10:30)
  assert(
    "Case 6: จบคาบเกี่ยวช่วงต้น (09:00-10:30 vs 10:00-12:00) -> ต้องชน",
    testIsOverlappingPure(baseMock, "ROOM-01", "2026-09-15", "09:00", "10:30") === true,
    true, false
  );

  // Case 7: อยู่ภายในช่วงเวลาเดิมทั้งหมด (10:30 - 11:30)
  assert(
    "Case 7: อยู่ภายในช่วงเวลาเดิม (10:30-11:30 vs 10:00-12:00) -> ต้องชน",
    testIsOverlappingPure(baseMock, "ROOM-01", "2026-09-15", "10:30", "11:30") === true,
    true, false
  );

  // Case 8: ครอบคลุมช่วงเวลาเดิมทั้งหมด (09:00 - 13:00)
  assert(
    "Case 8: ครอบคลุมเวลาเดิมทั้งหมด (09:00-13:00 vs 10:00-12:00) -> ต้องชน",
    testIsOverlappingPure(baseMock, "ROOM-01", "2026-09-15", "09:00", "13:00") === true,
    true, false
  );

  // Case 9: เวลาเดียวกันเป๊ะ (10:00 - 12:00)
  assert(
    "Case 9: เวลาเดียวกันเป๊ะ (10:00-12:00 vs 10:00-12:00) -> ต้องชน",
    testIsOverlappingPure(baseMock, "ROOM-01", "2026-09-15", "10:00", "12:00") === true,
    true, false
  );

  // Case 10: คิวเดิมถูกยกเลิกไปแล้ว (status = 'cancelled')
  var cancelledMock = [
    { room_id: "ROOM-01", booking_date: "2026-09-15", start_time: "10:00", end_time: "12:00", status: "cancelled" }
  ];
  assert(
    "Case 10: คิวเดิมสถานะ cancelled -> ต้องไม่ชน (ให้จองได้)",
    testIsOverlappingPure(cancelledMock, "ROOM-01", "2026-09-15", "10:00", "12:00") === false,
    false, true
  );

  // Case 11: คิวเดิมกำลังเช็คอินใช้งานอยู่ (status = 'checked_in')
  var checkedInMock = [
    { room_id: "ROOM-01", booking_date: "2026-09-15", start_time: "10:00", end_time: "12:00", status: "checked_in" }
  ];
  assert(
    "Case 11: คิวเดิมสถานะ checked_in -> ต้องชน",
    testIsOverlappingPure(checkedInMock, "ROOM-01", "2026-09-15", "10:00", "12:00") === true,
    true, false
  );

  // Case 12: คิวเดิมถูกตัดสิทธิ์ no_show (status = 'no_show')
  var noShowMock = [
    { room_id: "ROOM-01", booking_date: "2026-09-15", start_time: "10:00", end_time: "12:00", status: "no_show" }
  ];
  assert(
    "Case 12: คิวเดิมสถานะ no_show -> ต้องไม่ชน (คืนห้องว่าง)",
    testIsOverlappingPure(noShowMock, "ROOM-01", "2026-09-15", "10:00", "12:00") === false,
    false, true
  );

  // Case 13: คิวเดิมเช็คเอาต์เรียบร้อยแล้ว (status = 'checked_out')
  var checkedOutMock = [
    { room_id: "ROOM-01", booking_date: "2026-09-15", start_time: "10:00", end_time: "12:00", status: "checked_out" }
  ];
  assert(
    "Case 13: คิวเดิมสถานะ checked_out -> ต้องไม่ชน",
    testIsOverlappingPure(checkedOutMock, "ROOM-01", "2026-09-15", "10:00", "12:00") === false,
    false, true
  );

  // Case 14: คนละห้องกัน (ROOM-02 vs ROOM-01) ในวัน-เวลาเดียวกัน
  assert(
    "Case 14: เวลาเดียวกันแต่คนละห้อง (ROOM-02 vs ROOM-01) -> ต้องไม่ชน",
    testIsOverlappingPure(baseMock, "ROOM-02", "2026-09-15", "10:00", "12:00") === false,
    false, true
  );

  // Case 15: ห้องเดียวกันเวลาเดียวกัน แต่คนละวัน (2026-09-16 vs 2026-09-15)
  assert(
    "Case 15: ห้องเดียวกันเวลาเดียวกัน แต่คนละวัน -> ต้องไม่ชน",
    testIsOverlappingPure(baseMock, "ROOM-01", "2026-09-16", "10:00", "12:00") === false,
    false, true
  );

  // ----------------------------------------------------
  // ชุดทดสอบที่ 2: Time Helpers & Sanitization
  // ----------------------------------------------------
  Logger.log("\n--- [ชุดที่ 2: ทดสอบ Time Conversion & Sanitization] ---");

  assert("timeToMinutes('08:30') == 510", timeToMinutes("08:30") === 510, 510, timeToMinutes("08:30"));
  assert("timeToMinutes('00:00') == 0", timeToMinutes("00:00") === 0, 0, timeToMinutes("00:00"));
  assert("timeToMinutes('23:59') == 1439", timeToMinutes("23:59") === 1439, 1439, timeToMinutes("23:59"));
  assert("minutesToTime(510) == '08:30'", minutesToTime(510) === "08:30", "08:30", minutesToTime(510));

  assert(
    "Formula injection prefix '=' ถูกเติม single quote",
    sanitizeInput("=SUM(A1:A10)") === "'=SUM(A1:A10)",
    "'=SUM(A1:A10)", sanitizeInput("=SUM(A1:A10)")
  );
  assert(
    "Formula injection prefix '+' ถูกเติม single quote",
    sanitizeInput("+cmd") === "'+cmd",
    "'+cmd", sanitizeInput("+cmd")
  );

  // ----------------------------------------------------
  // ชุดทดสอบที่ 3: PDPA Name Masking & Code Format
  // ----------------------------------------------------
  Logger.log("\n--- [ชุดที่ 3: ทดสอบ PDPA Masking & Booking Code] ---");

  assert(
    "Mask 'นายสมชาย ใจดี' เป็น 'สมชาย จ.'",
    maskName("นายสมชาย ใจดี") === "สมชาย จ.",
    "สมชาย จ.", maskName("นายสมชาย ใจดี")
  );
  assert(
    "Mask 'John Doe' เป็น 'John D.'",
    maskName("John Doe") === "John D.",
    "John D.", maskName("John Doe")
  );

  var sampleCode = generateBookingCode();
  var codeRegex = /^MB-\d{4}-[23456789ABCDEFGHJKLMNPQRSTUVWXYZ]{4}$/;
  assert(
    "Booking code ถูกต้องตาม format MB-YYMM-XXXX (" + sampleCode + ")",
    codeRegex.test(sampleCode) === true,
    true, codeRegex.test(sampleCode)
  );

  // สรุปผล
  Logger.log("\n==================================================");
  Logger.log("สรุปผลการทดสอบ: ทั้งหมด " + totalTests + " เคส | ผ่าน: " + passedTests + " | ไม่ผ่าน: " + failedTests);
  Logger.log("==================================================");

  return {
    total: totalTests,
    passed: passedTests,
    failed: failedTests,
    status: failedTests === 0 ? "SUCCESS" : "FAILURE"
  };
}
