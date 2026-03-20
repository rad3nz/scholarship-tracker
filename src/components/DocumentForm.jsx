import React, { useState, useEffect } from 'react';
import { createDocument, updateDocument } from '../db/indexeddb';

const DocumentForm = ({ document: existingDocument, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    type: 'CV',
    status: 'NotReady',
    fileLink: '',
    notes: ''
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (existingDocument) {
      setFormData({
        name: existingDocument.name || '',
        type: existingDocument.type || 'CV',
        status: existingDocument.status || 'NotReady',
        fileLink: existingDocument.fileLink || '',
        notes: existingDocument.notes || ''
      });
    } else {
      setFormData({
        name: '',
        type: 'CV',
        status: 'NotReady',
        fileLink: '',
        notes: ''
      });
    }
  }, [existingDocument]);

  const documentTypeOptions = [
    { value: 'CV', label: 'CV' },
    { value: 'Transcript', label: 'Transcript' },
    { value: 'LanguageCertificate', label: 'Language Certificate' },
    { value: 'RecommendationLetter', label: 'Recommendation Letter' },
    { value: 'LoA', label: 'Letter of Acceptance (LoA)' },
    { value: 'PersonalStatement', label: 'Personal Statement' }
  ];

  const statusOptions = [
    { value: 'NotReady', label: 'Not Ready' },
    { value: 'Draft', label: 'Draft' },
    { value: 'Final', label: 'Final' },
    { value: 'Uploaded', label: 'Uploaded' }
  ];

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.type) {
      newErrors.type = 'Type is required';
    }
    
    if (!formData.status) {
      newErrors.status = 'Status is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      if (existingDocument) {
        await updateDocument(existingDocument.id, {
          ...formData,
          lastUpdated: new Date().toISOString()
        });
        console.log('Document updated successfully');
      } else {
        await createDocument(formData);
        console.log('Document created successfully');
      }
      onSave();
    } catch (error) {
      console.error('Error saving document:', error);
      setErrors({ submit: error.message || 'Failed to save document' });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      onCancel();
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
        {existingDocument ? 'Edit Document' : 'Add New Document'}
      </h2>
      
      <form onSubmit={handleSubmit} onKeyDown={handleKeyDown}>
        <div className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              Document Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.name ? 'border-red-300' : 'border-gray-300 dark:border-gray-600'
              }`}
              placeholder="e.g., CV, Transcript"
              autoFocus
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name}</p>
            )}
          </div>

          <div>
            <label htmlFor="type" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              Document Type *
            </label>
            <select
              id="type"
              name="type"
              value={formData.type}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.type ? 'border-red-300' : 'border-gray-300 dark:border-gray-600'
              }`}
            >
              {documentTypeOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {errors.type && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.type}</p>
            )}
          </div>

          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              Document Status *
            </label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.status ? 'border-red-300' : 'border-gray-300 dark:border-gray-600'
              }`}
            >
              {statusOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {errors.status && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.status}</p>
            )}
          </div>

          <div>
            <label htmlFor="fileLink" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              File Link (Optional)
            </label>
            <input
              type="text"
              id="fileLink"
              name="fileLink"
              value={formData.fileLink}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Local path or URL"
            />
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500">
              Enter a local file path or URL to the document
            </p>
          </div>

          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              Notes (Optional)
            </label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              placeholder="Additional notes about the document (e.g., version info, important details)"
            />
          </div>
        </div>

        {errors.submit && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600 dark:text-red-400">{errors.submit}</p>
          </div>
        )}

        <div className="mt-6 flex gap-3">
          <button
            type="submit"
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          >
            {existingDocument ? 'Update Document' : 'Add Document'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 py-2 px-4 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default DocumentForm;