const prisma = require("../utils/prisma");

exports.createBranch = async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name)
      return res
        .status(400)
        .json({ success: false, message: "Name is required" });
    const branch = await prisma.branch.create({ data: { name, description } });
    res.status(201).json({ success: true, data: branch });
  } catch (err) {
    if (err.code === "P2002")
      return res
        .status(409)
        .json({ success: false, message: "Branch already exists" });
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.getBranches = async (req, res) => {
  try {
    const branches = await prisma.branch.findMany({
      orderBy: { createdAt: "desc" },
    });
    res.json({ success: true, data: branches });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
