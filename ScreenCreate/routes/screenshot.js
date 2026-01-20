const express = require('express');
const fs = require('fs');
const path = require('path');
const { takeScreenshot } = require('../services/browser');

const router = express.Router();

// POST /screenshot/capture - Take screenshot and save to file, return JSON with path
router.post('/capture', express.json(), async (req, res) => {
  const { url, width, height, fullPage, format, quality, timeout } = req.body;

  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  const options = {
    width: parseInt(width) || 1920,
    height: parseInt(height) || 1080,
    fullPage: fullPage === true || fullPage === 'true',
    format: ['png', 'jpeg', 'webp'].includes(format) ? format : 'png',
    quality: Math.min(100, Math.max(1, parseInt(quality) || 80)),
    timeout: parseInt(timeout) || 30000
  };

  try {
    const screenshot = await takeScreenshot(url, options);

    // Create screenshots directory if not exists
    const screenshotsDir = path.join(__dirname, '..', 'screenshots');
    if (!fs.existsSync(screenshotsDir)) {
      fs.mkdirSync(screenshotsDir, { recursive: true });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const safeName = url.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 50);
    const filename = `${timestamp}_${safeName}.${options.format}`;
    const filePath = path.join(screenshotsDir, filename);

    // Save screenshot to file
    fs.writeFileSync(filePath, screenshot);

    // Return JSON with file path
    res.json({
      success: true,
      screenshot: {
        filePath: `screenshots/${filename}`,
        filename: filename,
        url: url,
        width: options.width,
        height: options.height
      }
    });
  } catch (error) {
    console.error('[screenshot/capture]', error.message);
    res.status(500).json({ error: 'Failed to capture screenshot', message: error.message });
  }
});

router.get('/', async (req, res) => {
  const { url, width, height, fullPage, format, quality } = req.query;

  // Validation
  if (!url) {
    return res.status(400).json({ error: 'URL parameter is required' });
  }

  // Parse parameters
  const options = {
    width: parseInt(width) || 1920,
    height: parseInt(height) || 1080,
    fullPage: fullPage === 'true',
    format: ['png', 'jpeg', 'webp'].includes(format) ? format : 'png',
    quality: Math.min(100, Math.max(1, parseInt(quality) || 80))
  };

  // Validate dimensions
  if (options.width < 100 || options.width > 3840) {
    return res.status(400).json({ error: 'Width must be between 100 and 3840' });
  }
  if (options.height < 100 || options.height > 2160) {
    return res.status(400).json({ error: 'Height must be between 100 and 2160' });
  }

  try {
    const screenshot = await takeScreenshot(url, options);

    const contentTypes = {
      png: 'image/png',
      jpeg: 'image/jpeg',
      webp: 'image/webp'
    };

    res.set('Content-Type', contentTypes[options.format]);
    res.send(screenshot);
  } catch (error) {
    console.error('Screenshot error:', error.message);
    res.status(500).json({ error: 'Failed to take screenshot', message: error.message });
  }
});

module.exports = router;
