// Utility to clear localStorage data
export const clearLocalStorage = () => {
  try {
    // Note: Wallet data is now stored in database, not localStorage
    // This function is kept for potential future use with other localStorage data
    
    console.log('localStorage clear function called (wallet data now in database)');
    return true;
  } catch (error) {
    console.error('Error clearing localStorage:', error);
    return false;
  }
};

// Clear localStorage on import (for development)
if (process.env.NODE_ENV === 'development') {
  // Uncomment the line below to auto-clear localStorage on page load
  // clearLocalStorage();
}
