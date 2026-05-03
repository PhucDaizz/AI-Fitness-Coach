import { jwtDecode } from 'jwt-decode';

export const getDecodedToken = (token) => {
  try {
    return jwtDecode(token);
  } catch (error) {
    return null;
  }
};

export const getUserRole = (token) => {
  const decoded = getDecodedToken(token);
  if (!decoded) return null;

  // Handling different potential role claim keys
  return (
    decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || decoded.role || null
  );
};

export const isAdmin = (token) => {
  const role = getUserRole(token);
  return role === 'SysAdmin' || role === 'Admin';
};
