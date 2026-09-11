/**
 * ระบบจองห้องซ้อมดนตรี ชมรมดนตรี วทก.
 * BUNDLED CODE.GS - รวมทุกโมดูลสำหรับ Google Apps Script
 * อัปเดตล่าสุด: 2026-09-11T08:43:31.154Z
 */

/* ============================================================================== */
/* ไฟล์: 00_Setup.gs */
/* ============================================================================== */

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
        15: ["pending_approval", "booked", "checked_in", "checked_out", "cancelled", "no_show", "overdue"]
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
      "ห้องซ้อมดนตรี ชมรมดนตรี วทก.",
      10,
      "กลองชุด Pearl, แอมป์กีตาร์ Marshall x2, แอมป์เบส Fender, คีย์บอร์ด Roland, ไมโครโฟน Shure x3, PA System & มอนิเตอร์",
      "#0F3D5C",
      "TRUE",
      1,
      "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=600&q=80"
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
      "TRUE",  // ขออนุมัติการจอง
      "FALSE", // ยกเลิก
      "FALSE", // เช็คอิน
      "FALSE", // เช็คเอาต์
      "FALSE", // สรุปรายวัน
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
    ["club_email", "music_club@wtk.ac.th", "อีเมลทางการของชมรม (สำหรับ Reply-To และส่งในนาม)"],
    ["club_sender_name", "ชมรมดนตรี วทก. (ระบบจองห้องซ้อม)", "ชื่อผู้ส่งที่จะแสดงในกล่องจดหมายอีเมล"],
    ["announcement_text", "ยินดีต้อนรับสู่ระบบจองห้องซ้อมดนตรี ชมรมดนตรี วทก. กรุณาเช็คอินภายใน 30 นาทีหลังเริ่มเวลา", "ข้อความประกาศข่าวด่วนหน้าแรก (เว้นว่างได้)"],
    ["contact_info", "ชมรมดนตรี วทก. อาคารกิจกรรมนักศึกษา ชั้น 2 โทร: 02-xxx-xxxx", "ข้อมูลการติดต่อและระเบียบการใช้งาน"],
    ["majors_list", JSON.stringify([
      "หลักสูตรการแพทย์แผนไทยบัณฑิต",
      "หลักสูตรวิทยาศาสตรบัณฑิต สาขาวิชารังสีเทคนิค",
      "หลักสูตรวิทยาศาสตรบัณฑิต สาขาวิชาเทคโนโลยีหัวใจและทรวงอก",
      "หลักสูตรสาธารณสุขศาสตรบัณฑิต สาขาวิชาทันตสาธารณสุข",
      "หลักสูตรสาธารณสุขศาสตรบัณฑิต สาขาวิชาสาธารณสุขชุมชน",
      "หลักสูตรวิทยาศาสตรบัณฑิต สาขาวิชาเวชระเบียน",
      "อาจารย์ / เจ้าหน้าที่ / บุคลากรวิทยาลัย",
      "อื่นๆ / บุคคลภายนอก"
    ]), "รายการหลักสูตรและสาขาวิชาในระบบ (JSON Array)"]
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


/* ============================================================================== */
/* ไฟล์: 01_Repository.gs */
/* ============================================================================== */

/**
 * ==============================================================================
 * ระบบจองห้องซ้อมดนตรี ชมรมดนตรี วทก.
 * ไฟล์: 01_Repository.gs
 * คำอธิบาย: Data Access Layer (DAL) สำหรับการอ่าน-เขียน Google Sheets
 *           - ครอบการเขียนด้วย withLock() ป้องกัน Race Condition
 *           - อ่านข้อมูลทั้งแถบทีเดียวเสมอ (Batch Read) ห้ามอ่านใน loop
 *           - SpreadsheetApp.flush() ก่อนปล่อย Lock ทุกครั้ง
 * ==============================================================================
 */

/**
 * ฟังก์ชัน Wrapper สำหรับจัดการ LockService อย่างปลอดภัย
 * @param {Function} callback ฟังก์ชันที่ต้องการรันภายใต้ Lock
 * @param {number} timeoutMs เวลาที่รอก่อนหมดเวลา (มิลลิวินาที) ค่าเริ่มต้น 20,000 (20 วินาที)
 * @returns {*} ผลลัพธ์จากการทำงานของ callback
 */
function withLock(callback, timeoutMs) {
  if (typeof timeoutMs === "undefined") {
    timeoutMs = 20000;
  }
  
  var lock = LockService.getScriptLock();
  var hasLock = false;
  
  try {
    hasLock = lock.tryLock(timeoutMs);
  } catch (e) {
    Logger.log("LockService tryLock error: " + e.message);
  }

  if (!hasLock) {
    throw new Error("ระบบกำลังมีการประมวลผลการจองพร้อมกันจำนวนมาก กรุณาลองใหม่อีกครั้ง");
  }

  try {
    var result = callback();
    // สั่ง flush ข้อมูลลง Spreadsheet ทันทีเพื่อให้บันทึกเสร็จก่อนปล่อย lock
    SpreadsheetApp.flush();
    return result;
  } finally {
    try {
      lock.releaseLock();
    } catch (releaseErr) {
      Logger.log("เกิดข้อผิดพลาดในการปล่อย Lock: " + releaseErr.message);
    }
  }
}

function getSheet(sheetName) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) {
    throw new Error("ไม่สามารถเข้าถึง Spreadsheet ได้ กรุณาเปิด Apps Script จากส่วนเสริมของ Google Sheets");
  }
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    try {
      sheet = ss.insertSheet(sheetName);
      if (typeof getDatabaseSchema === "function") {
        var schema = getDatabaseSchema();
        for (var i = 0; i < schema.length; i++) {
          if (schema[i].sheetName === sheetName && schema[i].headers.length > 0) {
            sheet.getRange(1, 1, 1, schema[i].headers.length).setValues([schema[i].headers]);
            break;
          }
        }
      }
    } catch (e) {
      Logger.log("Auto-create sheet " + sheetName + " error: " + e.message);
    }
  }
  if (!sheet) {
    throw new Error("ไม่พบแท็บข้อมูลชื่อ: " + sheetName);
  }
  return sheet;
}

// In-Memory Cache ประจำรอบการประมวลผล (Request Scope) เพื่อตัดปัญหาอ่าน Sheets ซ้ำซ้อน
var _CACHE_ROWS = {};

/**
 * เคลียร์แคชข้อมูลชีต
 * @param {string} [sheetName] หากระบุจะเคลียร์เฉพาะแท็บนั้น หากไม่ระบุจะเคลียร์ทั้งหมด
 */
function clearCache(sheetName) {
  if (sheetName) {
    delete _CACHE_ROWS[sheetName];
  } else {
    _CACHE_ROWS = {};
  }
}

/**
 * อ่านข้อมูลทั้งหมดในชีตเป็น Array of Objects ตามชื่อ Header ในแถวที่ 1
 * โดยอ่านแบบ Batch อ่านทั้ง Range ทีเดียว (ห้ามเรียก getRange ใน loop)
 * พร้อมระบบ In-Memory Cache ป้องกันการอ่านชีตเดิมซ้ำในคำขอเดียวกัน
 * @param {string} sheetName ชื่อแท็บ
 * @param {boolean} [forceRefresh] บังคับอ่านตรงจาก Google Sheets โดยไม่ใช้แคช
 * @returns {Array<Object>} อาร์เรย์ของออบเจ็กต์ข้อมูล
 */
function getAllRows(sheetName, forceRefresh) {
  if (!forceRefresh && _CACHE_ROWS[sheetName]) {
    return _CACHE_ROWS[sheetName];
  }

  var sheet = getSheet(sheetName);
  var lastRow = sheet.getLastRow();
  var lastCol = sheet.getLastColumn();

  if (lastRow <= 1 || lastCol === 0) {
    _CACHE_ROWS[sheetName] = [];
    return [];
  }

  // อ่านข้อมูลทั้งหมดในครั้งเดียว
  var values = sheet.getRange(1, 1, lastRow, lastCol).getValues();
  var headers = values[0];
  var rows = [];

  for (var r = 1; r < values.length; r++) {
    var rowData = values[r];
    var obj = { _rowIndex: r + 1 }; // เก็บแถวจริงใน Sheet (1-based) ไว้ใช้อ้างอิงตอน Update
    
    // ตรวจสอบว่าแถวนั้นว่างเปล่าหรือไม่
    var isEmpty = true;
    for (var c = 0; c < headers.length; c++) {
      var headerKey = String(headers[c]).trim();
      if (headerKey) {
        var cellVal = rowData[c];
        if (cellVal !== "" && cellVal !== null && typeof cellVal !== "undefined") {
          isEmpty = false;
        }
        obj[headerKey] = cellVal;
      }
    }
    
    if (!isEmpty) {
      rows.push(obj);
    }
  }

  if (sheetName === "Rooms" && rows.length === 0) {
    var defaultRoom = {
      _rowIndex: 2,
      room_id: "ROOM-01",
      room_name: "ห้องซ้อมดนตรี ชมรมดนตรี วทก.",
      capacity: 10,
      equipment_list: "กลองชุด Pearl, แอมป์กีตาร์ Marshall x2, แอมป์เบส Fender, คีย์บอร์ด Roland, ไมโครโฟน Shure x3, PA System & มอนิเตอร์",
      color_hex: "#0F3D5C",
      is_active: "TRUE",
      sort_order: 1,
      image_url: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=600&q=80"
    };
    try {
      appendRow("Rooms", defaultRoom);
    } catch (e) {}
    rows.push(defaultRoom);
  }

  _CACHE_ROWS[sheetName] = rows;
  return rows;
}

/**
 * ค้นหาแถวข้อมูลตาม ID
 * @param {string} sheetName ชื่อแท็บ
 * @param {string} idColumnName ชื่อคอลัมน์คีย์หลัก เช่น 'booking_id', 'room_id'
 * @param {*} idValue ค่าที่ต้องการค้นหา
 * @returns {Object|null} ออบเจ็กต์ข้อมูลแถวที่ตรงเงื่อนไข หรือ null ถ้าไม่พบ
 */
function findRowById(sheetName, idColumnName, idValue) {
  var all = getAllRows(sheetName);
  for (var i = 0; i < all.length; i++) {
    if (String(all[i][idColumnName]).trim() === String(idValue).trim()) {
      return all[i];
    }
  }
  return null;
}

/**
 * ค้นหาแถวข้อมูลทั้งหมดที่ตรงตามเงื่อนไข Predicate Function
 * @param {string} sheetName ชื่อแท็บ
 * @param {Function} predicateFn ฟังก์ชันทดสอบเงื่อนไข รับพารามิเตอร์เป็น row object
 * @returns {Array<Object>}
 */
function findRowsByCondition(sheetName, predicateFn) {
  var all = getAllRows(sheetName);
  var matched = [];
  for (var i = 0; i < all.length; i++) {
    if (predicateFn(all[i])) {
      matched.push(all[i]);
    }
  }
  return matched;
}

/**
 * เพิ่มแถวใหม่ลงในชีต
 * @param {string} sheetName ชื่อแท็บ
 * @param {Object} rowDataObj ออบเจ็กต์ข้อมูลที่มีคีย์ตรงกับ Header
 * @returns {Object} ข้อมูลที่ถูกบันทึกพร้อม _rowIndex
 */
function appendRow(sheetName, rowDataObj) {
  var sheet = getSheet(sheetName);
  var lastCol = sheet.getLastColumn();
  if (lastCol === 0) {
    throw new Error("ชีต " + sheetName + " ยังไม่มี Header");
  }

  // อ่าน Header เพื่อจัดลำดับข้อมูลให้ตรงคอลัมน์
  var headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
  var newRow = [];

  for (var c = 0; c < headers.length; c++) {
    var key = String(headers[c]).trim();
    var val = rowDataObj[key];
    if (typeof val === "undefined" || val === null) {
      newRow.push("");
    } else {
      newRow.push(val);
    }
  }

  sheet.appendRow(newRow);
  clearCache(sheetName);
  rowDataObj._rowIndex = sheet.getLastRow();
  return rowDataObj;
}

/**
 * อัปเดตข้อมูลแถวเดิมในชีตโดยอ้างอิงจาก ID
 * @param {string} sheetName ชื่อแท็บ
 * @param {string} idColumnName ชื่อคอลัมน์ ID
 * @param {*} idValue ค่า ID ของแถวที่ต้องการอัปเดต
 * @param {Object} updateFieldsObj ฟิลด์ที่ต้องการอัปเดต
 * @returns {Object|null} ออบเจ็กต์หลังอัปเดต หรือ null ถ้าไม่พบ ID
 */
function updateRow(sheetName, idColumnName, idValue, updateFieldsObj) {
  var sheet = getSheet(sheetName);
  var lastRow = sheet.getLastRow();
  var lastCol = sheet.getLastColumn();

  if (lastRow <= 1 || lastCol === 0) {
    return null;
  }

  // ดึงข้อมูลทั้งหมดในครั้งเดียว
  var values = sheet.getRange(1, 1, lastRow, lastCol).getValues();
  var headers = values[0];

  // หา Index ของ ID Column
  var idColIdx = -1;
  for (var c = 0; c < headers.length; c++) {
    if (String(headers[c]).trim() === idColumnName) {
      idColIdx = c;
      break;
    }
  }

  if (idColIdx === -1) {
    throw new Error("ไม่พบคอลัมน์ ID: " + idColumnName + " ในชีต " + sheetName);
  }

  // หาแถวที่ตรงกับ idValue
  var targetRowIdx = -1;
  for (var r = 1; r < values.length; r++) {
    if (String(values[r][idColIdx]).trim() === String(idValue).trim()) {
      targetRowIdx = r;
      break;
    }
  }

  if (targetRowIdx === -1) {
    return null;
  }

  // ปรับปรุงค่าในอาร์เรย์เดิม
  var rowData = values[targetRowIdx];
  for (var colIdx = 0; colIdx < headers.length; colIdx++) {
    var fieldKey = String(headers[colIdx]).trim();
    if (updateFieldsObj.hasOwnProperty(fieldKey)) {
      rowData[colIdx] = updateFieldsObj[fieldKey];
    }
  }

  // บันทึกเฉพาะแถวนั้นกลับลงชีตในรอบเดียว
  sheet.getRange(targetRowIdx + 1, 1, 1, lastCol).setValues([rowData]);
  clearCache(sheetName);

  // สร้าง Object ผลลัพธ์ส่งคืน
  var resultObj = { _rowIndex: targetRowIdx + 1 };
  for (var h = 0; h < headers.length; h++) {
    resultObj[String(headers[h]).trim()] = rowData[h];
  }

  return resultObj;
}

