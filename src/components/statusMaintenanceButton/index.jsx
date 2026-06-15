import { useTranslation } from "react-i18next";
import { maintenanceStatus } from "@/constants/constants";
const statusColors = {
  done: "#29b4c3",
  waiting: "#F49A13",
  in_progress: "#3B5A92",
};

const RenderMainteneceStatus = ({ status }) => {
  const { t } = useTranslation();
  const statusObj = maintenanceStatus[status] || {};
  const bg = statusColors[status] || "#29b4c3";
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
export default RenderMainteneceStatus;
