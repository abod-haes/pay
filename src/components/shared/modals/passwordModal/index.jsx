import React, { useState, useEffect } from "react";
import Modal from "../modal";
import { useTranslation } from "react-i18next";
import Input from "../../input";
import PrimaryButton from "../../primaryButton";
import SecondaryButton from "../../secondaryButton";
import { apis } from "@/apis/employee/api";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { handleBackendErrors } from "@/utils/helpers";
import { showSuccess } from "@/libs/react.toastify";
import eye from "@assets/svgs/login/eye.svg";
import eyeSlach from "@assets/svgs/login/eye-slash.svg";
import lock from "@assets/svgs/login/lock.svg";
export default function PasswordModal({ isOpen, onClose, userId }) {
  const { t, i18n } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const validationSchema = Yup.object().shape({
    // current_password: Yup.string().required(t("validation.required")),
    password: Yup.string()
      .required(t("validation.required"))
      .min(8, t("validation.password_min_length"))
      .notOneOf([Yup.ref("current_password")], t("validation.new_password_diff")),
    password_confirmation: Yup.string()
      .required(t("validation.required"))
      .oneOf([Yup.ref("password")], t("validation.password_mismatch")),
  });

  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isValid },
    reset,
    setError,
    watch,
  } = useForm({
    resolver: yupResolver(validationSchema),

    defaultValues: {
      password: "",
      password_confirmation: "",
    },
  });
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  useEffect(() => {
    if (isOpen) {
      reset();
    }
  }, [isOpen, reset]);

  const onSubmit = async data => {
    try {
      setIsLoading(true);

      const passwordData = {
        password: data.password,
        password_confirmation: data.password_confirmation,
      };

      const res = await apis.changePassword({ id: userId, payload: passwordData });

      showSuccess(res?.data?.message);

      reset();
      onClose();
    } catch (error) {
      handleBackendErrors({ setError, error });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    reset();
    onClose();
  };

  const isFormValid = isValid && !isLoading;

  return (
    <Modal open={isOpen} onClose={onClose} overlayStyle="p-4">
      <div className="flex flex-col gap-4 p-4 bg-white max-h-[80vh] rounded md:min-w-[594px] min-w-[400px]">
        <p className={"text-[1rem] mb-4 font-main "}>{t("common.change_password")}</p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* <Input
            name="current_password"
            label={t("profile.current")}
            placeholder={t("profile.enter_current")}
            type="password"
            error={errors.current_password?.message}
            {...register("current_password")}
            disabled={isLoading}
            control={control}
          /> */}

          <Input
            name="password"
            control={control}
            label={t("profile.new")}
            placeholder={t("profile.enter_new")}
            labelStyle={eye}
            type={showPassword ? "text" : "password"}
            leftIcon={showPassword ? eye : eyeSlach}
            onLeftIconClick={togglePasswordVisibility}
            leftIconClickable={true}
            error={errors.password?.message}
            disabled={isLoading}
          />

          <Input
            name="password_confirmation"
            control={control}
            label={t("profile.confirm")}
            placeholder={t("profile.enter_confirm")}
            labelStyle={eye}
            type={showPassword ? "text" : "password"}
            leftIcon={showPassword ? eye : eyeSlach}
            onLeftIconClick={togglePasswordVisibility}
            leftIconClickable={true}
            error={errors.password_confirmation?.message}
            disabled={isLoading}
          />

          <div className={"flex items-center gap-2 pt-4"}>
            <SecondaryButton
              text={t("common.cancel")}
              onClick={handleCancel}
              type="button"
              disabled={isLoading}
            />
            <PrimaryButton
              text={t("common.save")}
              variant={"solid"}
              type="submit"
              loading={isLoading}
            />
          </div>
        </form>
      </div>
    </Modal>
  );
}
