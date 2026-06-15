import { useTranslation } from "react-i18next";
const RenderStatus = statusObj => {
  const { t } = useTranslation();
  if (!statusObj) return null;

  return (
    <div
      style={{
        background: statusObj.color,
        borderRadius: 4,
        color: "#fff",
        fontSize: "0.75rem",
        display: "inline-block",
        minWidth: 100,
        textAlign: "center",
        padding: 6,
      }}
    >
      {statusObj.name}
    </div>
  );
};

export default RenderStatus;
