import { useState, useCallback, useRef, useEffect } from 'react';
import ChecklistItem from './ChecklistItem';
import DocumentRequirements from './DocumentRequirements';

const ChecklistView = ({
  scholarship,
  onBack,
  checklistItems,
  onCreateItem,
  onUpdateItem,
  onDeleteItem,
  onReorderItems,
  onUpdateScholarshipNote,
  documents = [],
  onViewDocument,
}) => {
  const [newItemText, setNewItemText] = useState('');
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [draggedItemId, setDraggedItemId] = useState(null);
  const [isEditingScholarshipNote, setIsEditingScholarshipNote] = useState(false);
  const [editedScholarshipNote, setEditedScholarshipNote] = useState(scholarship?.note || '');
  const [isSavingScholarshipNote, setIsSavingScholarshipNote] = useState(false);
  const [scholarshipNoteError, setScholarshipNoteError] = useState('');
  const isSubmittingRef = useRef(false);
  const skipScholarshipNoteBlurRef = useRef(false);

  useEffect(() => {
    if (!isEditingScholarshipNote) {
      setEditedScholarshipNote(scholarship?.note || '');
    }
  }, [scholarship?.note, isEditingScholarshipNote]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const completedCount = checklistItems.filter(item => item.checked).length;
  const totalCount = checklistItems.length;
  const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const handleAddItem = async () => {
    if (newItemText.trim() && !isSubmittingRef.current) {
      isSubmittingRef.current = true;
      try {
        const maxOrder = Math.max(-1, ...checklistItems.map(item => item.order));
        await onCreateItem({
          text: newItemText.trim(),
          checked: false,
          note: '',
          order: maxOrder + 1
        });
        setNewItemText('');
        setIsAddingItem(false);
      } finally {
        isSubmittingRef.current = false;
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddItem();
    } else if (e.key === 'Escape') {
      setNewItemText('');
      setIsAddingItem(false);
    }
  };

  const handleDragStart = useCallback((e, itemId) => {
    setDraggedItemId(itemId);
    e.dataTransfer.effectAllowed = 'move';
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const handleDrop = useCallback(async (e, targetItemId) => {
    e.preventDefault();
    
    if (!draggedItemId || draggedItemId === targetItemId) {
      setDraggedItemId(null);
      return;
    }

    const items = [...checklistItems];
    const draggedIndex = items.findIndex(item => item.id === draggedItemId);
    const targetIndex = items.findIndex(item => item.id === targetItemId);

    if (draggedIndex === -1 || targetIndex === -1) {
      setDraggedItemId(null);
      return;
    }

    const [removed] = items.splice(draggedIndex, 1);
    items.splice(targetIndex, 0, removed);

    const reorderedItems = items.map((item, index) => ({ ...item, order: index }));
    
    await onReorderItems(reorderedItems);
    setDraggedItemId(null);
  }, [draggedItemId, checklistItems, onReorderItems]);

  const handleStartScholarshipNoteEdit = () => {
    setScholarshipNoteError('');
    setEditedScholarshipNote(scholarship?.note || '');
    setIsEditingScholarshipNote(true);
  };

  const handleCancelScholarshipNoteEdit = () => {
    skipScholarshipNoteBlurRef.current = true;
    setEditedScholarshipNote(scholarship?.note || '');
    setScholarshipNoteError('');
    setIsEditingScholarshipNote(false);
  };

  const handleSaveScholarshipNote = async () => {
    if (!scholarship || !onUpdateScholarshipNote || isSavingScholarshipNote) {
      return;
    }

    const normalizedDraft = editedScholarshipNote.trim();
    const normalizedCurrent = (scholarship.note || '').trim();

    if (normalizedDraft === normalizedCurrent) {
      setScholarshipNoteError('');
      setIsEditingScholarshipNote(false);
      return;
    }

    setIsSavingScholarshipNote(true);
    setScholarshipNoteError('');

    try {
      await onUpdateScholarshipNote(scholarship.id, normalizedDraft);
      setIsEditingScholarshipNote(false);
    } catch (error) {
      console.error('Error saving scholarship note:', error);
      setScholarshipNoteError('Failed to save note. Please try again.');
    } finally {
      setIsSavingScholarshipNote(false);
    }
  };

  if (!scholarship) {
    return null;
  }

  return (
    <div className="max-w-3xl mx-auto">
      <button
        onClick={onBack}
        className="flex items-center text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white font-medium transition-colors mb-6"
      >
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Back to Scholarships
      </button>

      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm p-6 mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{scholarship.name}</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-4">{scholarship.provider}</p>
        <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
          <div className="flex items-center">
            <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Deadline: {formatDate(scholarship.deadline)}
          </div>
          <div className="flex items-center">
            <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
            </svg>
            {scholarship.degreeLevel} · {scholarship.country}
          </div>
        </div>
        {(scholarship.note?.trim() || isEditingScholarshipNote) && (
          <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between mb-1">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-200">Notes</p>
              {!isEditingScholarshipNote && (
                <button
                  type="button"
                  onClick={handleStartScholarshipNoteEdit}
                  className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                >
                  Edit
                </button>
              )}
            </div>
            {isEditingScholarshipNote ? (
              <>
                <textarea
                  value={editedScholarshipNote}
                  onChange={(e) => setEditedScholarshipNote(e.target.value)}
                  onBlur={() => {
                    if (skipScholarshipNoteBlurRef.current) {
                      skipScholarshipNoteBlurRef.current = false;
                      return;
                    }
                    handleSaveScholarshipNote();
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && e.ctrlKey) {
                      e.preventDefault();
                      handleSaveScholarshipNote();
                    } else if (e.key === 'Escape') {
                      e.preventDefault();
                      handleCancelScholarshipNoteEdit();
                    }
                  }}
                  rows={3}
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent resize-none"
                  placeholder="Add scholarship notes..."
                  autoFocus
                  disabled={isSavingScholarshipNote}
                />
                <div className="mt-1 flex items-center justify-between">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Auto-saves on blur. Press Ctrl+Enter to save now, Esc to cancel.</p>
                  {isSavingScholarshipNote && <p className="text-xs text-blue-600 dark:text-blue-400">Saving...</p>}
                </div>
                {scholarshipNoteError && (
                  <p className="mt-1 text-xs text-red-600 dark:text-red-400">{scholarshipNoteError}</p>
                )}
              </>
            ) : (
              <p className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-wrap">{scholarship.note}</p>
            )}
          </div>
        )}
        {!scholarship.note?.trim() && !isEditingScholarshipNote && (
          <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
            <button
              type="button"
              onClick={handleStartScholarshipNoteEdit}
              className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
            >
              + Add note
            </button>
            {scholarshipNoteError && (
              <p className="mt-1 text-xs text-red-600 dark:text-red-400">{scholarshipNoteError}</p>
            )}
          </div>
        )}
      </div>

      <DocumentRequirements scholarship={scholarship} documents={documents} onViewDocument={onViewDocument} />

      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Progress</h3>
          <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
            {completedCount} of {totalCount} items completed
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mb-2">
          <div
            className="bg-blue-600 h-3 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 text-right">{progress}% complete</p>
      </div>

      <div className="mb-4">
        {isAddingItem ? (
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-sm">
            <input
              type="text"
              value={newItemText}
              onChange={(e) => setNewItemText(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={() => {
                if (!newItemText.trim()) {
                  setIsAddingItem(false);
                  setNewItemText('');
                }
              }}
              placeholder="Enter requirement or task..."
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
              autoFocus
            />
            <div className="flex gap-2 mt-3">
              <button
                onClick={handleAddItem}
                className="px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white text-sm font-medium rounded-md hover:bg-blue-700 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:ring-offset-1 dark:focus:ring-offset-gray-800"
              >
                Add Item
              </button>
              <button
                onClick={() => {
                  setIsAddingItem(false);
                  setNewItemText('');
                }}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-sm font-medium rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-1 dark:focus:ring-offset-gray-800"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setIsAddingItem(true)}
            className="w-full px-4 py-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-500 dark:text-gray-400 hover:border-blue-500 dark:hover:border-blue-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:ring-offset-1 dark:focus:ring-offset-gray-800"
          >
            + Add New Requirement
          </button>
        )}
      </div>

      <div className="space-y-3">
        {checklistItems.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
            <svg className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No requirements yet</h3>
            <p className="text-gray-500 dark:text-gray-400">Start by adding requirements or tasks for this scholarship.</p>
          </div>
        ) : (
          checklistItems.map((item) => (
            <ChecklistItem
              key={item.id}
              item={item}
              onUpdate={onUpdateItem}
              onDelete={onDeleteItem}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              isDragging={draggedItemId === item.id}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default ChecklistView;
