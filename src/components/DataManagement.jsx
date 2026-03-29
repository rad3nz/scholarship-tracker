import { useState, useCallback, useEffect } from 'react';
import { exportAllData, exportSeedData, saveSeedDataToFile, getExportStats } from '../utils/exportData';
import { importData, parseImportFile, getImportPreview, IMPORT_STRATEGIES } from '../utils/importData';
import ExportOptions from './ExportOptions';
import ImportSection from './ImportSection';

const DataManagement = ({ onImportComplete }) => {
  const [exportStats, setExportStats] = useState({ scholarships: 0, checklistItems: 0, documents: 0, templates: 0, totalItems: 0 });
  const [exportLoading, setExportLoading] = useState(false);
  const [exportType, setExportType] = useState('regular'); // 'regular', 'seed'
  const [importLoading, setImportLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);
  const [statusType, setStatusType] = useState('info'); // 'info', 'success', 'error', 'warning'

  useEffect(() => {
    loadExportStats();
  }, []);

  const loadExportStats = async () => {
    try {
      const stats = await getExportStats();
      setExportStats(stats);
    } catch (error) {
      console.error('Error loading export stats:', error);
    }
  };

  const handleRegularExport = useCallback(async () => {
    try {
      setExportLoading(true);
      setStatusMessage(null);
      
      const result = await exportAllData();
      
      setStatusMessage({
        title: 'Regular Export Successful',
        message: `Successfully exported ${result.stats.scholarships} scholarships, ${result.stats.checklistItems} checklist items, and ${result.stats.documents} documents to ${result.filename}`,
        details: result.stats
      });
      setStatusType('success');
      
      // Refresh stats after export
      await loadExportStats();
      
    } catch (error) {
      console.error('Regular export failed:', error);
      setStatusMessage({
        title: 'Export Failed',
        message: error.message
      });
      setStatusType('error');
    } finally {
      setExportLoading(false);
    }
  }, []);

  const handleSeedExport = useCallback(async () => {
    try {
      setExportLoading(true);
      setStatusMessage(null);
      
      const result = await exportSeedData();

      const message = result.createdAt
        ? `Successfully exported seed data including ${result.stats.scholarships} scholarships, ${result.stats.checklistItems} checklist items, ${result.stats.documents} documents, and ${result.stats.templates} templates to ${result.filename}. CreatedAt: ${result.createdAt}.`
        : `Successfully exported seed data including ${result.stats.scholarships} scholarships, ${result.stats.checklistItems} checklist items, ${result.stats.documents} documents, and ${result.stats.templates} templates to ${result.filename}`;

      setStatusMessage({
        title: 'Seed Data Export Successful',
        message: message,
        details: result.stats
      });
      setStatusType('success');
      
      // Refresh stats after export
      await loadExportStats();
      
    } catch (error) {
      console.error('Seed export failed:', error);
      setStatusMessage({
        title: 'Seed Export Failed',
        message: error.message
      });
      setStatusType('error');
    } finally {
      setExportLoading(false);
    }
  }, []);

  const handleSaveSeedData = useCallback(async () => {
    try {
      setExportLoading(true);
      setStatusMessage(null);
      
      const result = await saveSeedDataToFile();

      const message = result.createdAt
        ? `Seed data prepared with ${result.stats.scholarships} scholarships, ${result.stats.checklistItems} checklist items, ${result.stats.documents} documents, and ${result.stats.templates} templates. CreatedAt: ${result.createdAt}.`
        : `Seed data prepared with ${result.stats.scholarships} scholarships, ${result.stats.checklistItems} checklist items, ${result.stats.documents} documents, and ${result.stats.templates} templates.`;

      setStatusMessage({
        title: 'Seed Data Prepared Successfully',
        message: message,
        details: result.stats,
        instructions: result.instructions
      });
      setStatusType('success');
      
      // Refresh stats after export
      await loadExportStats();
      
    } catch (error) {
      console.error('Save seed data failed:', error);
      setStatusMessage({
        title: 'Seed Data Preparation Failed',
        message: error.message
      });
      setStatusType('error');
    } finally {
      setExportLoading(false);
    }
  }, []);

  const handleImport = useCallback(async (file, strategy) => {
    try {
      setImportLoading(true);
      setStatusMessage(null);
      
      // Read file content
      const fileContent = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsText(file);
      });
      
      // Parse JSON
      const parseResult = parseImportFile(fileContent);
      if (!parseResult.success) {
        throw new Error(parseResult.error);
      }
      
      // Get preview
      const preview = getImportPreview(parseResult.data);
      if (!preview.valid) {
        throw new Error(`Invalid data: ${preview.errors.join(', ')}`);
      }
      
      // Show preview and confirm
      const confirmMessage = `This will import:\n• ${preview.stats.scholarships} scholarships\n• ${preview.stats.checklistItems} checklist items\n• ${preview.stats.documents} documents\n• ${preview.stats.templates || 0} templates\n\n${strategy === IMPORT_STRATEGIES.REPLACE_ALL ? 'This will replace ALL existing data. This action cannot be undone!' : 'This will merge with existing data.'}\n\nDo you want to continue?`;
      
      if (!window.confirm(confirmMessage)) {
        return;
      }
      
      // Perform import
      const result = await importData(parseResult.data, strategy);
      
      setStatusMessage({
        title: 'Import Successful',
        message: `Successfully imported data using ${strategy === IMPORT_STRATEGIES.REPLACE_ALL ? 'replace' : 'merge'} strategy`,
        details: result.results
      });
      setStatusType('success');
      
      // Notify parent component to refresh data
      if (onImportComplete) {
        onImportComplete();
      }
      
      // Refresh export stats
      await loadExportStats();
      
    } catch (error) {
      console.error('Import failed:', error);
      setStatusMessage({
        title: 'Import Failed',
        message: error.message
      });
      setStatusType('error');
    } finally {
      setImportLoading(false);
    }
  }, [onImportComplete]);

  const clearStatusMessage = () => {
    setStatusMessage(null);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Data Management</h2>
        <p className="text-gray-600 dark:text-gray-300">
          Backup and restore your scholarship tracker data
        </p>
      </div>

      {/* Status Message */}
      {statusMessage && (
        <div className={`rounded-lg p-4 ${
          statusType === 'success' ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' :
          statusType === 'error' ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800' :
          statusType === 'warning' ? 'bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800' :
          'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
        }`}>
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3">
              {statusType === 'success' && (
                <svg className="w-5 h-5 text-green-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              )}
              {statusType === 'error' && (
                <svg className="w-5 h-5 text-red-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              )}
              {statusType === 'warning' && (
                <svg className="w-5 h-5 text-yellow-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              )}
              {statusType === 'info' && (
                <svg className="w-5 h-5 text-blue-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              )}
              <div>
                <h3 className={`text-sm font-medium ${
                  statusType === 'success' ? 'text-green-800 dark:text-green-200' :
                  statusType === 'error' ? 'text-red-800 dark:text-red-200' :
                  statusType === 'warning' ? 'text-yellow-800 dark:text-yellow-200' :
                  'text-blue-800 dark:text-blue-200'
                }`}>
                  {statusMessage.title}
                </h3>
                <p className={`text-sm mt-1 ${
                  statusType === 'success' ? 'text-green-700 dark:text-green-300' :
                  statusType === 'error' ? 'text-red-700 dark:text-red-300' :
                  statusType === 'warning' ? 'text-yellow-700 dark:text-yellow-300' :
                  'text-blue-700 dark:text-blue-300'
                }`}>
                  {statusMessage.message}
                </p>
                {statusMessage.details && (
                  <div className={`text-xs mt-2 ${
                    statusType === 'success' ? 'text-green-600 dark:text-green-400' :
                    statusType === 'error' ? 'text-red-600 dark:text-red-400' :
                    statusType === 'warning' ? 'text-yellow-600 dark:text-yellow-400' :
                    'text-blue-600 dark:text-blue-400'
                  }`}>
                    {statusMessage.details.scholarships !== undefined && (
                      <div>Scholarships: {statusMessage.details.scholarships}</div>
                    )}
                    {statusMessage.details.checklistItems !== undefined && (
                      <div>Checklist Items: {statusMessage.details.checklistItems}</div>
                    )}
                    {statusMessage.details.documents !== undefined && (
                      <div>Documents: {statusMessage.details.documents}</div>
                    )}
                    {statusMessage.details.templates !== undefined && (
                      <div>Templates: {statusMessage.details.templates}</div>
                    )}
                  </div>
                )}
                {statusMessage.instructions && (
                  <div className={`text-xs mt-2 space-y-1 ${
                    statusType === 'success' ? 'text-green-600 dark:text-green-400' :
                    'text-blue-600 dark:text-blue-400'
                  }`}>
                    <div className="font-medium">Instructions:</div>
                    <ol className="list-decimal list-inside space-y-1">
                      {statusMessage.instructions.map((instruction, index) => (
                        <li key={index}>{instruction}</li>
                      ))}
                    </ol>
                  </div>
                )}
              </div>
            </div>
            <button
              onClick={clearStatusMessage}
              className={`text-sm ${
                statusType === 'success' ? 'text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300' :
                statusType === 'error' ? 'text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300' :
                statusType === 'warning' ? 'text-yellow-600 dark:text-yellow-400 hover:text-yellow-700 dark:hover:text-yellow-300' :
                'text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300'
              }`}
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Data Summary */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Current Data</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {exportStats.scholarships}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300">Scholarships</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {exportStats.checklistItems}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300">Checklist Items</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {exportStats.documents}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300">Documents</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              {exportStats.templates}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300">Templates</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {exportStats.totalItems}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300">Total Items</div>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Export Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
            Export Data
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Export your data for backup, sharing, or GitHub Pages deployment. Choose between regular backup or seed data export.
          </p>
          <ExportOptions
            onRegularExport={handleRegularExport}
            onSeedExport={handleSeedExport}
            onSaveSeedData={handleSaveSeedData}
            loading={exportLoading}
            disabled={exportStats.totalItems === 0}
            stats={exportStats}
          />
        </div>

        {/* Import Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
            Import Data
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Restore data from a previously exported backup file. You can choose to replace all existing data or merge with current data.
          </p>
          <ImportSection
            onImport={handleImport}
            loading={importLoading}
          />
        </div>
      </div>

      {/* Important Notes */}
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6">
        <h4 className="text-lg font-semibold text-yellow-800 dark:text-yellow-200 mb-3 flex items-center">
          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          Important Notes
        </h4>
        <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-2">
          <li>• Export creates a complete backup of all your data</li>
          <li>• Import with "Replace All" will delete all existing data</li>
          <li>• Files are stored locally in your browser - no data is sent to external servers</li>
          <li>• Keep your backup files safe and secure</li>
          <li>• You can import data exported from the same or older versions</li>
        </ul>
      </div>
    </div>
  );
};

export default DataManagement;