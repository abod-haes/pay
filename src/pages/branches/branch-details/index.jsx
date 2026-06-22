/* eslint-disable complexity */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable indent */
/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import { Navigate, useNavigate, useParams, useLocation } from "react-router-dom";
import { useTranslation } from "@hooks/useTranslation";
import { useForm } from "react-hook-form";
import Input from "@/components/shared/input";
import TextAreaField from "@/components/shared/textArea";
import Card from "@/components/card";
import BreadCrumb from "@/components/breadcrumb";
import PrimaryButton from "@/components/shared/primaryButton";
import SecondaryButton from "@/components/shared/secondaryButton";
import { showSuccess } from "@/libs/react.toastify";
import { decryptId, handleBackendErrors, hasPermissionFunction } from "@/utils/helpers";
import CustomFlexButtons from "@/components/shared/CustomFlexButtons";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import SelectField from "@/components/shared/select";
import { useBranchesQueries } from "@/apis/branches/query";
import LoadingSection from "@/components/loadingSection";
import { apis } from "@/apis/branches/api";
import useStates from "@/hooks/useStates";
import PhoneNumber from "@/components/phoneNumber";
import { getCountries, getCountryCallingCode } from "react-phone-number-input";
import { PERMISSION_ACTION, PERMISSION_GROUP } from "@/constants/constants";

const isTruthy = value => value === true || value === 1 || value === "1" || value === "true";

const getAuthData = () => {
  try {
    const authString = localStorage.getItem("authData") || sessionStorage.getItem("authData");
    return authString ? JSON.parse(authString) : null;
  } catch {
    return null;
  }
};

const isAuthBranchMain = () => {
  const authData = getAuthData();
  const branch = authData?.user?.branch || authData?.branch;

  return isTruthy(branch?.is_main ?? authData?.user?.branch_is_main ?? authData?.user?.is_main_branch);
};

const canAccessBranchesManagement = () =>
  isAuthBranchMain() &&
  hasPermissionFunction({
    group: PERMISSION_GROUP.Branch,
    type: PERMISSION_ACTION.index,
  });

export const getCountryByCallingCode = code => {
  const countries = getCountries();
  return countries.find(c => getCountryCallingCode(c) === String(code));
};
// eslint-disable-next-line complexity
function resetFormFields(reset, dataToReset) {
  const defaultUser = dataToReset?.default_user || {};

  reset({
    state_id: { label: dataToReset?.state?.name, value: dataToReset?.state?.id },
    notes: dataToReset?.notes,
    address: dataToReset?.address,
    phone_number: dataToReset?.phone_number,
    name: dataToReset?.name,
    country_code: dataToReset?.country_code,
    username: defaultUser?.username || "",
    email: defaultUser?.email || "",
    password: "",
  });
}

