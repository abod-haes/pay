/* eslint-disable indent */
/* eslint-disable comma-dangle */
/* eslint-disable curly */
/* eslint-disable no-nested-ternary */
/* eslint-disable complexity */
import React, { useEffect, useState, useMemo } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useTranslation } from "@hooks/useTranslation";
import { useForm, useFieldArray } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import Input from "@/components/shared/input";
import Card from "@/components/card";
import BreadCrumb from "@/components/breadcrumb";
import PrimaryButton from "@/components/shared/primaryButton";
import SecondaryButton from "@/components/shared/secondaryButton";
import CustomFlexButtons from "@/components/shared/CustomFlexButtons";
import SelectField from "@/components/shared/select";
import ControlledTimeField from "@/components/shared/controlledDatePicker";
import Calender from "@assets/svgs/common/calendar.svg";
import { apis } from "@/apis/bills/api";
import { useCashierQueries } from "@/apis/cashier/query";
import { useBillQueries } from "@/apis/bills/query";
import { useMaterialQueries } from "@/apis/items/query";
import { useWarehouseQueries } from "@/apis/warehouse/query";
import { showError, showSuccess } from "@/libs/react.toastify";
import { handleBackendErrors } from "@/utils/helpers";
import { motion, AnimatePresence } from "framer-motion";
import useVendors from "@/hooks/useVendors";

