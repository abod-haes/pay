// src/pages/NotFound.jsx
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

const NotFound = () => {
  const { t } = useTranslation("");
  return (
    <div className="flex items-center justify-center h-screen bg-gray-50">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-800">404</h1>
        <p className="mt-4 text-xl text-gray-600">{t("common.404_title")}</p>
        <p className="mt-2 text-gray-500">{t("common.404_subtitle")}</p>
        <Link
          to="/"
          className="inline-block mt-6 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary transition"
        >
          {t("common.go_back")}
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
