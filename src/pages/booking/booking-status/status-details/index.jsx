import React, { useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useTranslation } from "@hooks/useTranslation";
import { useForm } from "react-hook-form";
import Input from "@/components/shared/input";
import Card from "@/components/card";
import BreadCrumb from "@/components/breadcrumb";
import PrimaryButton from "@/components/shared/primaryButton";
import SecondaryButton from "@/components/shared/secondaryButton";
import { showSuccess } from "@/libs/react.toastify";
import CustomFlexButtons from "@/components/shared/CustomFlexButtons";
import { yupResolver } from "@hookform/resolvers/yup";
import { handleBackendErrors } from "@/utils/helpers";
import * as yup from "yup";
import { useSearchParams } from "react-router-dom";
import { apis } from "@/apis/booking-status/api";
import { useBookingStatusQueries } from "@/apis/booking-status/query";
import ColorPickerInput from "@/components/shared/colorPickerInput";
import { PERMISSION_ACTION, PERMISSION_GROUP } from "@/constants/constants";
import { Can } from "@/components/shared/can/can";

export default function BookingStatusDetails() {
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

  // حالة تعديل
  // const id = encryptedId ? decryptId(encryptedId) : null;
  const isEdit = Boolean(id);
  const { data } = useBookingStatusQueries.GetOne({ id });
  const schema = yup.object().shape({
    name: yup.string().required(t("validation.required")),
    color: yup.string().required(t("validation.required")),
  });

  const {
    control,

    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      name: "",

      color: "",
    },
  });

  useEffect(() => {
    if ((isEdit || isShow) && data?.data) {
      const emp = data.data?.data;

      reset({
        name: emp.name || "",
        color: emp?.color,
      });
    }
  }, [isEdit, data, reset, isShow, isAdd]);
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

  const TITLE = isAdd ? t("status.add") : isShow ? t("status.show") : t("status.edit");

  const BUTTONSLIST = [
    {
      show: !isShow,
      component: (
        <Can
          group={PERMISSION_GROUP.BOOKING_STATUS}
          type={isAdd ? PERMISSION_ACTION.create : PERMISSION_ACTION.update}
        >
          <PrimaryButton
            text={isAdd ? t("common.add") : t("common.save_changes")}
            type="submit"
            isSubmitting={isSubmitting}
          />
        </Can>
      ),
    },
    {
      show: !isShow,
      component: <SecondaryButton text={t("common.cancel2")} onClick={handleCancel} />,
    },
  ];

  return (
    <div>
      <BreadCrumb isAdd title={TITLE} link="/booking-status" />
      <Card otherStyle={"!w-[80%]"}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              name="name"
              control={control}
              placeholder={t("status.name")}
              disable={isShow}
              error={errors.name?.message}
            />
            <ColorPickerInput
              name="color"
              control={control}
              placeholder={t("status.color")}
              disable={isShow}
              error={errors.color?.message}
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
