const prisma = require('./prisma');
const QRCode = require('qrcode');

const MS_PER_DAY = 24 * 60 * 60 * 1000;

async function generateNumbersFromYear(year) {
  const count = await prisma.certificate.count({
    where: { certificateNumber: { startsWith: `CERT-${year}-` } }
  });
  const seq = count + 1;
  const seqPadded = String(seq).padStart(4, '0');
  return {
    certificateNumber: `CERT-${year}-${seqPadded}`,
    registrationNumber: `EUNOUS-REG-${year}-${seqPadded}`
  };
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
