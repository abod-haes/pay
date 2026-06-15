/* eslint-disable comma-dangle */
/* eslint-disable react/jsx-no-useless-fragment */
/* eslint-disable no-nested-ternary */
/* eslint-disable complexity */
import React, { useEffect } from "react";
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
import { handleBackendErrors } from "@/utils/helpers";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useCashierQueries } from "@/apis/cashier/query";
import { useSponsorsQueries } from "@/apis/sponsors/query";

export default function FundedBond() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { id } = useParams();
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const isShow = query.get("show") === "true";
  const isEdit = Boolean(id);

  const { data: bondData } = useBondsQueries.GetOne({ id });

  const { data: cashierData, isLoading: isLoadingCashier } = useCashierQueries.GetAll({});
  const { data: sponsorsData, isLoading: isLoadingSponsors } = useSponsorsQueries.GetAll({});

  const showSponsorField = !isEdit || !!bondData?.data?.financier.id > 0;

  const schema = yup.object().shape({
    type: yup
      .object()
      .shape({
        label: yup.string().required(),
        value: yup.string().required(),
      })
      .required(t("validation.required")),
    no: yup.string().when("type", {
      is: type => type?.value === "pay",
      then: schema => schema.required(t("validation.required")),
      otherwise: schema => schema.nullable(),
    }),
    cashier_id: yup
      .object()
      .shape({
        label: yup.string().required(),
        value: yup.mixed().required(),
      })
      .required(t("validation.required")),
    sponsor_id: showSponsorField
      ? yup
          .object()
          .shape({
            label: yup.string().required(),
            value: yup.mixed().required(),
          })
          .required(t("validation.required"))
      : yup.mixed().nullable(),
    total: yup.string().required(t("validation.required")),
    notes: yup.string().nullable(),
  });

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
    setValue,
    setError,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      type: null,
      no: "",
      cashier_id: null,
      sponsor_id: null,
      total: "",
      notes: "",
      description: "",
    },
  });

  useEffect(() => {
    if ((isEdit || isShow) && bondData?.data) {
      const bond = bondData.data;
      const cashierOption = bond.cashier
        ? { label: bond.cashier.name, value: bond.cashier.id }
        : null;
      const sponsorOption = bond.financier
        ? { label: bond.financier.full_name, value: bond.financier.id }
        : null;

      reset({
        type: bondTypes?.find(opt => opt.value === bond.type),
        no: bond.no,
        cashier_id: cashierOption,
        sponsor_id: sponsorOption,
        total: bond.total,
        notes: bond.notes,
        description: bond.description,
      });
    }
  }, [isEdit, isShow, bondData, reset, bondTypes]);

  const type = watch("type");

  const { data: bondNo } = useBondsQueries.GetNo({
    type: type?.value,
    enabled: type?.value === "catch",
  });

  const cashierOptions = cashierData?.data?.map(item => ({
    label: item?.name,
    value: item.id,
  }));

  const sponsorOptions = sponsorsData?.data?.map(item => ({
    label: item?.full_name,
    value: item.id,
  }));

  useEffect(() => {
    if (type?.value === "catch") {
      if (bondNo?.data) {
        setValue("no", bondNo.data);
      }
    }
  }, [type, bondNo, setValue]);

  const onSubmit = async formData => {
    try {
      const payload = {
        ...formData,
        type: formData.type?.value,
        cashier_id: formData.cashier_id?.value,
        financier_id: formData.sponsor_id?.value,
        is_funded: 1,
      };

      if (formData.type?.value === "pay") {
        payload.no = formData.no;
      } else {
        delete payload.no;
      }

      let res;
      if (isEdit) {
        res = await apis.update({ id, payload });
      } else {
        res = await apis.add({ payload });
      }

      showSuccess(res.data?.message);
      navigate("/accounts/vouchers");
    } catch (error) {
      handleBackendErrors({ error, setError });
    }
  };

  const handleCancel = () => {
    navigate(-1);
  };

  const BUTTONSLIST = [
    {
      show: !isShow,
      component: (
        <PrimaryButton
          text={isEdit ? t("complaints.save2") : t("common.add")}
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
      <BreadCrumb
        isAdd
        title={isEdit ? (isShow ? t("voucher.show") : t("voucher.edit")) : "إضافة سند ممول"}
        link="/accounts/vouchers"
      />
      <Card otherStyle={"max-md:!w-full !w-[80%]"}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SelectField
              name="type"
              control={control}
              options={bondTypes}
              placeholder={t("voucher.voucher")}
              error={errors.type?.message}
              disabled={isEdit || isShow}
            />

            {type?.value && (
              <>
                {type?.value === "pay" ? (
                  <Input
                    name="no"
                    control={control}
                    placeholder={t("voucher.no")}
                    error={errors.no?.message}
                    isNumberWithCommas
                    disable={isShow}
                  />
                ) : type?.value === "catch" ? (
                  <Input
                    name="no"
                    control={control}
                    placeholder={t("voucher.no")}
                    error={errors.no?.message}
                    readOnly
                    disabled={isEdit || isShow}
                  />
                ) : null}
              </>
            )}

            <SelectField
              name="cashier_id"
              control={control}
              placeholder={t("cashier.name")}
              error={errors.cashier_id?.message}
              options={cashierOptions}
              loading={isLoadingCashier}
              disabled={isShow}
            />

            {showSponsorField && (
              <SelectField
                name="sponsor_id"
                control={control}
                placeholder={t("sponsors.sponsors")}
                error={errors.sponsor_id?.message}
                options={sponsorOptions}
                key={sponsorOptions}
                loading={isLoadingSponsors}
                disabled={isShow}
              />
            )}

            <Input
              name="total"
              control={control}
              placeholder={t("voucher.total")}
              error={errors.total?.message}
              isNumberWithCommas
              disable={isShow}
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
