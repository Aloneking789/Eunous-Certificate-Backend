const prisma = require('./prisma');
const QRCode = require('qrcode');

const MS_PER_DAY = 24 * 60 * 60 * 1000;

function getCourseAbbr(courseName) {
  if (!courseName || typeof courseName !== 'string') return 'XX';
  const parts = courseName
    .split(/\s+/)
    .map((w) => w.replace(/[^A-Za-z]/g, ''))
    .filter(Boolean);
  if (parts.length === 0) return 'XX';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return parts.map((p) => p[0]).join('').toUpperCase();
}

async function generateNumbersFromYear(year, courseName) {
  const companyCode = 'EUIT';
  const courseAbbr = getCourseAbbr(courseName);
  const yearSuffix = String(year).slice(-2);

  // Count existing certificates for this company-course-year pattern
  const startsWith = `${companyCode}-${courseAbbr}${yearSuffix}-V`;
  const count = await prisma.certificate.count({
    where: { certificateNumber: { startsWith } },
  });
  const seq = count + 1;
  const seqPadded = String(seq).padStart(3, '0'); // V001
  const certificateNumber = `${companyCode}-${courseAbbr}${yearSuffix}-V${seqPadded}`;

  // Keep registration number as a global per-year increment (4 digits)
  const regCount = await prisma.certificate.count({
    where: { registrationNumber: { startsWith: `EUNOUS-REG-${year}-` } },
  });
  const regSeq = regCount + 1;
  const regSeqPadded = String(regSeq).padStart(4, '0');
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
  return process.env.APP_BASE_URL || `http://localhost:${process.env.PORT || 5000}`;
}

async function generateVerificationUrl(registrationNumber) {
  const base = getAppBase();
  return `${base}/api/certificates/verify/${registrationNumber}`;
}

async function generateQrCode(verificationUrl) {
  return await QRCode.toDataURL(verificationUrl);
}

module.exports = { generateNumbersFromYear, calculateDurationDays, generateVerificationUrl, generateQrCode };
