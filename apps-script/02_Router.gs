/**
 * ==============================================================================
 * ระบบจองห้องซ้อมดนตรี ชมรมดนตรี วทก.
 * ไฟล์: 02_Router.gs
 * คำอธิบาย: จุดเชื่อมต่อ API (API Gateway / Router) สำหรับ Web App
 *           - doGet และ doPost
 *           - รับ JSON Payload (ผ่าน Content-Type: text/plain เพื่อเลี่ยง CORS)
 *           - ตรวจสอบ Action และเรียกฟังก์ชัน Service ที่เกี่ยวข้อง
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

    if (action === "getPublicState") {
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
    return createJsonResponse({
      ok: false,
      error: { code: "SERVER_ERROR", message: err.message }
    });
  }
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
    actionName = action || "UNKNOWN";

    var context = {
      userAgent: requestData.user_agent || "",
      ipHash: requestData.ip_hash || ""
    };

    var resultData;

    // เราท์ติ้งตามคำสั่งที่ส่งมา
    switch (action) {
      // 1. ดึงสถานะหน้าบ้าน
      case "getPublicState":
        resultData = getPublicState(payload.date);
        break;

      // 2. เช็คว่าเวลาและห้องว่างหรือไม่
      case "checkAvailability":
        resultData = checkAvailability(payload.room_id, payload.date, payload.start_time, payload.end_time);
        break;

      // 3. สร้างการจองใหม่
      case "createBooking":
        actor = payload.full_name || "public";
        resultData = createBooking(payload, context);
        break;

      // 4. ค้นหาข้อมูลการจอง
      case "lookupBooking":
        resultData = lookupBooking(payload.booking_code, payload.full_name);
        break;

      // 5. เช็คอิน
      case "checkIn":
        actor = payload.full_name || "public";
        resultData = checkIn(payload.booking_code, payload.full_name, context);
        break;

      // 6. เช็คเอาต์
      case "checkOut":
        actor = payload.full_name || "public";
        resultData = checkOut(payload.booking_code, payload.full_name, context);
        break;

      // 7. ยกเลิกการจอง
      case "cancelBooking":
        actor = payload.full_name || "public";
        resultData = cancelBooking(payload.booking_code, payload.full_name, payload.reason, context);
        break;

      // กรณีไม่ตรงกับ Action ใดๆ ในเฟสนี้ (แอดมิน action จะต่อยอดใน Phase 3)
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
