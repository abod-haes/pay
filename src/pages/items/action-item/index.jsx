/* eslint-disable complexity */
/* eslint-disable no-trailing-spaces */
/* eslint-disable indent */
/* eslint-disable comma-dangle */
import React, { useEffect, useState, useMemo } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useTranslation } from "@hooks/useTranslation";
import { useForm } from "react-hook-form";
import Input from "@/components/shared/input";

import SelectField from "@/components/shared/select";
import Card from "@/components/card";
import BreadCrumb from "@/components/breadcrumb";
import PrimaryButton from "@/components/shared/primaryButton";
import SecondaryButton from "@/components/shared/secondaryButton";
import { showSuccess } from "@/libs/react.toastify";
import { decryptId } from "@/utils/helpers";
import CustomFlexButtons from "@/components/shared/CustomFlexButtons";
import { useWarehouseQueries } from "@/apis/warehouse/query";
import { useUnitQueries } from "@/apis/unit/query";
import { yupResolver } from "@hookform/resolvers/yup";
import { handleBackendErrors } from "@/utils/helpers";
import * as yup from "yup";
import { apis } from "@/apis/items/api";
import { useMaterialQueries } from "@/apis/items/query";
import { useSearchParams } from "react-router-dom";

export default function ActionItem() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { id } = useParams();
  const location = useLocation();
  const query = new URLSearchParams(location.search);

  // حالة إضافة
  const isAdd = location.pathname.endsWith("/add");

  // حالة عرض
  const isShow = query.get("show") === "true";
  const [searchParams] = useSearchParams();
  const warehouseId = searchParams.get("warehouse_id");
  const warehouseName = searchParams.get("warehouse_name");

  // حالة تعديل
  // const id = encryptedId ? decryptId(encryptedId) : null;
  const isEdit = Boolean(id);
  const { data } = useMaterialQueries.GetOne({ id });
  const { data: warehouseData, isLoading: isLoadingWarehouse } = useWarehouseQueries.GetAll({
    per_page: "",
    page: "",

    city_id: "",
  });
  const { data: unitData, isLoading: isLoadingUnit } = useUnitQueries.GetAll({
    per_page: "",
    page: "",
  });
  const schema = yup.object().shape({
    name: yup.string().required(t("validation.required")),
    warehouse_id: yup
      .object()
      .shape({
        label: yup.string().required(),
        value: yup.number().required(),
      })
      .required(t("validation.required")),
    purchase_price: yup.string().required(t("validation.required")),
    selling_price: yup.string().required(t("validation.required")),
    low_stock_alert: yup.string().required(t("validation.required")),
    initial_quantity: yup.string().required(t("validation.required")),
    unit_id: yup
      .object()
      .shape({
        label: yup.string().required(),
        value: yup.number().required(),
      })
      .required(t("validation.required")),
  });

  const warehouseOptions = useMemo(
    () =>
      warehouseData?.data?.map(role => ({
        label: role.name,
        value: role.id,
      })) || [],
    [warehouseData?.data]
  );
  const unitOptions = useMemo(
    () =>
      unitData?.data?.map(role => ({
        label: role.name,
        value: role.id,
      })) || [],
    [unitData?.data]
  );
  const {
    control,

    handleSubmit,
    reset,
    setValue,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      name: "",
      warehouse_id: null,
      purchase_price: "",
      initial_quantity: "",
      selling_price: "",
      low_stock_alert: "",

      unit_id: null,
    },
  });
  useEffect(() => {
    if (warehouseId && warehouseName) {
      setValue("warehouse_id", {
        value: parseInt(warehouseId),
        label: decodeURIComponent(warehouseName),
      });
    }
  }, [warehouseId, warehouseName, setValue]);
  useEffect(() => {
    if ((isEdit || isShow) && data?.data) {
      const emp = data.data;

      const warehouseOption = emp.warehouse
        ? { label: emp.warehouse.name, value: emp.warehouse.id }
        : null;

      const unitOption = emp.unit ? { label: emp.unit.name, value: emp.unit.id } : null;

      reset({
        name: emp.name || "",

        warehouse_id: warehouseOption,

        purchase_price: emp.purchase_price || "",
        selling_price: emp.selling_price || "",
        low_stock_alert: emp.low_stock_alert || "",
        initial_quantity: emp.initial_quantity || "",
        // quantity: emp.quantity || "",
        unit_id: unitOption,
      });
    }
  }, [isEdit, data, reset, isShow]);
  const onSubmit = async formData => {
    try {
      const payload = {
        ...formData,

        warehouse_id: formData.warehouse_id?.value,
        unit_id: formData.unit_id?.value,
      };

      let res;
      if (!isAdd) {
        res = await apis.update({ id, payload });
      } else {
        res = await apis.add({ payload });
      }

      showSuccess(res?.data?.message);
      navigate(-1);
    } catch (error) {
      console.error("Error submitting form:", error);
      handleBackendErrors({ error, setError });
    }
  };

  const handleCancel = () => {
    navigate(-1);
  };

  const TITLE = isAdd ? t("item.add") : isShow ? t("item.show") : t("item.update");

  const BUTTONSLIST = [
    {
      show: !isShow,
      component: (
        <PrimaryButton
          text={isAdd ? t("common.add") : t("common.save_changes")}
          type="submit"
          isSubmitting={isSubmitting}
        />
      ),
    },
    {
      show: !isShow,
      component: <SecondaryButton text={t("common.cancel2")} onClick={handleCancel} />,
    },
  ];

  // const [files, setFiles] = useState([]);

  // const handleRemoveFile = file => {
  //   // مثال: احذف الملف من اللستة
  //   setFiles(prev => prev.filter(f => f.id !== file.id));
  //   // تقدر كمان تستدعي API عند الحذف إذا بدك
  // };

  return (
    <div>
      <BreadCrumb isAdd title={TITLE} link="/branches" />
      <Card otherStyle={"max-md:!w-full !w-[80%]"}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Input
              name="name"
              control={control}
              placeholder={t("hair.item-name")}
              error={errors.name?.message}
              disable={isShow}
            />
            <SelectField
              name="warehouse_id"
              control={control}
              options={warehouseOptions}
              placeholder={t("hair.store")}
              loading={isLoadingWarehouse}
              error={errors.warehouse_id?.message}
              disabled={isShow}
            />
            <Input
              name="purchase_price"
              control={control}
              placeholder={t("item.buy-price")}
              error={errors.purchase_price?.message}
              isNumberWithCommas
              disable={isShow}
            />

            <Input
              name="selling_price"
              control={control}
              placeholder={t("hair.sales")}
              error={errors.selling_price?.message}
              isNumberWithCommas
              disable={isShow}
            />
            <Input
              name="initial_quantity"
              control={control}
              placeholder={t("item.initial")}
              error={errors.initial_quantity?.message}
              isNumberWithCommas
              disable={isShow}
            />
            <Input
              name="low_stock_alert"
              control={control}
              placeholder={t("alert")}
              error={errors.low_stock_alert?.message}
              isNumberWithCommas
              disable={isShow}
            />
            {/* <Input
              name="quantity"
              control={control}
              placeholder={t("hair.quantity")}
              error={errors.quantity?.message}
              isNumberWithCommas
              disable={isShow}
            /> */}

            <SelectField
              name="unit_id"
              control={control}
              options={unitOptions}
              placeholder={t("hair.fill")}
              loading={isLoadingUnit}
              error={errors.unit_id?.message}
              disabled={isShow}
            />
          </div>
          <CustomFlexButtons
            gap="gap-4"
            justify="justify-start"
            reverse={false}
            buttons={BUTTONSLIST}
          />
        </form>
      </Card>
    </div>
  );
}
