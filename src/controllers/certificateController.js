const prisma = require('../utils/prisma');
const { generateNumbersFromYear, calculateDurationDays, generateVerificationUrl, generateQrCode } = require('../utils/helpers');

exports.createCertificate = async (req, res) => {
  try {
    const {
      fullName, fatherName, courseName, collegeName, branch, semester,
      internshipDomain, startDate, endDate, totalHours, performance,
      authorizedSignatory, companyAddress, companyEmail, companyWebsite
    } = req.body;

    if (!fullName || !fatherName || !courseName || !internshipDomain || !startDate || !endDate) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const year = new Date(startDate).getFullYear();
    const { certificateNumber, registrationNumber } = await generateNumbersFromYear(year);
    const durationDays = calculateDurationDays(startDate, endDate);
    const verificationUrl = await generateVerificationUrl(registrationNumber);
    const qrCode = await generateQrCode(verificationUrl);

    const cert = await prisma.certificate.create({
      data: {
        fullName,
        fatherName,
        courseName,
        collegeName,
        branch,
        semester,
        internshipDomain,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        durationDays,
        totalHours: totalHours || 0,
        performance,
        authorizedSignatory,
        companyAddress,
        companyEmail,
        companyWebsite,
        certificateNumber,
        registrationNumber,
        verificationUrl,
        qrCode,
      }
    });

    res.status(201).json({ success: true, message: 'Certificate created successfully', data: cert });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.verifyCertificate = async (req, res) => {
  try {
    const { registrationNumber } = req.params;
    const cert = await prisma.certificate.findUnique({ where: { registrationNumber } });
    if (!cert) return res.status(404).json({ success: false, valid: false, message: 'Certificate not found' });
    res.json({ success: true, valid: true, certificate: cert });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, valid: false, message: 'Server error' });
  }
};

exports.getAllCertificates = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const skip = (page - 1) * limit;

    const where = search ? {
      OR: [
        { fullName: { contains: search, mode: 'insensitive' } },
        { registrationNumber: { contains: search, mode: 'insensitive' } }
      ]
    } : {};

    const [total, items] = await Promise.all([
      prisma.certificate.count({ where }),
      prisma.certificate.findMany({ where, orderBy: { createdAt: 'desc' }, skip, take: limit })
    ]);

    res.json({
      success: true,
      data: {
        items,
        total,
        page,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getSingleCertificate = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const cert = await prisma.certificate.findUnique({ where: { id } });
    if (!cert) return res.status(404).json({ success: false, message: 'Certificate not found' });
    res.json({ success: true, data: cert });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.updateCertificate = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const data = { ...req.body };

    if (data.startDate || data.endDate) {
      const existing = await prisma.certificate.findUnique({ where: { id } });
      const startVal = data.startDate ? new Date(data.startDate) : existing.startDate;
      const endVal = data.endDate ? new Date(data.endDate) : existing.endDate;
      data.durationDays = calculateDurationDays(startVal, endVal);
      if (data.startDate) data.startDate = new Date(data.startDate);
      if (data.endDate) data.endDate = new Date(data.endDate);
    }

    const updated = await prisma.certificate.update({ where: { id }, data });
    res.json({ success: true, message: 'Certificate updated', data: updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.deleteCertificate = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await prisma.certificate.delete({ where: { id } });
    res.json({ success: true, message: 'Certificate deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
