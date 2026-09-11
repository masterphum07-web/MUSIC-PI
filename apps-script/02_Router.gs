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