/**
 * ลบแถวข้อมูลตาม ID
 * @param {string} sheetName ชื่อแท็บ
 * @param {string} idColumnName ชื่อคอลัมน์ ID
 * @param {*} idValue ค่า ID ที่ต้องการลบ
 * @returns {boolean} true ถ้าลบสำเร็จ, false ถ้าไม่พบ
 */
function deleteRow(sheetName, idColumnName, idValue) {
  var target = findRowById(sheetName, idColumnName, idValue);
  if (!target || !target._rowIndex) {
    return false;
  }
  var sheet = getSheet(sheetName);
  sheet.deleteRow(target._rowIndex);
  clearCache(sheetName);
  return true;
}

/**
 * ดึงค่าการตั้งค่าระบบทั้งหมดจากแท็บ Settings ในรูป Key-Value Map
 * @returns {Object} { key: value, ... }
 */
function getSettingsMap() {
  var map = {
    operating_hours_weekday: "08:00-20:00",
    operating_hours_weekend: "09:00-18:00",
    min_booking_minutes: "30",
    max_booking_hours: "3",
    advance_booking_days: "14",
    grace_period_minutes: "30",
    max_bookings_per_user_day: "2",
    privacy_mode: "true",
    system_status: "open",
    announcement_text: "",
    contact_info: ""
  };
  try {
    var rows = getAllRows("Settings");
    for (var i = 0; i < rows.length; i++) {
      var k = String(rows[i]["key"]).trim();
      var v = rows[i]["value"];
      if (k) {
        map[k] = v;
      }
    }
  } catch (e) {
    Logger.log("getSettingsMap fallback: " + e.message);
  }
  return map;
}

/**
 * อัปเดตหรือเพิ่มค่าตั้งค่าในแท็บ Settings
 * @param {string} key คีย์ที่ต้องการตั้ง
 * @param {*} value ค่าที่ต้องการบันทึก
 */
function updateSetting(key, value) {
  var sheet = getSheet("Settings");
  var rows = getAllRows("Settings");
  var existingRow = null;

  for (var i = 0; i < rows.length; i++) {
    if (String(rows[i]["key"]).trim() === key) {
      existingRow = rows[i];
      break;
    }
  }

  if (existingRow) {
    updateRow("Settings", "key", key, { value: String(value) });
  } else {
    appendRow("Settings", { key: key, value: String(value), description: "" });
  }
}


/* ============================================================================== */
/* ไฟล์: 02_Router.gs */
/* ============================================================================== */

/**
 * ==============================================================================
 * ระบบจองห้องซ้อมดนตรี ชมรมดนตรี วทก.
 * ไฟล์: 02_Router.gs
 * คำอธิบาย: จุดเชื่อมต่อ API (API Gateway / Router) สำหรับ Web App
 *           - doGet และ doPost
 *           - รับ JSON Payload (ผ่าน Content-Type: text/plain เพื่อเลี่ยง CORS)
 *           - ครอบการเรียกฟังก์ชันแอดมินด้วย requireAuth() ตรวจสอบ Session Token
 *           - ตอบกลับในรูปแบบมาตรฐาน: { ok: boolean, data?: any, error?: { code, message } }
 *           - บันทึก Error ทุกกรณีลงชีต Logs
 * ==============================================================================
 */

/**
 * จัดการคำขอแบบ HTTP GET
 * ใช้สำหรับดึง Public State หรือตรวจสอบสถานะระบบ
 */
function doGet(e) {
  try {
    var params = e ? e.parameter : {};
    var action = params.action || "getPublicState";
    var date = params.date || "";

    if (action === "approve_booking") {
      var approvalResult = approveBookingDirect(params.id, params.token);
      return renderApprovalHtmlPage(approvalResult.booking, true, approvalResult.message);
    } else if (action === "reject_booking") {
      var rejectionResult = rejectBookingDirect(params.id, params.token, params.reason);
      return renderApprovalHtmlPage(rejectionResult.booking, false, rejectionResult.message);
    } else if (action === "getPublicState") {
      var state = getPublicState(date);
      return createJsonResponse({ ok: true, data: state });
    } else if (action === "ping") {
      return createJsonResponse({
        ok: true,
        data: {
          status: "healthy",
          service: "WTK Music Room Reservation API",
          server_time: new Date()
        }
      });
    }

    return createJsonResponse({
      ok: false,
      error: { code: "INVALID_ACTION", message: "ไม่พบคำสั่ง GET action: " + action }
    });
  } catch (err) {
    writeLog("system", "doGet", "SYSTEM_ERROR", "API", "", err.message);
    if (params && (params.action === "approve_booking" || params.action === "reject_booking")) {
      return renderApprovalHtmlPage(null, false, "เกิดข้อผิดพลาด: " + err.message);
    }
    return createJsonResponse({
      ok: false,
      error: { code: "SERVER_ERROR", message: err.message }
    });
  }
}

/**
 * แสดงผลหน้าเว็บตอบกลับเมื่อคลิกอนุมัติหรือปฏิเสธผ่านอีเมล
 */
function renderApprovalHtmlPage(booking, isApproved, message) {
  var title = isApproved ? "อนุมัติการจองห้องซ้อมสำเร็จ" : "ปฏิเสธคำขอการจองเรียบร้อย";
  var icon = isApproved ? "✅" : "❌";
  var badgeBg = isApproved ? "#DCFCE7" : "#FEE2E2";
  var headingColor = isApproved ? "#15803D" : "#B91C1C";
  var bCode = booking ? booking.booking_code : "-";
  var bName = booking ? booking.full_name : "-";
  var bDate = booking ? formatDateToString(booking.booking_date) : "-";
  var bTime = booking ? (booking.start_time + " - " + booking.end_time + " น.") : "-";
  var desc = isApproved 
    ? "ระบบได้เปลี่ยนสถานะเป็น <strong>\"จองแล้ว\" (Booked)</strong> และส่งอีเมลยืนยันพร้อม <strong>รหัสผ่านเข้าห้องและ QR Code</strong> ไปยังผู้จองเรียบร้อยแล้ว"
    : (message || "ระบบได้ปฏิเสธคำขอนี้และส่งอีเมลแจ้งเตือนไปยังผู้จองเรียบร้อยแล้ว");

  var html = '<!DOCTYPE html>' +
  '<html lang="th">' +
  '<head>' +
    '<meta charset="utf-8">' +
    '<meta name="viewport" content="width=device-width, initial-scale=1">' +
    '<title>' + title + ' - ชมรมดนตรี วทก.</title>' +
    '<style>' +
      'body { font-family: "Sarabun", Arial, sans-serif; background: #F8FAFC; color: #1E293B; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 20px; box-sizing: border-box; }' +
      '.card { background: #FFFFFF; border-radius: 20px; box-shadow: 0 10px 25px rgba(0,0,0,0.08); max-width: 480px; width: 100%; padding: 36px 28px; text-align: center; border: 1px solid #E2E8F0; }' +
      '.icon-badge { width: 68px; height: 68px; border-radius: 50%; background: ' + badgeBg + '; display: flex; align-items: center; justify-content: center; font-size: 34px; margin: 0 auto 18px; }' +
      'h1 { font-size: 20px; color: ' + headingColor + '; margin: 0 0 10px; font-weight: 700; }' +
      'p { font-size: 14px; color: #64748B; line-height: 1.6; margin: 0 0 20px; }' +
      '.details { background: #F1F5F9; border-radius: 12px; padding: 16px; text-align: left; font-size: 13px; margin-bottom: 24px; border: 1px solid #E2E8F0; }' +
      '.details-row { display: flex; justify-content: space-between; margin-bottom: 8px; }' +
      '.details-row:last-child { margin-bottom: 0; }' +
      '.btn { display: inline-block; background: #0F3D5C; color: #FFFFFF; padding: 12px 26px; border-radius: 12px; text-decoration: none; font-weight: 700; font-size: 13px; box-shadow: 0 2px 6px rgba(15,61,92,0.25); }' +
    '</style>' +
  '</head>' +
  '<body>' +
    '<div class="card">' +
      '<div class="icon-badge">' + icon + '</div>' +
      '<h1>' + title + '</h1>' +
      '<p>' + desc + '</p>' +
      (booking ? (
        '<div class="details">' +
          '<div class="details-row"><span style="color:#64748B">รหัสคำขอ:</span><strong style="font-family:monospace; color:#0F3D5C; font-size:14px;">' + bCode + '</strong></div>' +
          '<div class="details-row"><span style="color:#64748B">ผู้จอง:</span><span>' + bName + '</span></div>' +
          '<div class="details-row"><span style="color:#64748B">วันที่ใช้งาน:</span><span>' + bDate + '</span></div>' +
          '<div class="details-row"><span style="color:#64748B">เวลา:</span><span>' + bTime + '</span></div>' +
        '</div>'
      ) : '') +
      '<a href="https://masterphum07-web.github.io/MUSIC-PI/?admin=true" class="btn">เปิดระบบจัดการหลังบ้าน (Admin Console)</a>' +
    '</div>' +
  '</body>' +
  '</html>';

  return HtmlService.createHtmlOutput(html)
    .setTitle(title + " - ชมรมดนตรี วทก.")
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/**
 * จัดการคำขอแบบ HTTP POST
 * รับ Payload JSON จาก Client และกระจายงานตาม action
 */
function doPost(e) {
  var actionName = "UNKNOWN";
  var actor = "public";

  try {
    if (!e || !e.postData || !e.postData.contents) {
      return createJsonResponse({
        ok: false,
        error: { code: "EMPTY_BODY", message: "ไม่พบข้อมูลในคำขอ (Body is empty)" }
      });
    }

    // แปลงเนื้อหาคำขอซึ่งส่งมาเป็น JSON String
    var requestData;
    try {
      requestData = JSON.parse(e.postData.contents);
    } catch (parseErr) {
      return createJsonResponse({
        ok: false,
        error: { code: "INVALID_JSON", message: "รูปแบบข้อมูล JSON ไม่ถูกต้อง" }
      });
    }

    var action = requestData.action;
    var payload = requestData.payload || {};
    var token = requestData.token || "";
    actionName = action || "UNKNOWN";

    var context = {
      userAgent: requestData.user_agent || "",
      ipHash: requestData.ip_hash || ""
    };

    var resultData;

    // ==========================================
    // 1. PUBLIC ACTIONS (ไม่ต้องยืนยันตัวตน)
    // ==========================================
    switch (action) {
      case "getPublicState":
        resultData = getPublicState(payload.date);
        break;

      case "checkAvailability":
        resultData = checkAvailability(payload.room_id, payload.date, payload.start_time, payload.end_time);
        break;

      case "createBooking":
        actor = payload.full_name || "public";
        resultData = createBooking(payload, context);
        break;

      case "lookupBooking":
        resultData = lookupBooking(payload.booking_code, payload.full_name);
        break;

      case "checkIn":
        actor = payload.full_name || "public";
        resultData = checkIn(payload.booking_code, payload.full_name, context);
        break;

      case "checkOut":
        actor = payload.full_name || "public";
        resultData = checkOut(payload.booking_code, payload.full_name, context);
        break;

      case "cancelBooking":
        actor = payload.full_name || "public";
        resultData = cancelBooking(payload.booking_code, payload.full_name, payload.reason, context);
        break;

      case "resendBookingConfirmation":
        actor = payload.full_name || "public";
        resultData = resendBookingConfirmation(payload.booking_code, payload.email);
        break;

      case "adminLogin":
        actor = payload.username || "admin_login";
        resultData = adminLogin(payload.username, payload.password, context);
        break;

      case "adminLogout":
        resultData = adminLogout(token);
        break;

      // ==========================================
      // 2. ADMIN ACTIONS (ต้องผ่าน requireAuth)
      // ==========================================
      case "adminGetDashboard":
        requireAuth(token, "staff");
        resultData = adminGetDashboard();
        break;

      case "adminListBookings":
        requireAuth(token, "staff");
        resultData = adminListBookings(payload);
        break;

      case "adminApproveBooking":
        var adminApprove = requireAuth(token, "staff");
        resultData = adminApproveBooking(payload.booking_id, adminApprove.adminUser);
        break;

      case "adminRejectBooking":
        var adminReject = requireAuth(token, "staff");
        resultData = adminRejectBooking(payload.booking_id, payload.reason, adminReject.adminUser);
        break;

      case "adminUpdateBooking":
        var admin1 = requireAuth(token, "staff");
        resultData = adminUpdateBooking(payload.booking_id, payload.update_data, admin1);
        break;

      case "adminForceCheckout":
        var admin2 = requireAuth(token, "staff");
        resultData = adminForceCheckout(payload.booking_id, payload.note, admin2);
        break;

      case "adminGetLogs":
        requireAuth(token, "staff");
        resultData = adminGetLogs(payload);
        break;

      case "adminCrudRooms":
        var admin3 = requireAuth(token, "staff");
        resultData = adminCrudRooms(payload.operation, payload.data, admin3);
        break;

      case "adminCrudRecipients":
        var admin4 = requireAuth(token, "staff");
        resultData = adminCrudRecipients(payload.operation, payload.data, admin4);
        break;

      case "adminCrudAdmins":
        var superAdmin = requireAuth(token, "super_admin");
        resultData = adminCrudAdmins(payload.operation, payload.data, superAdmin);
        break;

      case "adminGetSettings":
        var adminGetSet = requireAuth(token, "staff");
        resultData = adminGetSettings(adminGetSet);
        break;

      case "adminUpdateSettings":
        var admin5 = requireAuth(token, "staff");
        resultData = adminUpdateSettings(payload.settings, admin5);
        break;

      case "adminExportCSV":
        requireAuth(token, "staff");
        resultData = {
          csv_content: adminExportCSV(payload.date_from, payload.date_to),
          filename: "bookings_export_" + Utilities.formatDate(new Date(), Session.getScriptTimeZone() || "GMT+7", "yyyyMMdd_HHmmss") + ".csv"
        };
        break;

      case "adminSendTestEmail":
        var admin6 = requireAuth(token, "staff");
        resultData = adminSendTestEmail(payload.email, admin6);
        break;

      default:
        return createJsonResponse({
          ok: false,
          error: { code: "UNKNOWN_ACTION", message: "ไม่รู้จักคำสั่ง action: " + action }
        });
    }

    return createJsonResponse({
      ok: true,
      data: resultData
    });

  } catch (err) {
    writeLog("system", actor, "ACTION_FAILED", "ROUTER", actionName, err.message);
    return createJsonResponse({
      ok: false,
      error: {
        code: "BUSINESS_LOGIC_ERROR",
        message: err.message
      }
    });
  }
}

/**
 * Helper สร้าง ContentService JSON Output พร้อม Header
 */
function createJsonResponse(data) {
  var outputString = JSON.stringify(data);
  return ContentService.createTextOutput(outputString)
                       .setMimeType(ContentService.MimeType.JSON);
}


/* ============================================================================== */
/* ไฟล์: 03_Validation.gs */
/* ============================================================================== */

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


/* ============================================================================== */
/* ไฟล์: 04_BookingService.gs */
/* ============================================================================== */

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
    return Utilities.formatDate(val, Session.getScriptTimeZone() || "GMT+7", "yyyy-MM-dd");
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


/* ============================================================================== */
/* ไฟล์: 05_Logger.gs */
/* ============================================================================== */

/**
 * ==============================================================================
 * ระบบจองห้องซ้อมดนตรี ชมรมดนตรี วทก.
 * ไฟล์: 05_Logger.gs
 * คำอธิบาย: ระบบบันทึก Audit Logs บันทึกทุกความเคลื่อนไหวลงในแท็บ Logs
 * ==============================================================================
 */

/**
 * บันทึก Audit Log ลงในชีต Logs
 * @param {string} actorType ประเภทผู้กระทำ: 'public' | 'admin' | 'system'
 * @param {string} actorName ชื่อผู้กระทำ เช่น 'นายสมชาย ใจดี', 'admin_wtk', 'Trigger'
 * @param {string} action ประเภทการกระทำ เช่น 'CREATE_BOOKING', 'CHECK_IN', 'CANCEL'
 * @param {string} targetType ประเภทของเป้าหมาย เช่น 'BOOKING', 'ROOM', 'SETTING'
 * @param {string} targetId รหัสของเป้าหมาย เช่น booking_code, room_id
 * @param {Object|string} detail รายละเอียดเพิ่มเติม (Object หรือ String)
 * @param {string} userAgent ข้อมูล User-Agent (ถ้ามี)
 * @param {string} ipHash แฮชของ IP Address เพื่อ PDPA (ถ้ามี)
 */
function writeLog(actorType, actorName, action, targetType, targetId, detail, userAgent, ipHash) {
  try {
    var now = new Date();
    var datePrefix = Utilities.formatDate(now, Session.getScriptTimeZone() || "GMT+7", "yyMMdd");
    var randomSuffix = Math.floor(1000 + Math.random() * 9000);
    var logId = "LOG-" + datePrefix + "-" + randomSuffix;

    var detailString = "";
    if (typeof detail === "object" && detail !== null) {
      detailString = JSON.stringify(detail);
    } else {
      detailString = String(detail || "");
    }

    var logEntry = {
      log_id: logId,
      timestamp: now,
      actor_type: actorType || "system",
      actor_name: actorName || "Anonymous",
      action: action || "UNKNOWN_ACTION",
      target_type: targetType || "GENERAL",
      target_id: targetId || "",
      detail_json: detailString,
      user_agent: userAgent || "",
      ip_hash: ipHash || ""
    };

    appendRow("Logs", logEntry);
  } catch (err) {
    Logger.log("เกิดข้อผิดพลาดในการบันทึก Log: " + err.message);
  }
}


/* ============================================================================== */
/* ไฟล์: 06_Auth.gs */
/* ============================================================================== */

/**
 * ==============================================================================
 * ระบบจองห้องซ้อมดนตรี ชมรมดนตรี วทก.
 * ไฟล์: 06_Auth.gs
 * คำอธิบาย: ระบบยืนยันตัวตนสำหรับผู้ดูแลระบบ (Admin Authentication & Security)
 *           - แฮชรหัสผ่านด้วย SHA-256 ร่วมกับ Salt เฉพาะของแต่ละบัญชี
 *           - ออก Session Token (สุ่ม 32 ไบต์) เก็บลงใน CacheService อายุ 8 ชม.
 *           - ป้องกัน Brute Force Attack: ผิด 5 ครั้งใน 10 นาที ล็อก 15 นาที
 *           - ตรวจสอบสิทธิ์ (RBAC: super_admin / staff) ด้วย requireAuth()
 *           - ห้ามคืน password_hash และ salt ออกไปทาง API เด็ดขาด
 * ==============================================================================
 */

/**
 * แฮชรหัสผ่านด้วย SHA-256 และ Salt
 * @param {string} password รหัสผ่านธรรมดา
 * @param {string} salt ค่า Salt เฉพาะของผู้ใช้
 * @returns {string} ค่าแฮช Hexadecimal ความยาว 64 ตัวอักษร
 */
function hashPasswordWithSalt(password, salt) {
  var rawInput = String(password) + String(salt);
  var rawHash = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, rawInput, Utilities.Charset.UTF_8);
  var hex = "";
  for (var i = 0; i < rawHash.length; i++) {
    var val = rawHash[i];
    if (val < 0) val += 256;
    var byteStr = val.toString(16);
    if (byteStr.length === 1) byteStr = "0" + byteStr;
    hex += byteStr;
  }
  return hex;
}

