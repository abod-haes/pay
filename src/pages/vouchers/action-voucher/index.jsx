/* eslint-disable comma-dangle */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/jsx-no-useless-fragment */
/* eslint-disable no-nested-ternary */
/* eslint-disable complexity */
import React, { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useTranslation } from "@hooks/useTranslation";
import { useForm } from "react-hook-form";
import Input from "@/components/shared/input";
import TextAreaField from "@/components/shared/textArea";
import Card from "@/components/card";
import BreadCrumb from "@/components/breadcrumb";
import PrimaryButton from "@/components/shared/primaryButton";
import SecondaryButton from "@/components/shared/secondaryButton";
import { showSuccess } from "@/libs/react.toastify";
import CustomFlexButtons from "@/components/shared/CustomFlexButtons";
import SelectField from "@/components/shared/select";
import { useBondsQueries } from "@/apis/bonds/query";
import { apis } from "@/apis/bonds/api";
import {
  buildPayloadByBondType,
  getBondSchema,
  handleBackendErrors,
  hasBondPermission,
  hasPermissionFunction,
} from "@/utils/helpers";
import { yupResolver } from "@hookform/resolvers/yup";
import Calender from "@assets/svgs/common/calendar.svg";
import ControlledTimeField from "@/components/shared/controlledDatePicker";
import { useCashierQueries } from "@/apis/cashier/query";
import { useBillQueries } from "@/apis/bills/query";
import { usePatientsQueries } from "@/apis/patients/query";
import { useEmployeeQueries } from "@/apis/employee/query";
import { useDebounce } from "@uidotdev/usehooks";
import { BondTypes, PERMISSION_ACTION } from "@/constants/constants";
import { useSponsorsQueries } from "@/apis/sponsors/query";
import { formatDateOrTime } from "@/utils/helpers";
export default function ActionVoucher() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { id } = useParams();
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const isShow = query.get("show") === "true";
  const [searchValue, setSearchValue] = useState("");
  // حالة إضافة
  const isAdd = location.pathname.endsWith("/add");

  const debounceSearch = useDebounce(searchValue, 500);
  // حالة تعديل
  const isEdit = Boolean(id);
  const { data: bondData } = useBondsQueries.GetOne({ id });
  const { data: cashierData, isLoading: isLoadingCashier } = useCashierQueries.GetAll({
    page: 1,
    per_page: 1000,
  });
  const { data: billData, isLoading: isLoadingBill } = useBillQueries.GetAll({
    page: 1,
    per_page: 1000,
  });
  const { data: userData, isLoading: isLoadingUser } = useEmployeeQueries.GetAll({
    page: 1,
    per_page: 1000,
  });
  const { data: patientData, isLoading: isLoadingPatient } = usePatientsQueries.GetAll({
    search: debounceSearch,
    page: 1,
    per_page: 1000,
  });

  const { data: sponsorsData, isLoading: isLoadingSponsors } = useSponsorsQueries.GetAll({});

  const bondType = location.state;

  const bondTypes = React.useMemo(
    () => [
      { label: t("voucher.pay"), value: "pay" },
      { label: t("voucher.catch"), value: "catch" },
    ],
    [t]
  );

  const {
    control,
    register,
    handleSubmit,
    reset,
    setValue,
    setError,
    watch,
    formState: { errors, isSubmitting, dirtyFields },
  } = useForm({
    resolver: yupResolver(getBondSchema(bondType.value, t)),
    mode: "onChange",
    defaultValues: {
      type: bondType.value === BondTypes.booking.value ? bondTypes[1] : bondTypes[0],
      no: "",
      bill_id: null,
      cashier_id: null,
      financier_id: null,
      user_id: null,
      booking_id: null,
      patient_id: null,
      total: "",
      notes: "",
      description: "",
      date: new Date().toISOString().split("T")[0],
      discount_type: null,
      discount_value: "",
    },
  });

  const { data: unPaidBooking, isLoading: isLoadingUnPaidPatient } =
    usePatientsQueries.GetAllUnPaidPatients({ PaitientId: watch("patient_id")?.value });

  const { data: bondNo, isLoading } = useBondsQueries.GetNo({
    type: watch("type")?.value,
    enabled: true,
    bond_group: location.state.value,
  });

  const discountType = [
    {
      label: t("amount"),
      value: "amount",
    },
    {
      label: t("employee.percentage"),
      value: "percentage",
    },
  ];

  const cashierOptions = cashierData?.data?.map(item => ({
    label: item?.name,
    value: item.id,
  }));

  const bookingOptions = unPaidBooking?.data?.map(item => ({
    label: item?.service?.name,
    value: item.id,
  }));

  const userOptions = userData?.data?.map(item => ({
    label: item.full_name,
    value: item.id,
  }));

  const billOptions = billData?.data?.map(item => ({
    label: String(item.no || ""),
    value: item.id,
  }));

  const patientOptions = patientData?.data?.map(item => ({
    label: item.full_name,
    value: item.id,
  }));

  const sponsorOptions = sponsorsData?.data?.map(item => ({
    label: item?.full_name,
    value: item.id,
  }));

  useEffect(() => {
    if (bondNo?.data) {
      setValue("no", bondNo.data);
    }
  }, [isAdd, bondNo?.data]);

  useEffect(() => {
    if ((isEdit || isShow) && bondData?.data) {
      const bond = bondData.data;
      const cashierOption = bond.cashier
        ? { label: bond.cashier.name, value: bond.cashier.id }
        : null;
      const patientOption = bond.patient
        ? { label: bond.patient.full_name, value: bond.patient.id }
        : null;
      const billOption = bond.bill ? { label: String(bond.bill?.no), value: bond.bill.id } : null;
      const userOption = bond.user ? { label: bond.user.full_name, value: bond.user.id } : null;
      const BookingOption = bond.booking
        ? { label: bond.booking.service.name, value: bond.booking.id }
        : null;
      const discountTypeOption = discountType.find(
        option => option.value.toLowerCase() === bond.discount_type?.toLowerCase()
      );
      const sponsorOption = bond.financier
        ? { label: bond.financier.full_name, value: bond.financier.id }
        : null;

      reset({
        type: bondTypes?.find(opt => opt.value === bond?.type),
        no: bond.no,
        bill_id: billOption,
        cashier_id: cashierOption,
        user_id: userOption,
        booking_id: BookingOption,
        patient_id: patientOption,
        total: bond.total,
        notes: bond.notes,
        description: bond.description,
        date: formatDateOrTime({ input: bond.date, type: "date" }),
        financier_id: sponsorOption,
        discount_type: discountTypeOption,
        discount_value: bond.discount_value,
      });
    }
  }, [isEdit, bondData, reset]);

  useEffect(() => {
    if (isAdd && location.state?.patient) {
      const { patient, total, booking_id, service_name } = location.state;

      setValue("patient_id", { label: patient.full_name, value: patient.id });
      if (total) {
        setValue("total", total);
      }
      if (booking_id) {
        setValue("booking_id", { label: service_name, value: booking_id });
      }
    }
  }, [isAdd, location.state, setValue]);

  const onSubmit = async formData => {
    try {
      const payload = buildPayloadByBondType({
        formData,
        date: formatDateOrTime({ input: formData.date, type: "date" }),
        bondType: location.state,
      });

      const res = isAdd ? await apis.add({ payload }) : await apis.update({ id, payload });

      showSuccess(res.data?.message);
      navigate(-1);
    } catch (error) {
      console.error("Error submitting form:", error);
      handleBackendErrors({ error, setError });
    }
  };

  const handleCancel = () => {
    navigate(-1);
  };

  const TITLE = isAdd
    ? t("voucher.add") + ` ${location?.state.label}`
    : isShow
    ? t("voucher.show")
    : t("voucher.edit") + ` ${location?.state.label}`;

  const BUTTONSLIST = [
    {
      show:
        !isShow &&
        hasPermissionFunction({
          group: bondType.permission.group,
          type: isAdd ? PERMISSION_ACTION.create : PERMISSION_ACTION.update,
        }),
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

  // set remaining value for patient after user id is changed
  useEffect(() => {
    if (location.state.value === BondTypes.salary.value && dirtyFields.user_id) {
      const selectEmployee = userData?.data.find(item => item.id === watch("user_id")?.value);
      setValue("total", selectEmployee?.remaining_salary);
    } else if (!watch("user_id")) {
      setValue("total", bondType?.total || null);
    }
  }, [
    userData?.data,
    location.state,
    watch("user_id"),
    dirtyFields.user_id,
    bondType.location?.total,
  ]);

  // reset total and booking when patient is be null be null
  useEffect(() => {
    if (location.state.value === BondTypes.booking.value && dirtyFields.patient_id) {
      setValue("booking_id", { label: null, value: null });
      setValue("total", null);
    }
  }, [dirtyFields.patient_id, watch("patient_id")]);

  // reset total when booking be null
  useEffect(() => {
    if (location.state.value === BondTypes.booking.value && !watch("booking_id")?.value) {
      setValue("total", null);
    }
  }, [dirtyFields.booking_id]);

  // change available amount depend on booking changing
  useEffect(() => {
    if (
      location.state.value === BondTypes.booking.value &&
      watch("booking_id")?.value > 0 &&
      dirtyFields.booking_id
    ) {
      const selectBooking = unPaidBooking?.data.find(
        item => item.id === watch("booking_id")?.value
      );

      setValue("total", selectBooking?.available_amount);
    }
  }, [unPaidBooking?.data, location.state, watch("booking_id"), dirtyFields.booking_id]);

  useEffect(() => {
    if (!dirtyFields.discount_type) return;

    setValue("discount_value", "", {
      shouldValidate: true,
      shouldDirty: true,
    });
  }, [watch("discount_type")?.value, dirtyFields.discount_type, setValue]);

  return (
    <div>
      <BreadCrumb isAdd title={TITLE} link="/accounts/voucher" />
      <Card otherStyle={"max-md:!w-full !w-[80%]"}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Input
              name="no"
              control={control}
              placeholder={t("voucher.no")}
              error={errors.no?.message}
              disable
            />

            {location.state.value === BondTypes.financier.value && (
              <SelectField
                name="type"
                control={control}
                options={bondTypes}
                placeholder={t("voucher.voucher")}
                error={errors.type?.message}
                disabled={isShow}
                isLoading={isLoading}
              />
            )}
            {location.state.value === BondTypes.invoice.value && (
              <SelectField
                name="bill_id"
                control={control}
                options={billOptions}
                placeholder={t("voucher.bill")}
                error={errors.bill_id?.message}
                loading={isLoadingBill}
                disabled={isShow}
              />
            )}

            {location.state.value === BondTypes.salary.value && (
              <SelectField
                name="user_id"
                control={control}
                options={userOptions}
                placeholder={t("employee.name")}
                error={errors.user_id?.message}
                loading={isLoadingUser}
                disabled={isShow}
              />
            )}

            <>
              {location.state.value === BondTypes.booking.value && (
                <SelectField
                  name="patient_id"
                  control={control}
                  options={patientOptions}
                  placeholder={t("complaints.patient-name")}
                  error={errors.patient_id?.message}
                  loading={isLoadingPatient}
                  onSearchChange={setSearchValue}
                  disabled={isShow}
                />
              )}
              {location.state.value === BondTypes.booking.value && (
                <SelectField
                  name="discount_type"
                  control={control}
                  options={discountType}
                  placeholder={t("voucher.discount_type")}
                  error={errors.discount_type?.message}
                  disabled={isShow}
                />
              )}
              {location.state.value === BondTypes.booking.value && (
                <Input
                  name="discount_value"
                  control={control}
                  placeholder={t("voucher.discount_value")}
                  error={errors.discount_value?.message}
                  isNumberWithCommas
                  disable={!watch("discount_type") || isShow}
                />
              )}
              {location.state.value === BondTypes.financier.value && (
                <SelectField
                  name="financier_id"
                  control={control}
                  placeholder={t("sponsors.sponsors")}
                  error={errors.financier_id?.message}
                  options={sponsorOptions}
                  loading={isLoadingSponsors}
                  disabled={isShow}
                />
              )}
              {location.state.value === BondTypes.booking.value && (
                <SelectField
                  name="booking_id"
                  control={control}
                  options={bookingOptions}
                  placeholder={t("bond.select_booking")}
                  error={errors.booking_id?.message}
                  loading={isLoadingUnPaidPatient}
                  disabled={isShow || !watch("patient_id")?.value}
                />
              )}
            </>

            <SelectField
              name="cashier_id"
              control={control}
              placeholder={t("cashier.name")}
              error={errors.cashier_id?.message}
              options={cashierOptions}
              loading={isLoadingCashier}
              disabled={isShow}
            />

            <ControlledTimeField
              name="date"
              control={control}
              placeholder={t("delayed.date")}
              errors={errors.date}
              icon={Calender}
              disable={isShow}
            />

            <Input
              name="total"
              control={control}
              placeholder={t("voucher.total")}
              error={errors.total?.message}
              disable={isShow || location.state.value === BondTypes.booking.value}
              isNumberWithCommas
            />

            <Input
              name="notes"
              control={control}
              placeholder={t("voucher.statue")}
              error={errors.notes?.message}
              disable={isShow}
            />
          </div>

          <TextAreaField
            {...register("description")}
            placeholder={t("common.notes")}
            rows={3}
            variant="white"
            error={errors.description?.message}
            disable={isShow}
          />

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
