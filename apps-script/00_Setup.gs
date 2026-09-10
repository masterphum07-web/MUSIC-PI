/**
 * ==============================================================================
 * ระบบจองห้องซ้อมดนตรี ชมรมดนตรี วทก.
 * ไฟล์: 00_Setup.gs
 * คำอธิบาย: สคริปต์สำหรับเริ่มต้นระบบชีต (รันครั้งเดียว)
 *           - สร้างชีตครบ 7 แท็บ
 *           - ตั้งค่า Header และ Freeze Row
 *           - ใส่ Data Validation (Dropdowns)
 *           - จัดสี รูปแบบ และ Number Format
 *           - Seed ข้อมูลห้องซ้อม, แอดมินเริ่มต้น, และค่าตั้งระบบ
 * ==============================================================================
 */

// โทนสีและสไตล์ตาม Design System
var THEME = {
  HEADER_BG: "#0F3D5C",      // น้ำเงินเข้ม Primary
  HEADER_FG: "#FFFFFF",      // ขาว
  BORDER_COLOR: "#CBD5E1",   // สีเส้นขอบตาราง
  FONT_FAMILY: "Sarabun"     // ฟอนต์มาตรฐาน
};

/**
 * ฟังก์ชันหลัก: รันฟังก์ชันนี้ครั้งเดียวเพื่อตั้งค่าฐานข้อมูล Google Sheets ทั้งหมด
 */
function setupSpreadsheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  
  Logger.log(">>> เริ่มต้นการตั้งค่าระบบจองห้องซ้อมดนตรี วทก. <<<");

  // 1. กำหนดนิยามของทั้ง 7 แท็บ
  var schema = getDatabaseSchema();

  // 2. วนลูปสร้างแต่ละชีตและใส่ Header
  for (var i = 0; i < schema.length; i++) {
    var def = schema[i];
    var sheet = ss.getSheetByName(def.sheetName);
    
    if (!sheet) {
      sheet = ss.insertSheet(def.sheetName);
      Logger.log("สร้างชีตใหม่: " + def.sheetName);
    } else {
      Logger.log("พบชีตเดิม: " + def.sheetName + " (กำลังรีเซ็ตโครงสร้าง)");
    }

    // ล้างรูปแบบและข้อมูลเก่า (ถ้ามี)
    sheet.clear();

    // เขียน Header
    if (def.headers.length > 0) {
      var headerRange = sheet.getRange(1, 1, 1, def.headers.length);
      headerRange.setValues([def.headers]);
      
      // จัดรูปแบบ Header
      headerRange.setBackground(THEME.HEADER_BG)
                 .setFontColor(THEME.HEADER_FG)
                 .setFontWeight("bold")
                 .setFontFamily(THEME.FONT_FAMILY)
                 .setFontSize(10)
                 .setHorizontalAlignment("center")
                 .setVerticalAlignment("middle")
                 .setWrap(false);
      
      sheet.setRowHeight(1, 38);
      sheet.setFrozenRows(1);

      // ตั้งความกว้างคอลัมน์ตามที่ระบุ
      if (def.columnWidths) {
        for (var colIdx = 0; colIdx < def.columnWidths.length; colIdx++) {
          sheet.setColumnWidth(colIdx + 1, def.columnWidths[colIdx]);
        }
      }

      // ตั้ง Number Format
      if (def.formats) {
        for (var fCol in def.formats) {
          var colNum = parseInt(fCol, 10);
          sheet.getRange(2, colNum, sheet.getMaxRows() - 1, 1).setNumberFormat(def.formats[fCol]);
        }
      }

      // ตั้ง Data Validation (Dropdowns)
      if (def.validations) {
        for (var vCol in def.validations) {
          var colNumber = parseInt(vCol, 10);
          var rule = SpreadsheetApp.newDataValidation()
                                   .requireValueInList(def.validations[vCol], true)
                                   .setAllowInvalid(false)
                                   .build();
          sheet.getRange(2, colNumber, sheet.getMaxRows() - 1, 1).setDataValidation(rule);
        }
      }
    }
  }

  // 3. ลบชีตปริยายที่ชื่อ "ชีต1" หรือ "Sheet1" หากมีชีตอื่นอยู่แล้ว
  var defaultSheet = ss.getSheetByName("ชีต1") || ss.getSheetByName("Sheet1");
  if (defaultSheet && ss.getSheets().length > 1) {
    try {
      ss.deleteSheet(defaultSheet);
      Logger.log("ลบชีตเริ่มต้นว่างออกเรียบร้อย");
    } catch (e) {
      // ข้ามหากไม่สามารถลบได้
    }
  }

  // 4. Seed ข้อมูลเริ่มต้น
  seedInitialData(ss);

  Logger.log(">>> ติดตั้งและตั้งค่าเสร็จสมบูรณ์ 100%! <<<");
}

