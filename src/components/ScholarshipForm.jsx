import React, { useState, useEffect } from 'react';
import DocumentRequirementForm from './DocumentRequirementForm';
import TemplateSelector from './TemplateSelector';
import CustomTemplateForm from './CustomTemplateForm';

const ScholarshipForm = ({ scholarship, documents = [], onSave, onCancel, onTemplateSelect }) => {
  const [formData, setFormData] = useState({
    name: '',
    provider: '',
    degreeLevel: 'Master',
    country: '',
    applicationYear: new Date().getFullYear(),
    deadline: '',
    status: 'Not Started',
    note: '',
    requiredDocumentIds: [],
  });

  const [errors, setErrors] = useState({});
  const [showTemplateSelector, setShowTemplateSelector] = useState(!scholarship);
  const [showCustomTemplateForm, setShowCustomTemplateForm] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  useEffect(() => {
    if (scholarship) {
      setFormData({
        name: scholarship.name,
        provider: scholarship.provider,
        degreeLevel: scholarship.degreeLevel,
        country: scholarship.country,
        applicationYear: scholarship.applicationYear,
        deadline: scholarship.deadline.split('T')[0],
        status: scholarship.status,
        note: scholarship.note || '',
        requiredDocumentIds: scholarship.requiredDocumentIds || [],
      });
      setShowTemplateSelector(false);
    } else {
      setFormData({
        name: '',
        provider: '',
        degreeLevel: 'Master',
        country: '',
        applicationYear: new Date().getFullYear(),
        deadline: '',
        status: 'Not Started',
        note: '',
        requiredDocumentIds: [],
      });
      setShowTemplateSelector(true);
    }
  }, [scholarship]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleRequiredDocumentsChange = (requiredDocumentIds) => {
    setFormData((prev) => ({
      ...prev,
      requiredDocumentIds,
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    if (!formData.provider.trim()) {
      newErrors.provider = 'Provider is required';
    }
    if (!formData.country.trim()) {
      newErrors.country = 'Country is required';
    }
    if (!formData.deadline) {
      newErrors.deadline = 'Deadline is required';
    }
    if (!formData.applicationYear) {
      newErrors.applicationYear = 'Application year is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      const dataToSave = {
        ...formData,
        deadline: new Date(formData.deadline).toISOString(),
      };
      onSave(dataToSave, selectedTemplate);
    }
  };

  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template);
    setShowTemplateSelector(false);
    setShowCustomTemplateForm(false);
  };

  const handleSkipTemplate = () => {
    setSelectedTemplate(null);
    setShowTemplateSelector(false);
    setShowCustomTemplateForm(false);
  };

  const handleCreateCustomTemplate = () => {
    setShowTemplateSelector(false);
    setShowCustomTemplateForm(true);
  };

  const handleCustomTemplateSave = async (templateData) => {
    try {
      const { createTemplate } = await import('../db/indexeddb');
      const savedTemplate = await createTemplate(templateData);
      setSelectedTemplate(savedTemplate);
      setShowCustomTemplateForm(false);
    } catch (error) {
      console.error('Error saving custom template:', error);
      alert('Failed to save template: ' + error.message);
    }
  };

  const handleCustomTemplateCancel = () => {
    setShowCustomTemplateForm(false);
    setShowTemplateSelector(true);
  };

  if (showTemplateSelector && !scholarship) {
    return (
      <TemplateSelector
        onSelect={handleTemplateSelect}
        onSkip={handleSkipTemplate}
        onCreateCustom={handleCreateCustomTemplate}
      />
    );
  }

  if (showCustomTemplateForm && !scholarship) {
    return (
      <CustomTemplateForm
        onSave={handleCustomTemplateSave}
        onCancel={handleCustomTemplateCancel}
      />
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm p-6">
      <button
        onClick={onCancel}
        className="flex items-center text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white font-medium transition-colors mb-6"
      >
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Back to Scholarships
      </button>
      
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        {scholarship ? 'Edit Scholarship' : 'Add New Scholarship'}
      </h2>

      {selectedTemplate && !scholarship && (
        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-200 mb-1">
                Template Selected: {selectedTemplate.name}
              </h3>
              <p className="text-xs text-blue-700 dark:text-blue-300">
                {selectedTemplate.items?.length || 0} checklist items will be added after creating the scholarship
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowTemplateSelector(true)}
              className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 text-sm font-medium"
            >
              Change Template
            </button>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
            Scholarship Name <span className="text-red-500 dark:text-red-400">*</span>
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className={`w-full px-3 py-2 border ${
              errors.name ? 'border-red-300 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'
            } rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition-colors`}
            placeholder="e.g., Fulbright Foreign Student Program"
          />
          {errors.name && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name}</p>}
        </div>

        <div>
          <label htmlFor="provider" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
            Provider/Organization <span className="text-red-500 dark:text-red-400">*</span>
          </label>
          <input
            type="text"
            id="provider"
            name="provider"
            value={formData.provider}
            onChange={handleChange}
            className={`w-full px-3 py-2 border ${
              errors.provider ? 'border-red-300 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'
            } rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition-colors`}
            placeholder="e.g., Fulbright Commission"
          />
          {errors.provider && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.provider}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="degreeLevel" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
              Degree Level
            </label>
            <select
              id="degreeLevel"
              name="degreeLevel"
              value={formData.degreeLevel}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition-colors"
            >
              <option value="Master">Master</option>
              <option value="Doctor">Doctor</option>
            </select>
          </div>

          <div>
            <label htmlFor="applicationYear" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
              Application Year <span className="text-red-500 dark:text-red-400">*</span>
            </label>
            <input
              type="number"
              id="applicationYear"
              name="applicationYear"
              value={formData.applicationYear}
              onChange={handleChange}
              min="2000"
              max="2100"
              className={`w-full px-3 py-2 border ${
                errors.applicationYear ? 'border-red-300 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'
              } rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition-colors`}
            />
            {errors.applicationYear && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.applicationYear}</p>
            )}
          </div>
        </div>

        <div>
          <label htmlFor="country" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
            Country <span className="text-red-500 dark:text-red-400">*</span>
          </label>
          <input
            type="text"
            id="country"
            name="country"
            value={formData.country}
            onChange={handleChange}
            className={`w-full px-3 py-2 border ${
              errors.country ? 'border-red-300 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'
            } rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition-colors`}
            placeholder="e.g., United States"
          />
          {errors.country && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.country}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="deadline" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
              Application Deadline <span className="text-red-500 dark:text-red-400">*</span>
            </label>
            <input
              type="date"
              id="deadline"
              name="deadline"
              value={formData.deadline}
              onChange={handleChange}
              className={`w-full px-3 py-2 border ${
                errors.deadline ? 'border-red-300 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'
              } rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition-colors`}
            />
            {errors.deadline && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.deadline}</p>}
          </div>

          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
              Application Status
            </label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition-colors"
            >
              <option value="Not Started">Not Started</option>
              <option value="Preparing">Preparing</option>
              <option value="Submitted">Submitted</option>
              <option value="Interview">Interview</option>
              <option value="Result">Result</option>
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="note" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
            Notes (Optional)
          </label>
          <textarea
            id="note"
            name="note"
            value={formData.note}
            onChange={handleChange}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition-colors resize-none"
            placeholder="Add any notes for this scholarship"
          />
        </div>

        <DocumentRequirementForm
          documents={documents}
          selectedIds={formData.requiredDocumentIds}
          onChange={handleRequiredDocumentsChange}
        />

        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            className="flex-1 px-4 py-2.5 text-white bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600 rounded-md font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 dark:focus:ring-offset-gray-800"
          >
            {scholarship ? 'Update Scholarship' : 'Create Scholarship'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-4 py-2.5 text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-1 dark:focus:ring-offset-gray-800"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default ScholarshipForm;
