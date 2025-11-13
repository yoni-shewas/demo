import { Upload, X, FileText } from 'lucide-react';

const FileUpload = ({
  label,
  accept,
  maxSize,
  multiple = false,
  value,
  onChange,
  error,
  helperText,
  className = '',
}) => {
  const handleFileChange = (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      if (multiple) {
        onChange(Array.from(files));
      } else {
        onChange(files[0]);
      }
    }
  };

  const handleRemove = (index) => {
    if (multiple && Array.isArray(value)) {
      const newFiles = value.filter((_, i) => i !== index);
      onChange(newFiles);
    } else {
      onChange(null);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const files = multiple && Array.isArray(value) ? value : value ? [value] : [];

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      )}
      
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          error ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
        }`}
      >
        <input
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleFileChange}
          className="hidden"
          id="file-upload"
        />
        <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center">
          <Upload className="h-12 w-12 text-gray-400 mb-3" />
          <p className="text-sm text-gray-600 mb-1">
            Click to upload or drag and drop
          </p>
          {accept && (
            <p className="text-xs text-gray-500">
              {accept.split(',').join(', ')} files
            </p>
          )}
          {maxSize && (
            <p className="text-xs text-gray-500">Max size: {formatFileSize(maxSize)}</p>
          )}
        </label>
      </div>

      {files.length > 0 && (
        <div className="mt-4 space-y-2">
          {files.map((file, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
            >
              <div className="flex items-center space-x-3 flex-1 min-w-0">
                <FileText className="h-5 w-5 text-gray-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                  <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                </div>
              </div>
              <button
                onClick={() => handleRemove(index)}
                className="text-gray-400 hover:text-red-600 transition-colors flex-shrink-0 ml-2"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
      {helperText && !error && <p className="text-sm text-gray-500 mt-2">{helperText}</p>}
    </div>
  );
};

export default FileUpload;
