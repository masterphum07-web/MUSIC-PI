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
