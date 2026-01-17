//server/middleware/uploadMiddleware.js
import multer from 'multer';

const proofStorage = multer.memoryStorage();

export const proofUpload = multer({
  storage: proofStorage,
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
  // Images
  'image/jpeg','image/jpg','image/png','image/gif','image/webp',

  // Documents
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',

  // Text & Code files
  'text/plain',          // .txt, many code files default to this
  'text/html',           // .html
  'text/css',            // .css
  'application/javascript', // .js
  'application/octet-stream',
  'application/json',    // .json
  'text/javascript',

  // Archives (very useful for projects)
  'application/zip',
  'application/x-zip-compressed',
  'application/x-rar-compressed'
    ];
    if (allowedTypes.includes(file.mimetype)) cb(null, true);
    else cb(new Error('File type not allowed'), false);
  }
});

const avatarStorage = multer.memoryStorage(); 

export const avatarUpload = multer({
  storage: avatarStorage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg','image/jpg','image/png','image/gif','image/webp'];
    if (allowedTypes.includes(file.mimetype)) cb(null, true);
    else cb(new Error('Only image files allowed'), false);
  }
});