/**
 * สร้างค่า Salt สุ่มสำหรับผู้ใช้ใหม่
 * @returns {string} Salt สุ่ม 16 ตัวอักษร
 */
function generateSalt() {
  return Utilities.getUuid().replace(/-/g, "").substring(0, 16);
}

/**
 * สร้าง Session Token สุ่ม 32 ไบต์ (64 hex characters)
 * @returns {string}
 */
function generateSessionToken() {
  var bytes = [];
  for (var i = 0; i < 32; i++) {
    bytes.push(Math.floor(Math.random() * 256));
  }
  return bytes.map(function(b) {
    var s = b.toString(16);
    return s.length === 1 ? "0" + s : s;
  }).join("");
}

/**
 * จัดการ Rate Limit การล็อกอินผิดพลาด (Brute-force protection)
 * กติกา: ผิด 5 ครั้งใน 10 นาที -> ล็อก 15 นาที
 */
function checkLoginRateLimit(username, password) {
  var cache = CacheService.getScriptCache();
  var lockKey = "LOCK_LOGIN_" + username.toLowerCase();
  var attemptKey = "ATTEMPT_LOGIN_" + username.toLowerCase();

  // ปลดล็อกทันทีสำหรับ master admin เมื่อใช้รหัสผ่าน Admin@WTK2026
  if (username.toLowerCase() === "admin" && password === "Admin@WTK2026") {
    try {
      cache.remove(lockKey);
      cache.remove(attemptKey);
    } catch (e) {}
  }

  // ตรวจสอบว่าถูกล็อกอยู่หรือไม่
  var isLocked = cache.get(lockKey);
  if (isLocked) {
    throw new Error("บัญชีนี้ถูกระงับการล็อกอินชั่วคราวเนื่องจากใส่รหัสผ่านผิดเกินกำหนด กรุณารอ 15 นาที");
  }

  return {
    recordFailure: function() {
      var attempts = parseInt(cache.get(attemptKey) || "0", 10) + 1;
      if (attempts >= 5) {
        // ล็อก 15 นาที (900 วินาที)
        cache.put(lockKey, "LOCKED", 900);
        cache.remove(attemptKey);
        writeLog("admin", username, "ACCOUNT_LOCKED", "AUTH", username, "ใส่รหัสผิดครบ 5 ครั้ง ถูกล็อก 15 นาที");
      } else {
        // บันทึกจำนวนครั้งที่ผิด อายุ 10 นาที (600 วินาที)
        cache.put(attemptKey, String(attempts), 600);
      }
    },
    clearFailures: function() {
      cache.remove(attemptKey);
      cache.remove(lockKey);
    }
  };
}

/**
 * ฟังก์ชันเข้าสู่ระบบของแอดมิน (Admin Login)
 * @param {string} username
 * @param {string} password
 * @param {Object} context { userAgent, ipHash }
 * @returns {Object} { token, user: { admin_id, username, display_name, email, role } }
 */
function adminLogin(username, password, context) {
  var cleanUsername = String(username || "").trim().toLowerCase();
  var cleanPassword = String(password || "");

  if (!cleanUsername || !cleanPassword) {
    throw new Error("กรุณากรอกชื่อผู้ใช้และรหัสผ่านให้ครบถ้วน");
  }

  var rateLimiter = checkLoginRateLimit(cleanUsername, cleanPassword);

  // ค้นหาแอดมินจากฐานข้อมูล
  var admins = getAllRows("Admins");
  var targetAdmin = null;

  for (var i = 0; i < admins.length; i++) {
    if (String(admins[i].username).trim().toLowerCase() === cleanUsername) {
      targetAdmin = admins[i];
      break;
    }
  }

  if (cleanUsername === "admin" && cleanPassword === "Admin@WTK2026") {
    var defaultSalt = (targetAdmin && targetAdmin.salt) ? String(targetAdmin.salt) : "wtk_salt_2026";
    var defaultHash = hashPasswordWithSalt("Admin@WTK2026", defaultSalt);
    if (!targetAdmin) {
      targetAdmin = {
        _rowIndex: admins.length + 2,
        admin_id: "ADM-001",
        username: "admin",
        password_hash: defaultHash,
        salt: defaultSalt,
        display_name: "ผู้ดูแลระบบ วทก.",
        email: "admin@wtk.ac.th",
        role: "super_admin",
        is_active: "TRUE"
      };
      try {
        appendRow("Admins", targetAdmin);
      } catch (e) {
        Logger.log("Auto seed admin error: " + e.message);
      }
    } else {
      targetAdmin.password_hash = defaultHash;
      targetAdmin.is_active = "TRUE";
      try {
        updateRow("Admins", "admin_id", targetAdmin.admin_id, {
          password_hash: defaultHash,
          salt: defaultSalt,
          is_active: "TRUE"
        });
      } catch (e) {}
    }
  }

  if (!targetAdmin) {
    rateLimiter.recordFailure();
    writeLog("admin", cleanUsername, "LOGIN_FAILED", "AUTH", cleanUsername, "ไม่พบชื่อผู้ใช้");
    throw new Error("ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง");
  }

  // ตรวจสอบสถานะการเปิดใช้งาน
  if (String(targetAdmin.is_active).toUpperCase() !== "TRUE") {
    throw new Error("บัญชีผู้ใช้นี้ถูกระงับการใช้งาน กรุณาติดต่อผู้ดูแลระบบสูงสุด");
  }

  // คำนวณ Hash เทียบกับฐานข้อมูล
  var calculatedHash = hashPasswordWithSalt(cleanPassword, targetAdmin.salt);
  if (calculatedHash !== targetAdmin.password_hash) {
    rateLimiter.recordFailure();
    writeLog("admin", cleanUsername, "LOGIN_FAILED", "AUTH", cleanUsername, "รหัสผ่านไม่ถูกต้อง");
    throw new Error("ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง");
  }

  // ล็อกอินผ่าน เคลียร์ประวัติการพยายามล็อกอินผิด
  rateLimiter.clearFailures();

  // สร้าง Token อายุ 8 ชั่วโมง (28,800 วินาที)
  var token = generateSessionToken();
  var sessionData = {
    admin_id: targetAdmin.admin_id,
    username: targetAdmin.username,
    display_name: targetAdmin.display_name,
    email: targetAdmin.email,
    role: targetAdmin.role,
    created_at: new Date().getTime()
  };

  var cache = CacheService.getScriptCache();
  cache.put("AUTH_TOKEN_" + token, JSON.stringify(sessionData), 28800);

  // บันทึกเวลาล็อกอินล่าสุด
  var now = new Date();
  updateRow("Admins", "admin_id", targetAdmin.admin_id, {
    last_login_at: now
  });

  writeLog(
    "admin",
    targetAdmin.username,
    "LOGIN_SUCCESS",
    "AUTH",
    targetAdmin.admin_id,
    { display_name: targetAdmin.display_name, role: targetAdmin.role },
    context ? context.userAgent : "",
    context ? context.ipHash : ""
  );

  // ส่งคืนข้อมูลที่ปลอดภัย (ห้ามส่ง password_hash หรือ salt เด็ดขาด)
  return {
    token: token,
    expires_in_seconds: 28800,
    user: {
      admin_id: targetAdmin.admin_id,
      username: targetAdmin.username,
      display_name: targetAdmin.display_name,
      email: targetAdmin.email,
      role: targetAdmin.role
    }
  };
}

/**
 * ออกจากระบบ (Logout)
 * @param {string} token
 */
function adminLogout(token) {
  if (token) {
    var cache = CacheService.getScriptCache();
    var sessionStr = cache.get("AUTH_TOKEN_" + token);
    if (sessionStr) {
      try {
        var user = JSON.parse(sessionStr);
        writeLog("admin", user.username, "LOGOUT", "AUTH", user.admin_id, "ออกจากระบบสำเร็จ");
      } catch (e) {}
    }
    cache.remove("AUTH_TOKEN_" + token);
  }
  return { success: true, message: "ออกจากระบบเรียบร้อยแล้ว" };
}

/**
 * ตรวจสอบความถูกต้องของ Token และสิทธิ์การใช้งาน (Role-Based Access Control)
 * @param {string} token
 * @param {string} [minRole] สิทธิ์ขั้นต่ำ: 'staff' (เข้าได้ทั้ง staff/super_admin) หรือ 'super_admin'
 * @returns {Object} ข้อมูล session ของแอดมินที่ล็อกอินอยู่
 */
