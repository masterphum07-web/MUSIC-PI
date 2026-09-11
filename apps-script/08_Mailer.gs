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

    var mailOptions = {
      subject: options.subject,
      htmlBody: options.htmlBody,
      name: "ชมรมดนตรี วทก. (ระบบจองห้องซ้อม)"
    };

    if (options.to) {
      mailOptions.to = options.to;
    } else if (options.bcc) {
      // หากส่งเฉพาะ BCC ต้องระบุ to เป็นอีเมลระบบ/ผู้ส่ง เพื่อป้องกันไม่ให้ MailApp โยน Exception "Invalid argument: to"
      try {
        mailOptions.to = Session.getEffectiveUser().getEmail() || "noreply@wtk.ac.th";
      } catch (toErr) {
        mailOptions.to = "noreply@wtk.ac.th";
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

    try {
      var senderEmail = Session.getEffectiveUser().getEmail();
      if (senderEmail) {
        mailOptions.replyTo = senderEmail;
      }
    } catch (replyErr) {}

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
 * 1. อีเมลแจ้งเตือนแอดมิน: มีการจองคิวใหม่
 */
function sendNewBookingNotificationToAdmins(booking) {
  var bccRecipients = getRecipientsForEvent("notify_on_booking");
  if (bccRecipients.length === 0) return;

  var content = '<h3 style="margin-top: 0; color: #0F3D5C;">มีรายการจองห้องซ้อมดนตรีใหม่</h3>' +
    '<p>รายละเอียดการจองมีดังนี้:</p>' +
    '<table style="width: 100%; border-collapse: collapse; margin: 16px 0; background-color: #F8FAFC; border-radius: 8px; overflow: hidden;">' +
      '<tr><td style="padding: 10px 14px; border-bottom: 1px solid #E2E8F0; font-weight: bold; width: 35%;">รหัสการจอง:</td><td style="padding: 10px 14px; border-bottom: 1px solid #E2E8F0; color: #0F3D5C; font-weight: bold;">' + booking.booking_code + '</td></tr>' +
      '<tr><td style="padding: 10px 14px; border-bottom: 1px solid #E2E8F0; font-weight: bold;">ห้องซ้อม:</td><td style="padding: 10px 14px; border-bottom: 1px solid #E2E8F0;">' + booking.room_id + '</td></tr>' +
      '<tr><td style="padding: 10px 14px; border-bottom: 1px solid #E2E8F0; font-weight: bold;">วันที่จอง:</td><td style="padding: 10px 14px; border-bottom: 1px solid #E2E8F0;">' + booking.booking_date + '</td></tr>' +
      '<tr><td style="padding: 10px 14px; border-bottom: 1px solid #E2E8F0; font-weight: bold;">ช่วงเวลา:</td><td style="padding: 10px 14px; border-bottom: 1px solid #E2E8F0;">' + booking.start_time + ' - ' + booking.end_time + ' น.</td></tr>' +
      '<tr><td style="padding: 10px 14px; border-bottom: 1px solid #E2E8F0; font-weight: bold;">ผู้จอง:</td><td style="padding: 10px 14px; border-bottom: 1px solid #E2E8F0;">' + booking.full_name + ' (' + booking.student_year + ')</td></tr>' +
      '<tr><td style="padding: 10px 14px; border-bottom: 1px solid #E2E8F0; font-weight: bold;">สาขาวิชา:</td><td style="padding: 10px 14px; border-bottom: 1px solid #E2E8F0;">' + booking.major + '</td></tr>' +
      '<tr><td style="padding: 10px 14px; font-weight: bold;">วัตถุประสงค์:</td><td style="padding: 10px 14px;">' + booking.purpose + ' (สมาชิก ' + booking.party_size + ' คน)</td></tr>' +
    '</table>';

  var html = buildBaseEmailTemplate("การจองใหม่: " + booking.booking_code, "จองคิวใหม่", "#16A34A", content);
  safeSendEmail({
    bcc: bccRecipients,
    subject: "[คิวจองใหม่] " + booking.room_id + " วันที่ " + booking.booking_date + " (" + booking.start_time + "-" + booking.end_time + ") โดย " + booking.full_name,
    htmlBody: html
  });
}

/**
 * 2. ใบยืนยันการจองถึงผู้จอง (ส่งเฉพาะกรณีที่ผู้จองกรอกอีเมล) พร้อม QR Code
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
 * 3. อีเมลแจ้งเตือนการยกเลิกคิว (Cancel)
 */
function sendCancellationNotification(booking) {
  var bccRecipients = getRecipientsForEvent("notify_on_cancel");
  var content = '<h3 style="margin-top: 0; color: #DC2626;">มีการยกเลิกการจองห้องซ้อม</h3>' +
    '<p>รายการจองรหัส <strong>' + booking.booking_code + '</strong> ถูกยกเลิกเรียบร้อยแล้ว:</p>' +
    '<ul style="line-height: 1.8;">' +
      '<li><strong>ห้อง:</strong> ' + booking.room_id + '</li>' +
      '<li><strong>วัน-เวลา:</strong> ' + booking.booking_date + ' (' + booking.start_time + ' - ' + booking.end_time + ' น.)</li>' +
      '<li><strong>ผู้จอง:</strong> ' + booking.full_name + '</li>' +
      '<li><strong>เหตุผล:</strong> ' + (booking.cancel_reason || "ไม่ได้ระบุ") + '</li>' +
    '</ul>' +
    '<p style="color: #16A34A; font-weight: bold;">ขณะนี้ช่วงเวลาดังกล่าวว่างและเปิดให้ผู้อื่นสามารถจองได้แล้ว</p>';

  var html = buildBaseEmailTemplate("ยกเลิกการจอง: " + booking.booking_code, "ยกเลิกการจอง", "#DC2626", content);

  if (bccRecipients.length > 0) {
    safeSendEmail({
      bcc: bccRecipients,
      subject: "[แจ้งยกเลิก] คิวห้อง " + booking.room_id + " วันที่ " + booking.booking_date + " (" + booking.booking_code + ")",
      htmlBody: html
    });
  }

  // ส่งแจ้งเตือนผู้จองด้วยหากมีอีเมล
  if (booking.email) {
    safeSendEmail({
      to: booking.email,
      subject: "แจ้งยืนยันการยกเลิกการจองห้องซ้อม วทก. [รหัส: " + booking.booking_code + "]",
      htmlBody: html
    });
  }
}

/**
 * 4. อีเมลแจ้งเตือนการเช็คอิน (Check-in)
 */
function sendCheckInNotification(booking) {
  var bccRecipients = getRecipientsForEvent("notify_on_checkin");
  if (bccRecipients.length === 0) return;

  var content = '<h3 style="margin-top: 0; color: #16A34A;">มีการเช็คอินเข้าใช้งานห้องซ้อม</h3>' +
    '<p>ผู้จองได้เข้าใช้งานห้องซ้อมดนตรีแล้ว:</p>' +
    '<ul style="line-height: 1.8;">' +
      '<li><strong>รหัสจอง:</strong> ' + booking.booking_code + '</li>' +
      '<li><strong>ห้อง:</strong> ' + booking.room_id + '</li>' +
      '<li><strong>ผู้ใช้งาน:</strong> ' + booking.full_name + ' (' + booking.student_year + ' ' + booking.major + ')</li>' +
      '<li><strong>เวลาที่จอง:</strong> ' + booking.start_time + ' - ' + booking.end_time + ' น.</li>' +
      '<li><strong>เวลาเช็คอินจริง:</strong> ' + formatDateToString(booking.checkin_at) + ' น.</li>' +
    '</ul>';

  var html = buildBaseEmailTemplate("เช็คอิน: " + booking.booking_code, "เช็คอินแล้ว", "#16A34A", content);
  safeSendEmail({
    bcc: bccRecipients,
    subject: "[เช็คอินแล้ว] " + booking.room_id + " โดย " + booking.full_name + " (" + booking.booking_code + ")",
    htmlBody: html
  });
}

/**
 * 5. อีเมลแจ้งเตือนการเช็คเอาต์ (Check-out)
 */
function sendCheckOutNotification(booking) {
  var bccRecipients = getRecipientsForEvent("notify_on_checkout");
  if (bccRecipients.length === 0) return;

  var content = '<h3 style="margin-top: 0; color: #0F3D5C;">มีการเช็คเอาต์ออกจากห้องซ้อม</h3>' +
    '<p>ผู้ใช้งานได้ทำการเช็คเอาต์เรียบร้อยแล้ว:</p>' +
    '<ul style="line-height: 1.8;">' +
      '<li><strong>รหัสจอง:</strong> ' + booking.booking_code + '</li>' +
      '<li><strong>ห้อง:</strong> ' + booking.room_id + '</li>' +
      '<li><strong>ผู้ใช้งาน:</strong> ' + booking.full_name + '</li>' +
      '<li><strong>เวลาเช็คเอาต์จริง:</strong> ' + formatDateToString(booking.checkout_at) + ' น.</li>' +
    '</ul>' +
    '<p style="color: #16A34A;">ห้องซ้อมกลับมาว่างพร้อมให้บริการรอบถัดไปแล้วครับ</p>';

  var html = buildBaseEmailTemplate("เช็คเอาต์: " + booking.booking_code, "เช็คเอาต์แล้ว", "#0F3D5C", content);
  safeSendEmail({
    bcc: bccRecipients,
    subject: "[เช็คเอาต์แล้ว] " + booking.room_id + " (" + booking.booking_code + ")",
    htmlBody: html
  });
}

/**
 * 6. อีเมลแจ้งเตือนกรณี No-show (ไม่มาใช้งานตามนัด)
 */
function sendNoShowNotification(booking) {
  var allAdmins = getAllRows("NotifyRecipients");
  var emails = allAdmins.filter(function(r) { return String(r.is_active).toUpperCase() === "TRUE"; })
                        .map(function(r) { return r.email; });
  if (emails.length === 0) return;

  var content = '<h3 style="margin-top: 0; color: #DC2626;">แจ้งเตือน: ผู้จองไม่มาแสดงตัว (No-show)</h3>' +
    '<p>รายการจองนี้เลยเวลาเริ่มต้นเกิน 30 นาทีโดยไม่มีการเช็คอิน ระบบได้ตัดสิทธิ์และปล่อยห้องว่างอัตโนมัติ:</p>' +
    '<table style="width: 100%; border-collapse: collapse; margin: 16px 0; background-color: #FEF2F2; border-radius: 8px;">' +
      '<tr><td style="padding: 8px 12px; font-weight: bold;">รหัสจอง:</td><td style="padding: 8px 12px;">' + booking.booking_code + '</td></tr>' +
      '<tr><td style="padding: 8px 12px; font-weight: bold;">ห้อง:</td><td style="padding: 8px 12px;">' + booking.room_id + '</td></tr>' +
      '<tr><td style="padding: 8px 12px; font-weight: bold;">ผู้จอง:</td><td style="padding: 8px 12px;">' + booking.full_name + ' (' + booking.student_year + ' ' + booking.major + ')</td></tr>' +
      '<tr><td style="padding: 8px 12px; font-weight: bold;">เวลาที่จอง:</td><td style="padding: 8px 12px;">' + booking.start_time + ' - ' + booking.end_time + ' น.</td></tr>' +
      '<tr><td style="padding: 8px 12px; font-weight: bold;">เบอร์ติดต่อ:</td><td style="padding: 8px 12px;">' + (booking.phone || "-") + '</td></tr>' +
    '</table>';

  var html = buildBaseEmailTemplate("ตัดสิทธิ์ No-show: " + booking.booking_code, "No-show", "#DC2626", content);
  safeSendEmail({
    bcc: emails,
    subject: "[เตือน No-show] คิวห้อง " + booking.room_id + " โดย " + booking.full_name + " ไม่มาเช็คอิน",
    htmlBody: html
  });
}

/**
 * 7. อีเมลแจ้งเตือนกรณีใช้ห้องเกินเวลา (Overdue Alert)
 */
function sendOverdueNotification(booking, overdueMinutes) {
  var allAdmins = getAllRows("NotifyRecipients");
  var emails = allAdmins.filter(function(r) { return String(r.is_active).toUpperCase() === "TRUE"; })
                        .map(function(r) { return r.email; });
  if (emails.length === 0) return;

  var content = '<h3 style="margin-top: 0; color: #B45309;">⚠️ แจ้งเตือน: ใช้งานห้องซ้อมเกินเวลา (Overdue)</h3>' +
    '<p>พบผู้ใช้งานห้องซ้อมดนตรียังไม่ทำการเช็คเอาต์ เกินเวลาสิ้นสุดมาแล้ว <strong>' + overdueMinutes + ' นาที</strong>:</p>' +
    '<table style="width: 100%; border-collapse: collapse; margin: 16px 0; background-color: #FFFBEB; border-radius: 8px;">' +
      '<tr><td style="padding: 8px 12px; font-weight: bold;">ห้อง:</td><td style="padding: 8px 12px; color: #B45309; font-weight: bold;">' + booking.room_id + '</td></tr>' +
      '<tr><td style="padding: 8px 12px; font-weight: bold;">ผู้ใช้งาน:</td><td style="padding: 8px 12px;">' + booking.full_name + '</td></tr>' +
      '<tr><td style="padding: 8px 12px; font-weight: bold;">เวลาที่ต้องสิ้นสุด:</td><td style="padding: 8px 12px;">' + booking.end_time + ' น.</td></tr>' +
      '<tr><td style="padding: 8px 12px; font-weight: bold;">เบอร์ติดต่อ:</td><td style="padding: 8px 12px;">' + (booking.phone || "-") + '</td></tr>' +
    '</table>' +
    '<p>กรุณากรรมการหรือผู้ดูแลตรวจสอบหน้าห้องซ้อม หรือใช้ฟังก์ชัน "บังคับเช็คเอาต์" ในหน้าแอดมินครับ</p>';

  var html = buildBaseEmailTemplate("แจ้งเตือน Overdue: " + booking.room_id, "ใช้งานเกินเวลา", "#F59E0B", content);
  safeSendEmail({
    bcc: emails,
    subject: "[เตือน Overdue] ห้อง " + booking.room_id + " ใช้งานเกินเวลา " + overdueMinutes + " นาที (" + booking.full_name + ")",
    htmlBody: html
  });
}

/**
 * 8. อีเมลรายงานสรุปประจำวัน (Daily Summary Report) เวลา 20:30 น.
 */
function sendDailySummaryNotification(summary) {
  var bccRecipients = getRecipientsForEvent("notify_daily_summary");
  if (bccRecipients.length === 0) return;

  var rowsHtml = "";
  for (var i = 0; i < summary.roomStats.length; i++) {
    var rs = summary.roomStats[i];
    rowsHtml += '<tr>' +
      '<td style="padding: 8px 12px; border-bottom: 1px solid #E2E8F0;">' + rs.room_name + '</td>' +
      '<td style="padding: 8px 12px; border-bottom: 1px solid #E2E8F0; text-align: center;">' + rs.count + ' คิว</td>' +
      '<td style="padding: 8px 12px; border-bottom: 1px solid #E2E8F0; text-align: center;">' + rs.hours + ' ชม.</td>' +
    '</tr>';
  }

  var content = '<h3 style="margin-top: 0; color: #0F3D5C;">รายงานสรุปการใช้งานห้องซ้อมประจำวันที่ ' + summary.date + '</h3>' +
    '<div style="display: flex; gap: 10px; margin: 16px 0;">' +
      '<div style="flex: 1; padding: 12px; background-color: #F1F5F9; border-radius: 8px; text-align: center;">' +
        '<div style="font-size: 12px; color: #64748B;">จองทั้งหมด</div>' +
        '<div style="font-size: 22px; font-weight: bold; color: #0F3D5C;">' + summary.totalBookings + '</div>' +
      '</div>' +
      '<div style="flex: 1; padding: 12px; background-color: #DCFCE7; border-radius: 8px; text-align: center;">' +
        '<div style="font-size: 12px; color: #166534;">สำเร็จ / เช็คเอาต์</div>' +
        '<div style="font-size: 22px; font-weight: bold; color: #16A34A;">' + summary.completedBookings + '</div>' +
      '</div>' +
      '<div style="flex: 1; padding: 12px; background-color: #FEE2E2; border-radius: 8px; text-align: center;">' +
        '<div style="font-size: 12px; color: #991B1B;">No-show</div>' +
        '<div style="font-size: 22px; font-weight: bold; color: #DC2626;">' + summary.noShowBookings + '</div>' +
      '</div>' +
    '</div>' +
    '<h4 style="margin: 16px 0 8px 0; color: #1E293B;">สถิติการใช้งานแยกตามห้อง:</h4>' +
    '<table style="width: 100%; border-collapse: collapse; margin-bottom: 16px;">' +
      '<thead><tr style="background-color: #F8FAFC;"><th style="padding: 8px 12px; text-align: left;">ห้องซ้อม</th><th style="padding: 8px 12px; text-align: center;">จำนวนคิว</th><th style="padding: 8px 12px; text-align: center;">ชั่วโมงรวม</th></tr></thead>' +
      '<tbody>' + rowsHtml + '</tbody>' +
    '</table>';

  var html = buildBaseEmailTemplate("สรุปประจำวัน: " + summary.date, "สรุปยอดประจำวัน", "#C9A227", content);
  safeSendEmail({
    bcc: bccRecipients,
    subject: "[สรุปประจำวัน] สถิติการใช้ห้องซ้อมดนตรี วทก. ประจำวันที่ " + summary.date,
    htmlBody: html
  });
}
