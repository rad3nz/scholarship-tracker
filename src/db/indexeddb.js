const DB_NAME = 'ScholarshipTrackerDB';
const DB_VERSION = 6;
const STORE_NAME = 'scholarships';
const CHECKLIST_STORE_NAME = 'checklistItems';
const DOCUMENTS_STORE_NAME = 'documents';
const TEMPLATES_STORE_NAME = 'templates';
const METADATA_STORE_NAME = 'metadata';

let db = null;

const normalizeRequiredDocumentIds = (value) => {
  if (!Array.isArray(value)) return [];
  const ids = value
    .map((id) => Number(id))
    .filter((id) => Number.isFinite(id));
  return Array.from(new Set(ids));
};

const normalizeScholarship = (scholarship) => {
  if (!scholarship) return scholarship;
  return {
    ...scholarship,
    note: typeof scholarship.note === 'string' ? scholarship.note : '',
    requiredDocumentIds: normalizeRequiredDocumentIds(scholarship.requiredDocumentIds),
  };
};

export const initDB = () => {
  return new Promise((resolve, reject) => {
    if (db) {
      resolve(db);
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      console.error('Error opening IndexedDB:', request.error);
      reject(request.error);
    };

    request.onsuccess = () => {
      db = request.result;
      console.log('IndexedDB opened successfully');
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      db = event.target.result;
      const transaction = event.target.transaction;
      const oldVersion = event.oldVersion;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const objectStore = db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
        objectStore.createIndex('deadline', 'deadline', { unique: false });
        objectStore.createIndex('status', 'status', { unique: false });
        console.log('Object store created:', STORE_NAME);
      }
      if (!db.objectStoreNames.contains(CHECKLIST_STORE_NAME)) {
        const checklistStore = db.createObjectStore(CHECKLIST_STORE_NAME, { keyPath: 'id', autoIncrement: true });
        checklistStore.createIndex('scholarshipId', 'scholarshipId', { unique: false });
        checklistStore.createIndex('order', 'order', { unique: false });
        console.log('Object store created:', CHECKLIST_STORE_NAME);
      }
      if (!db.objectStoreNames.contains(DOCUMENTS_STORE_NAME)) {
        const documentsStore = db.createObjectStore(DOCUMENTS_STORE_NAME, { keyPath: 'id', autoIncrement: true });
        documentsStore.createIndex('type', 'type', { unique: false });
        documentsStore.createIndex('status', 'status', { unique: false });
        console.log('Object store created:', DOCUMENTS_STORE_NAME);
      }
      if (!db.objectStoreNames.contains(TEMPLATES_STORE_NAME)) {
        const templatesStore = db.createObjectStore(TEMPLATES_STORE_NAME, { keyPath: 'id', autoIncrement: true });
        templatesStore.createIndex('createdBy', 'createdBy', { unique: false });
        templatesStore.createIndex('category', 'category', { unique: false });
        console.log('Object store created:', TEMPLATES_STORE_NAME);
      }
      if (!db.objectStoreNames.contains(METADATA_STORE_NAME)) {
        const metadataStore = db.createObjectStore(METADATA_STORE_NAME, { keyPath: 'key' });
        console.log('Object store created:', METADATA_STORE_NAME);
      }

      if (oldVersion < 6 && transaction && db.objectStoreNames.contains(STORE_NAME)) {
        const scholarshipStore = transaction.objectStore(STORE_NAME);
        const cursorRequest = scholarshipStore.openCursor();

        cursorRequest.onsuccess = (cursorEvent) => {
          const cursor = cursorEvent.target.result;
          if (!cursor) {
            return;
          }

          const value = cursor.value;
          const normalized = normalizeScholarship(value);

          if (value.note !== normalized.note || value.requiredDocumentIds !== normalized.requiredDocumentIds) {
            cursor.update(normalized);
          }

          cursor.continue();
        };
      }
    };
  });
};

