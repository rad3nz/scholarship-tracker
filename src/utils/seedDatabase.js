/**
 * Seed Database Utility with CreatedAt Timestamp Versioning System
 * 
 * This module handles intelligent seed data import with timestamp-based version tracking.
 * When the seed data createdAt timestamp is updated, it reimports seed scholarships while
 * preserving user-created data.
 * 
 * How to update seed data:
 * 1. Export your data as "Seed Data Export" from Data Management
 * 2. Replace src/data/seedData.json with the exported file
 * 3. Update the "createdAt" field in seedData.json to current timestamp
 * 4. Commit and deploy - returning visitors will automatically get updated seed data
 * 
 * The versioning system:
 * - Tracks current seed createdAt in IndexedDB metadata
 * - Compares with seedData.json createdAt on each app load
 * - If timestamps differ, reimports seed data intelligently
 * - Deletes old system scholarships (createdBy: 'system')
 * - Imports new seed scholarships with createdBy: 'system'
 * - Preserves user scholarships (createdBy: 'user')
 */

import seedData from '../data/seedData.json';
import {
  getAllScholarships,
  createScholarship,
  deleteScholarship,
  createChecklistItem,
  getChecklistItems,
  deleteChecklistItem,
  createDocument,
  createTemplate,
  getMetadata,
  setMetadata
} from '../db/indexeddb';

const SEED_CREATEDAT_KEY = 'seedDataCreatedAt';
let seedDatabaseInFlight = null;

/**
 * Get the currently installed seed data createdAt timestamp
 */
export const getCurrentSeedCreatedAt = async () => {
  try {
    const createdAt = await getMetadata(SEED_CREATEDAT_KEY);
    console.log('Retrieved current seed createdAt from IndexedDB:', createdAt);
    return createdAt;
  } catch (error) {
    console.error('Error reading seed createdAt from IndexedDB:', error);
    return null;
  }
};

/**
 * Save the current seed data createdAt timestamp
 */
export const setSeedCreatedAt = async (createdAt) => {
  try {
    console.log('Storing seed createdAt to IndexedDB:', createdAt);
    await setMetadata(SEED_CREATEDAT_KEY, createdAt);
    console.log('Seed createdAt stored successfully');
  } catch (error) {
    console.error('Error storing seed createdAt to IndexedDB:', error);
    throw error;
  }
};

/**
 * Check if seed data needs to be updated based on createdAt comparison
 */
export const needsSeedUpdate = async () => {
  try {
    const currentCreatedAt = await getCurrentSeedCreatedAt();
    const newCreatedAt = seedData?.createdAt;

    console.log('=== SEED DATABASE: Starting createdAt comparison ===');
    console.log('Seed createdAt comparison:', {
      currentCreatedAt,
      newCreatedAt,
      timestampsMatch: currentCreatedAt === newCreatedAt,
      isFirstVisit: !currentCreatedAt
    });

    // First time visit - no createdAt stored (including case where IndexedDB is inaccessible)
    if (!currentCreatedAt) {
      console.log('-> Update needed: First visit or IndexedDB unavailable');
      return true;
    }

    // Missing createdAt in seed data - treat as needing update to be safe
    if (!newCreatedAt) {
      console.log('-> Update needed: Seed data missing createdAt field');
      return true;
    }

    // createdAt mismatch - need update
    if (currentCreatedAt !== newCreatedAt) {
      console.log(`-> Update needed: createdAt changed from "${currentCreatedAt}" to "${newCreatedAt}"`);
      return true;
    }

    console.log('-> No update needed: createdAt timestamps match');
    return false;
  } catch (error) {
    console.error('Error checking seed update status:', error);
    // If we can't check, assume update is needed to be safe
    return true;
  }
};

/**
 * Delete all system-created scholarships and their checklist items
 * This preserves user-created scholarships
 */
const deleteSystemScholarships = async () => {
  const allScholarships = await getAllScholarships();
  const systemScholarships = allScholarships.filter(s => s.createdBy === 'system');
  
  console.log(`Deleting ${systemScholarships.length} system scholarships...`);
  
  for (const scholarship of systemScholarships) {
    // Delete associated checklist items first
    const checklistItems = await getChecklistItems(scholarship.id);
    for (const item of checklistItems) {
      await deleteChecklistItem(item.id);
    }
    
    // Delete the scholarship
    await deleteScholarship(scholarship.id);
    console.log('Deleted system scholarship:', scholarship.name);
  }
};

/**
 * Remove duplicate system scholarships that share the same seed identity/fingerprint
 * Keeps the oldest record and removes newer duplicates plus their checklist items.
 */
