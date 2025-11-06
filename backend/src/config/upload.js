import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure upload directories exist
const uploadDir = path.join(__dirname, '../../uploads');
const lessonDir = path.join(uploadDir, 'lessons');
const assignmentDir = path.join(uploadDir, 'assignments');
const submissionDir = path.join(uploadDir, 'submissions');

[uploadDir, lessonDir, assignmentDir, submissionDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Storage configuration
const createStorage = (subDir) => multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(uploadDir, subDir);
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Generate unique filename: timestamp_originalname
    const uniqueSuffix = Date.now() + '_' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext);
    cb(null, `${uniqueSuffix}_${name}${ext}`);
  }
});

// File filter for allowed types
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'image/jpeg',
    'image/png',
    'image/gif',
    'application/zip',
    'application/x-zip-compressed',
    'text/javascript',
    'text/html',
    'text/css',
    'application/json'
  ];

  const allowedExtensions = ['.pdf', '.doc', '.docx', '.txt', '.jpg', '.jpeg', '.png', '.gif', '.zip', '.js', '.html', '.css', '.json', '.py', '.java', '.cpp', '.c'];
  
  const ext = path.extname(file.originalname).toLowerCase();
  
  if (allowedTypes.includes(file.mimetype) || allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error(`File type not allowed. Allowed types: ${allowedExtensions.join(', ')}`));
  }
};

// Upload configurations
export const lessonUpload = multer({
  storage: createStorage('lessons'),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 5 // Max 5 files per lesson
  },
  fileFilter
});

export const assignmentUpload = multer({
  storage: createStorage('assignments'),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 3 // Max 3 files per assignment
  },
  fileFilter
});

export const submissionUpload = multer({
  storage: createStorage('submissions'),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 10 // Max 10 files per submission
  },
  fileFilter
});

// Helper function to get file URL
export function getFileUrl(req, filePath) {
  if (!filePath) return null;
  const baseUrl = `${req.protocol}://${req.get('host')}`;
  return `${baseUrl}/uploads/${filePath.replace(/\\/g, '/')}`;
}

// Helper function to delete file
export function deleteFile(filePath) {
  try {
    const fullPath = path.join(uploadDir, filePath);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
      return true;
    }
  } catch (error) {
    console.error('Error deleting file:', error);
  }
  return false;
}
