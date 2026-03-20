import { useState } from 'react';

const ChecklistItem = ({ item, onUpdate, onDelete, onDragStart, onDragOver, onDrop, isDragging }) => {
  const [isEditingText, setIsEditingText] = useState(false);
  const [isEditingNote, setIsEditingNote] = useState(false);
  const [editedText, setEditedText] = useState(item.text);
  const [editedNote, setEditedNote] = useState(item.note);

  const handleToggleChecked = async () => {
    await onUpdate(item.id, { checked: !item.checked });
  };

  const handleSaveText = async () => {
    if (editedText.trim()) {
      await onUpdate(item.id, { text: editedText.trim() });
      setIsEditingText(false);
    }
  };

  const handleSaveNote = async () => {
    await onUpdate(item.id, { note: editedNote.trim() });
    setIsEditingNote(false);
  };

  const handleCancelText = () => {
    setEditedText(item.text);
    setIsEditingText(false);
  };

  const handleCancelNote = () => {
    setEditedNote(item.note);
    setIsEditingNote(false);
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      onDelete(item.id);
    }
  };

  const handleKeyDown = (e, action) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      action();
    } else if (e.key === 'Escape') {
      setIsEditingText(false);
      setIsEditingNote(false);
      setEditedText(item.text);
      setEditedNote(item.note);
    }
  };

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, item.id)}
      onDragOver={onDragOver}
      onDrop={(e) => onDrop(e, item.id)}
      className={`bg-white dark:bg-gray-800 border ${isDragging ? 'border-blue-400 dark:border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-gray-700'} rounded-lg p-4 hover:shadow-sm transition-shadow duration-200`}
    >
      <div className="flex items-start gap-3">
        <button
          onClick={handleToggleChecked}
          className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:ring-offset-1 dark:focus:ring-offset-gray-800 ${
            item.checked
              ? 'bg-blue-600 dark:bg-blue-500 border-blue-600 dark:border-blue-500'
              : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600'
          }`}
          aria-label={item.checked ? 'Mark as incomplete' : 'Mark as complete'}
        >
          {item.checked && (
            <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          )}
        </button>

        <div className="flex-1 min-w-0">
          {isEditingText ? (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={editedText}
                onChange={(e) => setEditedText(e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, handleSaveText)}
                onBlur={handleSaveText}
                className="flex-1 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
                autoFocus
              />
              <button
                onClick={handleCancelText}
                className="p-1 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
                aria-label="Cancel"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ) : (
            <p
              onClick={() => setIsEditingText(true)}
              className={`text-sm font-medium cursor-pointer ${item.checked ? 'text-gray-400 dark:text-gray-500 line-through' : 'text-gray-900 dark:text-white'}`}
            >
              {item.text}
            </p>
          )}

          {item.note || isEditingNote ? (
            <div className="mt-2">
              {isEditingNote ? (
                <div className="flex items-start gap-2">
                  <textarea
                    value={editedNote}
                    onChange={(e) => setEditedNote(e.target.value)}
                    onBlur={handleSaveNote}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && e.ctrlKey) {
                        handleSaveNote();
                      } else if (e.key === 'Escape') {
                        handleCancelNote();
                      }
                    }}
                    className="flex-1 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent resize-none"
                    rows={2}
                    placeholder="Add a note..."
                    autoFocus
                  />
                  <button
                    onClick={handleCancelNote}
                    className="p-1 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 mt-0.5"
                    aria-label="Cancel"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ) : (
                <div className="flex items-start gap-2 group">
                  <p className="text-xs text-gray-500 dark:text-gray-400 flex-1">{item.note}</p>
                  <button
                    onClick={() => {
                      setEditedNote(item.note);
                      setIsEditingNote(true);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-0.5 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-opacity"
                    aria-label="Edit note"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          ) : (
            !item.note && (
              <button
                onClick={() => setIsEditingNote(true)}
                className="mt-2 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
              >
                + Add note
              </button>
            )
          )}
        </div>

        <div className="flex items-center gap-1 flex-shrink-0">
          <div
            className="cursor-grab active:cursor-grabbing p-1.5 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
            aria-label="Drag to reorder"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
            </svg>
          </div>
          <button
            onClick={handleDelete}
            className="p-1.5 text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 transition-colors"
            aria-label="Delete item"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChecklistItem;
