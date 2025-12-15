// Simulates a generic API client with delay
export const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Helper to get/set data from localStorage to persist changes during session
export const getStorage = <T>(key: string, initialData: T): T => {
  const stored = localStorage.getItem(key);
  if (!stored) {
    localStorage.setItem(key, JSON.stringify(initialData));
    return initialData;
  }
  return JSON.parse(stored);
};

export const setStorage = <T>(key: string, data: T) => {
  localStorage.setItem(key, JSON.stringify(data));
};
