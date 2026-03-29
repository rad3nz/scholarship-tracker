import { useState, useRef } from 'react';
import { parseImportFile, getImportPreview, IMPORT_STRATEGIES } from '../utils/importData';

const ImportSection = ({ onImport, loading }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [importStrategy, setImportStrategy] = useState(IMPORT_STRATEGIES.REPLACE_ALL);
  const [preview, setPreview] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileSelect = (file) => {
    if (!file) return;

    // Validate file type
    if (!file.name.endsWith('.json')) {
      alert('Please select a JSON file');
      return;
    }

    setSelectedFile(file);
    setPreview(null);

    // Read and preview the file
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const fileContent = e.target.result;
        const parseResult = parseImportFile(fileContent);
        
        if (!parseResult.success) {
          alert(`Error reading file: ${parseResult.error}`);
          setSelectedFile(null);
          return;
        }

        const importPreview = getImportPreview(parseResult.data);
        setPreview(importPreview);
      } catch (error) {
        console.error('Error reading file:', error);
        alert('Error reading file: ' + error.message);
        setSelectedFile(null);
      }
    };
    reader.readAsText(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleFileInputChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleImportClick = () => {
    if (!selectedFile || !preview?.valid) return;
    
    onImport(selectedFile, importStrategy);
  };

  const clearSelection = () => {
    setSelectedFile(null);
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4">
      {/* File Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          dragOver
            ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20'
            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleFileInputChange}
          className="hidden"
        />
        
        <div className="space-y-3">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          
          <div>
            <p className="text-lg font-medium text-gray-900 dark:text-white">
              Drop your backup file here
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              or click to select a file
            </p>
          </div>
          
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={loading}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-800 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Select File
          </button>
          
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Only .json files are supported
          </p>
        </div>
      </div>

      {/* File Preview */}
      {selectedFile && (
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <svg className="w-8 h-8 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {selectedFile.name}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-300">
                  {(selectedFile.size / 1024).toFixed(1)} KB
                </p>
              </div>
            </div>
            <button
              onClick={clearSelection}
              disabled={loading}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 disabled:opacity-50"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Import Preview */}
      {preview && (
        <div className={`rounded-lg p-4 ${
          preview.valid 
            ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
            : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
        }`}>
          {preview.valid ? (
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <h4 className="text-sm font-medium text-green-800 dark:text-green-200">
                  Ready to Import
                </h4>
              </div>
              
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-lg font-semibold text-green-600 dark:text-green-400">
                    {preview.stats.scholarships}
                  </div>
                  <div className="text-xs text-green-700 dark:text-green-300">Scholarships</div>
                </div>
                <div>
                  <div className="text-lg font-semibold text-green-600 dark:text-green-400">
                    {preview.stats.checklistItems}
                  </div>
                  <div className="text-xs text-green-700 dark:text-green-300">Checklist Items</div>
                </div>
                <div>
                  <div className="text-lg font-semibold text-green-600 dark:text-green-400">
                    {preview.stats.documents}
                  </div>
                  <div className="text-xs text-green-700 dark:text-green-300">Documents</div>
                </div>
              </div>

              {preview.warnings && preview.warnings.length > 0 && (
                <div className="text-xs text-yellow-700 dark:text-yellow-300">
                  <p className="font-medium mb-1">Warnings:</p>
                  <ul className="list-disc list-inside space-y-1">
                    {preview.warnings.map((warning, index) => (
                      <li key={index}>{warning}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <h4 className="text-sm font-medium text-red-800 dark:text-red-200">
                  Invalid File
                </h4>
              </div>
              <ul className="text-xs text-red-700 dark:text-red-300 space-y-1">
                {preview.errors.map((error, index) => (
                  <li key={index} className="list-disc list-inside">{error}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Import Strategy Selection */}
      {preview?.valid && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white">
            Import Strategy
          </h4>
          <div className="space-y-2">
            <label className="flex items-start space-x-3">
              <input
                type="radio"
                value={IMPORT_STRATEGIES.REPLACE_ALL}
                checked={importStrategy === IMPORT_STRATEGIES.REPLACE_ALL}
                onChange={(e) => setImportStrategy(e.target.value)}
                className="mt-1 h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300"
              />
              <div>
                <div className="text-sm font-medium text-gray-900 dark:text-white">
                  Replace All Data
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-300">
                  This will delete all existing data and replace it with the imported data. This action cannot be undone.
                </div>
              </div>
            </label>
            <label className="flex items-start space-x-3">
              <input
                type="radio"
                value={IMPORT_STRATEGIES.MERGE}
                checked={importStrategy === IMPORT_STRATEGIES.MERGE}
                onChange={(e) => setImportStrategy(e.target.value)}
                className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
              />
              <div>
                <div className="text-sm font-medium text-gray-900 dark:text-white">
                  Merge with Existing Data
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-300">
                  This will add the imported data to your existing data. Be careful of potential duplicates.
                </div>
              </div>
            </label>
          </div>
        </div>
      )}

      {/* Import Button */}
      {preview?.valid && (
        <div className="pt-2">
          <button
            onClick={handleImportClick}
            disabled={loading || !selectedFile}
            className={`w-full flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm transition-colors ${
              loading || !selectedFile
                ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                : importStrategy === IMPORT_STRATEGIES.REPLACE_ALL
                  ? 'bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500'
                  : 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
            }`}
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Importing...
              </>
            ) : (
              <>
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
                Import {importStrategy === IMPORT_STRATEGIES.REPLACE_ALL ? '(Replace All)' : '(Merge)'}
              </>
            )}
          </button>
          
          {importStrategy === IMPORT_STRATEGIES.REPLACE_ALL && (
            <p className="text-xs text-red-600 dark:text-red-400 text-center mt-2">
              ⚠️ This will permanently delete all existing data
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default ImportSection;