export const createScholarship = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      await initDB();
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const objectStore = transaction.objectStore(STORE_NAME);
      
      const scholarship = {
        ...data,
        note: typeof data?.note === 'string' ? data.note : '',
        requiredDocumentIds: normalizeRequiredDocumentIds(data?.requiredDocumentIds),
        createdBy: data?.createdBy || 'user', // Default to 'user' if not specified, 'system' for seed data
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const request = objectStore.add(scholarship);

      request.onsuccess = () => {
        console.log('Scholarship created with ID:', request.result);
        resolve({ ...scholarship, id: request.result });
      };

      request.onerror = () => {
        console.error('Error creating scholarship:', request.error);
        reject(request.error);
      };
    } catch (error) {
      reject(error);
    }
  });
};

export const getAllScholarships = () => {
  return new Promise(async (resolve, reject) => {
    try {
      await initDB();
      const transaction = db.transaction([STORE_NAME], 'readonly');
      const objectStore = transaction.objectStore(STORE_NAME);
      const request = objectStore.getAll();

      request.onsuccess = () => {
        const scholarships = request.result.map(normalizeScholarship);
        console.log('Retrieved scholarships:', scholarships.length);
        resolve(scholarships);
      };

      request.onerror = () => {
        console.error('Error getting scholarships:', request.error);
        reject(request.error);
      };
    } catch (error) {
      reject(error);
    }
  });
};

export const getScholarship = (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      await initDB();
      const transaction = db.transaction([STORE_NAME], 'readonly');
      const objectStore = transaction.objectStore(STORE_NAME);
      const request = objectStore.get(id);

      request.onsuccess = () => {
        console.log('Retrieved scholarship:', id);
        resolve(normalizeScholarship(request.result));
      };

      request.onerror = () => {
        console.error('Error getting scholarship:', request.error);
        reject(request.error);
      };
    } catch (error) {
      reject(error);
    }
  });
};

export const updateScholarship = (id, data) => {
  return new Promise(async (resolve, reject) => {
    try {
      await initDB();
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const objectStore = transaction.objectStore(STORE_NAME);
      
      const request = objectStore.get(id);

      request.onsuccess = () => {
        const existing = request.result;
        if (!existing) {
          reject(new Error('Scholarship not found'));
          return;
        }

        const updated = {
          ...existing,
          ...data,
          note:
            data?.note !== undefined
              ? (typeof data.note === 'string' ? data.note : '')
              : (typeof existing.note === 'string' ? existing.note : ''),
          requiredDocumentIds: normalizeRequiredDocumentIds(
            data?.requiredDocumentIds ?? existing.requiredDocumentIds
          ),
          updatedAt: new Date().toISOString()
        };

        const updateRequest = objectStore.put(updated);

        updateRequest.onsuccess = () => {
          console.log('Scholarship updated:', id);
          resolve(updated);
        };

        updateRequest.onerror = () => {
          console.error('Error updating scholarship:', updateRequest.error);
          reject(updateRequest.error);
        };
      };

      request.onerror = () => {
        console.error('Error getting scholarship for update:', request.error);
        reject(request.error);
      };
    } catch (error) {
      reject(error);
    }
  });
};

export const deleteScholarship = (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      await initDB();
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const objectStore = transaction.objectStore(STORE_NAME);
      const request = objectStore.delete(id);

      request.onsuccess = () => {
        console.log('Scholarship deleted:', id);
        resolve();
      };

      request.onerror = () => {
        console.error('Error deleting scholarship:', request.error);
        reject(request.error);
      };
    } catch (error) {
      reject(error);
    }
  });
};

export const clearAllData = () => {
  return new Promise(async (resolve, reject) => {
    try {
      await initDB();
      const transaction = db.transaction([STORE_NAME, CHECKLIST_STORE_NAME, DOCUMENTS_STORE_NAME], 'readwrite');
      
      const scholarshipsStore = transaction.objectStore(STORE_NAME);
      const checklistStore = transaction.objectStore(CHECKLIST_STORE_NAME);
      const documentsStore = transaction.objectStore(DOCUMENTS_STORE_NAME);
      
      let completed = 0;
      const total = 3;
      
      const handleCompletion = () => {
        completed++;
        if (completed === total) {
          console.log('All data cleared from all stores');
          resolve();
        }
      };
      
      transaction.onerror = () => {
        console.error('Transaction error:', transaction.error);
        reject(transaction.error);
      };
      
      const scholarshipsRequest = scholarshipsStore.clear();
      scholarshipsRequest.onsuccess = () => {
        console.log('Scholarships cleared');
        handleCompletion();
      };
      scholarshipsRequest.onerror = () => {
        console.error('Error clearing scholarships:', scholarshipsRequest.error);
        reject(scholarshipsRequest.error);
      };
      
      const checklistRequest = checklistStore.clear();
      checklistRequest.onsuccess = () => {
        console.log('Checklist items cleared');
        handleCompletion();
      };
      checklistRequest.onerror = () => {
        console.error('Error clearing checklist items:', checklistRequest.error);
        reject(checklistRequest.error);
      };
      
      const documentsRequest = documentsStore.clear();
      documentsRequest.onsuccess = () => {
        console.log('Documents cleared');
        handleCompletion();
      };
      documentsRequest.onerror = () => {
        console.error('Error clearing documents:', documentsRequest.error);
        reject(documentsRequest.error);
      };
    } catch (error) {
      console.error('Error in clearAllData:', error);
      reject(error);
    }
  });
};

