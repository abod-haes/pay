/* eslint-disable complexity */
/* eslint-disable no-nested-ternary */
/* eslint-disable no-unused-vars */
import React, { useState, useRef, useEffect } from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  getSortedRowModel,
  getFilteredRowModel,
} from "@tanstack/react-table";
import ClosIcon from "@assets/svgs/common/close-filter.svg";
import filterIcon from "@assets/svgs/common/setting-4.svg";
import { useTranslation } from "react-i18next";

import PaginationSelect from "./paginationSelect";
import TableSearch from "./tableSearch";

import eye from "@/assets/svgs/table/e-eye.svg";
import edit2 from "@/assets/svgs/table/edit2.svg";
import trash1 from "@assets/svgs/table/trash.svg";
import file from "@assets/svgs/table/document-download.svg";
import printer from "@/assets/svgs/table/printer.svg";
import LoadingElement from "@/components/shared/loading";
import { printBookingRow } from "@/utils/printPatientInfo";
import "./table.css";
import Card from "../card";
import { Can } from "../shared/can/can";
import { PERMISSION_ACTION } from "@/constants/constants";

export default function Table({
  data,
  columns,
  pageSize,
  pageIndex,
  onPageSizeChange,
  onPreviousPage,
  onNextPage,
  onShow,
  onEdit,
  onFile,
  onDelete,
  onPrint,
  sorting,
  pageSizeOptions = [5, 10, 20, 30, 40, 50],
  customHeader,
  hasPagination = true,
  totalPages = 1,
  onGotoPage,
  showRowActions = () => true,
  permissionGroup,
  isLoading,
  isDeleting,
  customPermission,
  onRowClick,
  tableBodyContainerStyle,
  hideMinHeigh,
  extraActions,
  // New props for enhanced functionality
  hasSearch = true,
  searchValue = "",
  onSearchChange,
  searchPlaceholder,
  // New prop for full height table
  useFullHeight = false,
  customHeight,
  // New prop to indicate if page has sticky breadcrumb
  hasStickyBreadcrumb = false,
  hideFilter = false,
  // Filter UI props
  filterElements = [],
  onResetFilters = () => {},
  customTitle,
}) {
  // State for filter collapse
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const { t, i18n } = useTranslation();
  const tableData = data;
  const isRTL = ["ar", "fa"].includes(i18n.language);

  // State for column filters
  const [activeFilters, setActiveFilters] = useState({});
  const [openFilterColumn, setOpenFilterColumn] = useState(null);
  const filterRefs = useRef({});

  // Close filter dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = event => {
      if (openFilterColumn && filterRefs.current[openFilterColumn]) {
        if (!filterRefs.current[openFilterColumn].contains(event.target)) {
          setOpenFilterColumn(null);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openFilterColumn]);

  const handlePrintRow = row => {
    if (onPrint) {
      onPrint(row);
      return;
    }

    printBookingRow(row);
  };

  const canPrintRow = row => (onPrint || row?.patientx) && showRowActions(row);

  const getPrintMenuItem = row => {
    if (!canPrintRow(row)) return null;

    return {
      label: "طباعة معلومات المريض",
      icon: <img src={printer} alt="print" />,
      onClick: () => handlePrintRow(row),
      show: true,
    };
  };

  const renderPrintAction = row => {
    if (!canPrintRow(row)) return null;

    return (
      <button
        type="button"
        onClick={e => {
          e.stopPropagation();
          handlePrintRow(row);
        }}
      >
        <img src={printer} alt="print" className="w-5 h-5 cursor-pointer" />
      </button>
    );
  };

  const renderExtraActions = row => {
    const actions = extraActions(row);
    const printMenuItem = getPrintMenuItem(row);

    if (printMenuItem && React.isValidElement(actions) && Array.isArray(actions.props?.items)) {
      return React.cloneElement(actions, {
        items: [printMenuItem, ...actions.props.items],
      });
    }

    return actions;
  };

  const renderDefaultActions = row => (
    <>
      {renderPrintAction(row)}

      {onEdit && showRowActions(row) && (
        // row.default !== 1 &&
        // row.related_to_project !== 1 &&
        // row.related_to_bill !== 1 && (
        <Can group={permissionGroup} type={customPermission || PERMISSION_ACTION.update}>
          <button
            onClick={e => {
              onEdit(row);
              e.stopPropagation();
            }}
          >
            <img src={edit2} alt="Edit" className="w-5 h-5 cursor-pointer" />
          </button>
        </Can>
      )}

      {onShow && showRowActions(row) && (
        <Can group={permissionGroup} type={customPermission || PERMISSION_ACTION.index}>
          <button
            onClick={e => {
              onShow(row);
              e.stopPropagation();
            }}
          >
            <img src={eye} alt="Show" className="w-5 h-5 cursor-pointer" />
          </button>
        </Can>
      )}

      {onFile && showRowActions(row) && (
        <Can group={permissionGroup} type={customPermission || PERMISSION_ACTION.update}>
          <button
            onClick={e => {
              onFile(row);
              e.stopPropagation();
            }}
          >
            <img src={file} alt="file" className="w-5 h-5 cursor-pointer" />
          </button>
        </Can>
      )}
      {onDelete && showRowActions(row) && (
        <Can group={permissionGroup} type={customPermission || PERMISSION_ACTION.delete}>
          <button
            type="button"
            onClick={e => {
              onDelete(row);
              e.stopPropagation();
            }}
          >
            {isDeleting ? (
              <LoadingElement size={15} />
            ) : (
              <img src={trash1} alt="Delete" className="w-5 h-5 cursor-pointer" />
            )}
          </button>
        </Can>
      )}
    </>
  );

  const table = useReactTable({
    columns: [
      ...columns,
      {
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <div className="flex justify-end gap-2">
            {extraActions ? renderExtraActions(row.original) : renderDefaultActions(row.original)}
          </div>
        ),
      },
    ],
    data: tableData,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    manualPagination: true,
    pageCount: totalPages,
    state: {
      sorting,
      pagination: { pageIndex, pageSize },
      globalFilter: searchValue,
      columnFilters: Object.entries(activeFilters).map(([id, value]) => ({
        id,
        value,
      })),
    },
    // onSortingChange,
    // onGlobalFilterChange: onSearchChange,
    ...(hasPagination && { pageCount: totalPages }),
  });

  const handelCloseFilter = () => {
    onResetFilters();
    setIsFilterOpen(false);
  };

  // Calculate dynamic height based on props
  const getCardHeight = () => {
    if (customHeight) {
      return customHeight;
    }
    if (useFullHeight) {
      if (hasStickyBreadcrumb) {
        // Navbar (70px) + BreadCrumb sticky (60px) + main padding (24px lg, 12px sm) + card padding (32px) + margin (16px)
        return "h-[calc(100vh-70px-60px-24px-32px-16px)] lg:h-[calc(100vh-70px-60px-48px-32px-16px)]";
      } else {
        // Navbar (70px) + main padding (24px lg, 12px sm) + card padding (32px) + margin (16px)
        return "h-[calc(100vh-70px-24px-32px-16px)] lg:h-[calc(100vh-70px-48px-32px-16px)]";
      }
    }
    return hideMinHeigh ? "h-full" : "min-h-[100px] h-full";
  };

  return (
    <Card otherStyle={`flex flex-col ${getCardHeight()} overflow-hidden`}>
      {/* Fixed Header Section */}
      <div className="flex-shrink-0">
        <div className="flex md:flex-row flex-col justify-between items-center">
          {/* Search Bar + Filter Button */}
          {hasSearch && (
            <div className="flex items-center gap-2">
              {/* Filter Button */}
              <TableSearch
                value={searchValue}
                onChange={onSearchChange}
                placeholder={searchPlaceholder || t("common.searchPlaceholder")}
              />
              {!hideFilter && (
                <button
                  type="button"
                  className="flex items-center border border-primary justify-center text-primary rounded-full px-4 cursor-pointer py-1 mr-2 w-[130px] hover:bg-[#e6f7fa] transition"
                  style={{ fontSize: 12, fontWeight: 500 }}
                  onClick={() => setIsFilterOpen(v => !v)}
                >
                  <img src={filterIcon} alt="search" />
                  {t("common.filter")}
                </button>
              )}
            </div>
          )}

          {customTitle}

          {hasPagination && (
            <div className="">
              <PaginationSelect
                pageSizes={pageSizeOptions}
                onPageSizeChange={onPageSizeChange}
                currentPageSize={pageSize}
                pageIndex={pageIndex}
                totalPages={totalPages}
                onGotoPage={onGotoPage}
                onPreviousPage={onPreviousPage}
                onNextPage={onNextPage}
              />
            </div>
          )}
        </div>
        {/* Filter Collapse Section */}
        {isFilterOpen && (
          <div onClick={handelCloseFilter} className="flex cursor-pointer items-center gap-2">
            <img src={ClosIcon} /> <p className="text-[12px]">{t("common.filter")}</p>
          </div>
        )}
        {isFilterOpen && (
          <div className="flex flex-wrap items-center gap-4 p-3 relative animate-fade-in">
            {filterElements.map(({ id, component }) => (
              <div className="flex-shrink-0" key={id} style={{ minWidth: "200px" }}>
                {component}
              </div>
            ))}
          </div>
        )}
        {customHeader && <div className="mb-4">{customHeader}</div>}
      </div>

      {/* Scrollable Table Section */}
      <div
        className="flex-1 table-scroll-container max-md:overflow-x-auto"
        style={tableBodyContainerStyle}
      >
        <table className="full-width-table border-separate border-spacing-y-2">
          {/* ================== Table Header ================== */}
          <thead className="bg-table-header text-[12px] rounded-lg gray-color">
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id} className="rounded-md">
                {headerGroup.headers.map((header, headerIndex) => {
                  const isActionHeader = header.id === "actions";
                  return (
                    <th
                      key={header.id}
                      className={`
                        p-4 top-0 !text-[#333333] font-normal  bg-table-header z-10
                        ${isActionHeader ? "w-[120px]" : "max-md:min-w-[150px]"}
                      `}
                      style={isActionHeader ? { minWidth: "120px", maxWidth: "120px" } : {}}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center text-[0.8rem] gap-2">
                          {header.isPlaceholder
                            ? null
                            : flexRender(header.column.columnDef.header, header.getContext())}
                        </div>
                      </div>
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>

          {/* ================== Table Body ================== */}
          <tbody className="text-gray-700 text-[16px] font-din-regular-base ">
            {isLoading ? (
              <tr>
                <td colSpan={columns.length + 1} className="p-4 h-[40vh]">
                  <div className="flex justify-center items-center">
                    <LoadingElement color="#29b4c3" />
                  </div>
                </td>
              </tr>
            ) : tableData.length === 0 ? (
              <tr>
                <td colSpan={columns.length + 1} className="p-4 h-[40vh]">
                  <div className="flex justify-center text-[1.1rem] items-center text-gray-500">
                    {t("common.noData")}
                  </div>
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map(row => (
                <tr
                  key={row.id}
                  className="transition-all ease-in-out hover:shadow-md"
                  onClick={onRowClick ? () => onRowClick(row.original) : undefined}
                  style={onRowClick ? { cursor: "pointer" } : {}}
                >
                  {row.getVisibleCells().map((cell, cellIndex) => {
                    const isActionCell = cell.column.id === "actions";
                    return (
                      <td
                        key={cell.id}
                        className={`
                          p-4 border-b text-[0.8rem] border-[#EFEFEF]
                        `}
                        style={isActionCell ? { minWidth: "120px", maxWidth: "120px" } : {}}
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
