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
