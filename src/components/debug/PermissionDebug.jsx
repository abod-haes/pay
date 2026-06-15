import React from "react";
import { getCurrentPermissions, hasPermission } from "@/utils/mockAuth";
import { refreshAuthData, clearAllAuth } from "@/utils/refreshAuth";
import { Permissions, subPermissions } from "@/utils/helpers";

const PermissionDebug = ({ pageType = null, customTitle = null }) => {
  const permissions = getCurrentPermissions();

  // تحديد الصلاحيات المطلوبة حسب نوع الصفحة
  const getPagePermissions = () => {
    if (!pageType) return null;

    return {
      view: hasPermission(pageType, subPermissions.VIEW),
      store: hasPermission(pageType, subPermissions.STORE),
      edit: hasPermission(pageType, subPermissions.EDIT),
      delete: hasPermission(pageType, subPermissions.DELETE),
    };
  };

  const pagePermissions = getPagePermissions();

  // تحديد عنوان الصفحة
  const getPageTitle = () => {
    if (customTitle) return customTitle;

    switch (pageType) {
      case Permissions.BRANCHES:
        return "الفروع";
      case Permissions.USERS:
        return "المستخدمين";
      default:
        return "الصفحة الحالية";
    }
  };

  return (
    <div className="fixed bottom-4 end-4 bg-white border border-gray-300 rounded-lg p-4 shadow-lg max-w-sm z-50">
      <h3 className="font-bold text-sm mb-2">
        Debug: {pageType ? `صلاحيات ${getPageTitle()}` : "Permissions"}
      </h3>
      <div className="text-xs space-y-1">
        <p>
          <strong>Total permissions:</strong> {permissions.length}
        </p>

        {/* عرض صلاحيات الصفحة الحالية */}
        {pagePermissions && (
          <div className="border-t pt-2 mt-2">
            <p className="font-semibold mb-1">{getPageTitle()}:</p>
            <p>
              <strong>عرض:</strong> {pagePermissions.view ? "✅" : "❌"}
            </p>
            <p>
              <strong>إضافة:</strong> {pagePermissions.store ? "✅" : "❌"}
            </p>
            <p>
              <strong>تعديل:</strong> {pagePermissions.edit ? "✅" : "❌"}
            </p>
            <p>
              <strong>حذف:</strong> {pagePermissions.delete ? "✅" : "❌"}
            </p>
          </div>
        )}

        {/* عرض صلاحيات عامة إذا لم يتم تحديد نوع الصفحة */}
        {!pageType && (
          <>
            <p>
              <strong>Branches View:</strong> {hasPermission("branches", "view") ? "✅" : "❌"}
            </p>
            <p>
              <strong>Branches Edit:</strong> {hasPermission("branches", "edit") ? "✅" : "❌"}
            </p>
            <p>
              <strong>Branches Delete:</strong> {hasPermission("branches", "delete") ? "✅" : "❌"}
            </p>
            <p>
              <strong>Users View:</strong> {hasPermission("users", "view") ? "✅" : "❌"}
            </p>
            <p>
              <strong>Users Edit:</strong> {hasPermission("users", "edit") ? "✅" : "❌"}
            </p>
            <p>
              <strong>Users Delete:</strong> {hasPermission("users", "delete") ? "✅" : "❌"}
            </p>
          </>
        )}

        <p>
          <strong>Environment:</strong> {process.env.NODE_ENV}
        </p>
      </div>

      <div className="mt-3 space-y-2">
        <button
          onClick={refreshAuthData}
          className="w-full px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
        >
          تحديث الصلاحيات
        </button>
        <button
          onClick={clearAllAuth}
          className="w-full px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600"
        >
          مسح الصلاحيات
        </button>
      </div>

      <details className="mt-2">
        <summary className="text-xs cursor-pointer">Show all permissions</summary>
        <div className="mt-1 text-xs max-h-32 overflow-y-auto">
          {permissions.map((perm, index) => (
            <div key={index} className="text-gray-600">
              {perm.group}.{perm.type}
            </div>
          ))}
        </div>
      </details>
    </div>
  );
};

export default PermissionDebug;