const deduplicateSystemScholarships = async () => {
  const allScholarships = await getAllScholarships();
  const systemScholarships = allScholarships.filter((s) => s.createdBy === 'system');

  const groups = new Map();
  for (const scholarship of systemScholarships) {
    const key = [
      scholarship.seedSourceId ?? 'no-seed-id',
      scholarship.name ?? '',
      scholarship.provider ?? '',
      scholarship.deadline ?? ''
    ].join('|');

    if (!groups.has(key)) {
      groups.set(key, []);
    }
    groups.get(key).push(scholarship);
  }

  let removedCount = 0;

  for (const [, group] of groups) {
    if (group.length <= 1) continue;

    // Keep the oldest entry to avoid churn in existing references.
    const sorted = group.sort((a, b) => {
      const aTime = new Date(a.createdAt || 0).getTime();
      const bTime = new Date(b.createdAt || 0).getTime();
      return aTime - bTime;
    });

    const duplicates = sorted.slice(1);

    for (const duplicate of duplicates) {
      const checklistItems = await getChecklistItems(duplicate.id);
      for (const item of checklistItems) {
        await deleteChecklistItem(item.id);
      }

      await deleteScholarship(duplicate.id);
      removedCount += 1;
      console.log(`-> Removed duplicate system scholarship "${duplicate.name}" (ID ${duplicate.id})`);
    }
  }

  if (removedCount > 0) {
    console.log(`Removed ${removedCount} duplicate system scholarships`);
  }
};

/**
 * Import seed scholarships with createdBy: 'system' marker
 */
const importSeedScholarships = async (scholarships, checklistItems) => {
  const existingScholarships = await getAllScholarships();
  const existingSystemScholarships = existingScholarships.filter((s) => s.createdBy === 'system');
  const scholarshipIdMap = new Map();

  console.log(`Importing ${scholarships.length} seed scholarships...`);

  for (const scholarship of scholarships) {
    try {
      const { id, ...scholarshipData } = scholarship;

      const duplicate = existingSystemScholarships.find((existing) => {
        const hasMatchingSeedId = existing.seedSourceId !== undefined && existing.seedSourceId === id;
        const hasMatchingFingerprint =
          existing.name === scholarship.name &&
          existing.provider === scholarship.provider &&
          existing.deadline === scholarship.deadline;

        return hasMatchingSeedId || hasMatchingFingerprint;
      });

      if (duplicate) {
        scholarshipIdMap.set(id, duplicate.id);
        console.log(`-> Skipping duplicate seed scholarship "${scholarship.name}" (already exists as ID ${duplicate.id})`);
        continue;
      }

      // Add createdBy marker to identify this as system data
      const created = await createScholarship({
        ...scholarshipData,
        createdBy: 'system',
        seedSourceId: id
      });

      scholarshipIdMap.set(id, created.id);
      console.log(`-> Created seed scholarship "${scholarship.name}" with ID ${created.id}`);
    } catch (error) {
      console.error(`-> FAILED to import scholarship "${scholarship.name}":`, error);
      throw new Error(`Failed to import scholarship "${scholarship.name}": ${error.message}`);
    }
  }

  console.log(`Importing ${checklistItems?.length || 0} seed checklist items...`);

  // Import checklist items for seed scholarships
  if (checklistItems && checklistItems.length > 0) {
    for (const item of checklistItems) {
      try {
        const { id, scholarshipId, ...itemData } = item;
        const newScholarshipId = scholarshipIdMap.get(scholarshipId);

        if (newScholarshipId) {
          await createChecklistItem(newScholarshipId, itemData);
          console.log(`-> Created checklist item "${item.text}" for scholarship ID ${newScholarshipId}`);
        } else {
          console.warn(`-> Skipping checklist item "${item.text}" for unknown scholarship ID ${scholarshipId}`);
        }
      } catch (error) {
        console.error(`-> FAILED to import checklist item "${item.text}":`, error);
        throw new Error(`Failed to import checklist item "${item.text}": ${error.message}`);
      }
    }
  } else {
    console.log('-> No checklist items to import');
  }

  console.log('Seed scholarship import completed successfully');
  return scholarshipIdMap;
};

/**
 * Import seed documents
 */
const importSeedDocuments = async (documents) => {
  const documentIdMap = new Map();
  
  for (const document of documents) {
    const { id, ...documentData } = document;
    const created = await createDocument(documentData);
    documentIdMap.set(id, created.id);
    console.log('Created document:', document.name);
  }
  
  return documentIdMap;
};

/**
 * Import seed templates
 */
const importSeedTemplates = async (templates) => {
  const templateIdMap = new Map();
  
  for (const template of templates) {
    const { id, ...templateData } = template;
    const created = await createTemplate(templateData);
    templateIdMap.set(id, created.id);
    console.log('Created template:', template.name);
  }
  
  return templateIdMap;
};

