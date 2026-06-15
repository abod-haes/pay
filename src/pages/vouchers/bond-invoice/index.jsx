/* eslint-disable indent */
/* eslint-disable no-nested-ternary */

import { useRef } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { useTranslation } from "react-i18next";
import logo from "@assets/svgs/common/logo.svg";
import { useSettingsQueries } from "@/apis/setting/query";
import { useLocation, useParams } from "react-router-dom";
import { useBondsQueries } from "@/apis/bonds/query";
import { formatDateOrTime } from "@/utils/helpers";
const Phone = ({ className }) => <span className={className}>📞</span>;

export default function BondInvoice() {
  const { t } = useTranslation();
  const location = useLocation();

  const domain = location.state?.domain || window.location.hostname;
  const { data: dataSetting } = useSettingsQueries.GetAll({ domain_name: domain });
  const { id } = useParams();
  const { data: billData } = useBondsQueries.GetOne({ id });

  const invoiceData = billData?.data;
  const details = invoiceData?.details || [];
  const total = parseFloat(invoiceData?.total || 0);
  const discountValue = parseFloat(invoiceData?.discount_value || 0);
  const discountType = invoiceData?.discount_type;

  let priceAfterDiscount = total;

  if (discountType === "amount") {
    priceAfterDiscount = total - discountValue;
  } else if (discountType === "percentage") {
    priceAfterDiscount = total - total * (discountValue / 100);
  }

  const invoiceRef = useRef(null);

  const handleDownloadPDF = async () => {
    if (!invoiceRef.current) {
      return;
    }

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
    if (!invoiceRef.current) {
      return;
    }

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
            {t("download_voucher")}
          </button>
          <button
            onClick={handleOpenPDFInNewTab}
            className="px-6 py-2 rounded-lg transition-colors flex items-center gap-2 cursor-pointer"
            style={{ backgroundColor: "#06b6d4", color: "#ffffff" }}
          >
            {t("print-voucher")}{" "}
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
                <p className="font-main text-[1.2rem]">
                  {invoiceData?.bond_group === "financier_bond"
                    ? t("print.financier")
                    : invoiceData?.bond_group === "general_pay_bond"
                    ? t("bond.generalPay")
                    : invoiceData?.bond_group === "booking_bond"
                    ? t("bond.booking")
                    : invoiceData?.bond_group === "salary_bond"
                    ? t("print.salary")
                    : t("bond.invoice")}
                </p>
              </div>
            </div>
            {invoiceData?.bond_group === "booking_bond" ? (
              <div className="grid grid-cols-2 gap-8 mb-[150px]">
                <div>
                  <div className="p-4 rounded-lg" style={{ backgroundColor: "#f8fafc" }}>
                    <div className="mb-2 flex items-center gap-2">
                      <span style={{ color: "#475569" }}>{`${t("booking.patient")}:`}</span>
                      <p style={{ color: "#0f172a" }}>{invoiceData?.patient?.full_name}</p>
                    </div>
                    <div className="mb-2 flex items-center gap-2">
                      <span style={{ color: "#475569" }}>{`${t("common.address")}:`}</span>
                      <p style={{ color: "#0f172a" }}>{invoiceData?.patient?.address}</p>
                    </div>
                    <div className="mb-2 flex items-center gap-2">
                      <span style={{ color: "#475569" }}>{`${t("common.phone-number")}:`}</span>
                      <p style={{ color: "#0f172a" }}>
                        {`${
                          invoiceData?.patient?.first_phone_number_country_code +
                          invoiceData?.patient?.first_phone_number
                        }+`}
                      </p>
                    </div>
                    <div className="mb-2 flex items-center gap-2">
                      <span style={{ color: "#475569" }}>{`${t("delayed.gender")}:`}</span>
                      <p style={{ color: "#0f172a" }}>
                        {invoiceData?.patient?.gender === "female"
                          ? t("home.female")
                          : t("home.men")}
                      </p>
                    </div>
                    {/* <div className="mb-2 flex items-center gap-2">
                      <span style={{ color: "#475569" }}>{t("voucher.discount_type") + ":"}</span>
                      <p style={{ color: "#0f172a" }}>
                        {invoiceData?.discount_type === "amount"
                          ? t("amount")
                          : t("employee.percentage")}
                      </p>
                    </div>
                    <div className="mb-2 flex items-center gap-2">
                      <span style={{ color: "#475569" }}>{t("voucher.discount_value") + ":"}</span>
                      <p style={{ color: "#0f172a" }}>{invoiceData?.discount_value}</p>
                    </div> */}
                  </div>
                </div>

                <div>
                  <div className="p-4 rounded-lg" style={{ backgroundColor: "#f8fafc" }}>
                    <div className="mb-2 flex items-center gap-2">
                      <span style={{ color: "#475569" }}>{`${t("voucher.no")}:`}</span>
                      <p style={{ color: "#0f172a" }}>{invoiceData?.no}</p>
                    </div>
                    <div className="mb-2 flex items-center gap-2">
                      <span style={{ color: "#475569" }}>{`${t("print.date")}:`}</span>
                      <p style={{ color: "#0f172a" }}>
                        {formatDateOrTime({ input: invoiceData?.date, type: "date" })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-8 mb-[150px]">
                <div>
                  <div className="p-4 rounded-lg" style={{ backgroundColor: "#f8fafc" }}>
                    {invoiceData?.bond_group === "financier_bond" && (
                      <div className="mb-2 flex items-center gap-2">
                        <span style={{ color: "#475569" }}>{`${t("print.sponsor")}:`}</span>
                        <p style={{ color: "#0f172a" }}>{invoiceData?.financier?.full_name}</p>
                      </div>
                    )}
                    {invoiceData?.bond_group === "financier_bond" && (
                      <div className="mb-2 flex items-center gap-2">
                        <span style={{ color: "#475569" }}>{`${t("voucher.statue")}:`}</span>
                        <p style={{ color: "#0f172a" }}>{invoiceData?.notes}</p>
                      </div>
                    )}
                    {invoiceData?.bond_group === "financier_bond" && (
                      <div className="mb-2 flex items-center gap-2">
                        <span style={{ color: "#475569" }}>{`${t("common.notes")}:`}</span>
                        <p style={{ color: "#0f172a" }}>{invoiceData?.description || "-"}</p>
                      </div>
                    )}
                    {invoiceData?.bond_group === "invoice_bond" && (
                      <div className="mb-2 flex items-center gap-2">
                        <span style={{ color: "#475569" }}>{`${t("print.billNo")}:`}</span>
                        <p style={{ color: "#0f172a" }}>{invoiceData?.bill?.no}</p>
                      </div>
                    )}
                    {invoiceData?.bond_group === "invoice_bond" && (
                      <div className="mb-2 flex items-center gap-2">
                        <span style={{ color: "#475569" }}>{`${t("print.importer")}:`}</span>
                        <p style={{ color: "#0f172a" }}>
                          {invoiceData?.bill?.warehouse?.vendor?.full_name || "-"}
                        </p>
                      </div>
                    )}
                    {invoiceData?.bond_group === "salary_bond" && (
                      <div className="mb-2 flex items-center gap-2">
                        <span style={{ color: "#475569" }}>{`${t("employee.name")}:`}</span>
                        <p style={{ color: "#0f172a" }}>{invoiceData?.user?.full_name}</p>
                      </div>
                    )}

                    {invoiceData?.bond_group === "salary_bond" && (
                      <div className="mb-2 flex items-center gap-2">
                        <span style={{ color: "#475569" }}>{`${t("common.address")}:`}</span>
                        <p style={{ color: "#0f172a" }}>{invoiceData?.user?.address}</p>
                      </div>
                    )}
                    {invoiceData?.bond_group === "salary_bond" && (
                      <div className="mb-2 flex items-center gap-2">
                        <span style={{ color: "#475569" }}>{`${t("common.phone-number")}:`}</span>
                        <p style={{ color: "#0f172a" }}>
                          {`${invoiceData?.user?.country_code + invoiceData?.user?.phone_number}+`}
                        </p>
                      </div>
                    )}
                    {invoiceData?.bond_group === "general_pay_bond" && (
                      <>
                        <div className="mb-2 flex items-center gap-2">
                          <span style={{ color: "#475569" }}>{`${t("voucher.no")}:`}</span>
                          <p style={{ color: "#0f172a" }}>{invoiceData?.no}</p>
                        </div>
                        <div className="mb-2 flex items-center gap-2">
                          <span style={{ color: "#475569" }}>{`${t("print.date")}:`}</span>
                          <p style={{ color: "#0f172a" }}>
                            {formatDateOrTime({ input: invoiceData?.date, type: "date" })}
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <div>
                  {invoiceData?.bond_group !== "general_pay_bond" && (
                    <div className="p-4 rounded-lg" style={{ backgroundColor: "#f8fafc" }}>
                      <div className="mb-2 flex items-center gap-2">
                        <span style={{ color: "#475569" }}>{`${t("voucher.no")}:`}</span>
                        <p style={{ color: "#0f172a" }}>{invoiceData?.no}</p>
                      </div>
                      <div className="mb-2 flex items-center gap-2">
                        <span style={{ color: "#475569" }}>{`${t("print.date")}:`}</span>
                        <p style={{ color: "#0f172a" }}>
                          {formatDateOrTime({ input: invoiceData?.date, type: "date" })}
                        </p>
                      </div>

                      {invoiceData?.bond_group === "salary_bond" && (
                        <div className="mb-2 flex items-center gap-2">
                          <span style={{ color: "#475569" }}>{`${t("common.notes")}:`}</span>
                          <p style={{ color: "#0f172a" }}>{invoiceData?.description}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
            <div className="flex justify-end  mb-8">
              <div className="w-80">
                {invoiceData?.bond_group === "booking_bond" ? (
                  <>
                    <div className="flex justify-between py-2">
                      <span style={{ color: "#475569" }}> {`${t("print.total")}:`}</span>
                      <span style={{ color: "#0f172a" }}>{invoiceData?.total}</span>
                    </div>

                    <div
                      className="flex justify-between py-2"
                      style={{ borderBottom: "1px solid #e2e8f0" }}
                    >
                      <span style={{ color: "#475569" }}>{`${t("voucher.discount_value")}:`}</span>
                      <span style={{ color: "#0f172a" }}>{invoiceData?.discount_value}</span>
                    </div>

                    <div
                      className="flex justify-between py-3 px-3 rounded-lg mt-2"
                      style={{ backgroundColor: "#06b6d4", color: "#ffffff" }}
                    >
                      <span>{`${t("print.net")}:`}</span>
                      <span>{priceAfterDiscount.toFixed(2)}</span>
                    </div>
                  </>
                ) : (
                  <div
                    className="flex justify-between py-3 px-3 rounded-lg mt-2"
                    style={{ backgroundColor: "#06b6d4", color: "#ffffff" }}
                  >
                    <span>{`${t("print.total")}:`}</span>
                    <span>{invoiceData?.total}</span>
                  </div>
                )}
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
