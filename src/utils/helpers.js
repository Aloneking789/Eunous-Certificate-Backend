const prisma = require("./prisma");
const QRCode = require("qrcode");

const MS_PER_DAY = 24 * 60 * 60 * 1000;

function getBranchAbbr(name) {
  if (!name || typeof name !== "string") return "XX";
  const parts = name
    .split(/\s+/)
    .map((w) => w.replace(/[^A-Za-z]/g, ""))
    .filter(Boolean);
  if (parts.length === 0) return "XX";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return parts
    .map((p) => p[0])
    .join("")
    .toUpperCase();
}

async function generateNumbersFromYear(year, branchName) {
  const companyCode = "EUIT";
  const branchAbbr = getBranchAbbr(branchName);
  const yearSuffix = String(year).slice(-2);
  // Determine next certificate sequence by looking up the latest certificate for this pattern
  const startsWith = `${companyCode}-${branchAbbr}${yearSuffix}-V`;
  const lastCert = await prisma.certificate.findMany({
    where: { certificateNumber: { startsWith } },
    orderBy: { certificateNumber: "desc" },
    take: 1,
  });

  let seq = 1;
  if (lastCert && lastCert.length > 0) {
    const m = String(lastCert[0].certificateNumber).match(/-V(\d+)$/);
    if (m) seq = parseInt(m[1], 10) + 1;
  }
  const seqPadded = String(seq).padStart(3, "0"); // V001
  const certificateNumber = `${companyCode}-${branchAbbr}${yearSuffix}-V${seqPadded}`;

  // Determine next registration sequence by looking up the latest registration for the year
  const regStarts = `EUNOUS-REG-${year}-`;
  const lastReg = await prisma.certificate.findMany({
    where: { registrationNumber: { startsWith: regStarts } },
    orderBy: { registrationNumber: "desc" },
    take: 1,
  });

  let regSeq = 1;
  if (lastReg && lastReg.length > 0) {
    const m2 = String(lastReg[0].registrationNumber).match(/-(\d+)$/);
    if (m2) regSeq = parseInt(m2[1], 10) + 1;
  }
  const regSeqPadded = String(regSeq).padStart(4, "0");
  const registrationNumber = `EUNOUS-REG-${year}-${regSeqPadded}`;

  return { certificateNumber, registrationNumber };
}

function calculateDurationDays(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diff = Math.floor((end - start) / MS_PER_DAY) + 1;
  return diff >= 0 ? diff : 0;
}

function getAppBase() {
  return (
    process.env.APP_BASE_URL || `http://localhost:${process.env.PORT || 5000}`
  );
}

async function generateVerificationUrl(registrationNumber) {
  const base = getAppBase();
  return `${base}/api/certificates/verify/${registrationNumber}`;
}

async function generateQrCode(verificationUrl) {
  return await QRCode.toDataURL(verificationUrl);
}

module.exports = {
  generateNumbersFromYear,
  calculateDurationDays,
  generateVerificationUrl,
  generateQrCode,
};
