/**
 * Firebase Configuration Placeholder
 *
 * This is a placeholder implementation for the admin module to maintain independence.
  */

// Placeholder Firebase config for admin module independence
export const db = {
  collection: () => ({
    onSnapshot: () => () => {},
    query: () => ({
      orderBy: () => ({
        limit: () => ({
          where: () => ({})
        })
      })
    })
  })
};

export const firebaseConfig = {
  // Placeholder config
};

export default db;