/**
 * Main seed database function with createdAt timestamp support
 * This function:
 * - Checks if seed data createdAt has changed
 * - On first visit: imports all seed data
 * - On createdAt change: reimports seed scholarships, preserves user data
 * - On same createdAt: does nothing
 */
const runSeedDatabase = async () => {
  try {
    console.log('=== SEED DATABASE: Starting timestamp check ===');
    console.log('Seed data loaded:', {
      createdAt: seedData?.createdAt,
      hasData: !!seedData?.data,
      scholarshipCount: seedData?.data?.scholarships?.length || 0,
      checklistItemCount: seedData?.data?.checklistItems?.length || 0
    });
    
    // Validate seed data structure
    if (!seedData) {
      console.error('Invalid seed data: seedData is null/undefined');
      throw new Error('Seed data is invalid or missing');
    }
    
    if (!seedData.createdAt) {
      console.error('Invalid seed data: createdAt field is missing');
      throw new Error('Seed data createdAt is missing');
    }
    
    if (!seedData.data || !Array.isArray(seedData.data.scholarships)) {
      console.error('Invalid seed data: scholarships array is missing', seedData.data);
      throw new Error('Seed data scholarships array is missing or invalid');
    }
    
    await deduplicateSystemScholarships();

    const allScholarships = await getAllScholarships();
    const isFirstTime = allScholarships.length === 0;
    const needsUpdate = await needsSeedUpdate();
    
    console.log('Seed check results:', {
      isFirstTime,
      needsUpdate,
      scholarshipCount: allScholarships.length,
      currentCreatedAt: await getCurrentSeedCreatedAt(),
      newCreatedAt: seedData.createdAt
    });
    
    // Only skip import if we don't need an update AND we already have data
    if (!needsUpdate && !isFirstTime) {
      console.log('=== SEED DATABASE: createdAt timestamp is up to date, skipping import ===');
      return;
    }
    
    if (isFirstTime) {
      console.log('=== SEED DATABASE: First time visit - importing all seed data ===');
    } else {
      console.log('=== SEED DATABASE: createdAt timestamp changed - updating seed data ===');
      // Delete old system scholarships before importing new ones
      await deleteSystemScholarships();
    }
    
    const { scholarships, checklistItems, documents, templates } = seedData.data;
    
    console.log('Starting seed data import:', {
      scholarships: scholarships.length,
      checklistItems: checklistItems?.length || 0,
      documents: documents?.length || 0,
      templates: templates?.length || 0
    });
    
    // Import seed data with system markers
    await importSeedScholarships(scholarships, checklistItems || []);
    
    // Only import documents and templates on first visit
    // (these aren't version-controlled to avoid overwriting user data)
    if (isFirstTime) {
      if (documents && documents.length > 0) {
        await importSeedDocuments(documents);
      } else {
        console.log('No seed documents to import');
      }
      
      if (templates && templates.length > 0) {
        await importSeedTemplates(templates);
      } else {
        console.log('No seed templates to import');
      }
    }
    
    // Only update the stored createdAt AFTER successful import
    console.log(`=== SEED DATABASE: Import successful, updating createdAt to ${seedData.createdAt} ===`);
    await setSeedCreatedAt(seedData.createdAt);
    
    // Verify import by checking the database
    const finalScholarships = await getAllScholarships();
    console.log(`=== SEED DATABASE: ${isFirstTime ? 'Import' : 'Update'} completed successfully ===`);
    console.log('Final database state:', {
      totalScholarships: finalScholarships.length,
      systemScholarships: finalScholarships.filter(s => s.createdBy === 'system').length,
      userScholarships: finalScholarships.filter(s => s.createdBy === 'user').length
    });
    
    console.log('=== SEED DATABASE: Process complete ===');
    
  } catch (error) {
    console.error('=== SEED DATABASE: ERROR ===');
    console.error('Error seeding database:', error);
    // Do NOT store the createdAt if import failed
    console.error('createdAt was NOT stored due to import failure');
    throw error;
  }
};

export const seedDatabase = async () => {
  if (seedDatabaseInFlight) {
    console.log('=== SEED DATABASE: Reusing in-flight seed operation ===');
    return seedDatabaseInFlight;
  }

  seedDatabaseInFlight = runSeedDatabase().finally(() => {
    seedDatabaseInFlight = null;
  });

  return seedDatabaseInFlight;
};

/**
 * Reset seed createdAt marker (for testing/debugging)
 * This will cause the seed data to be reimported on next reload
 */
export const resetSeedVersion = () => {
  setMetadata(SEED_CREATEDAT_KEY, null);
  console.log('Seed createdAt reset. Database will be reseeded on next reload.');
};