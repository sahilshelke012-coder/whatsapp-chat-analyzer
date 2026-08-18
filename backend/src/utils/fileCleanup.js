const fs = require('fs');

/**
 * Safely delete temporary uploaded file
 * @param {string} filePath 
 */
const deleteFile = (filePath) => {
  if (filePath && fs.existsSync(filePath)) {
    fs.unlink(filePath, (err) => {
      if (err) console.error(`Error deleting temp file ${filePath}:`, err);
    });
  }
};

module.exports = { deleteFile };
