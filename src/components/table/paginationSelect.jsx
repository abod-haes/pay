/* eslint-disable complexity */
/* eslint-disable comma-dangle */
import React from "react";
import rightArrow from "@assets/svgs/table/rightArrow.svg";
import leftArrow from "@assets/svgs/table/leftArrow.svg";
import { useTranslation } from "react-i18next";
import "./pagination.css";

export default function PaginationSelect({
  pageIndex,
  totalPages,
  onGotoPage,
  onPreviousPage,
  onNextPage,
}) {
  const { i18n } = useTranslation();

  const renderPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    let startPage, endPage;

    if (totalPages <= maxVisiblePages) {
      startPage = 1;
      endPage = totalPages;
    } else {
      const half = Math.floor(maxVisiblePages / 2);
      if (pageIndex + 1 <= half + 1) {
        startPage = 1;
        endPage = maxVisiblePages;
      } else if (pageIndex + 1 >= totalPages - half) {
        startPage = totalPages - maxVisiblePages + 1;
        endPage = totalPages;
      } else {
        startPage = pageIndex + 1 - half;
        endPage = pageIndex + 1 + half;
      }
    }

    if (startPage > 1) {
      pages.push(
        <button
          key={1}
          onClick={() => onGotoPage(1)}
          className={`pagination-button ${pageIndex === 1 ? "active" : ""}`}
        >
          1
        </button>
      );
      if (startPage > 2) {
        pages.push(
          <span key="start-ellipsis" className="pagination-ellipsis">
            ...
          </span>
        );
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => onGotoPage(i)}
          className={`pagination-button ${pageIndex === i ? "active" : ""}`}
        >
          {i}
        </button>
      );
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push(
          <span key="end-ellipsis" className="pagination-ellipsis">
            ...
          </span>
        );
      }
      pages.push(
        <button
          key={totalPages}
          onClick={() => onGotoPage(totalPages + 1)}
          className={`pagination-button ${pageIndex + 1 === totalPages ? "active" : ""}`}
        >
          {totalPages}
        </button>
      );
    }

    return pages;
  };
  const isRTL = ["ar", "fa"].includes(i18n.language);
  return (
    <div className={"pagination-container"}>
      <div className="pagination-wrapper">
        <button onClick={onPreviousPage} disabled={pageIndex === 1} className="pagination-button">
          <img
            src={isRTL ? leftArrow : rightArrow}
            alt="Previous"
            className={`pagination-arrow ${isRTL ? "right" : "left"}`}
          />
        </button>

        {renderPageNumbers()}

        <button
          onClick={onNextPage}
          disabled={pageIndex >= totalPages}
          className="pagination-button"
        >
          <img
            src={isRTL ? rightArrow : leftArrow}
            alt="Next"
            className={`pagination-arrow ${isRTL ? "left" : "right"}`}
          />
        </button>
      </div>
    </div>
  );
}