export default function ActionBill() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { id } = useParams();
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const isShow = query.get("show") === "true";
  const isAdd = location.pathname.endsWith("/add");
  const isEdit = Boolean(id);

  const { data: billData } = useBillQueries.GetOne({ id });
  const { data: casierData, isLoading: isLoadingCashier } = useCashierQueries.GetAll({});
  const { data: warehouseData, isLoading: isLoadingWarehouse } = useWarehouseQueries.GetAll({});

  const getSchema = () =>
    yup.object().shape({
      no: yup.string().required(t("validation.required")),
      date: yup.string().required(t("validation.required")),
      total: yup
        .number()
        .nullable()
        .transform((value, originalValue) => (originalValue === "" ? null : value))
        .typeError(t("validation.mustBeNumber")),
      paid_amount: yup
        .number()
        .required(t("validation.required"))
        .typeError(t("validation.mustBeNumber"))
        .min(0, t("validation.mustBePositive"))
        .test(
          "is-less-than-or-equal-total",
          t("validation.paidAmountExceedsTotal"),
          function (value) {
            const { total } = this.parent;
            return total === null || value <= total;
          }
        ),
      cashier_id: yup
        .object()
        .shape({
          label: yup.string().required(t("validation.required")),
          value: yup.number().required(t("validation.required")),
        })
        .required(t("validation.required")),
      warehouse_id: yup
        .object()
        .shape({
          label: yup.string().required(t("validation.required")),
          value: yup.number().required(t("validation.required")),
        })
        .required(t("validation.required")),
      vendor_id: yup
        .object()
        .typeError(t("validation.required"))
        .shape({
          label: yup.string().required(t("validation.required")),
          value: yup.string().required(t("validation.required")),
        })
        .required(t("validation.required")),
    });

  const {
    control,
    watch,
    handleSubmit,
    reset,
    setValue,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(getSchema()),
    defaultValues: {
      no: "",
      date: "",
      total: "",
      paid_amount: "",
      notes: "",
      cashier_id: null,
      warehouse_id: null,
      vendor_id: null,
      details: [
        {
          material_id: null,
          quantity: "",
          purchase_price: "",
          selling_price: "",
        },
      ],
    },
  });

  const { fields, append, remove, replace } = useFieldArray({
    control,
    name: "details",
  });

  // ✅ مراقبة جميع التغييرات في النموذج
  const formValues = watch();
  const selectedWarehouse = formValues?.warehouse_id;
  const details = formValues?.details || [];
  const { isLoadingVendors, items: vendors } = useVendors();

  const cashierOptions = casierData?.data?.map(item => ({
    label: item.name,
    value: item.id,
  }));

  const warehouseOptions = warehouseData?.data?.map(item => ({
    label: item.name,
    value: item.id,
  }));
  const { data: itemData, isLoading: isLoadingMaterial } = useMaterialQueries.GetAll({
    warehouse_id: selectedWarehouse,
  });

  // ✅ الحصول على IDs المواد المختارة (باستثناء صف الإضافة الأول)
  const selectedMaterialIds =
    details
      ?.slice(1) // نتجاهل صف الإضافة
      ?.filter(detail => detail.material_id?.value) // نأخذ فقط الصفوف التي فيها مواد مختارة
      ?.map(detail => detail.material_id.value) || [];

  // ✅ التحقق من وجود مواد مضافة لتعطيل حقل المخزن
  const hasAddedMaterials = selectedMaterialIds.length > 0;

  // ✅ تصفية المواد لإزالة المواد المختارة من الخيارات
  const itemsOptions = itemData?.data
    ?.filter(item => !selectedMaterialIds.includes(item.id))
    ?.map(item => ({
      label: item.name,
      value: item.id,
      purchase_price: item.purchase_price,
      selling_price: item.selling_price,
    }));

  // ✅ عند اختيار مادة، نملأ الأسعار فقط (بدون إضافة تلقائية)
  const handleItemChange = (selectedOption, index) => {
    if (selectedOption) {
      const selectedItem = itemData?.data?.find(item => item.id === selectedOption.value);
      if (selectedItem) {
        setValue(`details.${index}.material_id`, {
          label: selectedItem.name,
          value: selectedItem.id,
        });
        setValue(`details.${index}.purchase_price`, selectedItem.purchase_price || "");
        setValue(`details.${index}.selling_price`, selectedItem.selling_price || "");
        clearErrors(`details.${index}.material_id`);
      }
    } else {
      setValue(`details.${index}.purchase_price`, "");
      setValue(`details.${index}.selling_price`, "");
    }
  };

  // ✅ إضافة صف جديد عند الضغط على زر الإضافة
  const handleAddItem = () => {
    const addRow = details[0]; // صف الإضافة

    // التحقق من ملء جميع الحقول المطلوبة
    if (!addRow?.material_id?.value) {
      showError(t("validation.material_required") || "يرجى اختيار المادة");
      return;
    }
    if (!addRow?.quantity || parseFloat(addRow.quantity) <= 0) {
      showError(t("validation.quantity_required") || "يرجى إدخال الكمية");
      return;
    }
    if (!addRow?.purchase_price || parseFloat(addRow.purchase_price) <= 0) {
      showError(t("validation.purchase_price_required") || "يرجى إدخال سعر الشراء");
      return;
    }
    if (!addRow?.selling_price || parseFloat(addRow.selling_price) <= 0) {
      showError(t("validation.selling_price_required") || "يرجى إدخال سعر البيع");
      return;
    }

    // إضافة الصف الجديد
    const newRow = {
      material_id: addRow.material_id,
      quantity: addRow.quantity,
      purchase_price: addRow.purchase_price,
      selling_price: addRow.selling_price,
    };

    append(newRow);

    // تفريغ صف الإضافة
    setValue("details.0.material_id", null);
    setValue("details.0.quantity", "");
    setValue("details.0.purchase_price", "");
    setValue("details.0.selling_price", "");
  };

  // ✅ تحميل بيانات الفاتورة عند التعديل أو العرض
  useEffect(() => {
    if (billData && (isEdit || isShow)) {
      const emp = billData.data;
      const cashierOption = emp.cashier ? { label: emp.cashier.name, value: emp.cashier.id } : null;
      const warehouseOption = emp.warehouse
        ? { label: emp.warehouse.name, value: emp.warehouse.id }
        : null;
      const vendorOption = emp.vendor ? { label: emp.vendor.name, value: emp.vendor.id } : null;
      // ✅ نضيف صف الإضافة أولاً، ثم بيانات السيرفر
      const serverDetails =
        emp.details?.map(detail => ({
          material_id: {
            value: detail.material?.id,
            label: detail.material?.name,
          },
          quantity: detail.quantity || "",
          purchase_price: detail.purchase_price || "",
          selling_price: detail.selling_price || "",
        })) || [];

      const allDetails = [
        {
          material_id: null,
          quantity: "",
          purchase_price: "",
          selling_price: "",
        },
        ...serverDetails,
      ];

      reset({
        no: emp.no || "",
        date: emp.date || "",
        cashier_id: cashierOption,
        warehouse_id: warehouseOption,
        total: emp.total || "",
        notes: emp.notes || "",
        paid_amount: emp.paid_amount || "",
        details: allDetails,
        vendor_id: vendorOption,
      });
    }
  }, [billData, isEdit, isShow, reset]);

  // ✅ استخدام useMemo لحفظ detailsString
  const detailsString = useMemo(() => JSON.stringify(details), [details]);

  // ✅ حساب الإجمالي تلقائياً عند تغيير الكمية أو السعر
  useEffect(() => {
    if (!details || details.length === 0) return;

    const validDetails = details.slice(1).filter(d => d?.material_id?.value) || [];

    const calculatedTotal = validDetails.reduce((sum, detail) => {
      const quantity = parseFloat(detail.quantity) || 0;
      const purchasePrice = parseFloat(detail.purchase_price) || 0;
      return sum + quantity * purchasePrice;
    }, 0);

    // تحديث حقل الإجمالي
    setValue("total", calculatedTotal > 0 ? calculatedTotal : "");
  }, [detailsString, setValue]);

  // ✅ عند الحفظ، نتجاهل صف الإضافة (الأول)
  const onSubmit = async data => {
    const validDetails = data.details.slice(1).filter(d => d.material_id?.value);

    if (validDetails.length === 0) {
      showError(t("validation.bills_error"));
      return;
    }

    try {
      const submitData = {
        ...data,
        cashier_id: data.cashier_id.value,
        warehouse_id: data.warehouse_id.value,
        vendor_id: data.vendor_id.value,
        details: validDetails.map(detail => ({
          material_id: detail.material_id.value,
          quantity: detail.quantity,
          purchase_price: detail.purchase_price,
          selling_price: detail.selling_price,
        })),
      };

      const res = isAdd
        ? await apis.add({ payload: submitData })
        : await apis.update({ id, payload: submitData });

      showSuccess(res.data?.message);
      navigate(-1);
    } catch (error) {
      if (error.response?.data?.errors?.deposit) {
        const depositError = error.response.data.errors.deposit[0];
        showError(depositError);
      }
      handleBackendErrors({ error, setError });
    }
  };

  const handleCancel = () => navigate(-1);

  const TITLE = isAdd ? t("bills.add") : isShow ? t("bills.show") : t("bills.edit");

  const BUTTONSLIST = [
    {
      show: !isShow,
      component: (
        <PrimaryButton
          text={!isAdd ? t("complaints.save2") : t("common.add")}
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

  return (
    <div>
      <BreadCrumb isAdd title={TITLE} link="/accounts/bills" />
      <Card otherStyle={"max-md:!w-full !w-[80%]"}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* رأس الفاتورة */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              name="no"
              control={control}
              placeholder={t("bills.no")}
              error={errors.no?.message}
              disable={isShow}
            />
            <ControlledTimeField
              name="date"
              placeholder={t("bills.date")}
              control={control}
              errors={errors?.date}
              icon={Calender}
              disable={isShow}
            />
            <SelectField
              name="cashier_id"
              control={control}
              options={cashierOptions}
              placeholder={t("cashier.name")}
              error={errors.cashier_id?.message}
              isLoading={isLoadingCashier}
              disabled={isShow}
            />
            <SelectField
              name="vendor_id"
              control={control}
              options={vendors}
              error={errors.vendor_id?.message}
              placeholder={t("vendors.name")}
              loading={isLoadingVendors}
              disabled={isShow}
            />
            <SelectField
              name="warehouse_id"
              control={control}
              options={warehouseOptions}
              placeholder={t("warehouse.name")}
              error={errors.warehouse_id?.message}
              isLoading={isLoadingWarehouse}
              disabled={isShow || hasAddedMaterials}
            />
            <Input
              name="total"
              control={control}
              placeholder={t("cashier.total")}
              error={errors.total?.message}
              disable={true}
              isNumberWithCommas
            />
            <Input
              name="paid_amount"
              control={control}
              placeholder={t("bills.paid")}
              error={errors.paid_amount?.message}
              disable={isShow}
              isNumberWithCommas
            />
            {/* <SelectField
              name="warehouse_id"
              control={control}
              options={warehouseOptions}
              placeholder={t("warehouse.name")}
              error={errors.warehouse_id?.message}
              isLoading={isLoadingWarehouse}
              disabled={isShow}
            /> */}
            <Input
              name="notes"
              control={control}
              placeholder={t("common.notes")}
              error={errors.notes?.message}
              disable={isShow}
            />
          </div>

          {/* تفاصيل الأصناف */}
          <div className="pt-6">
            <h3 className="text-[1rem] font-main mb-4">{t("sidebar.items")}</h3>

            {/* ✅ صف الإضافة (دائم في الأعلى) */}
            {!isShow && (
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6 border-b border-gray-50 pb-4">
                <SelectField
                  name={`details.0.material_id`}
                  control={control}
                  options={itemsOptions}
                  placeholder={t("hair.item-name")}
                  error={errors.details?.[0]?.material_id?.message}
                  isLoading={isLoadingMaterial}
                  disabled={isShow}
                  onChange={selectedOption => handleItemChange(selectedOption, 0)}
                />
                <Input
                  name={`details.0.quantity`}
                  control={control}
                  placeholder={t("hair.quantity")}
                  error={errors.details?.[0]?.quantity?.message}
                  disable={isShow}
                  isNumberWithCommas
                />
                <Input
                  name={`details.0.purchase_price`}
                  control={control}
                  placeholder={t("item.buy-price")}
                  error={errors.details?.[0]?.purchase_price?.message}
                  disable={isShow}
                />
                <Input
                  name={`details.0.selling_price`}
                  control={control}
                  placeholder={t("hair.sell-price")}
                  error={errors.details?.[0]?.selling_price?.message}
                  disable={isShow}
                />
                <div className="flex items-end">
                  <PrimaryButton type="button" text={t("common.add")} onClick={handleAddItem} />
                </div>
              </div>
            )}

            {/* ✅ باقي الصفوف أسفل صف الإضافة */}
            <AnimatePresence>
              {fields.slice(1).map((field, index) => (
                <motion.div
                  key={field.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4"
                >
                  <SelectField
                    name={`details.${index + 1}.material_id`}
                    control={control}
                    options={itemsOptions}
                    placeholder={t("hair.item-name")}
                    error={errors.details?.[index + 1]?.material_id?.message}
                    isLoading={isLoadingMaterial}
                    disabled={true}
                    onChange={selectedOption => handleItemChange(selectedOption, index + 1)}
                  />
                  <Input
                    name={`details.${index + 1}.quantity`}
                    control={control}
                    placeholder={t("hair.quantity")}
                    error={errors.details?.[index + 1]?.quantity?.message}
                    disable={true}
                    isNumberWithCommas
                  />
                  <Input
                    name={`details.${index + 1}.purchase_price`}
                    control={control}
                    placeholder={t("item.buy-price")}
                    error={errors.details?.[index + 1]?.purchase_price?.message}
                    disable={true}
                  />
                  <Input
                    name={`details.${index + 1}.selling_price`}
                    control={control}
                    placeholder={t("hair.sell-price")}
                    error={errors.details?.[index + 1]?.selling_price?.message}
                    disable={true}
                  />
                  {!isShow && (
                    <div className="flex items-end">
                      <SecondaryButton
                        type="button"
                        text={t("bills.remove")}
                        onClick={() => remove(index + 1)}
                      />
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          <CustomFlexButtons gap="gap-4" justify="justify-start" buttons={BUTTONSLIST} />
        </form>
      </Card>
    </div>
  );
}
