import React from 'react';
import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');
  
  if (!token || !userStr) {
    // Jika tidak ada token/user, lempar ke halaman login
    return <Navigate to="/auth" replace />;
  }

  try {
    const user = JSON.parse(userStr);
    
    // Jika ada allowedRoles dan role user tidak termasuk di dalamnya, redirect
    if (allowedRoles && !allowedRoles.includes(user.role)) {
      // Jika admin/operator tersesat ke page general
      if (user.role === 'admin' || user.role === 'operator') {
        return <Navigate to="/operator" replace />;
      }
      // Jika student/teacher tersesat ke page operator
      return <Navigate to="/general" replace />;
    }
  } catch (err) {
    // Jika error parsing JSON, buang ke login
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