export const createChecklistItem = (scholarshipId, data) => {
  return new Promise(async (resolve, reject) => {
    try {
      await initDB();
      const transaction = db.transaction([CHECKLIST_STORE_NAME], 'readwrite');
      const objectStore = transaction.objectStore(CHECKLIST_STORE_NAME);

      const checklistItem = {
        scholarshipId,
        text: data.text,
        checked: data.checked || false,
        note: data.note || '',
        order: data.order || 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const request = objectStore.add(checklistItem);

      request.onsuccess = () => {
        console.log('Checklist item created with ID:', request.result);
        resolve({ ...checklistItem, id: request.result });
      };

      request.onerror = () => {
        console.error('Error creating checklist item:', request.error);
        reject(request.error);
      };
    } catch (error) {
      reject(error);
    }
  });
};

export const getChecklistItems = (scholarshipId) => {
  return new Promise(async (resolve, reject) => {
    try {
      await initDB();
      const transaction = db.transaction([CHECKLIST_STORE_NAME], 'readonly');
      const objectStore = transaction.objectStore(CHECKLIST_STORE_NAME);
      const index = objectStore.index('scholarshipId');
      const request = index.getAll(scholarshipId);

      request.onsuccess = () => {
        const items = request.result.sort((a, b) => a.order - b.order);
        console.log('Retrieved checklist items:', items.length, 'for scholarship:', scholarshipId);
        resolve(items);
      };

      request.onerror = () => {
        console.error('Error getting checklist items:', request.error);
        reject(request.error);
      };
    } catch (error) {
      reject(error);
    }
  });
};

export const updateChecklistItem = (id, data) => {
  return new Promise(async (resolve, reject) => {
    try {
      await initDB();
      const transaction = db.transaction([CHECKLIST_STORE_NAME], 'readwrite');
      const objectStore = transaction.objectStore(CHECKLIST_STORE_NAME);

      const request = objectStore.get(id);

      request.onsuccess = () => {
        const existing = request.result;
        if (!existing) {
          reject(new Error('Checklist item not found'));
          return;
        }

        const updated = {
          ...existing,
          ...data,
          updatedAt: new Date().toISOString()
        };

        const updateRequest = objectStore.put(updated);

        updateRequest.onsuccess = () => {
          console.log('Checklist item updated:', id);
          resolve(updated);
        };

        updateRequest.onerror = () => {
          console.error('Error updating checklist item:', updateRequest.error);
          reject(updateRequest.error);
        };
      };

      request.onerror = () => {
        console.error('Error getting checklist item for update:', request.error);
        reject(request.error);
      };
    } catch (error) {
      reject(error);
    }
  });
};

export const deleteChecklistItem = (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      await initDB();
      const transaction = db.transaction([CHECKLIST_STORE_NAME], 'readwrite');
      const objectStore = transaction.objectStore(CHECKLIST_STORE_NAME);
      const request = objectStore.delete(id);

      request.onsuccess = () => {
        console.log('Checklist item deleted:', id);
        resolve();
      };

      request.onerror = () => {
        console.error('Error deleting checklist item:', request.error);
        reject(request.error);
      };
    } catch (error) {
      reject(error);
    }
  });
};

