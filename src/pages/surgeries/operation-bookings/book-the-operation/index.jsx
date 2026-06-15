/* eslint-disable complexity */
import BreadCrumb from "@/components/breadcrumb";
import Card from "@/components/card";
import CustomFlexButtons from "@/components/shared/CustomFlexButtons";
import Input from "@/components/shared/input";
import PrimaryButton from "@/components/shared/primaryButton";
import SecondaryButton from "@/components/shared/secondaryButton";
import SelectField from "@/components/shared/select";
import useEmployees from "@/hooks/useEmployess";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { showSuccess } from "@/libs/react.toastify";
import { apis } from "@/apis/booking/hair-transplant/api";
import { decryptId, handleBackendErrors } from "@/utils/helpers";
import { useEffect } from "react";

const BookTheOperation = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id: encryptedId } = useParams();
  const { state } = useLocation();
  const patientId = state?.patientId;
  const operationId = state?.operationId;

  const id = encryptedId ? decryptId(encryptedId) : null;

  const schema = yup.object().shape({
    total: yup.string().required(t("validation.required")),
    paying_type: yup
      .object()
      .typeError(t("validation.required"))
      .shape({
        value: yup.string().required(),
        label: yup.string().required(),
      })
      .required(t("validation.required")),

    // paid: yup.string().when("paying_type", {
    //   is: val => val?.value !== "cash",
    //   then: schema => schema.required(t("validation.required")),
    //   otherwise: schema => schema.notRequired(),
    // }),

    // remaining: yup.string().when("paying_type", {
    //   is: val => val?.value !== "cash",
    //   then: schema => schema.required(t("validation.required")),
    //   otherwise: schema => schema.notRequired(),
    // }),
  });

  const {
    control,
    handleSubmit,
    clearErrors,
    setError,
    formState: { errors, isSubmitting },
    watch,
    setValue,
  } = useForm({
    defaultValues: {},
    resolver: yupResolver(schema),
  });

  useEffect(() => {
    if (state.total) {
      setValue("total", Number(state.total));
    }
  }, [state.total]);

  const payemntMethod = [
    { value: "installment", label: "QI Card" },
    { value: "cash", label: t("surgeries.chash") },
  ];

  const handleCancel = () => {
    navigate(-1);
  };

  const onSubmit = async data => {
    try {
      const dataToSend = {
        paying_type: data.paying_type.value,
        total: Number(data.total),
      };
      clearErrors();
      const response = await apis.changeOperation({ payload: dataToSend, id: operationId });
      showSuccess(response.data?.message);
      navigate(-1);
    } catch (error) {
      handleBackendErrors({ error, setError });
    }
  };

  const BUTTONSLIST = [
    {
      show: true,
      component: (
        <PrimaryButton
          isSubmitting={isSubmitting}
          text={t("booking.confirm-your-reservation")}
          type="submit"
        />
      ),
    },
    {
      show: true,
      component: (
        <PrimaryButton
          text={t("surgeries.print-pledge")}
          otherStyle={"bg-white !text-primary border border-primary"}
          onClick={() => navigate(`/surgeries/print-pledge/${patientId}`)}
        />
      ),
    },
    {
      show: true,
      component: <SecondaryButton text={t("common.cancel2")} onClick={handleCancel} />,
    },
  ];

  // راقب total و paid
  const total = watch("total");
  const paid = watch("paid");

  useEffect(() => {
    if (total && paid) {
      const remaining = Number(total) - Number(paid);
      setValue("remaining", remaining >= 0 ? remaining : 0); // إذا المدفوع أكبر من الإجمالي لا نخليها سالبة
    }
  }, [total, paid]);

  return (
    <div className="py-2">
      <BreadCrumb isAdd title={t("surgeries.book-the-operation")} />
      <form onSubmit={handleSubmit(onSubmit)} className="w-full lg:w-[80%]">
        <Card otherStyle="mb-[16px]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Input
              name="total"
              control={control}
              placeholder={t("surgeries.cost-of-the-operation")}
              isNumberWithCommas
              error={errors?.total?.message}
            />
            <SelectField
              name="paying_type"
              control={control}
              options={payemntMethod}
              placeholder={t("surgeries.payment-way")}
              error={errors?.paying_type?.message}
            />
          </div>
          {/* {watch("paying_type")?.value === "installment" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
              <Input
                name="paid"
                control={control}
                placeholder={t("salary.arrival")}
                isNumberWithCommas
                error={errors?.paid?.message}
              />
              <Input
                name="remaining"
                control={control}
                isNumberWithCommas
                placeholder={t("salary.rest")}
                disable
                error={errors?.remaining?.message}
              />
            </div>
          )} */}
        </Card>
        <CustomFlexButtons
          gap="gap-4"
          justify="justify-start"
          reverse={false}
          buttons={BUTTONSLIST}
        />
      </form>
    </div>
  );
};

export default BookTheOperation;
