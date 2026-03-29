import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { getAllDocuments, deleteDocument } from '../db/indexeddb';
import DocumentCard from './DocumentCard';
import DocumentForm from './DocumentForm';
import DocumentStatus from './DocumentStatus';

const DocumentTracker = ({
  scholarships = [],
  onViewScholarship,
  initialEditDocumentId,
  onClearInitialEdit,
  onDocumentsChanged,
}) => {
  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingDocument, setEditingDocument] = useState(null);
  const [statusFilter, setStatusFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [scholarshipFilterId, setScholarshipFilterId] = useState('All');

  const fetchDocuments = useCallback(async () => {
    try {
      setIsLoading(true);
      const allDocuments = await getAllDocuments();
      setDocuments(allDocuments);
    } catch (error) {
      console.error('Error fetching documents:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  useEffect(() => {
    if (!initialEditDocumentId) return;
    if (documents.length === 0) return;

    const doc = documents.find((d) => d.id === initialEditDocumentId);
    if (doc) {
      setEditingDocument(doc);
      setShowForm(true);
    }

    onClearInitialEdit?.();
  }, [initialEditDocumentId, documents, onClearInitialEdit]);

  const scholarshipOptions = useMemo(() => {
    return scholarships
      .slice()
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((s) => ({ id: s.id, name: s.name }));
  }, [scholarships]);

  const documentScholarshipsMap = useMemo(() => {
    const map = {};
    scholarships.forEach((scholarship) => {
      const ids = Array.isArray(scholarship.requiredDocumentIds) ? scholarship.requiredDocumentIds : [];
      ids.forEach((documentId) => {
        const key = Number(documentId);
        if (!Number.isFinite(key)) return;
        if (!map[key]) map[key] = [];
        map[key].push(scholarship);
      });
    });

    Object.values(map).forEach((list) => list.sort((a, b) => a.name.localeCompare(b.name)));
    return map;
  }, [scholarships]);

  const handleAddDocument = () => {
    setEditingDocument(null);
    setShowForm(true);
  };

  const handleEditDocument = (document) => {
    setEditingDocument(document);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingDocument(null);
  };

  const handleSave = async () => {
    setShowForm(false);
    setEditingDocument(null);
    await fetchDocuments();
    await onDocumentsChanged?.();
  };

  const handleDeleteDocument = async (id) => {
    if (confirm('Are you sure you want to delete this document?')) {
      try {
        await deleteDocument(id);
        console.log('Document deleted successfully');
        await fetchDocuments();
        await onDocumentsChanged?.();
      } catch (error) {
        console.error('Error deleting document:', error);
        alert('Failed to delete document');
      }
    }
  };

  const getFilteredDocuments = () => {
    let filtered = [...documents];

    if (scholarshipFilterId !== 'All') {
      const scholarshipId = Number(scholarshipFilterId);
      const scholarship = scholarships.find((s) => s.id === scholarshipId);
      const requiredIds = Array.isArray(scholarship?.requiredDocumentIds)
        ? scholarship.requiredDocumentIds
        : [];

      filtered = filtered.filter((doc) => requiredIds.includes(doc.id));
    }

    if (statusFilter !== 'All') {
      filtered = filtered.filter((doc) => doc.status === statusFilter);
    }

    if (typeFilter !== 'All') {
      filtered = filtered.filter((doc) => doc.type === typeFilter);
    }

    return filtered;
  };

  const filteredDocuments = getFilteredDocuments();

  const statusOptions = ['All', 'NotReady', 'Draft', 'Final', 'Uploaded'];
  const typeOptions = [
    'All',
    'CV',
    'Transcript',
    'LanguageCertificate',
    'RecommendationLetter',
    'LoA',
    'PersonalStatement',
  ];

  const getTypeLabel = (type) => {
    const labels = {
      CV: 'CV',
      Transcript: 'Transcript',
      LanguageCertificate: 'Language Certificate',
      RecommendationLetter: 'Recommendation Letter',
      LoA: 'LoA',
      PersonalStatement: 'Personal Statement',
    };
    return labels[type] || type;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading documents...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Document Tracker</h1>
          <button
            onClick={handleAddDocument}
            className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-colors font-medium"
          >
            + Add Document
          </button>
        </div>
        <p className="text-gray-600 dark:text-gray-300">Manage your application documents across all scholarships</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1">
          <DocumentStatus documents={documents} />
        </div>

        <div className="lg:col-span-3">
          {showForm && (
            <div className="mb-8">
              <DocumentForm document={editingDocument} onSave={handleSave} onCancel={handleCancel} />
            </div>
          )}

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6">
            <div className="flex flex-wrap items-center gap-4">
              {scholarshipOptions.length > 0 && (
                <div className="flex items-center space-x-2">
                  <label htmlFor="scholarshipFilter" className="text-sm font-medium text-gray-700 dark:text-gray-200">
                    Scholarship:
                  </label>
                  <select
                    id="scholarshipFilter"
                    value={scholarshipFilterId}
                    onChange={(e) => setScholarshipFilterId(e.target.value)}
                    className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  >
                    <option value="All">All Scholarships</option>
                    {scholarshipOptions.map((s) => (
                      <option key={s.id} value={String(s.id)}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="flex items-center space-x-2">
                <label htmlFor="statusFilter" className="text-sm font-medium text-gray-700 dark:text-gray-200">
                  Status:
                </label>
                <select
                  id="statusFilter"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                >
                  {statusOptions.map((option) => (
                    <option key={option} value={option}>
                      {option === 'All' ? 'All Statuses' : option === 'NotReady' ? 'Not Ready' : option}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center space-x-2">
                <label htmlFor="typeFilter" className="text-sm font-medium text-gray-700 dark:text-gray-200">
                  Type:
                </label>
                <select
                  id="typeFilter"
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                >
                  {typeOptions.map((option) => (
                    <option key={option} value={option}>
                      {option === 'All' ? 'All Types' : getTypeLabel(option)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {documents.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
              <div className="mb-4">
                <svg className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No documents yet</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">Start by adding your first application document</p>
              <button
                onClick={handleAddDocument}
                className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors font-medium"
              >
                Add Your First Document
              </button>
            </div>
          ) : filteredDocuments.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
              <div className="mb-4">
                <svg className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No documents match your filters</h3>
              <p className="text-gray-600 dark:text-gray-300">Try adjusting your filters or add a new document</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredDocuments.map((document) => (
                <DocumentCard
                  key={document.id}
                  document={document}
                  onEdit={handleEditDocument}
                  onDelete={handleDeleteDocument}
                  requiredByScholarships={documentScholarshipsMap[document.id] || []}
                  onViewScholarship={onViewScholarship}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DocumentTracker;