export const reorderChecklistItems = (scholarshipId, items) => {
  return new Promise(async (resolve, reject) => {
    try {
      await initDB();
      const transaction = db.transaction([CHECKLIST_STORE_NAME], 'readwrite');
      const objectStore = transaction.objectStore(CHECKLIST_STORE_NAME);

      let completed = 0;
      const total = items.length;
      const updatedItems = [];

      items.forEach((item, index) => {
        const getRequest = objectStore.get(item.id);

        getRequest.onsuccess = () => {
          const existing = getRequest.result;
          if (!existing) {
            reject(new Error('Checklist item not found'));
            return;
          }

          const updated = {
            ...existing,
            order: index,
            updatedAt: new Date().toISOString()
          };

          const putRequest = objectStore.put(updated);

          putRequest.onsuccess = () => {
            updatedItems.push(updated);
            completed++;
            if (completed === total) {
              console.log('Checklist items reordered for scholarship:', scholarshipId);
              resolve(updatedItems);
            }
          };

          putRequest.onerror = () => {
            console.error('Error reordering checklist item:', putRequest.error);
            reject(putRequest.error);
          };
        };

        getRequest.onerror = () => {
          console.error('Error getting checklist item for reorder:', getRequest.error);
          reject(getRequest.error);
        };
      });
    } catch (error) {
      reject(error);
    }
  });
};

export const createDocument = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      await initDB();
      const transaction = db.transaction([DOCUMENTS_STORE_NAME], 'readwrite');
      const objectStore = transaction.objectStore(DOCUMENTS_STORE_NAME);
      
      const document = {
        name: data.name,
        type: data.type,
        status: data.status || 'NotReady',
        fileLink: data.fileLink || '',
        notes: data.notes || '',
        lastUpdated: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const request = objectStore.add(document);

      request.onsuccess = () => {
        console.log('Document created with ID:', request.result);
        resolve({ ...document, id: request.result });
      };

      request.onerror = () => {
        console.error('Error creating document:', request.error);
        reject(request.error);
      };
    } catch (error) {
      reject(error);
    }
  });
};

export const getAllDocuments = () => {
  return new Promise(async (resolve, reject) => {
    try {
      await initDB();
      const transaction = db.transaction([DOCUMENTS_STORE_NAME], 'readonly');
      const objectStore = transaction.objectStore(DOCUMENTS_STORE_NAME);
      const request = objectStore.getAll();

      request.onsuccess = () => {
        const documents = request.result;
        console.log('Retrieved documents:', documents.length);
        resolve(documents);
      };

      request.onerror = () => {
        console.error('Error getting documents:', request.error);
        reject(request.error);
      };
    } catch (error) {
      reject(error);
    }
  });
};

export const getDocument = (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      await initDB();
      const transaction = db.transaction([DOCUMENTS_STORE_NAME], 'readonly');
      const objectStore = transaction.objectStore(DOCUMENTS_STORE_NAME);
      const request = objectStore.get(id);

      request.onsuccess = () => {
        console.log('Retrieved document:', id);
        resolve(request.result);
      };

      request.onerror = () => {
        console.error('Error getting document:', request.error);
        reject(request.error);
      };
    } catch (error) {
      reject(error);
    }
  });
};

export const updateDocument = (id, data) => {
  return new Promise(async (resolve, reject) => {
    try {
      await initDB();
      const transaction = db.transaction([DOCUMENTS_STORE_NAME], 'readwrite');
      const objectStore = transaction.objectStore(DOCUMENTS_STORE_NAME);
      
      const request = objectStore.get(id);

      request.onsuccess = () => {
        const existing = request.result;
        if (!existing) {
          reject(new Error('Document not found'));
          return;
        }

        const updated = {
          ...existing,
          ...data,
          lastUpdated: data.lastUpdated || new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        const updateRequest = objectStore.put(updated);

        updateRequest.onsuccess = () => {
          console.log('Document updated:', id);
          resolve(updated);
        };

        updateRequest.onerror = () => {
          console.error('Error updating document:', updateRequest.error);
          reject(updateRequest.error);
        };
      };

      request.onerror = () => {
        console.error('Error getting document for update:', request.error);
        reject(request.error);
      };
    } catch (error) {
      reject(error);
    }
  });
};

export const deleteDocument = (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      await initDB();
      const transaction = db.transaction([DOCUMENTS_STORE_NAME], 'readwrite');
      const objectStore = transaction.objectStore(DOCUMENTS_STORE_NAME);
      const request = objectStore.delete(id);

      request.onsuccess = () => {
        console.log('Document deleted:', id);
        resolve();
      };

      request.onerror = () => {
        console.error('Error deleting document:', request.error);
        reject(request.error);
      };
    } catch (error) {
      reject(error);
    }
  });
};

