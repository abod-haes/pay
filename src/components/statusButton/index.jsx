import { ExaminationStatus } from "@/constants/constants";
import { useTranslation } from "react-i18next";

const statusColors = {
  booking_assigned: "#29b4c3",
  booking_cancelled: "#c3292c",
  wait: "#F49A13",
  transfer_to_doctor: "#3b5a92",
  delayed: "#C1C1C1",
};

const RenderStatus = status => {
  const { t } = useTranslation();
  const statusObj = ExaminationStatus[status] || {};
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
export default RenderStatus;
