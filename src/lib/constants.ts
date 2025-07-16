// This file contains the names of the Firestore collections.
// To "reset" all application data, you can change the DATA_VERSION_SUFFIX.
// This will cause the app to read from and write to a new set of collections,
// effectively starting from a clean slate. Your old data will remain in
// Firestore under the old collection names.

const DATA_VERSION_SUFFIX = '_v1';

// Main Collections
export const LOBBIES = 'lobbies' + DATA_VERSION_SUFFIX;
export const NURSES = 'nurses' + DATA_VERSION_SUFFIX;

// Sub-collections
export const PATIENTS = 'patients';
export const ENTRIES = 'entries';
export const MEMBERS = 'members';
