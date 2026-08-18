const fs = require('fs');

/**
 * Check whether the Python analysis microservice is reachable
 */
const checkPythonHealth = async () => {
  const pythonUrl = process.env.PYTHON_SERVICE_URL || 'http://127.0.0.1:5001';
  try {
    const response = await fetch(`${pythonUrl}/health`, { signal: AbortSignal.timeout(3000) });
    if (response.ok) {
      const data = await response.json();
      return { reachable: true, data };
    }
    return { reachable: false, error: `HTTP ${response.status}` };
  } catch (err) {
    return { reachable: false, error: `Python service unreachable: ${err.message}` };
  }
};

/**
 * Send uploaded WhatsApp txt chat file to Python analysis Flask API
 * @param {string} filePath Absolute path to uploaded file on disk
 * @returns {Promise<Object>} Analyzed chat metrics JSON
 */
const runPythonAnalysis = async (filePath) => {
  const pythonUrl = process.env.PYTHON_SERVICE_URL || 'http://127.0.0.1:5001';

  if (!fs.existsSync(filePath)) {
    throw new Error('Uploaded file does not exist on disk.');
  }

  const fileStats = fs.statSync(filePath);
  if (fileStats.size === 0) {
    throw new Error('The uploaded file is empty.');
  }

  try {
    const fileBuffer = fs.readFileSync(filePath);
    const blob = new Blob([fileBuffer], { type: 'text/plain' });
    const formData = new FormData();
    formData.append('file', blob, 'uploaded_chat.txt');

    const response = await fetch(`${pythonUrl}/api/analyze`, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      let errorMsg = `Python service returned HTTP ${response.status}`;
      try {
        const errorJson = await response.json();
        if (errorJson && errorJson.error) {
          errorMsg = errorJson.error;
        }
      } catch (e) {
        // Fallback to text
      }
      throw new Error(errorMsg);
    }

    const jsonResult = await response.json();
    if (!jsonResult.success || !jsonResult.data) {
      throw new Error(jsonResult.error || 'Invalid response received from Python service.');
    }

    return jsonResult.data;

  } catch (err) {
    if (err.cause && err.cause.code === 'ECONNREFUSED') {
      throw new Error('Python analysis service is unavailable. Please ensure the Python service is running.');
    }
    throw err;
  }
};

module.exports = {
  runPythonAnalysis,
  checkPythonHealth
};
