import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';

const UploadModal = ({ isOpen, onClose, onUploadSuccess }) => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const onDrop = useCallback((acceptedFiles) => {
    setError('');
    setSuccess(false);
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/pdf': ['.pdf'],
      'application/json': ['.json']
    },
    multiple: false
  });

  const handleUpload = async () => {
    if (!file) return;
    setError('');
    setUploading(true);

    const formData = new FormData();
    formData.append('file', file);

    try {
      await axios.post('/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      setSuccess(true);
      setFile(null);
      if (onUploadSuccess) {
        onUploadSuccess();
      }
      setTimeout(() => {
        onClose();
        setSuccess(false);
      }, 1500);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || 'Failed to upload and parse statement.');
    } finally {
      setUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-lg bg-background/80 backdrop-blur-sm">
      <div className="w-full max-w-md glass-surface-elevated rounded-3xl p-lg flex flex-col gap-md relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={uploading}
          className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:bg-white/5 transition-all active:scale-90"
        >
          <span className="material-symbols-outlined text-[20px]">close</span>
        </button>

        <h3 className="font-headline-md text-headline-md text-on-surface pr-8">Upload Bank Statement</h3>
        <p className="font-body-md text-body-md text-on-surface-variant">
          Upload your banking transaction statement in CSV, PDF, or JSON format.
        </p>

        {/* Dropzone */}
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-2xl p-xl text-center cursor-pointer transition-all ${
            isDragActive
              ? 'border-primary bg-primary/5'
              : 'border-outline-variant/30 hover:border-primary/50'
          }`}
        >
          <input {...getInputProps()} />
          <span className="material-symbols-outlined text-primary text-[48px] mb-2">
            cloud_upload
          </span>
          {file ? (
            <div>
              <p className="font-label-md text-on-surface font-bold">{file.name}</p>
              <p className="text-xs text-on-surface-variant mt-1">
                {(file.size / 1024).toFixed(2)} KB • Click or drag to replace
              </p>
            </div>
          ) : isDragActive ? (
            <p className="font-label-md text-primary">Drop the statement file here...</p>
          ) : (
            <div>
              <p className="font-label-md text-on-surface">Drag & drop your statement here</p>
              <p className="text-xs text-on-surface-variant mt-1">Supports CSV, PDF, or JSON</p>
            </div>
          )}
        </div>

        {error && (
          <div className="bg-error-container/20 border border-error/40 text-error rounded-xl p-md text-label-md flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">warning</span>
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="bg-secondary/10 border border-secondary/30 text-secondary rounded-xl p-md text-label-md flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">check_circle</span>
            <span>Statement uploaded and analyzed successfully!</span>
          </div>
        )}

        <div className="flex gap-sm mt-2">
          <button
            onClick={onClose}
            disabled={uploading}
            className="flex-1 border border-outline-variant/30 text-on-surface font-bold py-3 px-4 rounded-xl text-label-md hover:bg-white/5 transition-all active:scale-[0.98]"
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={!file || uploading}
            className="flex-1 bg-primary text-on-primary font-bold py-3 px-4 rounded-xl text-label-md hover:opacity-90 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none transition-all flex items-center justify-center gap-2"
          >
            {uploading ? (
              <div className="w-5 h-5 border-2 border-on-primary border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <span className="material-symbols-outlined text-[20px]">upload</span>
                <span>Process File</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UploadModal;