/**
 * นิยาม Schema ครบ 7 แท็บ พร้อมความกว้างคอลัมน์, Dropdown, และ Number Format
 */
function getDatabaseSchema() {
  return [
    {
      sheetName: "Bookings",
      headers: [
        "booking_id", "booking_code", "room_id", "booking_date",
        "start_time", "end_time", "full_name", "student_year",
        "major", "phone", "email", "party_size", "purpose",
        "equipment", "status", "created_at", "checkin_at",
        "checkout_at", "cancelled_at", "cancel_reason",
        "admin_note", "updated_at", "updated_by"
      ],
      columnWidths: [
        180, 140, 100, 110,
        90, 90, 180, 110,
        180, 120, 200, 90, 160,
        200, 110, 160, 160,
        160, 160, 180,
        200, 160, 140
      ],
      formats: {
        4: "yyyy-mm-dd",    // booking_date
        5: "@",             // start_time (string HH:mm)
        6: "@",             // end_time (string HH:mm)
        12: "#,##0",        // party_size
        16: "yyyy-mm-dd hh:mm:ss", // created_at
        17: "yyyy-mm-dd hh:mm:ss", // checkin_at
        18: "yyyy-mm-dd hh:mm:ss", // checkout_at
        19: "yyyy-mm-dd hh:mm:ss", // cancelled_at
        22: "yyyy-mm-dd hh:mm:ss"  // updated_at
      },
      validations: {
        8: ["ปี 1", "ปี 2", "ปี 3", "ปี 4", "บุคลากร"],
        15: ["booked", "checked_in", "checked_out", "cancelled", "no_show", "overdue"]
      }
    },
    {
      sheetName: "Rooms",
      headers: [
        "room_id", "room_name", "capacity", "equipment_list",
        "color_hex", "is_active", "sort_order", "image_url"
      ],
      columnWidths: [100, 180, 90, 300, 100, 90, 90, 240],
      formats: {
        3: "#,##0",
        7: "#,##0"
      },
      validations: {
        6: ["TRUE", "FALSE"]
      }
    },
    {
      sheetName: "Admins",
      headers: [
        "admin_id", "username", "display_name", "email",
        "password_hash", "salt", "role", "is_active", "last_login_at"
      ],
      columnWidths: [120, 140, 180, 220, 260, 160, 120, 90, 170],
      formats: {
        9: "yyyy-mm-dd hh:mm:ss"
      },
      validations: {
        7: ["super_admin", "staff"],
        8: ["TRUE", "FALSE"]
      }
    },
    {
      sheetName: "NotifyRecipients",
      headers: [
        "id", "email", "display_name", "notify_on_booking",
        "notify_on_cancel", "notify_on_checkin", "notify_on_checkout",
        "notify_daily_summary", "is_active"
      ],
      columnWidths: [80, 220, 180, 130, 130, 130, 130, 150, 90],
      validations: {
        4: ["TRUE", "FALSE"],
        5: ["TRUE", "FALSE"],
        6: ["TRUE", "FALSE"],
        7: ["TRUE", "FALSE"],
        8: ["TRUE", "FALSE"],
        9: ["TRUE", "FALSE"]
      }
    },
    {
      sheetName: "Logs",
      headers: [
        "log_id", "timestamp", "actor_type", "actor_name",
        "action", "target_type", "target_id", "detail_json",
        "user_agent", "ip_hash"
      ],
      columnWidths: [160, 170, 100, 160, 140, 110, 140, 320, 180, 140],
      formats: {
        2: "yyyy-mm-dd hh:mm:ss"
      },
      validations: {
        3: ["public", "admin", "system"]
      }
    },
    {
      sheetName: "Settings",
      headers: ["key", "value", "description"],
      columnWidths: [220, 300, 350]
    },
    {
      sheetName: "Blackouts",
      headers: ["id", "date_from", "date_to", "room_id", "reason", "created_by", "created_at"],
      columnWidths: [120, 110, 110, 100, 250, 140, 160],
      formats: {
        2: "yyyy-mm-dd",
        3: "yyyy-mm-dd",
        7: "yyyy-mm-dd hh:mm:ss"
      }
    }
  ];
}

