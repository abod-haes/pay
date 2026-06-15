import { useTranslation } from "react-i18next";
import { BondStatus } from "@/constants/constants";
const statusColors = {
  pending: "#F49A13",
  approved: "#3B925A",
};

const RenderStatus = status => {
  const { t } = useTranslation();
  const statusObj = BondStatus[status] || {};
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
