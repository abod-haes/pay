/* eslint-disable comma-dangle */
/* eslint-disable curly */
import React, { useMemo, useReducer } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "@hooks/useTranslation";
import { branchesActions, initialValues, branchesReducer } from "@/reducers/branches";
import Card from "@/components/card";
import BreadCrumb from "@/components/breadcrumb";
import { showSuccess } from "@/libs/react.toastify";
import { handleBackendErrors } from "@/utils/helpers";
import { useCashierQueries } from "@/apis/cashier/query";
import { useBondsQueries } from "@/apis/bonds/query";
import { apis } from "@/apis/bonds/api";
import DeleteModal from "@/components/shared/modals/deleteModal";
import VoucherTable from "@/components/voucherTable";
import { useForm } from "react-hook-form";

export default function CashierDetails() {
  const { t } = useTranslation();
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

  const [state, dispatch] = useReducer(branchesReducer, initialValues);
  const { id } = useParams();

  const { data: holidayData } = useCashierQueries.GetOne({ id });
  const { data, isLoading, refetch } = useBondsQueries.GetAll({
    per_page: state.pageSize,
    page: state.pageIndex,
    type: watch("type"),
    date_from: watch("date_from"),
    date_to: watch("date_to"),
    search: state.searchValue,
    patient_id: watch("patient_id"),
    employee_id: watch("employee_id"),
    financier_id: watch("financier_id"),
    cashier_id: { value: id },
  });

  const handelDelete = async () => {
    try {
      dispatch({ type: branchesActions.isSending, payload: true });
      const response = await apis.deleteApi({ id: state.selectedId });
      dispatch({ type: branchesActions.closeDeleteModal });
      refetch();
      showSuccess(response?.data?.message);
      dispatch({ type: branchesActions.isSending, payload: true });
    } catch (error) {
      handleBackendErrors({ error });
      dispatch({ type: branchesActions.isSending, payload: true });
    }
  };

  const handelCloseModal = () => {
    dispatch({ type: branchesActions.selectedId, payload: 0 });
    dispatch({ type: branchesActions.closeDeleteModal });
    dispatch({ type: branchesActions.openDeleteModal, payload: false });
  };

  const warehouseInfoData = useMemo(() => {
    if (!holidayData?.data) return [];

    return [
      {
        label: t("cashier.name"),
        value: holidayData.data.name || " ",
      },
      {
        label: t("cashier.initial"),
        value: holidayData.data.initial_balance || " ",
      },
      {
        label: t("voucher.total"),
        value: holidayData.data.total || " ",
      },
      {
        label: t("voucher.bonds"),
        value: holidayData.data.bonds_count || " ",
      },
    ];
  }, [holidayData, t]);

  return (
    <div>
      <BreadCrumb
        title={t("cashier.show")}
        link={"/cashier"}
        sticky={true}
        stickyTop="70px"
        isAdd
      />
      <Card otherStyle={"mb-8 !py-6"}>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:w-[50%]">
          {warehouseInfoData.map((item, index) => (
            <div key={index} className="flex flex-col gap-4">
              <p className="font-main text-accent text-[0.75rem]">{item.label}</p>
              <p className="font-main text-[#3333333] text-[0.85rem]">{item.value}</p>
            </div>
          ))}
        </div>
      </Card>
      <p className="font-main text-[1.25rem] py-6 text-primary">{t("sidebar.vouchers")}</p>

      <VoucherTable
        data={data}
        dispatch={dispatch}
        isLoading={false}
        refetch={refetch}
        state={state}
        control={control}
        reset={reset}
      />

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
    </div>
  );
}
