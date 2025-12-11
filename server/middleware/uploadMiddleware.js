import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Ensure uploads directory exists
const uploadDir = 'uploads/proofs';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `proof-${uniqueSuffix}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  console.log('File filter checking:', {
    originalname: file.originalname,
    mimetype: file.mimetype,
    size: file.size
  });

  const allowedTypes = [
    // Documents
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-word.document.macroEnabled.12',
    
    // PowerPoint
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/vnd.openxmlformats-officedocument.presentationml.slideshow',
    'application/vnd.ms-powerpoint.presentation.macroEnabled.12',
    'application/vnd.ms-powerpoint.slideshow.macroEnabled.12',
    
    // Excel
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel.sheet.macroEnabled.12',
    'application/vnd.ms-excel.sheet.binary.macroEnabled.12',
    
    // Images
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml',
    'image/tiff',
    'image/bmp',
    
    // Text files
    'text/plain',
    'text/csv',
    'text/html',
    'text/markdown',
    'text/rtf',
    
    // Archives
    'application/zip',
    'application/x-rar-compressed',
    'application/x-7z-compressed',
    'application/x-tar',
    'application/gzip',
    
    // Code files
    'application/json',
    'text/javascript',
    'text/typescript',
    'text/x-python',
    'text/x-java-source',
    'text/x-c++src',
    'text/x-csrc',
    'text/x-csharp',
    'text/x-php',
    'text/x-ruby',
    'text/x-go',
    'text/x-swift',
    
    // Audio/Video (optional)
    'audio/mpeg',
    'audio/wav',
    'audio/ogg',
    'video/mp4',
    'video/mpeg',
    'video/ogg',
    'video/webm',
    
    // Other common types
    'application/rtf',
    'application/x-latex',
    'application/vnd.oasis.opendocument.text',
    'application/vnd.oasis.opendocument.spreadsheet',
    'application/vnd.oasis.opendocument.presentation',
    
    // Apple files
    'application/vnd.apple.pages',
    'application/vnd.apple.numbers',
    'application/vnd.apple.keynote',
  ];
  
  // Also check by file extension as fallback
  const allowedExtensions = [
    '.pdf',
    '.doc', '.docx', '.dot', '.dotx',
    '.ppt', '.pptx', '.pps', '.ppsx', '.pot', '.potx',
    '.xls', '.xlsx', '.xlsm', '.xlsb', '.xlt', '.xltx',
    '.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.tiff', '.tif', '.bmp',
    '.txt', '.csv', '.html', '.htm', '.md', '.markdown', '.rtf',
    '.zip', '.rar', '.7z', '.tar', '.gz',
    '.json', '.js', '.ts', '.py', '.java', '.cpp', '.c', '.cs', '.php', '.rb', '.go', '.swift',
    '.mp3', '.wav', '.ogg',
    '.mp4', '.mpeg', '.webm',
    '.odt', '.ods', '.odp',
    '.pages', '.numbers', '.key',
  ];
  
  const fileExt = path.extname(file.originalname).toLowerCase();
  
  if (allowedTypes.includes(file.mimetype) || allowedExtensions.includes(fileExt)) {
    console.log('File type accepted:', file.mimetype, 'Extension:', fileExt);
    cb(null, true);
  } else {
    console.log('File type rejected:', file.mimetype, 'Extension:', fileExt);
    cb(new Error(
      `Invalid file type. Allowed types: PDF, Word, Excel, PowerPoint, Images, Text files, Archives, Code files. ` +
      `Received: ${file.mimetype} (${fileExt})`
    ), false);
  }
};

const upload = multer({
  storage: storage,
  limits: { 
    fileSize: 25 * 1024 * 1024 // 25MB
  },
  fileFilter: fileFilter
});



export default upload;