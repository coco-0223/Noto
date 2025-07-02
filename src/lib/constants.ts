// This file contains the names of the Firestore collections.
// To "reset" all application data, you can change the DATA_VERSION_SUFFIX.
// This will cause the app to read from and write to a new set of collections,
// effectively starting from a clean slate. Your old data will remain in
// Firestore under the old collection names.

const DATA_VERSION_SUFFIX = '_v2';

export const CONVERSATIONS = 'conversations' + DATA_VERSION_SUFFIX;
export const MESSAGES = 'messages'; // Sub-collection name, can stay the same.
export const MEMORIES = 'memories' + DATA_VERSION_SUFFIX;
export const REMINDERS = 'reminders' + DATA_VERSION_SUFFIX;
export const APP_STATE = 'app_state'; // This can be shared across versions.
