// Helper to get auth token properly
export function getAuthToken() {
  const token = localStorage.getItem("token");
  if (!token) {
    console.warn('No token found in localStorage');
    return null;
  }
  return token;
};