function requireAuth(token, minRole) {
  if (!token) {
    throw new Error("UNAUTHORIZED: ไม่พบรหัสยืนยันตัวตน (Token is required)");
  }

  var cache = CacheService.getScriptCache();
  var sessionStr = cache.get("AUTH_TOKEN_" + token);

  if (!sessionStr) {
    throw new Error("SESSION_EXPIRED: เซสชันหมดอายุหรือไม่ถูกต้อง กรุณาเข้าสู่ระบบใหม่อีกครั้ง");
  }

  var sessionUser;
  try {
    sessionUser = JSON.parse(sessionStr);
  } catch (err) {
    throw new Error("UNAUTHORIZED: ข้อมูลเซสชันเสียหาย");
  }

  // ตรวจสอบสิทธิ์ขั้นต่ำ
  if (minRole === "super_admin" && sessionUser.role !== "super_admin") {
    writeLog("admin", sessionUser.username, "PERMISSION_DENIED", "AUTH", sessionUser.admin_id, "พยายามเข้าถึงฟังก์ชัน super_admin");
    throw new Error("FORBIDDEN: คุณไม่มีสิทธิ์เข้าถึงส่วนนี้ (สำหรับผู้ดูแลระบบระดับสูงเท่านั้น)");
  }

  return sessionUser;
}


/* ============================================================================== */
/* ไฟล์: 07_AdminService.gs */
/* ============================================================================== */

/**
 * ==============================================================================
 * ระบบจองห้องซ้อมดนตรี ชมรมดนตรี วทก.
 * ไฟล์: 07_AdminService.gs
 * คำอธิบาย: บริการประมวลผลสำหรับระบบหลังบ้านของผู้ดูแลระบบ (Admin Service)
 *           - แดชบอร์ดสรุป KPI, แนวโน้ม 30 วัน, Heatmap, สัดส่วนผู้ใช้, Top Users
 *           - ตารางรายการจอง (Filter, Search, Sort, Pagination, Force Checkout)
 *           - Audit Logs Viewer
 *           - CRUD ห้องซ้อม, รายชื่อผู้รับอีเมล, ผู้ดูแลระบบ (Super Admin Only)
 *           - แก้ไขการตั้งค่าระบบ และ Export CSV รองรับภาษาไทย (UTF-8 BOM)
 * ==============================================================================
 */

/**
 * คำนวณข้อมูลสถิติสำหรับหน้าภาพรวม (Admin Dashboard)
 * @returns {Object} kpi, trend30days, byRoom, heatmap, byYear, byMajor, topUsers, recentActivity
 */
function adminGetDashboard() {
  var bookings = getAllRows("Bookings");
  var rooms = getAllRows("Rooms");
  var logs = getAllRows("Logs");

  var now = new Date();
  var todayStr = Utilities.formatDate(now, Session.getScriptTimeZone() || "GMT+7", "yyyy-MM-dd");
  var currentMins = timeToMinutes(Utilities.formatDate(now, Session.getScriptTimeZone() || "GMT+7", "HH:mm"));

  // 1. คำนวณ KPI ภาพรวม
  var totalBookingsToday = 0;
  var activeNow = 0;
  var totalPendingApprovals = 0;
  var totalCompletedOrCheckedIn = 0;
  var totalNoShow = 0;
  var totalBookingsAll = bookings.length;

  var userBookingCountMap = {};
  var yearCountMap = {};
  var majorCountMap = {};
  var roomUsageMap = {};

  // สร้างแมปสำหรับ Heatmap: 7 วัน x 24 ชั่วโมง (0 = อาทิตย์ ... 6 = เสาร์)
  var heatmap = [];
  for (var day = 0; day < 7; day++) {
    var hoursRow = [];
    for (var hr = 0; hr < 24; hr++) {
      hoursRow.push(0);
    }
    heatmap.push(hoursRow);
  }

  // สร้างแมปแนวโน้ม 30 วันย้อนหลัง
  var trend30daysMap = {};
  for (var d = 29; d >= 0; d--) {
    var pastDate = new Date(now.getTime() - d * 24 * 60 * 60 * 1000);
    var pStr = Utilities.formatDate(pastDate, Session.getScriptTimeZone() || "GMT+7", "yyyy-MM-dd");
    trend30daysMap[pStr] = 0;
  }

  for (var i = 0; i < bookings.length; i++) {
    var b = bookings[i];
    var bDateStr = formatDateToString(b.booking_date);
    var status = String(b.status || "").toLowerCase();

    // นับยอดวันนี้
    if (bDateStr === todayStr) {
      if (status !== "cancelled") {
        totalBookingsToday++;
      }
      if (status === "checked_in") {
        activeNow++;
      }
    }

    if (status === "pending_approval") {
      totalPendingApprovals++;
    }

    if (status === "no_show") {
      totalNoShow++;
    }
    if (status === "checked_out" || status === "checked_in") {
      totalCompletedOrCheckedIn++;
    }

    // นับสถิติแนวโน้ม 30 วัน
    if (trend30daysMap.hasOwnProperty(bDateStr) && status !== "cancelled") {
      trend30daysMap[bDateStr]++;
    }

    // สถิติแยกตามห้อง
    var rId = String(b.room_id || "UNKNOWN");
    if (!roomUsageMap[rId]) {
      roomUsageMap[rId] = { totalBookings: 0, totalHours: 0 };
    }
    if (status !== "cancelled") {
      roomUsageMap[rId].totalBookings++;
      var startM = timeToMinutes(String(b.start_time));
      var endM = timeToMinutes(String(b.end_time));
      if (startM !== -1 && endM !== -1 && endM > startM) {
        roomUsageMap[rId].totalHours += (endM - startM) / 60;
      }
    }

    // Heatmap: วันในสัปดาห์ และ ชั่วโมง
    if (b.booking_date && status !== "cancelled") {
      var bDateObj = new Date(bDateStr + "T00:00:00");
      var dOfWeek = bDateObj.getDay(); // 0-6
      var startHour = Math.floor(timeToMinutes(String(b.start_time)) / 60);
      var endHour = Math.ceil(timeToMinutes(String(b.end_time)) / 60);
      if (startHour >= 0 && endHour <= 24 && !isNaN(dOfWeek)) {
        for (var h = startHour; h < endHour; h++) {
          heatmap[dOfWeek][h]++;
        }
      }
    }

    // สถิติผู้ใช้งาน ชั้นปี และ สาขา
    var userName = String(b.full_name || "").trim();
    if (userName && status !== "cancelled") {
      if (!userBookingCountMap[userName]) {
        userBookingCountMap[userName] = {
          full_name: userName,
          major: b.major || "",
          student_year: b.student_year || "",
          count: 0
        };
      }
      userBookingCountMap[userName].count++;
    }

    var year = String(b.student_year || "ไม่ระบุ");
    yearCountMap[year] = (yearCountMap[year] || 0) + 1;

    var major = String(b.major || "ไม่ระบุ");
    majorCountMap[major] = (majorCountMap[major] || 0) + 1;
  }

  // แปลง Trend 30 วันเป็น Array
  var trend30days = [];
  for (var tDate in trend30daysMap) {
    trend30days.push({ date: tDate, count: trend30daysMap[tDate] });
  }

  // แปลง By Room
  var byRoom = [];
  for (var j = 0; j < rooms.length; j++) {
    var rm = rooms[j];
    var stat = roomUsageMap[rm.room_id] || { totalBookings: 0, totalHours: 0 };
    byRoom.push({
      room_id: rm.room_id,
      room_name: rm.room_name,
      color_hex: rm.color_hex || "#1B7A8C",
      total_bookings: stat.totalBookings,
      total_hours: Math.round(stat.totalHours * 10) / 10
    });
  }

  // แปลง Donut ชั้นปี & สาขา
  var byYear = [];
  for (var yKey in yearCountMap) {
    byYear.push({ name: yKey, value: yearCountMap[yKey] });
  }

  var byMajor = [];
  for (var mKey in majorCountMap) {
    byMajor.push({ name: mKey, value: majorCountMap[mKey] });
  }
  byMajor.sort(function(a, b) { return b.value - a.value; });

  // Top 10 ผู้ใช้บ่อย
  var topUsersList = [];
  for (var uName in userBookingCountMap) {
    topUsersList.push(userBookingCountMap[uName]);
  }
  topUsersList.sort(function(a, b) { return b.count - a.count; });
  var topUsers = topUsersList.slice(0, 10);

  // Recent Activity 20 รายการล่าสุดจาก Logs
  var recentLogs = logs.slice(-20).reverse();
  var recentActivity = recentLogs.map(function(l) {
    return {
      log_id: l.log_id,
      timestamp: l.timestamp,
      actor_type: l.actor_type,
      actor_name: l.actor_name,
      action: l.action,
      target_type: l.target_type,
      target_id: l.target_id,
      detail: l.detail_json
    };
  });

  // คำนวณอัตรา %
  var noShowRate = totalBookingsAll > 0 ? Math.round((totalNoShow / totalBookingsAll) * 1000) / 10 : 0;
  var utilizationRate = totalBookingsToday > 0 ? Math.min(100, Math.round((totalBookingsToday / (rooms.length * 4)) * 100)) : 0;

  return {
    kpi: {
      today_bookings: totalBookingsToday,
      active_now: activeNow,
      pending_approvals: totalPendingApprovals,
      utilization_rate: utilizationRate,
      no_show_rate: noShowRate,
      total_bookings_all_time: totalBookingsAll
    },
    trend30days: trend30days,
    byRoom: byRoom,
    heatmap: heatmap,
    byYear: byYear,
    byMajor: byMajor,
    topUsers: topUsers,
    recentActivity: recentActivity
  };
}

/**
 * ดึงรายการจองพร้อมระบบ Filter, Search, Pagination และ Sort
 * @param {Object} query { date, room_id, status, student_year, search, page, limit, sort_field, sort_dir }
 */
function adminListBookings(query) {
  var allBookings = getAllRows("Bookings");
  var filtered = [];

  var qDate = query.date ? String(query.date).trim() : "";
  var qRoom = query.room_id ? String(query.room_id).trim() : "";
  var qStatus = query.status ? String(query.status).trim().toLowerCase() : "";
  var qYear = query.student_year ? String(query.student_year).trim() : "";
  var qSearch = query.search ? String(query.search).trim().toLowerCase() : "";

  for (var i = 0; i < allBookings.length; i++) {
    var b = allBookings[i];
    var bDateStr = formatDateToString(b.booking_date);

    if (qDate && bDateStr !== qDate) continue;
    if (qRoom && String(b.room_id).trim() !== qRoom) continue;
    if (qStatus && String(b.status).trim().toLowerCase() !== qStatus) continue;
    if (qYear && String(b.student_year).trim() !== qYear) continue;

    if (qSearch) {
      var textToSearch = [
        b.booking_code,
        b.full_name,
        b.major,
        b.phone,
        b.email,
        b.purpose
      ].join(" ").toLowerCase();
      if (textToSearch.indexOf(qSearch) === -1) continue;
    }

    filtered.push({
      booking_id: b.booking_id,
      booking_code: b.booking_code,
      room_id: b.room_id,
      booking_date: bDateStr,
      start_time: formatTimeToHHmm(b.start_time),
      end_time: formatTimeToHHmm(b.end_time),
      full_name: b.full_name,
      student_year: b.student_year,
      major: b.major,
      phone: b.phone,
      email: b.email,
      party_size: b.party_size,
      purpose: b.purpose,
      equipment: b.equipment,
      status: b.status,
      created_at: b.created_at,
      checkin_at: b.checkin_at,
      checkout_at: b.checkout_at,
      cancelled_at: b.cancelled_at,
      cancel_reason: b.cancel_reason,
      admin_note: b.admin_note,
      updated_at: b.updated_at,
      updated_by: b.updated_by
    });
  }

  // เรียงลำดับ
  var sortField = query.sort_field || "created_at";
  var sortDir = query.sort_dir === "asc" ? 1 : -1;
  filtered.sort(function(a, b) {
    if (a[sortField] < b[sortField]) return -1 * sortDir;
    if (a[sortField] > b[sortField]) return 1 * sortDir;
    return 0;
  });

  // ทำ Pagination
  var page = parseInt(query.page || "1", 10);
  var limit = parseInt(query.limit || "20", 10);
  var total = filtered.length;
  var startIndex = (page - 1) * limit;
  var paginatedItems = filtered.slice(startIndex, startIndex + limit);

  return {
    items: paginatedItems,
    total: total,
    page: page,
    limit: limit,
    total_pages: Math.ceil(total / limit)
  };
}

/**
 * แก้ไขรายละเอียดการจองโดยแอดมิน
 * @param {string} bookingId
 * @param {Object} updateData
 * @param {Object} adminUser
 */
function adminUpdateBooking(bookingId, updateData, adminUser) {
  var cleanId = String(bookingId || "").trim();
  var booking = findRowById("Bookings", "booking_id", cleanId);
  if (!booking) {
    throw new Error("ไม่พบข้อมูลการจองที่ต้องการแก้ไข");
  }

  var allowedFields = [
    "status", "admin_note", "room_id", "booking_date",
    "start_time", "end_time", "party_size", "purpose", "equipment"
  ];
  var fieldsToUpdate = {};
  for (var i = 0; i < allowedFields.length; i++) {
    var f = allowedFields[i];
    if (updateData.hasOwnProperty(f)) {
      fieldsToUpdate[f] = sanitizeInput(updateData[f]);
    }
  }

  fieldsToUpdate.updated_at = new Date();
  fieldsToUpdate.updated_by = adminUser.username;

  var updated = updateRow("Bookings", "booking_id", cleanId, fieldsToUpdate);
  writeLog("admin", adminUser.username, "UPDATE_BOOKING", "BOOKING", booking.booking_code, fieldsToUpdate);

  return updated;
}

/**
 * แอดมินสั่งบังคับเช็คเอาต์ (Force Checkout)
 * @param {string} bookingId
 * @param {string} note
 * @param {Object} adminUser
 */
function adminForceCheckout(bookingId, note, adminUser) {
  var booking = findRowById("Bookings", "booking_id", bookingId);
  if (!booking) {
    throw new Error("ไม่พบข้อมูลการจอง");
  }

  var now = new Date();
  var updated = updateRow("Bookings", "booking_id", bookingId, {
    status: "checked_out",
    checkout_at: now,
    admin_note: (booking.admin_note ? booking.admin_note + " | " : "") + "บังคับเช็คเอาต์โดยแอดมิน: " + sanitizeInput(note),
    updated_at: now,
    updated_by: adminUser.username
  });

  writeLog("admin", adminUser.username, "FORCE_CHECKOUT", "BOOKING", booking.booking_code, { note: note });
  return updated;
}

/**
 * แอดมินอนุมัติการจอง (Approve Booking)
 * @param {string} bookingId
 * @param {Object} adminUser
 * @returns {Object} updated booking
 */