export const getScholarshipRequiredDocuments = (scholarshipId) => {
  return new Promise(async (resolve, reject) => {
    try {
      await initDB();
      const transaction = db.transaction([STORE_NAME, DOCUMENTS_STORE_NAME], 'readonly');
      const scholarshipStore = transaction.objectStore(STORE_NAME);
      const documentsStore = transaction.objectStore(DOCUMENTS_STORE_NAME);

      const scholarshipRequest = scholarshipStore.get(scholarshipId);

      scholarshipRequest.onsuccess = async () => {
        const scholarship = normalizeScholarship(scholarshipRequest.result);
        if (!scholarship) {
          resolve([]);
          return;
        }

        const requiredIds = scholarship.requiredDocumentIds || [];
        if (requiredIds.length === 0) {
          resolve([]);
          return;
        }

        const documentPromises = requiredIds.map(
          (id) =>
            new Promise((res) => {
              const docRequest = documentsStore.get(id);
              docRequest.onsuccess = () => res(docRequest.result || null);
              docRequest.onerror = () => res(null);
            })
        );

        const docs = await Promise.all(documentPromises);
        resolve(docs.filter(Boolean));
      };

      scholarshipRequest.onerror = () => {
        console.error('Error getting scholarship for required documents:', scholarshipRequest.error);
        reject(scholarshipRequest.error);
      };
    } catch (error) {
      reject(error);
    }
  });
};

export const getDocumentScholarships = (documentId) => {
  return new Promise(async (resolve, reject) => {
    try {
      await initDB();
      const transaction = db.transaction([STORE_NAME], 'readonly');
      const scholarshipStore = transaction.objectStore(STORE_NAME);
      const request = scholarshipStore.getAll();

      request.onsuccess = () => {
        const scholarships = request.result
          .map(normalizeScholarship)
          .filter((s) => (s.requiredDocumentIds || []).includes(Number(documentId)));

        resolve(scholarships);
      };

      request.onerror = () => {
        console.error('Error getting scholarships for document:', request.error);
        reject(request.error);
      };
    } catch (error) {
      reject(error);
    }
  });
};

export const createTemplate = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      await initDB();
      const transaction = db.transaction([TEMPLATES_STORE_NAME], 'readwrite');
      const objectStore = transaction.objectStore(TEMPLATES_STORE_NAME);
      
      const template = {
        name: data.name,
        description: data.description || '',
        category: data.category || 'Custom',
        country: data.country || '',
        items: data.items || [],
        createdBy: 'user',
        version: '1.0',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const request = objectStore.add(template);

      request.onsuccess = () => {
        console.log('Template created with ID:', request.result);
        resolve({ ...template, id: request.result });
      };

      request.onerror = () => {
        console.error('Error creating template:', request.error);
        reject(request.error);
      };
    } catch (error) {
      reject(error);
    }
  });
};

export const getTemplate = (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      await initDB();
      const transaction = db.transaction([TEMPLATES_STORE_NAME], 'readonly');
      const objectStore = transaction.objectStore(TEMPLATES_STORE_NAME);
      const request = objectStore.get(id);

      request.onsuccess = () => {
        console.log('Retrieved template:', id);
        resolve(request.result);
      };

      request.onerror = () => {
        console.error('Error getting template:', request.error);
        reject(request.error);
      };
    } catch (error) {
      reject(error);
    }
  });
};

export const getAllTemplates = () => {
  return new Promise(async (resolve, reject) => {
    try {
      await initDB();
      const transaction = db.transaction([TEMPLATES_STORE_NAME], 'readonly');
      const objectStore = transaction.objectStore(TEMPLATES_STORE_NAME);
      const request = objectStore.getAll();

      request.onsuccess = () => {
        const templates = request.result;
        console.log('Retrieved templates:', templates.length);
        resolve(templates);
      };

      request.onerror = () => {
        console.error('Error getting templates:', request.error);
        reject(request.error);
      };
    } catch (error) {
      reject(error);
    }
  });
};

