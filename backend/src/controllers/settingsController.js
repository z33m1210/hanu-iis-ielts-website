const prisma = require('../models/prismaClient');

// Get all settings
exports.getSettings = async (req, res, next) => {
  try {
    // Fetch global settings (id: 1)
    let settings = await prisma.globalSettings.findUnique({
      where: { id: 1 }
    });

    // Default values if not initialized
    if (!settings) {
      settings = {
        platformName: "BandPath IELTS",
        adminEmail: "admin@bandpath.edu",
        defaultLanguage: "English (US)",
        maintenanceMode: false
      };
    }

    res.json({ success: true, settings });
  } catch (error) {
    next(error);
  }
};

// Update global settings
exports.updateSettings = async (req, res, next) => {
  try {
    const { platformName, adminEmail, defaultLanguage, maintenanceMode } = req.body;
    
    const settings = await prisma.globalSettings.upsert({
      where: { id: 1 },
      update: {
        platformName,
        adminEmail,
        defaultLanguage,
        maintenanceMode
      },
      create: {
        id: 1,
        platformName,
        adminEmail,
        defaultLanguage,
        maintenanceMode
      }
    });

    res.json({ success: true, message: 'Settings updated successfully.', settings });
  } catch (error) {
    next(error);
  }
};
