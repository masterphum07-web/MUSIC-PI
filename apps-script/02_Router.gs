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
