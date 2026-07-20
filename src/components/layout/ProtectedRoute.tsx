import React from 'react';
import { Navigate } from 'react-router-dom';

/**
 * Properti untuk komponen ProtectedRoute
 */
interface ProtectedRouteProps {
  /** Komponen anak yang akan dirender jika pengguna berhak mengaksesnya */
  children: React.ReactNode;
  /** Daftar peran pengguna yang diperbolehkan untuk mengakses rute ini */
  allowedRoles?: string[];
}

/**
 * Komponen untuk membungkus rute yang membutuhkan autentikasi.
 * Jika pengguna belum login, akan diarahkan ke halaman login.
 * Jika peran pengguna tidak sesuai dengan allowedRoles, akan diarahkan
 * ke halaman yang sesuai dengan perannya.
 * 
 * @param {ProtectedRouteProps} props - Properti komponen
 * @returns {JSX.Element} Komponen anak atau Navigate untuk redirect
 */
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
