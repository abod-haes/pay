/* eslint-disable curly */
/* eslint-disable comma-dangle */
/* eslint-disable no-nested-ternary */
import React, { useEffect, useMemo } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useTranslation } from "@hooks/useTranslation";
import { useForm } from "react-hook-form";
import Input from "@/components/shared/input";
import Card from "@/components/card";
import BreadCrumb from "@/components/breadcrumb";
import PrimaryButton from "@/components/shared/primaryButton";
import SecondaryButton from "@/components/shared/secondaryButton";
import { showSuccess } from "@/libs/react.toastify";
import { decryptId } from "@/utils/helpers";
import CustomFlexButtons from "@/components/shared/CustomFlexButtons";
import { apis } from "@/apis/cashier/api";
import { handleBackendErrors } from "@/utils/helpers";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useCashierQueries } from "@/apis/cashier/query";

export default function ActionCashier() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { id } = useParams();
  const location = useLocation();
  const query = new URLSearchParams(location.search);

  // حالة إضافة
  const isAdd = location.pathname.endsWith("/add");

  // حالة عرض
  //const isShow = Boolean(query.get("show") === "true");

  // حالة تعديل
  //const id = encryptedId ? decryptId(encryptedId) : null;
  const isEdit = Boolean(id);

  const { data: holidayData } = useCashierQueries.GetOne({ id });
  const schema = yup.object().shape({
    name: yup.string().required(t("validation.required")),
    // initial_balance: yup.string().required(t("validation.required")),
  });

  const {
    control,

    handleSubmit,
    reset,
    setValue,
    setError,
    register,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      name: "",
      // initial_balance: "",
    },
  });

  useEffect(() => {
    if (isEdit && holidayData?.data) {
      const emp = holidayData.data;

      reset({
        name: emp.name || "",
        // initial_balance: emp.initial_balance || "",
      });
    }
  }, [isEdit, holidayData, reset]);
  const onSubmit = async formData => {
    try {
      const payload = {
        ...formData,
      };

      let res;
      if (!isAdd) {
        res = await apis.update({ id, payload });
      } else {
        res = await apis.add({ payload });
      }

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

  const TITLE = isAdd ? t("cashier.add") : t("cashier.edit");

  const BUTTONSLIST = [
    {
      component: (
        <PrimaryButton
          text={!isAdd ? t("complaints.save2") : t("common.add")}
          type="submit"
          isSubmitting={isSubmitting}
        />
      ),
    },
    {
      component: <SecondaryButton text={t("common.cancel2")} onClick={handleCancel} />,
    },
  ];
  return (
    <div>
      <div className="w-[80%]">
        <BreadCrumb isAdd title={TITLE} link="/cashier" />
      </div>
      <Card otherStyle={"max-md:!w-full !w-[80%]"}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
            <Input
              name={"name"}
              control={control}
              placeholder={t("cashier.name")}
              error={errors.name?.message}
            />
            {/* <Input
              name={"initial_balance"}
              control={control}
              placeholder={t("cashier.initial")}
              error={errors.initial_balance?.message}
              isNumberWithCommas
            /> */}
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
