export const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001/api';

// Normalize pythonUrl to always end with exactly one /python
let pythonUrl = process.env.NEXT_PUBLIC_PYTHON_URL || 'http://localhost:8000/python';
pythonUrl = pythonUrl.replace(/\/$/, ''); // Remove trailing slash
// Remove any existing /python suffix(es) to avoid duplicates
pythonUrl = pythonUrl.replace(/\/python\/?$/g, '');
// Ensure it ends with exactly one /python
if (!pythonUrl.endsWith('/python')) {
  pythonUrl = `${pythonUrl}/python`;
}
export { pythonUrl };

// Normalize pythonUrl2 to always end with exactly one /python2
let pythonUrl2 = process.env.NEXT_PUBLIC_PYTHON_URL2 || 'http://localhost:8008/python2';
pythonUrl2 = pythonUrl2.replace(/\/$/, ''); // Remove trailing slash
// Remove any existing /python2 suffix(es) to avoid duplicates
pythonUrl2 = pythonUrl2.replace(/\/python2\/?$/g, '');
// Ensure it ends with exactly one /python2
if (!pythonUrl2.endsWith('/python2')) {
  pythonUrl2 = `${pythonUrl2}/python2`;
}
export { pythonUrl2 };