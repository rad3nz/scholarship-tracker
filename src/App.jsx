import { useState, useEffect, useCallback } from 'react';
import DashboardView from './components/DashboardView';
import ScholarshipList from './components/ScholarshipList';
import ScholarshipForm from './components/ScholarshipForm';
import ChecklistView from './components/ChecklistView';
import DocumentTracker from './components/DocumentTracker';
import DataManagement from './components/DataManagement';
import CalendarView from './components/CalendarView';
import TimelineView from './components/TimelineView';
import ThemeToggle from './components/ThemeToggle';
import MobileMenu from './components/MobileMenu';
import BottomNav from './components/BottomNav';
import { getAllScholarships, createScholarship, updateScholarship, deleteScholarship, getChecklistItems, createChecklistItem, createChecklistItemsBulk, updateChecklistItem, deleteChecklistItem, reorderChecklistItems, getAllDocuments } from './db/indexeddb';
import { seedDatabase } from './utils/seedDatabase';
import TemplateManager from './components/TemplateManager';

function App() {
  const [scholarships, setScholarships] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [documentTrackerEditId, setDocumentTrackerEditId] = useState(null);
  const [view, setView] = useState('dashboard');
  const [mainTab, setMainTab] = useState('dashboard'); // 'dashboard', 'scholarships', 'calendar', 'documents', 'templates', or 'data'
  const [editingScholarship, setEditingScholarship] = useState(null);
  const [currentChecklistScholarship, setCurrentChecklistScholarship] = useState(null);
  const [checklistItems, setChecklistItems] = useState([]);
  const [checklistItemsByScholarship, setChecklistItemsByScholarship] = useState({});
  const [independentTimelineTasks, setIndependentTimelineTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const getDateOnly = useCallback((value) => {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    return date.toISOString().slice(0, 10);
  }, []);

  const addDays = useCallback((dateString, days) => {
    const date = new Date(dateString);
    date.setDate(date.getDate() + days);
    return date.toISOString().slice(0, 10);
  }, []);

  const dayDiff = useCallback((fromDate, toDate) => {
    const msInDay = 24 * 60 * 60 * 1000;
    const from = new Date(fromDate);
    const to = new Date(toDate);
    return Math.round((to - from) / msInDay);
  }, []);

  const normalizeChecklistItemFlags = useCallback((item) => {
    const conditional = Boolean(item?.conditional);
    let required;

    if (item?.required === undefined) {
      required = !conditional;
    } else {
      required = Boolean(item.required);
    }

    if (conditional) {
      required = false;
    }

    if (!required && !conditional) {
      required = true;
    }

    const parsedCopies = Number(item?.copies_required);
    const copies_required = Number.isFinite(parsedCopies) && parsedCopies >= 1
      ? Math.floor(parsedCopies)
      : 1;

    return {
      required,
      conditional,
      copies_required,
    };
  }, []);

  useEffect(() => {
    seedDatabase().then(() => {
      loadScholarships();
      loadDocuments();
      loadIndependentTimelineTasks();
    }).catch(error => {
      console.error('Error seeding database:', error);
      loadScholarships();
      loadDocuments();
      loadIndependentTimelineTasks();
    });
  }, []);

  const loadIndependentTimelineTasks = async () => {
    try {
      const items = await getChecklistItems(null);
      const normalized = items
        .filter((item) => item.scholarshipId == null)
        .map((item) => {
          const dueDate = getDateOnly(item.dueDate);
          const startDate = getDateOnly(item.startDate) || dueDate;
          return {
            ...item,
            startDate,
            dueDate,
          };
        })
        .filter((item) => item.startDate && item.dueDate)
        .sort((a, b) => {
          if (a.startDate !== b.startDate) return a.startDate.localeCompare(b.startDate);
          return (a.order || 0) - (b.order || 0);
        });
      setIndependentTimelineTasks(normalized);
    } catch (error) {
      console.error('Error loading independent timeline tasks:', error);
    }
  };

  const loadAllChecklistItems = async () => {
    try {
      const itemsMap = {};
      for (const scholarship of scholarships) {
        const items = await getChecklistItems(scholarship.id);
        itemsMap[scholarship.id] = items;
      }
      setChecklistItemsByScholarship(itemsMap);
    } catch (error) {
      console.error('Error loading checklist items:', error);
    }
  };

  useEffect(() => {
    if (scholarships.length > 0) {
      loadAllChecklistItems();
    }
  }, [scholarships]);

  const loadScholarships = async () => {
    try {
      setLoading(true);
      const data = await getAllScholarships();
      const sorted = data.sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
      setScholarships(sorted);
    } catch (error) {
      console.error('Error loading scholarships:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadDocuments = async () => {
    try {
      const data = await getAllDocuments();
      setDocuments(data);
    } catch (error) {
      console.error('Error loading documents:', error);
    }
  };

  const handleCreateScholarship = useCallback(async (data, template = null) => {
    try {
      const scholarship = await createScholarship(data);
      
      if (template && template.items && template.items.length > 0) {
        const itemsToCreate = template.items.map((item, index) => {
          const flags = normalizeChecklistItemFlags(item);
          return {
            text: item.text,
            note: item.note || '',
            order: index,
            checked: false,
            ...flags,
          };
        });
        await createChecklistItemsBulk(scholarship.id, itemsToCreate);
      }
      
      await loadScholarships();
      await loadAllChecklistItems();
      setView('list');
    } catch (error) {
      console.error('Error creating scholarship:', error);
    }
  }, [normalizeChecklistItemFlags]);

  const handleUpdateScholarship = useCallback(async (data) => {
    try {
      await updateScholarship(editingScholarship.id, data);
      await loadScholarships();
      setView('list');
      setEditingScholarship(null);
    } catch (error) {
      console.error('Error updating scholarship:', error);
    }
  }, [editingScholarship]);

  const handleDeleteScholarship = useCallback(async (id) => {
    try {
      await deleteScholarship(id);
      await loadScholarships();
    } catch (error) {
      console.error('Error deleting scholarship:', error);
    }
  }, []);

  const handleEdit = useCallback((scholarship) => {
    setEditingScholarship(scholarship);
    setView('form');
  }, []);

  const handleAddNew = useCallback(() => {
    setEditingScholarship(null);
    setMainTab('scholarships');
    setView('form');
  }, []);

   const handleCancel = useCallback(() => {
    if (view === 'checklist') {
      setView('list');
    }
    setEditingScholarship(null);
    setCurrentChecklistScholarship(null);
    setChecklistItems([]);
  }, [view]);

  const handleMobileMenuToggle = useCallback(() => {
    setIsMobileMenuOpen(prev => !prev);
  }, []);

  const handleMobileMenuClose = useCallback(() => {
    setIsMobileMenuOpen(false);
  }, []);

  const handleTabChange = useCallback((tab) => {
    setMainTab(tab);
    setView(tab === 'scholarships' ? 'list' : tab === 'timeline' ? 'timeline' : 'dashboard');
    handleMobileMenuClose();
  }, [handleMobileMenuClose]);

  const handleViewChecklist = useCallback(async (scholarshipId) => {
    const scholarship = scholarships.find(s => s.id === scholarshipId);
    if (scholarship) {
      setCurrentChecklistScholarship(scholarship);
      setMainTab('scholarships');
      setView('checklist');
      try {
        const items = await getChecklistItems(scholarshipId);
        setChecklistItems(items);
      } catch (error) {
        console.error('Error loading checklist items:', error);
        setChecklistItems([]);
      }
    }
  }, [scholarships]);

  const handleViewDocument = useCallback((documentId) => {
    setDocumentTrackerEditId(documentId);
    setMainTab('documents');
    setView('list');
    setEditingScholarship(null);
    setCurrentChecklistScholarship(null);
    setChecklistItems([]);
  }, []);

  const clearDocumentTrackerEditId = useCallback(() => {
    setDocumentTrackerEditId(null);
  }, []);

  const handleCreateChecklistItem = useCallback(async (data) => {
    if (!currentChecklistScholarship) return;
    try {
      await createChecklistItem(currentChecklistScholarship.id, data);
      const items = await getChecklistItems(currentChecklistScholarship.id);
      setChecklistItems(items);
      await loadAllChecklistItems();
    } catch (error) {
      console.error('Error creating checklist item:', error);
    }
  }, [currentChecklistScholarship, loadAllChecklistItems]);

  const handleCreateChecklistItemsBulk = useCallback(async (itemsData) => {
    if (!currentChecklistScholarship || !Array.isArray(itemsData) || itemsData.length === 0) return;

    try {
      await createChecklistItemsBulk(currentChecklistScholarship.id, itemsData);
      const items = await getChecklistItems(currentChecklistScholarship.id);
      setChecklistItems(items);
      await loadAllChecklistItems();
    } catch (error) {
      console.error('Error creating checklist items in bulk:', error);
    }
  }, [currentChecklistScholarship, loadAllChecklistItems]);

  const handleUpdateChecklistItem = useCallback(async (id, data) => {
    try {
      await updateChecklistItem(id, data);
      if (currentChecklistScholarship) {
        const items = await getChecklistItems(currentChecklistScholarship.id);
        setChecklistItems(items);
      }
      await loadAllChecklistItems();
    } catch (error) {
      console.error('Error updating checklist item:', error);
    }
  }, [currentChecklistScholarship, loadAllChecklistItems]);

  const handleDeleteChecklistItem = useCallback(async (id) => {
    try {
      await deleteChecklistItem(id);
      if (currentChecklistScholarship) {
        const items = await getChecklistItems(currentChecklistScholarship.id);
        setChecklistItems(items);
      }
      await loadAllChecklistItems();
    } catch (error) {
      console.error('Error deleting checklist item:', error);
    }
  }, [currentChecklistScholarship, loadAllChecklistItems]);

  const handleReorderChecklistItems = useCallback(async (items) => {
    if (!currentChecklistScholarship) return;
    try {
      await reorderChecklistItems(currentChecklistScholarship.id, items);
      setChecklistItems(items);
      await loadAllChecklistItems();
    } catch (error) {
      console.error('Error reordering checklist items:', error);
    }
  }, [currentChecklistScholarship, loadAllChecklistItems]);

  const handleShiftTimelineScholarship = useCallback(async (id, newDeadline) => {
    try {
      await updateScholarship(id, { deadline: newDeadline });
      await loadScholarships();
    } catch (error) {
      console.error('Error shifting scholarship deadline from timeline:', error);
    }
  }, []);

  const handleCreateIndependentTimelineTask = useCallback(async (data) => {
    try {
      await createChecklistItem(null, {
        text: data.text,
        checked: data.taskStatus === 'completed',
        note: data.note || '',
        required: true,
        conditional: false,
        copies_required: 1,
        startDate: data.startDate,
        dueDate: data.dueDate,
        taskType: 'independent',
        taskStatus: data.taskStatus || 'pending',
        priority: Number(data.priority) || 3,
        dependencyIds: [],
      });
      await loadIndependentTimelineTasks();
    } catch (error) {
      console.error('Error creating independent timeline task:', error);
    }
  }, []);

  const handleUpdateIndependentTimelineTask = useCallback(async (id, data) => {
    try {
      const payload = {
        ...data,
      };

      if (data.taskStatus) {
        payload.checked = data.taskStatus === 'completed';
      }

      await updateChecklistItem(id, payload);
      await loadIndependentTimelineTasks();
    } catch (error) {
      console.error('Error updating independent timeline task:', error);
    }
  }, []);

  const handleDeleteIndependentTimelineTask = useCallback(async (id) => {
    try {
      await deleteChecklistItem(id);
      await loadIndependentTimelineTasks();
    } catch (error) {
      console.error('Error deleting independent timeline task:', error);
    }
  }, []);

  const handleMoveIndependentTimelineTask = useCallback(async (id, newStartDate) => {
    try {
      const task = independentTimelineTasks.find((item) => item.id === id);
      if (!task) return;
      const durationDays = Math.max(0, dayDiff(task.startDate, task.dueDate));
      const nextStartDate = getDateOnly(newStartDate);
      const nextDueDate = addDays(nextStartDate, durationDays);
      await updateChecklistItem(id, {
        startDate: nextStartDate,
        dueDate: nextDueDate,
      });
      await loadIndependentTimelineTasks();
    } catch (error) {
      console.error('Error moving independent timeline task:', error);
    }
  }, [independentTimelineTasks, dayDiff, getDateOnly, addDays]);

  const handleResizeIndependentTimelineTaskStart = useCallback(async (id, nextStartDate) => {
    try {
      const task = independentTimelineTasks.find((item) => item.id === id);
      if (!task) return;

      const normalizedStart = getDateOnly(nextStartDate);
      const clampedStart = normalizedStart > task.dueDate ? task.dueDate : normalizedStart;

      await updateChecklistItem(id, {
        startDate: clampedStart,
      });
      await loadIndependentTimelineTasks();
    } catch (error) {
      console.error('Error resizing independent task start date:', error);
    }
  }, [independentTimelineTasks, getDateOnly]);

  const handleResizeIndependentTimelineTaskEnd = useCallback(async (id, nextDueDate) => {
    try {
      const task = independentTimelineTasks.find((item) => item.id === id);
      if (!task) return;

      const normalizedEnd = getDateOnly(nextDueDate);
      const clampedEnd = normalizedEnd < task.startDate ? task.startDate : normalizedEnd;

      await updateChecklistItem(id, {
        dueDate: clampedEnd,
      });
      await loadIndependentTimelineTasks();
    } catch (error) {
      console.error('Error resizing independent task end date:', error);
    }
  }, [independentTimelineTasks, getDateOnly]);

  const handleTimelineEdit = useCallback((scholarship) => {
    setMainTab('scholarships');
    setEditingScholarship(scholarship);
    setView('form');
  }, []);

  const handleUpdateChecklistScholarshipNote = useCallback(async (scholarshipId, note) => {
    try {
      await updateScholarship(scholarshipId, { note });
      await loadScholarships();
      setCurrentChecklistScholarship((prev) => (
        prev && prev.id === scholarshipId ? { ...prev, note } : prev
      ));
    } catch (error) {
      console.error('Error updating scholarship note from checklist view:', error);
      throw error;
    }
  }, []);

  const handleImportComplete = useCallback(async () => {
    // Refresh all data after import
    await loadScholarships();
    await loadDocuments();
    await loadAllChecklistItems();
    await loadIndependentTimelineTasks();
  }, []);

  const handleSave = useCallback((data, template = null) => {
    if (editingScholarship) {
      handleUpdateScholarship(data);
    } else {
      handleCreateScholarship(data, template);
    }
  }, [editingScholarship, handleCreateScholarship, handleUpdateScholarship]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <MobileMenu
        activeTab={mainTab}
        onTabChange={handleTabChange}
        isVisible={isMobileMenuOpen}
        onClose={handleMobileMenuClose}
      />

      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-3">
              {/* Hamburger Menu Button - Mobile Only */}
              <button
                onClick={handleMobileMenuToggle}
                className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <svg className="w-6 h-6 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Scholarship Tracker</h1>
            </div>
            <div className="flex items-center gap-3">
              <ThemeToggle />
              {mainTab === 'scholarships' && view === 'form' && (
                <button
                  onClick={handleCancel}
                  className="hidden md:block text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white font-medium transition-colors"
                >
                  ← Back to List
                </button>
              )}
            </div>
          </div>
          
          {/* Desktop Navigation - Hidden on Mobile */}
          <div className="hidden md:flex items-center space-x-1 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={() => {
                setMainTab('dashboard');
                setView('dashboard');
                handleCancel();
              }}
              className={`px-4 py-2 font-medium text-sm transition-colors ${
                mainTab === 'dashboard'
                  ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => {
                setMainTab('scholarships');
                setView('list');
                handleCancel();
              }}
              className={`px-4 py-2 font-medium text-sm transition-colors ${
                mainTab === 'scholarships'
                  ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Scholarships
            </button>
            <button
              onClick={() => {
                setMainTab('calendar');
                handleCancel();
              }}
              className={`px-4 py-2 font-medium text-sm transition-colors ${
                mainTab === 'calendar'
                  ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Calendar
            </button>
            <button
              onClick={() => {
                setMainTab('timeline');
                handleCancel();
              }}
              className={`px-4 py-2 font-medium text-sm transition-colors ${
                mainTab === 'timeline'
                  ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Timeline
            </button>
            <button
              onClick={() => {
                setMainTab('documents');
                clearDocumentTrackerEditId();
                handleCancel();
              }}
              className={`px-4 py-2 font-medium text-sm transition-colors ${
                mainTab === 'documents'
                  ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Documents
            </button>
            <button
              onClick={() => {
                setMainTab('templates');
                handleCancel();
              }}
              className={`px-4 py-2 font-medium text-sm transition-colors ${
                mainTab === 'templates'
                  ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Templates
            </button>
            <button
              onClick={() => {
                setMainTab('data');
                handleCancel();
              }}
              className={`px-4 py-2 font-medium text-sm transition-colors ${
                mainTab === 'data'
                  ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Data Management
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 md:pb-8">
        {mainTab === 'dashboard' ? (
          <DashboardView
            scholarships={scholarships}
            checklistItemsByScholarship={checklistItemsByScholarship}
            documents={documents}
            onViewChecklist={handleViewChecklist}
            onAddScholarship={handleAddNew}
          />
        ) : mainTab === 'scholarships' ? (
          view === 'list' ? (
            <ScholarshipList
              scholarships={scholarships}
              onEdit={handleEdit}
              onDelete={handleDeleteScholarship}
              onAddNew={handleAddNew}
              onViewChecklist={handleViewChecklist}
              checklistItemsByScholarship={checklistItemsByScholarship}
              documents={documents}
            />
          ) : view === 'checklist' ? (
            <ChecklistView
              scholarship={currentChecklistScholarship}
              onBack={handleCancel}
              checklistItems={checklistItems}
              onCreateItem={handleCreateChecklistItem}
              onCreateItemsBulk={handleCreateChecklistItemsBulk}
              onUpdateItem={handleUpdateChecklistItem}
              onDeleteItem={handleDeleteChecklistItem}
              onReorderItems={handleReorderChecklistItems}
              onUpdateScholarshipNote={handleUpdateChecklistScholarshipNote}
              documents={documents}
              onViewDocument={handleViewDocument}
            />
          ) : (
            <ScholarshipForm
              scholarship={editingScholarship}
              documents={documents}
              onSave={handleSave}
              onCancel={handleCancel}
            />
          )
        ) : mainTab === 'calendar' ? (
          <CalendarView
            scholarships={scholarships}
            onViewChecklist={handleViewChecklist}
            onEdit={handleEdit}
          />
        ) : mainTab === 'timeline' ? (
          <TimelineView
            scholarships={scholarships}
            independentTasks={independentTimelineTasks}
            onShiftTask={handleShiftTimelineScholarship}
            onCreateIndependentTask={handleCreateIndependentTimelineTask}
            onUpdateIndependentTask={handleUpdateIndependentTimelineTask}
            onDeleteIndependentTask={handleDeleteIndependentTimelineTask}
            onMoveIndependentTask={handleMoveIndependentTimelineTask}
            onResizeIndependentTaskStart={handleResizeIndependentTimelineTaskStart}
            onResizeIndependentTaskEnd={handleResizeIndependentTimelineTaskEnd}
            onEdit={handleTimelineEdit}
          />
        ) : mainTab === 'templates' ? (
          <TemplateManager onTemplateUpdate={() => {}} />
        ) : mainTab === 'data' ? (
          <DataManagement onImportComplete={handleImportComplete} />
        ) : (
          <DocumentTracker
            scholarships={scholarships}
            onViewScholarship={handleViewChecklist}
            initialEditDocumentId={documentTrackerEditId}
            onClearInitialEdit={clearDocumentTrackerEditId}
            onDocumentsChanged={loadDocuments}
          />
        )}
      </main>

      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <p className="text-center text-sm text-gray-500 dark:text-gray-400">
            Scholarship Tracker · Data stored locally with IndexedDB
          </p>
        </div>
      </footer>

      <BottomNav activeTab={mainTab} onTabChange={handleTabChange} />
    </div>
  );
}

export default App;
