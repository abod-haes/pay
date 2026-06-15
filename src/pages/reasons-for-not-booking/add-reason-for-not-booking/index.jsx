/* eslint-disable curly */
/* eslint-disable comma-dangle */
import React, { useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import Input from "@/components/shared/input";
import Card from "@/components/card";
import BreadCrumb from "@/components/breadcrumb";
import PrimaryButton from "@/components/shared/primaryButton";
import SecondaryButton from "@/components/shared/secondaryButton";
import { showSuccess } from "@/libs/react.toastify";
import CustomFlexButtons from "@/components/shared/CustomFlexButtons";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { handleBackendErrors } from "@/utils/helpers";
import { apis } from "@/apis/reason/api";
import { useReasonQueries } from "@/apis/reason/query";
const AddSponsor = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { id } = useParams();

  const location = useLocation();
  const isAdd = location.pathname.endsWith("/add");
  const isEdit = Boolean(id);

  const {
    data: sponsorData,
    isLoading: isLoadingSponsor,
    refetch,
  } = useReasonQueries.GetOne({
    id: isEdit ? id : null,
  });
  const reasonForNotBooking = sponsorData?.data;

  const schema = yup.object().shape({
    title: yup.string().required(t("validation.required")),
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
      title: "",
    },
  });

  useEffect(() => {
    if (isEdit && reasonForNotBooking) {
      const item = reasonForNotBooking?.data;
      reset({
        title: item.title || "",
      });
    }
  }, [isEdit, reasonForNotBooking, reset]);

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
      refetch();
      showSuccess(res?.data?.message);
      navigate(-1);
    } catch (error) {
      handleBackendErrors({ error, setError });
    }
  };

  const handleCancel = () => {
    navigate(-1);
  };

  const TITLE = isAdd
    ? t("booking.add_reasons_for_not_booking")
    : t("booking.edit_reasons_for_not_booking");

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
      show: true,
      component: <SecondaryButton text={t("common.cancel2")} onClick={handleCancel} />,
    },
  ];

  return (
    <div>
      <BreadCrumb isAdd title={TITLE} link="/sponsors" />
      <Card otherStyle={"max-md:!w-full !w-[80%]"}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Input
              name="title"
              control={control}
              placeholder={t("common.address")}
              error={errors.title?.message}
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
};

export default AddSponsor;
