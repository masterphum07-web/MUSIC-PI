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
