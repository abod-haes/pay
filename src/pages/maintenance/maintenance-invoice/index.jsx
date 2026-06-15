import { useRef } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { useTranslation } from "react-i18next";
import logo from "@assets/svgs/common/logo.svg";
import { useSettingsQueries } from "@/apis/setting/query";
import { useLocation, useParams } from "react-router-dom";
import { formatDateOrTime } from "@/utils/helpers";
import { useMaintenanceQueries } from "@/apis/maintenance/query";
const Phone = ({ className }) => <span className={className}>📞</span>;
export default function MaintenanceInvoice() {
  const { t } = useTranslation();
  const location = useLocation();

  const domain = location.state?.domain || window.location.hostname;
  const { data: dataSetting } = useSettingsQueries.GetAll({ domain_name: domain });
  const { id } = useParams();
  const { data: billData } = useMaintenanceQueries.GetOne({ id });

  const invoiceData = billData?.data?.data;

  const invoiceRef = useRef(null);

  const handleDownloadPDF = async () => {
    if (!invoiceRef.current) return;

    try {
      const element = invoiceRef.current;
      const originalStyle = element.style.cssText;

      const canvas = await html2canvas(invoiceRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        windowWidth: invoiceRef.current.scrollWidth,
        windowHeight: invoiceRef.current.scrollHeight,
        backgroundColor: "#ffffff",
        onclone: clonedDoc => {
          const clonedElement = clonedDoc.querySelector("[data-invoice-container]");
          if (clonedElement) {
            clonedElement.style.boxShadow = "none";
          }
        },
      });

      element.style.cssText = originalStyle;

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`Invoice-${invoiceData.invoiceNumber}.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
    }
  };

  const handleOpenPDFInNewTab = async () => {
    if (!invoiceRef.current) return;

    try {
      const input = invoiceRef.current;
      const canvas = await html2canvas(input, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
        onclone: clonedDoc => {
          const clonedElement = clonedDoc.querySelector("[data-invoice-container]");
          if (clonedElement) {
            clonedElement.style.boxShadow = "none";
          }
        },
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);

      // Open PDF in new tab
      const pdfBlob = pdf.output("blob");
      const blobUrl = URL.createObjectURL(pdfBlob);
      window.open(blobUrl);
    } catch (error) {
      console.error("Error generating PDF:", error);
    }
  };

  return (
    <>
      <style>{`
        @media print {
          body {
            margin: 0;
            padding: 0;
          }
          .no-print {
            display: none !important;
          }
          .print-container {
            box-shadow: none !important;
            margin: 0 !important;
            max-width: 100% !important;
          }
        }
      `}</style>

      <div className="max-w-4xl mx-auto py-4">
        {/* Action Buttons */}
        <div className="mb-4 flex justify-end gap-3 no-print">
          <button
            onClick={handleDownloadPDF}
            className="px-6 py-2 rounded-lg transition-colors flex items-center gap-2 bg-secondary cursor-pointer"
            style={{ color: "#ffffff" }}
          >
            {t("print.download")}
          </button>
          <button
            onClick={handleOpenPDFInNewTab}
            className="px-6 py-2 rounded-lg transition-colors flex items-center gap-2 cursor-pointer"
            style={{ backgroundColor: "#06b6d4", color: "#ffffff" }}
          >
            {t("print.printBill")}{" "}
          </button>
        </div>

        {/* Invoice Container */}
        <div
          ref={invoiceRef}
          data-invoice-container
          className="bg-white rounded-lg shadow-lg p-8 print-container"
          style={{
            minHeight: "320mm",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <div className="flex-grow">
            {/* Header */}
            <div
              className="flex justify-between mb-8  pb-6"
              style={{ borderBottom: "2px solid #06b6d4" }}
            >
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2 mb-2 font-main">
                  <h1 style={{ color: "#0891b2" }}>{dataSetting?.data?.company_name}</h1>
                </div>
                <p style={{ color: "#475569" }}>{dataSetting?.data?.about_us}</p>
                <p style={{ color: "#475569" }}>{dataSetting?.data?.address}</p>

                <div className="flex items-center gap-4" style={{ color: "#475569" }}>
                  <Phone className="w-4 h-4" />
                  <span dir="ltr">{dataSetting?.data?.phone_number}</span>
                </div>
              </div>
              <div className="flex flex-col justify-center items-center gap-2">
                <div className="w-50 h-30 flex items-center justify-center text-center mx-auto">
                  <img src={logo} alt="logo" className="w-full h-full object-contain" />
                </div>
                <p className="font-main text-[1.2rem]">{t("permission.title")}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-8 mb-[150px]">
              <div>
                <div className="p-4 rounded-lg" style={{ backgroundColor: "#f8fafc" }}>
                  <div className="mb-2 flex items-center gap-2">
                    <span style={{ color: "#475569" }}>{t("maintenance.type") + ":"}</span>
                    <p style={{ color: "#0f172a" }}>{invoiceData?.type}</p>
                  </div>

                  <div className="mb-2 flex items-center gap-2">
                    <span style={{ color: "#475569" }}>{t("maintenance.widget") + ":"}</span>
                    <p style={{ color: "#0f172a" }}>{invoiceData?.item}</p>
                  </div>
                </div>
              </div>

              <div>
                <div className="p-4 rounded-lg" style={{ backgroundColor: "#f8fafc" }}>
                  <div className="mb-2 flex items-center gap-2">
                    <span style={{ color: "#475569" }}>{t("maintenance.contact") + ":"}</span>
                    <p style={{ color: "#0f172a" }}>{invoiceData?.no}</p>
                  </div>

                  <div className="mb-2 flex items-center gap-2">
                    <span style={{ color: "#475569" }}>{t("maintenance.problem") + ":"}</span>
                    <p style={{ color: "#0f172a" }}>{invoiceData?.description}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end  mb-8">
              <div className="w-80">
                <div
                  className="flex justify-between py-3 px-3 rounded-lg mt-2"
                  style={{ backgroundColor: "#06b6d4", color: "#ffffff" }}
                >
                  <span>{t("maintenance.cost") + ":"}</span>
                  <span>{invoiceData?.cost}</span>
                </div>
              </div>
            </div>
          </div>
          {/* Footer */}
          <div
            className="pt-6 text-center"
            style={{ borderTop: "1px solid #e2e8f0", color: "#64748b" }}
          >
            <p>
              {t("print.text")} {dataSetting?.data?.company_name}
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
