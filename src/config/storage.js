const admin = require('firebase-admin');

// Initialize Storage bucket
const bucket = admin.storage().bucket('your-project-id.appspot.com'); 

/**
 * Generates a signed URL so the Frontend can upload directly 
 * to Firebase Storage securely.
 */
exports.getUploadUrl = async (fileName) => {
  const file = bucket.file(`scans/${Date.now()}_${fileName}`);
  
  const [url] = await file.getSignedUrl({
    version: 'v4',
    action: 'write',
    expires: Date.now() + 15 * 60 * 1000, // URL expires in 15 mins
    contentType: 'image/jpeg',
  });

  return { url, fileName: file.name };
};