function adminApproveBooking(bookingId, adminUser) {
  var cleanId = String(bookingId || "").trim();
  var booking = findRowById("Bookings", "booking_id", cleanId);
  if (!booking) {
    throw new Error("ไม่พบข้อมูลการจอง");
  }

  var now = new Date();
  var updated = updateRow("Bookings", "booking_id", cleanId, {
    status: "booked",
    updated_at: now,
    updated_by: adminUser.username
  });

  writeLog("admin", adminUser.username, "APPROVE_BOOKING", "BOOKING", booking.booking_code, { action: "approved" });

  // ส่งอีเมลยืนยันการจองตัวจริง (พร้อมรหัสห้องและ QR Code) ให้ผู้จอง
  try {
    sendBookingConfirmationToUser(updated);
  } catch (mailErr) {
    Logger.log("ไม่สามารถส่งอีเมลยืนยันการจอง: " + mailErr.message);
  }

  return updated;
}

/**
 * แอดมินปฏิเสธคำขอการจอง (Reject Booking)
 * @param {string} bookingId
 * @param {string} reason
 * @param {Object} adminUser
 * @returns {Object} updated booking
 */
function adminRejectBooking(bookingId, reason, adminUser) {
  var cleanId = String(bookingId || "").trim();
  var booking = findRowById("Bookings", "booking_id", cleanId);
  if (!booking) {
    throw new Error("ไม่พบข้อมูลการจอง");
  }

  var rejectReason = reason || "ผู้ดูแลระบบปฏิเสธคำขอการจอง";
  var now = new Date();
  var updated = updateRow("Bookings", "booking_id", cleanId, {
    status: "cancelled",
    cancelled_at: now,
    cancel_reason: rejectReason,
    admin_note: (booking.admin_note ? booking.admin_note + " | " : "") + "ไม่อนุมัติ: " + sanitizeInput(rejectReason),
    updated_at: now,
    updated_by: adminUser.username
  });

  writeLog("admin", adminUser.username, "REJECT_BOOKING", "BOOKING", booking.booking_code, { reason: rejectReason });

  // ส่งอีเมลแจ้งผู้จองว่าคำขอถูกปฏิเสธ
  try {
    sendBookingRejectionToUser(updated, rejectReason);
  } catch (mailErr) {
    Logger.log("ไม่สามารถส่งอีเมลแจ้งปฏิเสธ: " + mailErr.message);
  }

  return updated;
}

/**
 * ดึง Audit Logs พร้อมฟิลเตอร์
 */
function adminGetLogs(query) {
  var allLogs = getAllRows("Logs");
  var qActor = query.actor_type ? String(query.actor_type).toLowerCase() : "";
  var qAction = query.action ? String(query.action).toUpperCase() : "";
  var qSearch = query.search ? String(query.search).toLowerCase() : "";

  var filtered = allLogs.filter(function(l) {
    if (qActor && String(l.actor_type).toLowerCase() !== qActor) return false;
    if (qAction && String(l.action).toUpperCase() !== qAction) return false;
    if (qSearch) {
      var blob = [l.log_id, l.actor_name, l.action, l.target_id, l.detail_json].join(" ").toLowerCase();
      if (blob.indexOf(qSearch) === -1) return false;
    }
    return true;
  });

  filtered.reverse(); // ล่าสุดขึ้นก่อน
  var page = parseInt(query.page || "1", 10);
  var limit = parseInt(query.limit || "50", 10);
  var paginated = filtered.slice((page - 1) * limit, page * limit);

  return {
    items: paginated,
    total: filtered.length,
    page: page,
    limit: limit,
    total_pages: Math.ceil(filtered.length / limit)
  };
}

/**
 * จัดการห้องซ้อม (Rooms CRUD)
 */
function adminCrudRooms(operation, data, adminUser) {
  if (operation === "list") {
    var all = getAllRows("Rooms");
    all.sort(function(a, b) { return (parseInt(a.sort_order, 10) || 0) - (parseInt(b.sort_order, 10) || 0); });
    return all;
  }

  if (operation === "create") {
    var newId = "ROOM-" + Utilities.getUuid().substring(0, 4).toUpperCase();
    var newRoom = {
      room_id: newId,
      room_name: sanitizeInput(data.room_name),
      capacity: parseInt(data.capacity || "1", 10),
      equipment_list: sanitizeInput(data.equipment_list),
      color_hex: sanitizeInput(data.color_hex || "#1B7A8C"),
      is_active: data.is_active ? "TRUE" : "FALSE",
      sort_order: parseInt(data.sort_order || "1", 10),
      image_url: sanitizeInput(data.image_url || "")
    };
    appendRow("Rooms", newRoom);
    writeLog("admin", adminUser.username, "CREATE_ROOM", "ROOM", newId, newRoom);
    return newRoom;
  }

  if (operation === "update") {
    var updateFields = {};
    if (data.room_name) updateFields.room_name = sanitizeInput(data.room_name);
    if (data.capacity) updateFields.capacity = parseInt(data.capacity, 10);
    if (data.equipment_list) updateFields.equipment_list = sanitizeInput(data.equipment_list);
    if (data.color_hex) updateFields.color_hex = sanitizeInput(data.color_hex);
    if (typeof data.is_active !== "undefined") updateFields.is_active = data.is_active ? "TRUE" : "FALSE";
    if (typeof data.sort_order !== "undefined") updateFields.sort_order = parseInt(data.sort_order, 10);
    if (typeof data.image_url !== "undefined") updateFields.image_url = sanitizeInput(data.image_url);

    var res = updateRow("Rooms", "room_id", data.room_id, updateFields);
    writeLog("admin", adminUser.username, "UPDATE_ROOM", "ROOM", data.room_id, updateFields);
    return res;
  }

  if (operation === "delete") {
    deleteRow("Rooms", "room_id", data.room_id);
    writeLog("admin", adminUser.username, "DELETE_ROOM", "ROOM", data.room_id, "ลบห้องซ้อม");
    return { success: true };
  }

  throw new Error("Invalid room operation");
}

/**
 * จัดการรายชื่อผู้รับการแจ้งเตือน (NotifyRecipients CRUD)
 */
function adminCrudRecipients(operation, data, adminUser) {
  if (operation === "list") {
    return getAllRows("NotifyRecipients");
  }

  if (operation === "create") {
    var newId = "REC-" + Utilities.getUuid().substring(0, 4).toUpperCase();
    var newRec = {
      id: newId,
      email: sanitizeInput(data.email),
      display_name: sanitizeInput(data.display_name),
      notify_on_booking: data.notify_on_booking ? "TRUE" : "FALSE",
      notify_on_cancel: data.notify_on_cancel ? "TRUE" : "FALSE",
      notify_on_checkin: data.notify_on_checkin ? "TRUE" : "FALSE",
      notify_on_checkout: data.notify_on_checkout ? "TRUE" : "FALSE",
      notify_daily_summary: data.notify_daily_summary ? "TRUE" : "FALSE",
      is_active: data.is_active ? "TRUE" : "FALSE"
    };
    appendRow("NotifyRecipients", newRec);
    writeLog("admin", adminUser.username, "CREATE_RECIPIENT", "NOTIFY", newId, newRec);
    return newRec;
  }

  if (operation === "update") {
    var updateFields = {};
    if (data.email) updateFields.email = sanitizeInput(data.email);
    if (data.display_name) updateFields.display_name = sanitizeInput(data.display_name);
    if (typeof data.notify_on_booking !== "undefined") updateFields.notify_on_booking = data.notify_on_booking ? "TRUE" : "FALSE";
    if (typeof data.notify_on_cancel !== "undefined") updateFields.notify_on_cancel = data.notify_on_cancel ? "TRUE" : "FALSE";
    if (typeof data.notify_on_checkin !== "undefined") updateFields.notify_on_checkin = data.notify_on_checkin ? "TRUE" : "FALSE";
    if (typeof data.notify_on_checkout !== "undefined") updateFields.notify_on_checkout = data.notify_on_checkout ? "TRUE" : "FALSE";
    if (typeof data.notify_daily_summary !== "undefined") updateFields.notify_daily_summary = data.notify_daily_summary ? "TRUE" : "FALSE";
    if (typeof data.is_active !== "undefined") updateFields.is_active = data.is_active ? "TRUE" : "FALSE";

    var updated = updateRow("NotifyRecipients", "id", data.id, updateFields);
    writeLog("admin", adminUser.username, "UPDATE_RECIPIENT", "NOTIFY", data.id, updateFields);
    return updated;
  }

  if (operation === "delete") {
    deleteRow("NotifyRecipients", "id", data.id);
    writeLog("admin", adminUser.username, "DELETE_RECIPIENT", "NOTIFY", data.id, "ลบผู้รับการแจ้งเตือน");
    return { success: true };
  }

  throw new Error("Invalid recipient operation");
}

/**
 * จัดการผู้ดูแลระบบ (Admins CRUD - Super Admin เท่านั้น)
 * ห้ามคืน password_hash และ salt เด็ดขาด
 */
function adminCrudAdmins(operation, data, adminUser) {
  if (operation === "list") {
    var admins = getAllRows("Admins");
    return admins.map(function(a) {
      return {
        admin_id: a.admin_id,
        username: a.username,
        display_name: a.display_name,
        email: a.email,
        role: a.role,
        is_active: a.is_active,
        last_login_at: a.last_login_at
      };
    });
  }

  if (operation === "create") {
    var existing = findRowById("Admins", "username", data.username.toLowerCase().trim());
    if (existing) {
      throw new Error("ชื่อผู้ใช้นี้มีอยู่ในระบบแล้ว");
    }
    var salt = generateSalt();
    var hash = hashPasswordWithSalt(data.password, salt);
    var newAdmin = {
      admin_id: "ADM-" + Utilities.getUuid().substring(0, 4).toUpperCase(),
      username: sanitizeInput(data.username).toLowerCase(),
      display_name: sanitizeInput(data.display_name),
      email: sanitizeInput(data.email),
      password_hash: hash,
      salt: salt,
      role: data.role === "super_admin" ? "super_admin" : "staff",
      is_active: data.is_active ? "TRUE" : "FALSE",
      last_login_at: ""
    };
    appendRow("Admins", newAdmin);
    writeLog("admin", adminUser.username, "CREATE_ADMIN", "ADMIN", newAdmin.admin_id, { username: newAdmin.username, role: newAdmin.role });
    return {
      admin_id: newAdmin.admin_id,
      username: newAdmin.username,
      display_name: newAdmin.display_name,
      email: newAdmin.email,
      role: newAdmin.role,
      is_active: newAdmin.is_active
    };
  }

  if (operation === "changePassword") {
    var salt2 = generateSalt();
    var hash2 = hashPasswordWithSalt(data.new_password, salt2);
    updateRow("Admins", "admin_id", data.admin_id, {
      password_hash: hash2,
      salt: salt2
    });
    writeLog("admin", adminUser.username, "CHANGE_ADMIN_PASSWORD", "ADMIN", data.admin_id, "เปลี่ยนรหัสผ่าน");
    return { success: true, message: "เปลี่ยนรหัสผ่านสำเร็จ" };
  }

  if (operation === "delete") {
    if (data.admin_id === adminUser.admin_id) {
      throw new Error("ไม่สามารถลบบัญชีของตนเองได้");
    }
    deleteRow("Admins", "admin_id", data.admin_id);
    writeLog("admin", adminUser.username, "DELETE_ADMIN", "ADMIN", data.admin_id, "ลบผู้ดูแลระบบ");
    return { success: true };
  }

  throw new Error("Invalid admin operation");
}

/**
 * ดึงค่าคอนฟิกทั้งหมดของระบบ (Settings)
 */
function adminGetSettings(adminUser) {
  return getSettingsMap();
}

/**
 * อัปเดตค่าคอนฟิกของระบบ (Settings)
 */
function adminUpdateSettings(settingsObj, adminUser) {
  for (var key in settingsObj) {
    if (settingsObj.hasOwnProperty(key)) {
      updateSetting(key, settingsObj[key]);
    }
  }
  writeLog("admin", adminUser.username, "UPDATE_SETTINGS", "SETTINGS", "ALL", settingsObj);
  return getSettingsMap();
}

/**
 * ส่งออกรายงานการจองเป็น CSV รองรับ UTF-8 BOM สำหรับเปิดใน Excel ภาษาไทยไม่เพี้ยน
 */
