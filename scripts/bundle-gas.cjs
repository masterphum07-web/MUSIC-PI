const fs = require("fs");
const path = require("path");

const rootDir = path.resolve(__dirname, "..");
const files = [
  "00_Setup.gs",
  "01_Repository.gs",
  "02_Router.gs",
  "03_Validation.gs",
  "04_BookingService.gs",
  "05_Logger.gs",
  "06_Auth.gs",
  "07_AdminService.gs",
  "08_Mailer.gs",
  "09_Triggers.gs",
  "99_Test.gs"
];

let bundle = "/**\n * ระบบจองห้องซ้อมดนตรี ชมรมดนตรี วทก.\n * BUNDLED CODE.GS - รวมทุกโมดูลสำหรับ Google Apps Script\n * อัปเดตล่าสุด: " + new Date().toISOString() + "\n */\n\n";

for (const file of files) {
  const filePath = path.join(rootDir, "apps-script", file);
  if (fs.existsSync(filePath)) {
    bundle += "/* ============================================================================== */\n";
    bundle += "/* ไฟล์: " + file + " */\n";
    bundle += "/* ============================================================================== */\n\n";
    bundle += fs.readFileSync(filePath, "utf8") + "\n\n";
  }
}

const outputPath = path.join(rootDir, "apps-script", "Code.gs");
fs.writeFileSync(outputPath, bundle, "utf8");
console.log("Successfully bundled " + files.length + " files into " + outputPath + " (" + bundle.length + " bytes)");