const AddBranch = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { id: encryptedId } = useParams();
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const canManageBranches = canAccessBranchesManagement();

  const isAdd = location.pathname.endsWith("/add");
  const isShow = Boolean(query.get("show") === "true");
  const id = !isAdd && encryptedId ? decryptId(encryptedId) : null;
  const isEdit = Boolean(id) && !isShow && !isAdd;
  const { data, isLoading } = useBranchesQueries.GetOne({ id: canManageBranches ? id : null });

  const validationSchema = yup.object().shape({
    name: yup.string().required(t("validation.required")),
    phone_number: yup.string().required(t("validation.required")),
    username: isAdd
      ? yup.string().required(t("validation.required"))
      : yup.string().nullable().notRequired(),
    password: isAdd
      ? yup.string().required(t("validation.required"))
      : yup.string().nullable().notRequired(),
    email: yup.string().nullable().notRequired(),
    notes: yup.string().nullable(),
    address: yup.string().nullable(),
    state_id: yup
      .object()
      .shape({
        label: yup.string().required(t("validation.required")),
        value: yup.string().required(t("validation.required")),
      })
      .required(t("validation.required")),
  });

  const {
    control,
    register,
    handleSubmit,
    reset,
    clearErrors,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      name: "",
      phone_number: "",
      address: "",
      notes: "",
      state_id: null,
      country_code: "964",
      username: "",
      password: "",
      email: "",
    },
    resolver: yupResolver(validationSchema),
  });
  const [phoneNumberReady, setPhoneNumberReady] = useState(false);

  useEffect(() => {
    if ((isEdit || isShow) && id && !isAdd) {
      const dataToReset = data?.data?.data;
      resetFormFields(reset, dataToReset);

      if (dataToReset?.country_code) {
        setPhoneNumberReady(true);
      }
    } else {
      setPhoneNumberReady(true);
    }
  }, [id, isAdd, isEdit, isShow, data?.data, reset]);

  useEffect(() => {
    if ((isEdit || isShow) && id && !isAdd) {
      const dataToReset = data?.data?.data;
      resetFormFields(reset, dataToReset);
    }
  }, [id, isAdd, data?.data]);

  const onSubmit = async data => {
    if (!canManageBranches) return;

    try {
      const dataToSend = {
        name: data.name,
        address: data.address,
        notes: data.notes,
        state_id: data.state_id.value,
        phone_number: data.phone_number,
        country_code: data.country_code || null,
        ...(isAdd
          ? {
              username: data.username,
              password: data.password,
            }
          : {}),
      };

      clearErrors();

      const response = isEdit
        ? await apis.update({ id, payload: dataToSend })
        : await apis.add({ payload: dataToSend });

      showSuccess(response?.data.message);
      navigate(-1);
    } catch (error) {
      handleBackendErrors({ error, setError });
    }
  };

  const handleCancel = () => {
    navigate(-1);
  };

  const { isLoadingStates, items } = useStates();

  const TITLE = isAdd
    ? t("branches.add-branch")
    : isShow
    ? t("branches.view-branch")
    : t("branches.edit-branch");

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
      show: true,
      component: <SecondaryButton text={t("common.cancel2")} onClick={handleCancel} />,
    },
  ];

  if (!canManageBranches) {
    return <Navigate to="/homepage" replace />;
  }

  return (
    <div>
      <BreadCrumb isAdd title={TITLE} link="/branches" />
      <Card otherStyle={"max-md:!w-full !w-[80%]"}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <LoadingSection isLoading={isLoading && !isAdd} otherStyle={"h-full"} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              name="name"
              control={control}
              placeholder={t("branches.branch-name")}
              error={errors?.name?.message}
              disable={isShow}
            />

            {phoneNumberReady && (
              <PhoneNumber
                control={control}
                defaultCountry={getCountryByCallingCode(data?.data?.data?.country_code) || "IQ"}
                name={"phone_number"}
                phoneName={"country_code"}
                placeholder={t("common.phone-number")}
                register={register}
                errors={errors.phone_number?.message}
                disable={isShow}
              />
            )}

            {isAdd && (
              <>
                <Input
                  name="username"
                  control={control}
                  placeholder={t("common.user")}
                  error={errors?.username?.message}
                  autoComplete="username"
                />
                <Input
                  name="password"
                  control={control}
                  placeholder={t("common.password")}
                  error={errors?.password?.message}
                  type="password"
                  autoComplete="new-password"
                />
              </>
            )}

            {isShow && (
              <>
                <Input
                  name="username"
                  control={control}
                  placeholder={t("common.user")}
                  error={errors?.username?.message}
                  disable
                />
                <Input
                  name="email"
                  control={control}
                  placeholder={t("common.email")}
                  error={errors?.email?.message}
                  disable
                />
              </>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <SelectField
              name="state_id"
              control={control}
              options={items}
              placeholder={t("users.city")}
              disabled={isShow}
              loading={isLoadingStates}
              error={errors.state_id?.message || errors.state_id?.label?.message}
            />

            <TextAreaField
              {...register("address")}
              placeholder={t("common.address")}
              rows={1}
              disable={isShow}
              error={errors?.address?.message}
            />
          </div>

          <TextAreaField
            {...register("notes")}
            placeholder={t("common.notes")}
            rows={3}
            variant="white"
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
};

export default AddBranch;