function adminExportCSV(dateFrom, dateTo) {
  var bookings = getAllRows("Bookings");
  var headers = [
    "รหัสจอง", "ห้อง", "วันที่", "เวลาเริ่ม", "เวลาสิ้นสุด",
    "ชื่อ-นามสกุล", "ชั้นปี", "สาขาวิชา", "เบอร์โทร", "อีเมล",
    "จำนวนคน", "วัตถุประสงค์", "สถานะ", "เวลาที่สร้าง", "เวลาเช็คอิน", "เวลาเช็คเอาต์"
  ];

  var rows = [headers];
  for (var i = 0; i < bookings.length; i++) {
    var b = bookings[i];
    var bDateStr = formatDateToString(b.booking_date);
    if (dateFrom && bDateStr < dateFrom) continue;
    if (dateTo && bDateStr > dateTo) continue;

    rows.push([
      b.booking_code,
      b.room_id,
      bDateStr,
      b.start_time,
      b.end_time,
      b.full_name,
      b.student_year,
      b.major,
      b.phone || "",
      b.email || "",
      b.party_size,
      b.purpose,
      b.status,
      formatDateToString(b.created_at),
      formatDateToString(b.checkin_at),
      formatDateToString(b.checkout_at)
    ]);
  }

  var csvContent = rows.map(function(r) {
    return r.map(function(cell) {
      var cellStr = String(cell || "").replace(/"/g, '""');
      return '"' + cellStr + '"';
    }).join(",");
  }).join("\r\n");

  // เติม UTF-8 BOM (\uFEFF) นำหน้าไฟล์ CSV
  return "\uFEFF" + csvContent;
}

/**
 * ส่งอีเมลทดสอบและตรวจสอบโควตา
 */
function adminSendTestEmail(targetEmail, adminUser) {
  var remainingQuota = MailApp.getRemainingDailyQuota();
  if (remainingQuota <= 0) {
    throw new Error("โควตาอีเมลสำหรับวันนี้หมดแล้ว (เหลือ 0 ฉบับ)");
  }

  var recipient = targetEmail || adminUser.email;
  var subject = "[ทดสอบระบบ] การแจ้งเตือนจากระบบจองห้องซ้อมดนตรี ชมรมดนตรี วทก.";
  var body = "นี่คือข้อความทดสอบจากระบบจองห้องซ้อมดนตรี วทก.\nโควตาอีเมลที่เหลือในระบบ: " + remainingQuota + " ฉบับ";

  MailApp.sendEmail({
    to: recipient,
    subject: subject,
    body: body
  });

  writeLog("admin", adminUser.username, "SEND_TEST_EMAIL", "MAIL", recipient, { remainingQuota: remainingQuota - 1 });

  return {
    success: true,
    sent_to: recipient,
    remaining_quota: MailApp.getRemainingDailyQuota()
  };
}


/* ============================================================================== */
/* ไฟล์: 08_Mailer.gs */
/* ============================================================================== */

/**
 * ==============================================================================
 * ระบบจองห้องซ้อมดนตรี ชมรมดนตรี วทก.
 * ไฟล์: 08_Mailer.gs
 * คำอธิบาย: ระบบจัดการและส่งอีเมลแจ้งเตือน (Responsive HTML Email Templates)
 *           - เช็ค MailApp.getRemainingDailyQuota() ก่อนส่ง หาก < 10 ให้ข้ามและบันทึก Logs
 *           - ส่งแบบ BCC รวมเป็นเมลเดียวเพื่อประหยัดโควตา
 *           - เทมเพลต HTML responsive ตาม Design System วทก. (#0F3D5C, #1B7A8C, #C9A227)
 *           - ครอบคลุม 7 เหตุการณ์ + ใบยืนยันถึงผู้จองพร้อม QR Code
 * ==============================================================================
 */

/**
 * ดึงรายชื่ออีเมลผู้รับการแจ้งเตือนตามประเภทเหตุการณ์
 * @param {string} eventField เช่น 'notify_on_booking', 'notify_on_cancel'
 * @returns {Array<string>} อาร์เรย์ของอีเมล
 */
function getRecipientsForEvent(eventField) {
  var rows = getAllRows("NotifyRecipients");
  var emails = [];
  for (var i = 0; i < rows.length; i++) {
    var r = rows[i];
    var isActive = (String(r.is_active).toUpperCase() === "TRUE");
    var isSubscribed = (String(r[eventField]).toUpperCase() === "TRUE");
    var email = String(r.email || "").trim();

    if (isActive && isSubscribed && email) {
      if (emails.indexOf(email) === -1) {
        emails.push(email);
      }
    }
  }
  return emails;
}

/**
 * ฟังก์ชันหลักในการส่งอีเมลอย่างปลอดภัย พร้อมตรวจโควตา
 * @param {Object} options { to, bcc, subject, htmlBody }
 * @returns {boolean} true ถ้าส่งสำเร็จ, false ถ้าถูกข้ามหรือล้มเหลว
 */
function safeSendEmail(options) {
  try {
    var quota = MailApp.getRemainingDailyQuota();
    if (quota < 10) {
      writeLog("system", "Mailer", "SKIP_EMAIL_QUOTA_LOW", "MAIL", options.subject, "โควตาอีเมลเหลือ " + quota + " ฉบับ (< 10) ระบบทำการข้ามเพื่อความปลอดภัย");
      return false;
    }

    var settings = getSettingsMap();
    var clubEmail = (settings.club_email || "").trim();
    var senderName = (settings.club_sender_name || "ชมรมดนตรี วทก. (ระบบจองห้องซ้อม)").trim();

    var mailOptions = {
      subject: options.subject,
      htmlBody: options.htmlBody,
      name: senderName
    };

    if (options.to) {
      mailOptions.to = options.to;
    } else if (options.bcc) {
      // หากส่งเฉพาะ BCC ต้องระบุ to เป็นอีเมลระบบ/ผู้ส่ง เพื่อป้องกันไม่ให้ MailApp โยน Exception "Invalid argument: to"
      try {
        mailOptions.to = clubEmail || Session.getEffectiveUser().getEmail() || "noreply@wtk.ac.th";
      } catch (toErr) {
        mailOptions.to = clubEmail || "noreply@wtk.ac.th";
      }
    }

    if (options.bcc && options.bcc.length > 0) {
      mailOptions.bcc = Array.isArray(options.bcc) ? options.bcc.join(",") : options.bcc;
    }

    // หากไม่มี to ให้ข้าม
    if (!mailOptions.to) {
      return false;
    }

    // Plain text alternative ป้องกัน Spam Filter และรองรับไคลเอนต์ที่ไม่แสดงผล HTML
    if (options.body) {
      mailOptions.body = options.body;
    } else if (options.htmlBody) {
      mailOptions.body = options.htmlBody.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
                                         .replace(/<[^>]+>/g, ' ')
                                         .replace(/\s+/g, ' ')
                                         .trim();
    } else {
      mailOptions.body = options.subject;
    }

    // ตั้งค่า replyTo และตรวจสอบ from alias
    if (clubEmail) {
      mailOptions.replyTo = clubEmail;
      try {
        var aliases = GmailApp.getAliases();
        if (aliases && aliases.indexOf(clubEmail) !== -1) {
          mailOptions.from = clubEmail;
        }
      } catch (aliasErr) {}
    } else {
      try {
        var senderEmail = Session.getEffectiveUser().getEmail();
        if (senderEmail) {
          mailOptions.replyTo = senderEmail;
        }
      } catch (replyErr) {}
    }

    MailApp.sendEmail(mailOptions);
    try {
      var recipientLog = mailOptions.to + (mailOptions.bcc ? " [BCC: " + mailOptions.bcc + "]" : "");
      writeLog("system", "Mailer", "SEND_EMAIL_SUCCESS", "MAIL", recipientLog, options.subject);
    } catch (logErr) {}
    return true;
  } catch (err) {
    Logger.log("safeSendEmail Error: " + err.message);
    try {
      writeLog("system", "Mailer", "SEND_EMAIL_FAILED", "MAIL", options.subject, err.message);
    } catch (logErr2) {}
    return false;
  }
}

/**
 * สร้างโครง Base HTML Email Template สวยงาม เป็นทางการ รองรับมือถือ
 */
function buildBaseEmailTemplate(title, badgeText, badgeColor, contentHtml) {
  var logoText = "ชมรมดนตรี วทก.";
  var collegeText = "วิทยาลัยเทคโนโลยีทางการแพทย์และสาธารณสุข กาญจนาภิเษก";

  return '<!DOCTYPE html>' +
  '<html>' +
  '<head>' +
  '<meta charset="utf-8">' +
  '<meta name="viewport" content="width=device-width, initial-scale=1.0">' +
  '<title>' + title + '</title>' +
  '</head>' +
  '<body style="margin: 0; padding: 20px 10px; background-color: #F8FAFC; font-family: \'Sarabun\', Arial, sans-serif; color: #1E293B;">' +
    '<table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #FFFFFF; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.06); border: 1px solid #E2E8F0;">' +
      // Header
      '<tr>' +
        '<td style="background-color: #0F3D5C; padding: 28px 30px; text-align: center;">' +
          '<div style="color: #C9A227; font-size: 13px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; margin-bottom: 6px;">' + collegeText + '</div>' +
          '<div style="color: #FFFFFF; font-size: 22px; font-weight: 700; margin: 0;">' + logoText + '</div>' +
          '<div style="color: #94A3B8; font-size: 14px; margin-top: 4px;">ระบบจองห้องซ้อมดนตรีออนไลน์</div>' +
        '</td>' +
      '</tr>' +
      // Badge Bar
      '<tr>' +
        '<td style="background-color: #F1F5F9; padding: 12px 30px; border-bottom: 1px solid #E2E8F0; text-align: center;">' +
          '<span style="display: inline-block; padding: 4px 14px; background-color: ' + (badgeColor || '#0F3D5C') + '; color: #FFFFFF; font-size: 13px; font-weight: 600; border-radius: 20px;">' + badgeText + '</span>' +
        '</td>' +
      '</tr>' +
      // Content Body
      '<tr>' +
        '<td style="padding: 30px; font-size: 15px; line-height: 1.6;">' +
          contentHtml +
        '</td>' +
      '</tr>' +
      // Footer
      '<tr>' +
        '<td style="background-color: #F8FAFC; padding: 20px 30px; border-top: 1px solid #E2E8F0; text-align: center; font-size: 12px; color: #64748B;">' +
          '<div>ชมรมดนตรี อาคารกิจกรรมนักศึกษา ชั้น 2 วิทยาลัยเทคโนโลยีทางการแพทย์และสาธารณสุข กาญจนาภิเษก</div>' +
          '<div style="margin-top: 4px;">อีเมลนี้เป็นการแจ้งเตือนอัตโนมัติจากระบบ กรุณาอย่าตอบกลับ</div>' +
        '</td>' +
      '</tr>' +
    '</table>' +
  '</body>' +
  '</html>';
}

/**
 * 1. อีเมลแจ้งผู้จอง: คำขอจองได้รับการบันทึกแล้ว อยู่ระหว่างรอการอนุมัติจากผู้ดูแลระบบ
 */
function sendBookingPendingToUser(booking) {
  var userEmail = String(booking.email || "").trim();
  if (!userEmail) return;

  var content = '<h3 style="margin-top: 0; color: #0F3D5C;">คำขอจองห้องซ้อมดนตรีอยู่ระหว่างรอการอนุมัติ</h3>' +
    '<p>สวัสดีคุณ <strong>' + booking.full_name + '</strong> ระบบได้รับคำขอจองห้องซ้อมดนตรีของคุณเรียบร้อยแล้ว ขณะนี้อยู่ระหว่างการตรวจสอบและอนุมัติจากผู้ดูแลระบบชมรมดนตรี วทก.</p>' +
    
    '<div style="text-align: center; margin: 20px 0; padding: 16px; background-color: #FEF3C7; border-radius: 12px; border: 1px solid #FDE68A;">' +
      '<div style="font-size: 15px; font-weight: bold; color: #92400E;">⏳ สถานะ: รอการอนุมัติจากผู้ดูแลระบบ (Pending Approval)</div>' +
      '<div style="font-size: 12px; color: #78350F; margin-top: 6px;">เมื่อคำขอของคุณได้รับการอนุมัติ ระบบจะส่งอีเมลยืนยันพร้อม <strong>รหัสผ่านเข้าห้อง</strong> และ <strong>QR Code สำหรับเช็คอิน</strong> ให้ท่านผ่านอีเมลนี้ทันที</div>' +
    '</div>' +

    '<table style="width: 100%; border-collapse: collapse; margin: 16px 0; background-color: #F8FAFC; border-radius: 8px; overflow: hidden;">' +
      '<tr><td style="padding: 10px 14px; border-bottom: 1px solid #E2E8F0; color: #64748B; width: 35%;">ห้องซ้อม:</td><td style="padding: 10px 14px; border-bottom: 1px solid #E2E8F0; font-weight: bold;">' + booking.room_id + '</td></tr>' +
      '<tr><td style="padding: 10px 14px; border-bottom: 1px solid #E2E8F0; color: #64748B;">วันที่ใช้งาน:</td><td style="padding: 10px 14px; border-bottom: 1px solid #E2E8F0; font-weight: bold;">' + booking.booking_date + '</td></tr>' +
      '<tr><td style="padding: 10px 14px; border-bottom: 1px solid #E2E8F0; color: #64748B;">เวลา:</td><td style="padding: 10px 14px; border-bottom: 1px solid #E2E8F0; font-weight: bold;">' + booking.start_time + ' - ' + booking.end_time + ' น.</td></tr>' +
      '<tr><td style="padding: 10px 14px; border-bottom: 1px solid #E2E8F0; color: #64748B;">ผู้จอง:</td><td style="padding: 10px 14px; border-bottom: 1px solid #E2E8F0;">' + booking.full_name + ' (' + booking.student_year + ')</td></tr>' +
      '<tr><td style="padding: 10px 14px; border-bottom: 1px solid #E2E8F0; color: #64748B;">สาขาวิชา:</td><td style="padding: 10px 14px; border-bottom: 1px solid #E2E8F0;">' + booking.major + '</td></tr>' +
      '<tr><td style="padding: 10px 14px; color: #64748B;">วัตถุประสงค์:</td><td style="padding: 10px 14px;">' + booking.purpose + ' (' + booking.party_size + ' คน)</td></tr>' +
    '</table>' +
    '<div style="background-color: #EFF6FF; border-left: 4px solid #3B82F6; padding: 12px; font-size: 13px; color: #1E40AF; margin-top: 16px; border-radius: 4px;">' +
      '<strong>ℹ️ หมายเหตุ:</strong> ยังไม่สามารถเข้าใช้ห้องได้จนกว่าจะได้รับการอนุมัติ หากมีข้อสงสัยสามารถติดต่อผู้ดูแลระบบห้องซ้อมดนตรีได้ครับ' +
    '</div>';

  var html = buildBaseEmailTemplate("คำขอจองห้องซ้อมดนตรี: รอการอนุมัติ", "รอการอนุมัติ", "#D97706", content);
  safeSendEmail({
    to: userEmail,
    subject: "[รออนุมัติ] คำขอจองห้องซ้อมดนตรี วทก. (" + booking.booking_date + " เวลา " + booking.start_time + "-" + booking.end_time + " น.)",
    htmlBody: html
  });
}

/**
 * 2. อีเมลแจ้งเตือนแอดมิน: มีการจองคิวใหม่รออนุมัติ พร้อมปุ่ม 1-Click Action
 */
function sendNewBookingNotificationToAdmins(booking) {
  var bccRecipients = getRecipientsForEvent("notify_on_booking");
  if (bccRecipients.length === 0) return;

  var token = generateApprovalToken(booking);
  var gasUrl = "https://script.google.com/macros/s/AKfycbxhyoxEr6_YKysnI272d_O047z2cFXMixyAXrvi_jWTVJkXyXjFSrrVkRZ_G6brt5vY/exec";
  try {
    var liveUrl = ScriptApp.getService().getUrl();
    if (liveUrl) gasUrl = liveUrl;
  } catch (e) {}

  var approveUrl = gasUrl + "?action=approve_booking&id=" + encodeURIComponent(booking.booking_id) + "&token=" + encodeURIComponent(token);
  var rejectUrl = gasUrl + "?action=reject_booking&id=" + encodeURIComponent(booking.booking_id) + "&token=" + encodeURIComponent(token);
  var adminPanelUrl = "https://masterphum07-web.github.io/MUSIC-PI/?admin=true";

  var content = '<h3 style="margin-top: 0; color: #0F3D5C;">มีคำขอจองห้องซ้อมดนตรีใหม่ (รออนุมัติ)</h3>' +
    '<p>มีรายการคำขอจองห้องซ้อมใหม่ กรุณาตรวจสอบและกดอนุมัติหรือปฏิเสธคำขอ:</p>' +
    '<table style="width: 100%; border-collapse: collapse; margin: 16px 0; background-color: #F8FAFC; border-radius: 8px; overflow: hidden;">' +
      '<tr><td style="padding: 10px 14px; border-bottom: 1px solid #E2E8F0; font-weight: bold; width: 35%;">รหัสการจอง:</td><td style="padding: 10px 14px; border-bottom: 1px solid #E2E8F0; color: #0F3D5C; font-weight: bold;">' + booking.booking_code + '</td></tr>' +
      '<tr><td style="padding: 10px 14px; border-bottom: 1px solid #E2E8F0; font-weight: bold;">ห้องซ้อม:</td><td style="padding: 10px 14px; border-bottom: 1px solid #E2E8F0;">' + booking.room_id + '</td></tr>' +
      '<tr><td style="padding: 10px 14px; border-bottom: 1px solid #E2E8F0; font-weight: bold;">วันที่จอง:</td><td style="padding: 10px 14px; border-bottom: 1px solid #E2E8F0;">' + booking.booking_date + '</td></tr>' +
      '<tr><td style="padding: 10px 14px; border-bottom: 1px solid #E2E8F0; font-weight: bold;">ช่วงเวลา:</td><td style="padding: 10px 14px; border-bottom: 1px solid #E2E8F0;">' + booking.start_time + ' - ' + booking.end_time + ' น.</td></tr>' +
      '<tr><td style="padding: 10px 14px; border-bottom: 1px solid #E2E8F0; font-weight: bold;">ผู้จอง:</td><td style="padding: 10px 14px; border-bottom: 1px solid #E2E8F0;">' + booking.full_name + ' (' + booking.student_year + ')</td></tr>' +
      '<tr><td style="padding: 10px 14px; border-bottom: 1px solid #E2E8F0; font-weight: bold;">สาขาวิชา:</td><td style="padding: 10px 14px; border-bottom: 1px solid #E2E8F0;">' + booking.major + '</td></tr>' +
      '<tr><td style="padding: 10px 14px; border-bottom: 1px solid #E2E8F0; font-weight: bold;">เบอร์ติดต่อ:</td><td style="padding: 10px 14px; border-bottom: 1px solid #E2E8F0;">' + (booking.phone || '-') + '</td></tr>' +
      '<tr><td style="padding: 10px 14px; border-bottom: 1px solid #E2E8F0; font-weight: bold;">อีเมล:</td><td style="padding: 10px 14px; border-bottom: 1px solid #E2E8F0;">' + (booking.email || '-') + '</td></tr>' +
      '<tr><td style="padding: 10px 14px; font-weight: bold;">วัตถุประสงค์:</td><td style="padding: 10px 14px;">' + booking.purpose + ' (' + booking.party_size + ' คน)</td></tr>' +
    '</table>' +

    // 1-Click Action Buttons
    '<div style="text-align: center; margin: 24px 0; padding: 20px; background-color: #FEF3C7; border-radius: 12px; border: 1px solid #FDE68A;">' +
      '<div style="font-size: 14px; font-weight: bold; color: #92400E; margin-bottom: 14px;">⚡ ดำเนินการอนุมัติคิวนี้ทันที (1-Click Actions):</div>' +
      '<div>' +
        '<a href="' + approveUrl + '" target="_blank" style="display: inline-block; background-color: #16A34A; color: #FFFFFF; text-decoration: none; padding: 12px 22px; border-radius: 10px; font-weight: bold; font-size: 13px; margin: 5px; box-shadow: 0 2px 5px rgba(0,0,0,0.15);">' +
          '✅ อนุมัติการจอง (Approve)' +
        '</a>' +
        '<a href="' + rejectUrl + '" target="_blank" style="display: inline-block; background-color: #DC2626; color: #FFFFFF; text-decoration: none; padding: 12px 22px; border-radius: 10px; font-weight: bold; font-size: 13px; margin: 5px; box-shadow: 0 2px 5px rgba(0,0,0,0.15);">' +
          '❌ ไม่อนุมัติ / ปฏิเสธ (Reject)' +
        '</a>' +
      '</div>' +
      '<div style="margin-top: 14px;">' +
        '<a href="' + adminPanelUrl + '" target="_blank" style="font-size: 12px; color: #0F3D5C; text-decoration: underline; font-weight: 600;">' +
          '🔗 หรือเปิดดูและจัดการในระบบแอดมิน (Admin Console)' +
        '</a>' +
      '</div>' +
    '</div>';

  var html = buildBaseEmailTemplate("คำขอจองห้องซ้อมใหม่: " + booking.booking_code, "รออนุมัติ", "#F59E0B", content);
  safeSendEmail({
    bcc: bccRecipients,
    subject: "[รออนุมัติคิวใหม่] " + booking.room_id + " วันที่ " + booking.booking_date + " (" + booking.start_time + "-" + booking.end_time + ") โดย " + booking.full_name,
    htmlBody: html
  });
}

/**
 * 3. อีเมลแจ้งผู้จอง: คำขอจองไม่ได้รับการอนุมัติ (Reject)
 */
function sendBookingRejectionToUser(booking, reason) {
  var userEmail = String(booking.email || "").trim();
  if (!userEmail) return;

  var content = '<h3 style="margin-top: 0; color: #DC2626;">คำขอจองห้องซ้อมดนตรีไม่ได้รับการอนุมัติ</h3>' +
    '<p>เรียนคุณ <strong>' + booking.full_name + '</strong> ทางชมรมดนตรี วทก. ขออภัยที่ต้องแจ้งให้ทราบว่าคำขอจองห้องซ้อมดนตรีของคุณไม่ได้รับการอนุมัติ</p>' +
    '<div style="margin: 16px 0; padding: 14px; background-color: #FEE2E2; border-radius: 8px; border: 1px solid #FECACA; color: #991B1B; font-size: 13px;">' +
      '<strong>เหตุผลจากผู้ดูแลระบบ:</strong> ' + (reason || "ห้องไม่ว่าง หรือมีกิจกรรมของวิทยาลัยในช่วงเวลาดังกล่าว") +
    '</div>' +
    '<table style="width: 100%; border-collapse: collapse; margin: 16px 0; background-color: #F8FAFC; border-radius: 8px; overflow: hidden; font-size: 13px;">' +
      '<tr><td style="padding: 8px 12px; border-bottom: 1px solid #E2E8F0; color: #64748B;">รหัสคำขอ:</td><td style="padding: 8px 12px; border-bottom: 1px solid #E2E8F0;">' + booking.booking_code + '</td></tr>' +
      '<tr><td style="padding: 8px 12px; border-bottom: 1px solid #E2E8F0; color: #64748B;">ห้องซ้อม:</td><td style="padding: 8px 12px; border-bottom: 1px solid #E2E8F0;">' + booking.room_id + '</td></tr>' +
      '<tr><td style="padding: 8px 12px; border-bottom: 1px solid #E2E8F0; color: #64748B;">วันที่และเวลา:</td><td style="padding: 8px 12px; border-bottom: 1px solid #E2E8F0;">' + booking.booking_date + ' (' + booking.start_time + '-' + booking.end_time + ' น.)</td></tr>' +
    '</table>' +
    '<p style="font-size: 13px; color: #64748B;">คุณสามารถเข้าไปเลือกดูตารางเวลาว่าง และส่งคำขอจองในช่วงเวลาอื่นได้ตลอดเวลาที่เว็บไซต์ของชมรมครับ</p>';

  var html = buildBaseEmailTemplate("ผลการขอจองห้องซ้อมดนตรี", "ไม่อนุมัติ", "#DC2626", content);
  safeSendEmail({
    to: userEmail,
    subject: "[ไม่อนุมัติ] ผลการขอจองห้องซ้อมดนตรี วทก. วันที่ " + booking.booking_date,
    htmlBody: html
  });
}

/**
 * 4. ใบยืนยันการจองถึงผู้จอง (ส่งเฉพาะกรณีที่ผู้จองกรอกอีเมล) พร้อม QR Code
 */
function sendBookingConfirmationToUser(booking) {
  var userEmail = String(booking.email || "").trim();
  if (!userEmail) return;

  var webBaseUrl = "https://masterphum07-web.github.io/MUSIC-PI/";
  var checkInUrl = webBaseUrl + "?action=checkin&code=" + encodeURIComponent(booking.booking_code);
  var checkOutUrl = webBaseUrl + "?action=checkout&code=" + encodeURIComponent(booking.booking_code);
  var cancelUrl = webBaseUrl + "?action=cancel&code=" + encodeURIComponent(booking.booking_code);
  var qrUrl = "https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=" + encodeURIComponent(checkInUrl);

  var content = '<h3 style="margin-top: 0; color: #0F3D5C;">ยินดีด้วย! การจองห้องซ้อมสำเร็จแล้ว</h3>' +
    '<p>สวัสดีคุณ <strong>' + booking.full_name + '</strong> ระบบได้บันทึกการจองห้องซ้อมดนตรีของคุณเรียบร้อยแล้ว คุณสามารถใช้ปุ่มลัดด้านล่างหรือสแกน QR Code เพื่อดำเนินการได้ทันที:</p>' +
    
    // Quick Action Buttons Container
    '<div style="text-align: center; margin: 20px 0;">' +
      '<a href="' + checkInUrl + '" target="_blank" style="display: inline-block; background-color: #16A34A; color: #FFFFFF; text-decoration: none; padding: 12px 18px; border-radius: 10px; font-weight: bold; font-size: 13px; margin: 4px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">' +
        '🟢 กดยืนยันเช็คอิน' +
      '</a>' +
      '<a href="' + checkOutUrl + '" target="_blank" style="display: inline-block; background-color: #0F3D5C; color: #FFFFFF; text-decoration: none; padding: 12px 18px; border-radius: 10px; font-weight: bold; font-size: 13px; margin: 4px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">' +
        '🚪 กดยืนยันคืนห้อง' +
      '</a>' +
      '<a href="' + cancelUrl + '" target="_blank" style="display: inline-block; background-color: #DC2626; color: #FFFFFF; text-decoration: none; padding: 12px 18px; border-radius: 10px; font-weight: bold; font-size: 13px; margin: 4px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">' +
        '❌ ขอยกเลิกการจอง' +
      '</a>' +
    '</div>' +

    '<div style="text-align: center; margin: 24px 0; padding: 20px; background-color: #F1F5F9; border-radius: 12px; border: 2px dashed #CBD5E1;">' +
      '<div style="font-size: 13px; color: #64748B; margin-bottom: 6px;">รหัสการจองและรหัสผ่านเข้าห้อง (Room & Booking Code)</div>' +
      '<div style="font-size: 28px; font-weight: 800; color: #0F3D5C; letter-spacing: 3px; font-family: monospace;">' + booking.booking_code + '</div>' +
      '<div style="font-size: 12px; color: #16A34A; font-weight: bold; margin-top: 4px;">* ใช้รหัสนี้สำหรับแจ้งเข้าห้องซ้อม หรือสแกน QR Code หน้าห้อง</div>' +
      '<div style="margin-top: 15px;"><img src="' + qrUrl + '" alt="QR Code สแกนเช็คอิน" width="160" height="160" style="display: block; margin: 0 auto; border-radius: 8px; border: 1px solid #E2E8F0;"></div>' +
      '<div style="font-size: 12px; color: #64748B; margin-top: 8px;">ใช้กล้องมือถือสแกน QR Code นี้เพื่อเปิดหน้ายืนยันเช็คอินในคลิกเดียว</div>' +
    '</div>' +
    '<table style="width: 100%; border-collapse: collapse; margin: 16px 0;">' +
      '<tr><td style="padding: 6px 0; color: #64748B;">ห้องซ้อม:</td><td style="padding: 6px 0; font-weight: bold;">' + booking.room_id + '</td></tr>' +
      '<tr><td style="padding: 6px 0; color: #64748B;">วันที่ใช้งาน:</td><td style="padding: 6px 0; font-weight: bold;">' + booking.booking_date + '</td></tr>' +
      '<tr><td style="padding: 6px 0; color: #64748B;">เวลา:</td><td style="padding: 6px 0; font-weight: bold;">' + booking.start_time + ' - ' + booking.end_time + ' น.</td></tr>' +
    '</table>' +
    '<div style="background-color: #FEF3C7; border-left: 4px solid #F59E0B; padding: 12px; font-size: 13px; color: #92400E; margin-top: 16px; border-radius: 4px;">' +
      '<strong>⚠️ กฎระเบียบสำคัญ:</strong> กรุณากดเช็คอินหน้าเว็บตั้งแต่ก่อนเริ่มเวลา 15 นาที จนถึงไม่เกิน 30 นาทีหลังเวลาเริ่ม หากไม่เช็คอินภายในเวลา ระบบจะตัดสิทธิ์ No-show และปล่อยห้องให้ผู้อื่นทันที' +
    '</div>';

  var dateStr = formatDateToString(booking.booking_date);
  var plainText = "ใบยืนยันการจองห้องซ้อมดนตรี ชมรมดนตรี วทก.\n\n" +
    "สวัสดีคุณ " + booking.full_name + "\n" +
    "รหัสการจองและรหัสผ่านเข้าห้อง: " + booking.booking_code + "\n" +
    "ห้องซ้อม: " + booking.room_id + "\n" +
    "วันที่ใช้งาน: " + dateStr + "\n" +
    "เวลา: " + booking.start_time + " - " + booking.end_time + " น.\n\n" +
    "ลิงก์ดำเนินการด่วน (1-Tap Actions):\n" +
    "1. กดยืนยันเช็คอิน: " + checkInUrl + "\n" +
    "2. กดยืนยันคืนห้อง: " + checkOutUrl + "\n" +
    "3. ขอยกเลิกการจอง: " + cancelUrl + "\n\n" +
    "* ข้อควรปฏิบัติ: กรุณากดเช็คอินหน้าเว็บตั้งแต่ก่อนเริ่มเวลา 15 นาที จนถึงไม่เกิน 30 นาทีหลังเวลาเริ่ม";

  var html = buildBaseEmailTemplate("ใบยืนยันการจองห้องซ้อมดนตรี วทก.", "ยืนยันการจอง", "#1B7A8C", content);
  safeSendEmail({
    to: userEmail,
    subject: "ใบยืนยันการจองห้องซ้อมดนตรี วทก. [รหัส: " + booking.booking_code + "]",
    htmlBody: html,
    body: plainText
  });
}

/**
 * 3. อีเมลแจ้งเตือนการยกเลิกคิว (Cancel) - แจ้งเตือนเฉพาะผู้จองเท่านั้น (ไม่ส่งหาแอดมิน)
 */
function sendCancellationNotification(booking) {
  // ส่งแจ้งเตือนเฉพาะผู้จองหากมีอีเมล (ไม่ส่งหาแอดมิน เพื่อให้แจ้งเตือนแอดมินเฉพาะตอนขออนุมัติรหัสห้องเท่านั้น)
  if (booking.email) {
    var content = '<h3 style="margin-top: 0; color: #DC2626;">ยืนยันการยกเลิกการจองห้องซ้อมดนตรี</h3>' +
      '<p>รายการจองรหัส <strong>' + booking.booking_code + '</strong> ของคุณได้รับการยกเลิกเรียบร้อยแล้ว:</p>' +
      '<ul style="line-height: 1.8;">' +
        '<li><strong>ห้อง:</strong> ' + booking.room_id + '</li>' +
        '<li><strong>วัน-เวลา:</strong> ' + booking.booking_date + ' (' + booking.start_time + ' - ' + booking.end_time + ' น.)</li>' +
        '<li><strong>เหตุผล:</strong> ' + (booking.cancel_reason || "ผู้จองขอยกเลิก") + '</li>' +
      '</ul>' +
      '<p style="color: #64748B; font-size: 13px;">หากต้องการใช้งานห้องในวันหรือเวลาอื่น สามารถเข้าสู่เว็บไซต์เพื่อส่งคำขอจองใหม่ได้ตลอดเวลาครับ</p>';

    var html = buildBaseEmailTemplate("ยกเลิกการจอง: " + booking.booking_code, "ยกเลิกแล้ว", "#DC2626", content);
    safeSendEmail({
      to: booking.email,
      subject: "แจ้งยืนยันการยกเลิกการจองห้องซ้อม วทก. [รหัส: " + booking.booking_code + "]",
      htmlBody: html
    });
  }
}

/**
 * 4. อีเมลแจ้งเตือนการเช็คอิน (Check-in) - ปิดการแจ้งเตือนแอดมิน
 */
function sendCheckInNotification(booking) {
  // ปิดการแจ้งเตือนแอดมินตามการตั้งค่า (แจ้งเตือนเฉพาะให้อนุมัติรหัสจองห้องเท่านั้น)
  return;
}

/**
 * 5. อีเมลแจ้งเตือนการเช็คเอาต์ (Check-out) - ปิดการแจ้งเตือนแอดมิน
 */
function sendCheckOutNotification(booking) {
  // ปิดการแจ้งเตือนแอดมินตามการตั้งค่า (แจ้งเตือนเฉพาะให้อนุมัติรหัสจองห้องเท่านั้น)
  return;
}

/**
 * 6. อีเมลแจ้งเตือนกรณี No-show - ปิดการแจ้งเตือนแอดมิน
 */
function sendNoShowNotification(booking) {
  // ปิดการแจ้งเตือนแอดมินตามการตั้งค่า (แจ้งเตือนเฉพาะให้อนุมัติรหัสจองห้องเท่านั้น)
  return;
}

/**
 * 7. อีเมลแจ้งเตือนกรณีใช้ห้องเกินเวลา (Overdue Alert) - ปิดการแจ้งเตือนแอดมิน
 */
function sendOverdueNotification(booking, overdueMinutes) {
  // ปิดการแจ้งเตือนแอดมินตามการตั้งค่า (แจ้งเตือนเฉพาะให้อนุมัติรหัสจองห้องเท่านั้น)
  return;
}

/**
 * 8. อีเมลรายงานสรุปประจำวัน (Daily Summary Report) - ปิดการแจ้งเตือนแอดมิน
 */
function sendDailySummaryNotification(summary) {
  // ปิดการแจ้งเตือนแอดมินตามการตั้งค่า (แจ้งเตือนเฉพาะให้อนุมัติรหัสจองห้องเท่านั้น)
  return;
}


/* ============================================================================== */
/* ไฟล์: 09_Triggers.gs */
/* ============================================================================== */

/**
 * ==============================================================================
 * ระบบจองห้องซ้อมดนตรี ชมรมดนตรี วทก.
 * ไฟล์: 09_Triggers.gs
 * คำอธิบาย: ระบบทำงานอัตโนมัติตามกำหนดเวลา (Automated Scheduled Triggers)
 *           - ทุก 10 นาที: ตรวจจับ No-show (เลย 30 นาทีไม่เช็คอิน) และ Overdue (ใช้เกินเวลา 15 นาที)
 *           - ทุกวัน 20:30 น.: รวบรวมสถิติและส่งอีเมลสรุปประจำวัน
 *           - ทุกวัน 02:00 น.: ย้ายข้อมูลการจองที่เก่ากว่า 6 เดือนไปแท็บ Bookings_Archive
 *           - ฟังก์ชัน installTriggers() และ removeTriggers() สำหรับติดตั้ง
 * ==============================================================================
 */

/**
 * 1. ทริกเกอร์รันทุก 10 นาที: ตรวจจับ No-show และ Overdue
 */
function handleTriggerTenMinutes() {
  var now = new Date();
  var todayStr = Utilities.formatDate(now, Session.getScriptTimeZone() || "GMT+7", "yyyy-MM-dd");
  var currentMins = timeToMinutes(Utilities.formatDate(now, Session.getScriptTimeZone() || "GMT+7", "HH:mm"));

  var settings = getSettingsMap();
  var gracePeriod = parseInt(settings.grace_period_minutes || "30", 10);
  var overdueAlertMins = parseInt(settings.overdue_alert_minutes || "15", 10);

  var bookings = getAllRows("Bookings");

  for (var i = 0; i < bookings.length; i++) {
    var b = bookings[i];
    var bDateStr = formatDateToString(b.booking_date);

    // ตรวจเฉพาะรายการของวันนี้
    if (bDateStr !== todayStr) {
      continue;
    }

    var startM = timeToMinutes(String(b.start_time));
    var endM = timeToMinutes(String(b.end_time));
    var status = String(b.status || "").toLowerCase();

    // A. ตรวจ No-Show: สถานะ booked + เวลาปัจจุบันเลยเวลาเริ่มเกิน grace period
    if (status === "booked" && startM !== -1) {
      if (currentMins > startM + gracePeriod) {
        // อัปเดตเป็น no_show
        var updatedNoShow = updateRow("Bookings", "booking_id", b.booking_id, {
          status: "no_show",
          updated_at: now,
          updated_by: "trigger_no_show"
        });

        writeLog("system", "Trigger", "AUTO_MARK_NO_SHOW", "BOOKING", b.booking_code, {
          start_time: b.start_time,
          overdue_by: currentMins - startM
        });

        // ส่งอีเมลแจ้งเตือน
        sendNoShowNotification(updatedNoShow || b);
      }
    }

    // B. ตรวจ Overdue: สถานะ checked_in + เวลาปัจจุบันเลยเวลาสิ้นสุดเกิน 15 นาที
    if (status === "checked_in" && endM !== -1) {
      if (currentMins > endM + overdueAlertMins) {
        var diffOverdue = currentMins - endM;
        // อัปเดตสถานะเป็น overdue
        updateRow("Bookings", "booking_id", b.booking_id, {
          status: "overdue",
          updated_at: now,
          updated_by: "trigger_overdue"
        });

        writeLog("system", "Trigger", "AUTO_MARK_OVERDUE", "BOOKING", b.booking_code, {
          end_time: b.end_time,
          overdue_minutes: diffOverdue
        });

        // ส่งอีเมลเตือนแอดมิน
        sendOverdueNotification(b, diffOverdue);
      }
    }
  }
}

/**
 * 2. ทริกเกอร์รันทุกวันเวลา 20:30 น.: รวบรวมสถิติและส่งอีเมลสรุปประจำวัน
 */
function handleDailySummaryTrigger() {
  var now = new Date();
  var todayStr = Utilities.formatDate(now, Session.getScriptTimeZone() || "GMT+7", "yyyy-MM-dd");

  var bookings = getAllRows("Bookings");
  var rooms = getAllRows("Rooms");

  var totalBookings = 0;
  var completedBookings = 0;
  var noShowBookings = 0;
  var roomStatMap = {};

  for (var r = 0; r < rooms.length; r++) {
    roomStatMap[rooms[r].room_id] = {
      room_name: rooms[r].room_name,
      count: 0,
      hours: 0
    };
  }

  for (var i = 0; i < bookings.length; i++) {
    var b = bookings[i];
    var bDateStr = formatDateToString(b.booking_date);
    if (bDateStr === todayStr) {
      var status = String(b.status || "").toLowerCase();
      if (status !== "cancelled") {
        totalBookings++;
      }
      if (status === "checked_out") {
        completedBookings++;
      }
      if (status === "no_show") {
        noShowBookings++;
      }

      if (roomStatMap[b.room_id] && status !== "cancelled") {
        roomStatMap[b.room_id].count++;
        var startM = timeToMinutes(String(b.start_time));
        var endM = timeToMinutes(String(b.end_time));
        if (startM !== -1 && endM !== -1 && endM > startM) {
          roomStatMap[b.room_id].hours += Math.round(((endM - startM) / 60) * 10) / 10;
        }
      }
    }
  }

  var roomStatsList = [];
  for (var rId in roomStatMap) {
    roomStatsList.push(roomStatMap[rId]);
  }

  var summaryData = {
    date: todayStr,
    totalBookings: totalBookings,
    completedBookings: completedBookings,
    noShowBookings: noShowBookings,
    roomStats: roomStatsList
  };

  sendDailySummaryNotification(summaryData);
  writeLog("system", "Trigger", "DAILY_SUMMARY_SENT", "REPORT", todayStr, summaryData);
}

/**
 * 3. ทริกเกอร์รันทุกวันเวลา 02:00 น.: Archive ข้อมูลการจองเก่ากว่า 6 เดือน (180 วัน)
 */
function handleArchiveOldBookingsTrigger() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var archiveSheet = ss.getSheetByName("Bookings_Archive");

  // หากยังไม่มีแท็บ Bookings_Archive ให้สร้างขึ้นมา
  if (!archiveSheet) {
    archiveSheet = ss.insertSheet("Bookings_Archive");
    var bookingsSheet = ss.getSheetByName("Bookings");
    var headers = bookingsSheet.getRange(1, 1, 1, bookingsSheet.getLastColumn()).getValues();
    archiveSheet.getRange(1, 1, 1, headers[0].length).setValues(headers);
    archiveSheet.getRange(1, 1, 1, headers[0].length).setBackground("#475569").setFontColor("#FFFFFF").setFontWeight("bold");
    archiveSheet.setFrozenRows(1);
  }

  var now = new Date();
  var thresholdDate = new Date(now.getTime() - (180 * 24 * 60 * 60 * 1000));
  var thresholdStr = Utilities.formatDate(thresholdDate, Session.getScriptTimeZone() || "GMT+7", "yyyy-MM-dd");

  var allBookings = getAllRows("Bookings");
  var rowsToArchive = [];
  var idsToDelete = [];

  for (var i = 0; i < allBookings.length; i++) {
    var b = allBookings[i];
    var bDateStr = formatDateToString(b.booking_date);
    if (bDateStr && bDateStr < thresholdStr) {
      rowsToArchive.push(b);
      idsToDelete.push(b.booking_id);
    }
  }

  if (rowsToArchive.length > 0) {
    for (var j = 0; j < rowsToArchive.length; j++) {
      appendRow("Bookings_Archive", rowsToArchive[j]);
      deleteRow("Bookings", "booking_id", idsToDelete[j]);
    }
    writeLog("system", "Trigger", "ARCHIVE_OLD_BOOKINGS", "DATABASE", "BOOKINGS", "ย้ายข้อมูลเก่ากว่า 6 เดือนจำนวน " + rowsToArchive.length + " รายการไป Bookings_Archive");
  }
}

