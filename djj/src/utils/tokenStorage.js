const ACCESS_TOKEN_KEY = 'djj_access_token';
const REFRESH_TOKEN_KEY = 'djj_refresh_token';
const USER_KEY = 'djj_user_data';

export const tokenStorage = {
  getAccessToken: () => localStorage.getItem(ACCESS_TOKEN_KEY),
  setAccessToken: (token) => localStorage.setItem(ACCESS_TOKEN_KEY, token),
  
  getRefreshToken: () => localStorage.getItem(REFRESH_TOKEN_KEY),
  setRefreshToken: (token) => localStorage.setItem(REFRESH_TOKEN_KEY, token),
  
  getUser: () => {
    const data = localStorage.getItem(USER_KEY);
    return data ? JSON.parse(data) : null;
  },
  setUser: (user) => localStorage.setItem(USER_KEY, JSON.stringify(user)),
  
  clear: () => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },
};
