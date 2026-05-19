const prisma = require('../utils/prisma');

exports.createCourse = async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ success: false, message: 'Name is required' });
    const course = await prisma.course.create({ data: { name, description } });
    res.status(201).json({ success: true, data: course });
  } catch (err) {
    if (err.code === 'P2002') return res.status(409).json({ success: false, message: 'Course already exists' });
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getCourses = async (req, res) => {
  try {
    const courses = await prisma.course.findMany({ orderBy: { createdAt: 'desc' } });
    res.json({ success: true, data: courses });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
