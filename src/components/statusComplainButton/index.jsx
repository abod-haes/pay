import { ComplaintsStatus } from "@/constants/constants";
import { useTranslation } from "react-i18next";

const statusColors = {
  wait: "#F49A13",
  done: "#3B5A92",
  canceled: "#C3292C",
};

const RenderComplainStatus = ({ status }) => {
  const { t } = useTranslation();
  const statusObj = ComplaintsStatus[status] || {};
  const bg = statusColors[status] || "#F49A13";
  const text = statusObj.label ? t(statusObj.label) : status;

  return (
    <div
      style={{
        background: bg,
        borderRadius: 4,
        color: "#fff",
        fontSize: "0.75rem",
        display: "inline-block",
        minWidth: 100,
        textAlign: "center",
        padding: 6,
      }}
    >
      {text}
    </div>
  );
};

export default RenderComplainStatus;
