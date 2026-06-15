/* eslint-disable comma-dangle */
import React, { useReducer, useState } from "react";
import BreadCrumb from "@/components/breadcrumb";
import { useTranslation } from "react-i18next";
import { branchesActions, initialValues, branchesReducer } from "@/reducers/branches";
import { useNavigate } from "react-router-dom";
import { hasPermissionFunction } from "@/utils/helpers";
import DeleteModal from "@/components/shared/modals/deleteModal";
import { useBondsQueries } from "@/apis/bonds/query";
import { apis } from "@/apis/bonds/api";
import { showSuccess } from "@/libs/react.toastify";
import { handleBackendErrors } from "@/utils/helpers";
import { PERMISSION_ACTION, PERMISSION_GROUP } from "@/constants/constants";
import { useForm } from "react-hook-form";
import Modal from "@/components/shared/modals/modal";
import PrimaryButton from "@/components/shared/primaryButton";
import useBookingBondTypes from "@/hooks/useBookingTypes";
import QiCardModal from "@/components/shared/modals/qiCardModal";
import { Can } from "@/components/shared/can/can";
import VoucherTable from "@/components/voucherTable";

export default function Vouchers() {
  const { t } = useTranslation();
  const [state, dispatch] = useReducer(branchesReducer, initialValues);
  const navigate = useNavigate();
  const { control, watch, reset } = useForm({
    defaultValues: {
      type: null,
      date_from: "",
      date_to: "",
      financier_id: null,
      employee_id: null,
      patient_id: null,
    },
  });
  const [isAddModalOpen, setAddModalOpen] = React.useState(false);
  const [isQiCardModalOpen, setQiCardModalOpen] = useState(false);
  const [selectedQiCardRow, setSelectedQiCardRow] = useState(null);
  const [isQiCardSubmitting, setIsQiCardSubmitting] = useState(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const { data, isLoading, refetch } = useBondsQueries.GetAll({
    per_page: state.pageSize,
    page: state.pageIndex,
    type: watch("type"),
    date_from: watch("date_from"),
    date_to: watch("date_to"),
    cashier_id: "",
    search: state.searchValue,
    patient_id: watch("patient_id"),
    employee_id: watch("employee_id"),
    financier_id: watch("financier_id"),
  });

  const { bookingBondTypes } = useBookingBondTypes();

  const handelDelete = async () => {
    try {
      dispatch({ type: branchesActions.isSending, payload: true });
      const response = await apis.deleteApi({ id: state.selectedId });
      dispatch({ type: branchesActions.closeDeleteModal });
      refetch();
      showSuccess(response?.data?.message);
      dispatch({ type: branchesActions.isSending, payload: false });
    } catch (error) {
      handleBackendErrors({ error });
      dispatch({ type: branchesActions.isSending, payload: 0 });
    }
  };

  const handelCloseModal = () => {
    dispatch({ type: branchesActions.selectedId, payload: 0 });
    dispatch({ type: branchesActions.closeDeleteModal });
    dispatch({ type: branchesActions.isDeleteModalOpen, payload: false });
  };

  const handleQiCardSubmit = async data => {
    try {
      setIsQiCardSubmitting(true);
      const response = await apis.payQiCard({ id: selectedQiCardRow.id, date: data.date });
      showSuccess(response?.data?.message);
      setQiCardModalOpen(false);
      refetch();
    } catch (error) {
      handleBackendErrors({ error });
    } finally {
      setIsQiCardSubmitting(false);
    }
  };

  return (
    <>
      <div className="w-[80dvw]">
        <BreadCrumb
          title={t("sidebar.vouchers")}
          link={"/accounts/vouchers"}
          onClick={() => setAddModalOpen(true)}
          sticky={true}
          stickyTop="70px"
          buttonText={t("common.add")}
          hideBrimaryButton={
            !hasPermissionFunction({
              group: [
                PERMISSION_GROUP.BOOKING_BOND,
                PERMISSION_GROUP.SALARY_BOND,
                PERMISSION_GROUP.FINANCIER_BOND,
                PERMISSION_GROUP.GENERAL_BOND,
                PERMISSION_GROUP.INVOICE_BOND,
              ],
              type: PERMISSION_ACTION.create,
            })
          }
        />
        <VoucherTable
          data={data}
          dispatch={dispatch}
          isLoading={isLoading}
          refetch={refetch}
          reset={reset}
          setQiCardModalOpen={setQiCardModalOpen}
          setSelectedQiCardRow={setSelectedQiCardRow}
          state={state}
          control={control}
          showQICardOprion
        />
      </div>
      {state.isDeleteModalOpen && (
        <DeleteModal
          isOpen={state.isDeleteModalOpen}
          onClose={handelCloseModal}
          onDelete={handelDelete}
          title={t("voucher.delete")}
          warning={t("package.warning")}
          deleteText={t("voucher.delete")}
          cancelText={t("common.cancel2")}
          isSubmitting={state.isSending}
        />
      )}
      {isAddModalOpen && (
        <Modal open={isAddModalOpen}>
          <div className="bg-white w-[400px] rounded-xl shadow-lg p-6 flex flex-col gap-6 relative">
            <button
              onClick={() => setAddModalOpen(false)}
              className="absolute top-4 left-4 text-gray-500 hover:text-gray-700 text-xl"
            >
              ✕
            </button>
            <h3 className="text-md font-bold text-center mb-4">{t("voucher.add")}</h3>
            <div className="flex flex-col gap-4">
              {bookingBondTypes.map(type => {
                return (
                  <Can key={type.value} group={type.permission.group} type={type.permission.type}>
                    <PrimaryButton
                      key={type.value}
                      text={type.label}
                      onClick={() => {
                        navigate("/accounts/vouchers/add", { state: type });
                        setAddModalOpen(false);
                      }}
                    />
                  </Can>
                );
              })}
            </div>
          </div>
        </Modal>
      )}
      {isQiCardModalOpen && (
        <QiCardModal
          isOpen={isQiCardModalOpen}
          onClose={() => setQiCardModalOpen(false)}
          onSubmit={handleQiCardSubmit}
          isSubmitting={isQiCardSubmitting}
        />
      )}
    </>
  );
}
