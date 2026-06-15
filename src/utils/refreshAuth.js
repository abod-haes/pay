/**
 * أدوات لتحديث بيانات المصادقة في localStorage
 */

import { setMockAuth, clearAuth } from './mockAuth';

/**
 * تحديث بيانات المصادقة في localStorage
 */
export const refreshAuthData = () => {
  // مسح البيانات القديمة
  clearAuth();
  
  // إضافة البيانات الجديدة
  const newAuthData = setMockAuth();
  
  console.log('تم تحديث بيانات المصادقة:', newAuthData);
  
  // إعادة تحميل الصفحة لتطبيق التغييرات
  window.location.reload();
};

/**
 * مسح جميع بيانات المصادقة
 */
export const clearAllAuth = () => {
  clearAuth();
  console.log('تم مسح جميع بيانات المصادقة');
  window.location.reload();
};

/**
 * عرض بيانات المصادقة الحالية
 */
export const showCurrentAuth = () => {
  const authData = localStorage.getItem("authData");
  if (authData) {
    const parsed = JSON.parse(authData);
    console.log('بيانات المصادقة الحالية:', parsed);
    return parsed;
  } else {
    console.log('لا توجد بيانات مصادقة');
    return null;
  }
};

// إضافة الدوال إلى window للوصول إليها من console المتصفح
if (typeof window !== 'undefined') {
  window.refreshAuthData = refreshAuthData;
  window.clearAllAuth = clearAllAuth;
  window.showCurrentAuth = showCurrentAuth;
}