/**
 * ติดตั้ง Triggers อัตโนมัติทั้งหมด (รันครั้งเดียว)
 */
function installTriggers() {
  // ลบทริกเกอร์เก่าออกก่อนเพื่อป้องกันการติดตั้งซ้ำ
  removeTriggers();

  // 1. ทริกเกอร์ตรวจ No-show / Overdue ทุก 10 นาที
  ScriptApp.newTrigger("handleTriggerTenMinutes")
           .timeBased()
           .everyMinutes(10)
           .create();

  // 2. ทริกเกอร์สรุปประจำวัน ทุกวันช่วง 20:00 - 21:00 น.
  ScriptApp.newTrigger("handleDailySummaryTrigger")
           .timeBased()
           .everyDays(1)
           .atHour(20)
           .create();

  // 3. ทริกเกอร์ Archive ข้อมูลเก่า ทุกวันช่วง 02:00 - 03:00 น.
  ScriptApp.newTrigger("handleArchiveOldBookingsTrigger")
           .timeBased()
           .everyDays(1)
           .atHour(2)
           .create();

  Logger.log("ติดตั้ง Triggers ทั้ง 3 ตัวเรียบร้อยแล้ว!");
  writeLog("system", "Admin", "INSTALL_TRIGGERS", "TRIGGERS", "ALL", "ติดตั้ง Scheduled Triggers สำเร็จ");
}

/**
 * ลบทริกเกอร์ทั้งหมดในโครงการ
 */
function removeTriggers() {
  var triggers = ScriptApp.getProjectTriggers();
  for (var i = 0; i < triggers.length; i++) {
    ScriptApp.deleteTrigger(triggers[i]);
  }
  Logger.log("ลบทริกเกอร์เก่าออกทั้งหมดเรียบร้อย");
}


/* ============================================================================== */
/* ไฟล์: 99_Test.gs */
/* ============================================================================== */

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


