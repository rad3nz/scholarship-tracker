import React, { useState, useEffect } from 'react';
import TemplatePreview from './TemplatePreview';

const CustomTemplateForm = ({ template, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'Custom',
    country: '',
    items: []
  });

  const [currentItem, setCurrentItem] = useState({ text: '', note: '', status: 'required', copies_required: 1 });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (template) {
      setFormData({
        name: template.name || '',
        description: template.description || '',
        category: template.category || 'Custom',
        country: template.country || '',
        items: template.items || []
      });
    }
  }, [template]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleItemChange = (e) => {
    const { name, value, type, checked } = e.target;
    setCurrentItem(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleAddItem = () => {
    if (!currentItem.text.trim()) {
      return;
    }

    setFormData(prev => ({
      ...prev,
      items: [...prev.items, {
        text: currentItem.text,
        note: currentItem.note,
        required: currentItem.status !== 'conditional',
        conditional: currentItem.status === 'conditional',
        copies_required: Math.max(1, Number(currentItem.copies_required) || 1),
      }]
    }));
    setCurrentItem({ text: '', note: '', status: 'required', copies_required: 1 });
  };

  const handleRemoveItem = (index) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const handleMoveItem = (index, direction) => {
    const newItems = [...formData.items];
    const newIndex = direction === 'up' ? index - 1 : index + 1;

    if (newIndex < 0 || newIndex >= newItems.length) {
      return;
    }

    [newItems[index], newItems[newIndex]] = [newItems[newIndex], newItems[index]];

    setFormData(prev => ({
      ...prev,
      items: newItems
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Template name is required';
    }
    
    if (formData.items.length === 0) {
      newErrors.items = 'Add at least one checklist item';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSave(formData);
    }
  };

  const previewTemplate = {
    ...formData,
    id: 'preview',
    createdBy: 'user'
  };

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          {template ? 'Edit Custom Template' : 'Create Custom Template'}
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Create a reusable template with your own checklist items
        </p>
      </div>

      <form onSubmit={handleSubmit} className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-5">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                Template Name <span className="text-red-500 dark:text-red-400">*</span>
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
                placeholder="e.g., My Custom Scholarship Template"
              />
              {errors.name && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name}</p>}
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition-colors resize-none"
                placeholder="Brief description of this template"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                  Category
                </label>
                <input
                  type="text"
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition-colors"
                  placeholder="e.g., Custom"
                />
              </div>

              <div>
                <label htmlFor="country" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                  Country
                </label>
                <input
                  type="text"
                  id="country"
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition-colors"
                  placeholder="e.g., International"
                />
              </div>
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700 pt-5">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                Checklist Items <span className="text-red-500 dark:text-red-400">*</span>
              </h3>
              
              <div className="space-y-3 mb-4">
                <div>
                  <input
                    type="text"
                    name="text"
                    value={currentItem.text}
                    onChange={handleItemChange}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddItem();
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition-colors"
                    placeholder="Item description (e.g., Passport copy)"
                  />
                </div>
                <div>
                  <input
                    type="text"
                    name="note"
                    value={currentItem.note}
                    onChange={handleItemChange}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddItem();
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition-colors"
                    placeholder="Optional note (e.g., Valid for at least 6 months)"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">
                      Status
                    </label>
                    <select
                      name="status"
                      value={currentItem.status}
                      onChange={handleItemChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition-colors"
                    >
                      <option value="required">Required</option>
                      <option value="conditional">Conditional</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">
                      Copies Required
                    </label>
                    <input
                      type="number"
                      name="copies_required"
                      min="1"
                      value={currentItem.copies_required}
                      onChange={handleItemChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition-colors"
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleAddItem}
                  disabled={!currentItem.text.trim()}
                  className={`w-full px-4 py-2 rounded-md font-medium transition-colors ${
                    currentItem.text.trim()
                      ? 'text-white bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600'
                      : 'text-gray-400 dark:text-gray-500 bg-gray-200 dark:bg-gray-700 cursor-not-allowed'
                  }`}
                >
                  Add Item
                </button>
              </div>

              {errors.items && <p className="mb-2 text-sm text-red-600 dark:text-red-400">{errors.items}</p>}

              <div className="space-y-2 max-h-96 overflow-y-auto">
                {formData.items.map((item, index) => (
                  <div
                    key={index}
                    className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md p-3"
                  >
                    <div className="flex items-start gap-2">
                      <div className="flex flex-col gap-1">
                        <button
                          type="button"
                          onClick={() => handleMoveItem(index, 'up')}
                          disabled={index === 0}
                          className={`p-1 rounded ${
                            index === 0
                              ? 'text-gray-300 dark:text-gray-700 cursor-not-allowed'
                              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                          }`}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                          </svg>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveItem(index, 'down')}
                          disabled={index === formData.items.length - 1}
                          className={`p-1 rounded ${
                            index === formData.items.length - 1
                              ? 'text-gray-300 dark:text-gray-700 cursor-not-allowed'
                              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                          }`}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {item.text}
                        </p>
                        {item.note && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {item.note}
                          </p>
                        )}
                        <div className="mt-2 flex items-center gap-2 flex-wrap">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                            item.conditional
                              ? 'bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200'
                              : 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
                          }`}>
                            {item.conditional ? 'Conditional' : 'Required'}
                          </span>
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200">
                            Copies: {item.copies_required || 1}
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(index)}
                        className="p-1 text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:border-l lg:border-gray-200 dark:border-gray-700 lg:pl-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              Preview
            </h3>
            {formData.items.length > 0 ? (
              <TemplatePreview template={previewTemplate} />
            ) : (
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-8 border border-gray-200 dark:border-gray-700 text-center text-gray-400 dark:text-gray-500">
                <svg
                  className="w-16 h-16 mx-auto mb-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <p>Add items to see preview</p>
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-3 pt-6 border-t border-gray-200 dark:border-gray-700 mt-6">
          <button
            type="submit"
            className="flex-1 px-4 py-2.5 text-white bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600 rounded-md font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 dark:focus:ring-offset-gray-800"
          >
            {template ? 'Update Template' : 'Save Template'}
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

export default CustomTemplateForm;
