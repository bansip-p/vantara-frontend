export function getCurrentUser() {
  return JSON.parse(localStorage.getItem('vantara_user') || 'null');
}

export function hasRole(...allowedRoles) {
  const user = getCurrentUser();
  if (!user) return false;
  return allowedRoles.includes(user.role);
}