export const updateTemplate = (id, data) => {
  return new Promise(async (resolve, reject) => {
    try {
      await initDB();
      const transaction = db.transaction([TEMPLATES_STORE_NAME], 'readwrite');
      const objectStore = transaction.objectStore(TEMPLATES_STORE_NAME);
      
      const request = objectStore.get(id);

      request.onsuccess = () => {
        const existing = request.result;
        if (!existing) {
          reject(new Error('Template not found'));
          return;
        }

        if (existing.createdBy === 'system') {
          reject(new Error('Cannot update built-in templates'));
          return;
        }

        const updated = {
          ...existing,
          ...data,
          updatedAt: new Date().toISOString()
        };

        const updateRequest = objectStore.put(updated);

        updateRequest.onsuccess = () => {
          console.log('Template updated:', id);
          resolve(updated);
        };

        updateRequest.onerror = () => {
          console.error('Error updating template:', updateRequest.error);
          reject(updateRequest.error);
        };
      };

      request.onerror = () => {
        console.error('Error getting template for update:', request.error);
        reject(request.error);
      };
    } catch (error) {
      reject(error);
    }
  });
};

export const deleteTemplate = (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      await initDB();
      const transaction = db.transaction([TEMPLATES_STORE_NAME], 'readwrite');
      const objectStore = transaction.objectStore(TEMPLATES_STORE_NAME);
      
      const getRequest = objectStore.get(id);
      
      getRequest.onsuccess = () => {
        const template = getRequest.result;
        if (!template) {
          reject(new Error('Template not found'));
          return;
        }

        if (template.createdBy === 'system') {
          reject(new Error('Cannot delete built-in templates'));
          return;
        }

        const deleteRequest = objectStore.delete(id);

        deleteRequest.onsuccess = () => {
          console.log('Template deleted:', id);
          resolve();
        };

        deleteRequest.onerror = () => {
          console.error('Error deleting template:', deleteRequest.error);
          reject(deleteRequest.error);
        };
      };

      getRequest.onerror = () => {
        console.error('Error getting template for delete:', getRequest.error);
        reject(getRequest.error);
      };
    } catch (error) {
      reject(error);
    }
  });
};

export const getUserTemplates = () => {
  return new Promise(async (resolve, reject) => {
    try {
      await initDB();
      const transaction = db.transaction([TEMPLATES_STORE_NAME], 'readonly');
      const objectStore = transaction.objectStore(TEMPLATES_STORE_NAME);
      const index = objectStore.index('createdBy');
      const request = index.getAll('user');

      request.onsuccess = () => {
        const templates = request.result;
        console.log('Retrieved user templates:', templates.length);
        resolve(templates);
      };

      request.onerror = () => {
        console.error('Error getting user templates:', request.error);
        reject(request.error);
      };
    } catch (error) {
      reject(error);
    }
  });
};

// Metadata storage functions for seed data versioning
export const setMetadata = (key, value) => {
  return new Promise(async (resolve, reject) => {
    try {
      await initDB();
      const transaction = db.transaction([METADATA_STORE_NAME], 'readwrite');
      const objectStore = transaction.objectStore(METADATA_STORE_NAME);
      
      const metadata = {
        key,
        value,
        updatedAt: new Date().toISOString()
      };

      const request = objectStore.put(metadata);

      request.onsuccess = () => {
        console.log('Metadata set:', key, value);
        resolve(metadata);
      };

      request.onerror = () => {
        console.error('Error setting metadata:', request.error);
        reject(request.error);
      };
    } catch (error) {
      reject(error);
    }
  });
};

export const getMetadata = (key) => {
  return new Promise(async (resolve, reject) => {
    try {
      await initDB();
      const transaction = db.transaction([METADATA_STORE_NAME], 'readonly');
      const objectStore = transaction.objectStore(METADATA_STORE_NAME);
      
      const request = objectStore.get(key);

      request.onsuccess = () => {
        const result = request.result;
        console.log('Metadata retrieved:', key, result?.value);
        resolve(result?.value || null);
      };

      request.onerror = () => {
        console.error('Error getting metadata:', request.error);
        reject(request.error);
      };
    } catch (error) {
      reject(error);
    }
  });
};