/**
 * Seed ข้อมูลเริ่มต้น: ห้องซ้อม 3 ห้อง, Super Admin 1 ท่าน, Settings เริ่มต้น
 */
function seedInitialData(ss) {
  // 1. ข้อมูลห้องซ้อมเริ่มต้น
  var roomsSheet = ss.getSheetByName("Rooms");
  var sampleRooms = [
    [
      "ROOM-01",
      "ห้องซ้อมรวม A (ใหญ่)",
      8,
      "กลองชุด Pearl, แอมป์กีตาร์ Marshall x2, แอมป์เบส Fender, คีย์บอร์ด Roland, ไมโครโฟน Shure x3, PA System",
      "#1B7A8C",
      "TRUE",
      1,
      "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=600&q=80"
    ],
    [
      "ROOM-02",
      "ห้องซ้อมวง B (กลาง)",
      5,
      "กลองชุด Yamaha, แอมป์กีตาร์ Fender x1, แอมป์กีตาร์ Roland x1, แอมป์เบส Ampeg, ไมโครโฟน x2",
      "#0F3D5C",
      "TRUE",
      2,
      "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=600&q=80"
    ],
    [
      "ROOM-03",
      "ห้องซ้อมส่วนตัว/เปียโน C",
      3,
      "เปียโนไฟฟ้า Yamaha Clavinova, แอมป์กีตาร์โปร่ง, ไมโครโฟนคอนเดนเซอร์, หูฟังมอนิเตอร์",
      "#C9A227",
      "TRUE",
      3,
      "https://images.unsplash.com/photo-1520523839898-5071270438a4?auto=format&fit=crop&w=600&q=80"
    ]
  ];
  roomsSheet.getRange(2, 1, sampleRooms.length, sampleRooms[0].length).setValues(sampleRooms);

  // 2. ข้อมูลผู้ดูแลระบบเริ่มต้น
  // รหัสผ่านเริ่มต้นคือ: Admin@WTK2026
  var adminsSheet = ss.getSheetByName("Admins");
  var defaultSalt = "wtk_music_club_salt_2026";
  var rawPassword = "Admin@WTK2026";
  var passwordHash = computeSHA256(rawPassword + defaultSalt);

  var sampleAdmins = [
    [
      "ADM-001",
      "admin_wtk",
      "ผู้ดูแลระบบชมรมดนตรี",
      "music_club@wtk.ac.th",
      passwordHash,
      defaultSalt,
      "super_admin",
      "TRUE",
      new Date()
    ]
  ];
  adminsSheet.getRange(2, 1, sampleAdmins.length, sampleAdmins[0].length).setValues(sampleAdmins);

  // 3. ข้อมูลผู้รับอีเมลแจ้งเตือนตัวอย่าง
  var notifySheet = ss.getSheetByName("NotifyRecipients");
  var sampleRecipients = [
    [
      "REC-001",
      "music_club@wtk.ac.th",
      "ชมรมดนตรี วทก. (ส่วนกลาง)",
      "TRUE",  // จองใหม่
      "TRUE",  // ยกเลิก
      "TRUE",  // เช็คอิน
      "TRUE",  // เช็คเอาต์
      "TRUE",  // สรุปรายวัน
      "TRUE"   // เปิดใช้งาน
    ]
  ];
  notifySheet.getRange(2, 1, sampleRecipients.length, sampleRecipients[0].length).setValues(sampleRecipients);

  // 4. ค่าคอนฟิกเริ่มต้นของระบบ (Settings)
  var settingsSheet = ss.getSheetByName("Settings");
  var defaultSettings = [
    ["operating_hours_weekday", "08:00-20:00", "เวลาเปิด-ปิดห้องซ้อม วันจันทร์-ศุกร์ (HH:mm-HH:mm)"],
    ["operating_hours_weekend", "09:00-18:00", "เวลาเปิด-ปิดห้องซ้อม วันเสาร์-อาทิตย์ (HH:mm-HH:mm)"],
    ["min_booking_minutes", "30", "ระยะเวลาจองขั้นต่ำต่อครั้ง (นาที)"],
    ["max_booking_hours", "3", "ระยะเวลาจองสูงสุดต่อครั้ง (ชั่วโมง)"],
    ["advance_booking_days", "14", "อนุญาตให้จองล่วงหน้าได้ไม่เกินกี่วัน"],
    ["grace_period_minutes", "30", "ระยะเวลาผ่อนปรนการเช็คอินก่อนตัดสิทธิ์ no-show (นาที)"],
    ["overdue_alert_minutes", "15", "จำนวนนาทีหลังหมดเวลาใช้งานเพื่อเตือน overdue"],
    ["max_bookings_per_user_day", "2", "จำนวนครั้งสูงสุดที่บุคคลเดียวกันสามารถจองได้ต่อวัน"],
    ["privacy_mode", "true", "โหมดย่อชื่อผู้จองหน้าแรก (true/false) เพื่อความเป็นส่วนตัว"],
    ["system_status", "open", "สถานะระบบ (open / maintenance)"],
    ["announcement_text", "ยินดีต้อนรับสู่ระบบจองห้องซ้อมดนตรี ชมรมดนตรี วทก. กรุณาเช็คอินภายใน 30 นาทีหลังเริ่มเวลา", "ข้อความประกาศข่าวด่วนหน้าแรก (เว้นว่างได้)"],
    ["contact_info", "ชมรมดนตรี วทก. อาคารกิจกรรมนักศึกษา ชั้น 2 โทร: 02-xxx-xxxx", "ข้อมูลการติดต่อและระเบียบการใช้งาน"]
  ];
  settingsSheet.getRange(2, 1, defaultSettings.length, defaultSettings[0].length).setValues(defaultSettings);

  // 5. บันทึกประวัติ Log เริ่มต้น
  var logsSheet = ss.getSheetByName("Logs");
  var initialLog = [
    [
      "LOG-INIT-001",
      new Date(),
      "system",
      "Setup Script",
      "INITIALIZE_DATABASE",
      "SYSTEM",
      "ALL_SHEETS",
      JSON.stringify({ message: "ระบบฐานข้อมูลถูกสร้างและตั้งค่าเรียบร้อยแล้ว" }),
      "AppsScript Engine",
      "127.0.0.1"
    ]
  ];
  logsSheet.getRange(2, 1, initialLog.length, initialLog[0].length).setValues(initialLog);

  Logger.log("Seed ข้อมูลเริ่มต้นลงในตารางเรียบร้อย");
}

/**
 * ฟังก์ชันช่วยคำนวณ SHA-256 สำหรับสร้างรหัสผ่าน
 */
function computeSHA256(input) {
  var rawHash = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, input, Utilities.Charset.UTF_8);
  var txtHash = "";
  for (var i = 0; i < rawHash.length; i++) {
    var hashVal = rawHash[i];
    if (hashVal < 0) hashVal += 256;
    var byteString = hashVal.toString(16);
    if (byteString.length == 1) byteString = "0" + byteString;
    txtHash += byteString;
  }
  return txtHash;
}
