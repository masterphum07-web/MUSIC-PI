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
