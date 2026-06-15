/* eslint-disable no-nested-ternary */
/* eslint-disable complexity */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "@hooks/useTranslation";
import { useForm, useWatch } from "react-hook-form";
import Input from "@/components/shared/input";
import SelectField from "@/components/shared/select";
import SecondaryButton from "@/components/shared/secondaryButton";
import { showSuccess } from "@/libs/react.toastify";
import Modal from "../shared/modals/modal";
import Card from "../card";
import PrimaryButton from "../shared/primaryButton";
import useMaterials from "@/hooks/useMaterial";
import { apis } from "@/apis/booking/material/api";
import { handleBackendErrors } from "@/utils/helpers";
import useWhereHouse from "@/hooks/useWhereHouse";
import LoadingElement from "../shared/loading";

export default function ActionItem({
  isOpen,
  onClose,
  cancelText,
  selectedId,
  selectedToDelete,
  editData,
}) {
  const { t } = useTranslation();
  const isEdit = editData?.id;

  const {
    control,
    handleSubmit,
    setError,
    watch,
    reset,
    setValue,
    formState: { isSubmitting, errors },
  } = useForm({
    defaultValues: {
      material_id: null,
      selling_price: null,
      quantity: null,
      warehouse_id: null,
    },
  });
  const { isLoadingEmployees, items } = useMaterials({
    enable: !!watch("warehouse_id"),
    whereHouseId: watch("warehouse_id")?.value,
  });
  const { isLoadingEmployees: isLoadingWhereHouse, items: whereHouse } = useWhereHouse({});

  const onSubmit = async data => {
    try {
      const dataToSend = {
        material_id: data.material_id.value,
        warehouse_id: data.warehouse_id.value,
        selling_price: data.selling_price,
        quantity: data.quantity,
      };
      if (isEdit) {
        const response = await apis.update({
          payload: dataToSend,
          id: selectedId,
          materialId: editData?.id,
        });
        showSuccess(response?.data?.message);
      } else {
        const response = await apis.add({ payload: dataToSend, id: selectedId });
        showSuccess(response?.data?.message);
      }
      onClose();
    } catch (error) {
      handleBackendErrors({ error, setError });
    }
  };

  const isEditing = useRef(true);

  useEffect(() => {
    const selected = items?.find(item => item.value === watch("material_id")?.value);
    if (watch("material_id")?.value && !isEditing?.current) {
      setValue("selling_price", Number(selected?.selling_price) || 0);
    }
  }, [watch("material_id")?.value]);

  useEffect(() => {
    if (isEdit && selectedToDelete && editData) {
      reset({
        material_id: { label: editData.name, value: editData.id },
        warehouse_id: { label: editData.warehouse.name, value: editData.warehouse.id },
        quantity: Number(editData.quantity),
        selling_price: Number(editData.price).toFixed(2),
      });
    }
  }, [isEdit, editData]);

  const selectedWarehouse = useWatch({
    control,
    name: "warehouse_id",
  });
  const prevWarehouseId = useRef(null);

  useEffect(() => {
    const currentWarehouseId = selectedWarehouse?.value;

    // Run only when warehouse actually changes
    if (
      currentWarehouseId &&
      currentWarehouseId !== prevWarehouseId.current &&
      !isLoadingEmployees
    ) {
      // update ref
      prevWarehouseId.current = currentWarehouseId;

      if (isEditing.current) {
        isEditing.current = false;
      } else {
        setValue("material_id", null);
        setValue("selling_price", null);
      }
    }
  }, [selectedWarehouse, isLoadingEmployees]);

  return (
    <div>
      <Modal open={isOpen}>
        <Card>
          <p className="font-main mb-4 text-[1.2rem] my-4">
            {isEdit ? t("item.update") : t("item.add")}
          </p>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <SelectField
                name="warehouse_id"
                control={control}
                options={whereHouse}
                loading={isLoadingWhereHouse}
                placeholder={t("warehouse.name")}
                error={errors?.whereHouse?.message}
              />
              <SelectField
                name="material_id"
                control={control}
                options={items}
                loading={isLoadingEmployees}
                placeholder={t("hair.item-name")}
                error={errors?.material_id?.message}
              />
              <Input
                name="quantity"
                control={control}
                placeholder={t("hair.quantity")}
                error={errors?.quantity?.message}
                isNumberWithCommas
              />
              <Input
                name="selling_price"
                control={control}
                placeholder={t("hair.sell-price")}
                error={errors?.selling_price?.message}
                isNumberWithCommas
              />
            </div>
            <div className="flex items-center  gap-4">
              <PrimaryButton
                text={
                  isSubmitting ? (
                    <LoadingElement size={18} />
                  ) : isEdit ? (
                    t("common.save")
                  ) : (
                    t("common.add")
                  )
                }
                type="submit"
              />
              <SecondaryButton onClick={onClose} text={cancelText} type="button" />
            </div>
          </form>
        </Card>
      </Modal>
    </div>
  );
}
