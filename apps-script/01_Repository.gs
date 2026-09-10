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

/**
 * ดึงออบเจ็กต์ Sheet ตามชื่อ หากไม่พบจะโยน Error
 * @param {string} sheetName ชื่อแท็บ
 * @returns {GoogleAppsScript.Spreadsheet.Sheet}
 */
function getSheet(sheetName) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    throw new Error("ไม่พบแท็บข้อมูลชื่อ: " + sheetName);
  }
  return sheet;
}

/**
 * อ่านข้อมูลทั้งหมดในชีตเป็น Array of Objects ตามชื่อ Header ในแถวที่ 1
 * โดยอ่านแบบ Batch อ่านทั้ง Range ทีเดียว (ห้ามเรียก getRange ใน loop)
 * @param {string} sheetName ชื่อแท็บ
 * @returns {Array<Object>} อาร์เรย์ของออบเจ็กต์ข้อมูล
 */
function getAllRows(sheetName) {
  var sheet = getSheet(sheetName);
  var lastRow = sheet.getLastRow();
  var lastCol = sheet.getLastColumn();

  if (lastRow <= 1 || lastCol === 0) {
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
  return true;
}

/**
 * ดึงค่าการตั้งค่าระบบทั้งหมดจากแท็บ Settings ในรูป Key-Value Map
 * @returns {Object} { key: value, ... }
 */
function getSettingsMap() {
  var rows = getAllRows("Settings");
  var map = {};
  for (var i = 0; i < rows.length; i++) {
    var k = String(rows[i]["key"]).trim();
    var v = rows[i]["value"];
    if (k) {
      map[k] = v;
    }
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
