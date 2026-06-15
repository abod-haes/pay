import React, { useEffect } from "react";
import Modal from "../modal";
import SecondaryButton from "../../secondaryButton";
import LoadingElement from "../../loading";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import SelectField from "../../select";
import useEmployees from "@/hooks/useEmployess";
import PrimaryButton from "../../primaryButton";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";

export default function AddDoctorModal({ isOpen, onClose, onSubmit, isSubmitting = false }) {
  const { t } = useTranslation();
  const validationSchema = yup.object().shape({
    doctor_id: yup
      .object()
      .shape({
        label: yup.string().required(),
        value: yup.number().required(),
      })
      .required(t("validation.required")),
  });
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(validationSchema),
    defaultValues: { doctor_id: null },
  });

  const { isLoadingEmployees2, items: employees2 } = useEmployees({ type: "doctor" });

  useEffect(() => {
    if (!isOpen) {
      reset();
    }
  }, [isOpen, reset]);

  const handleFormSubmit = data => {
    onSubmit(data);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Modal open={isOpen} onClose={handleClose}>
      <form
        onSubmit={handleSubmit(handleFormSubmit)}
        className="bg-white w-full md:min-w-md rounded-2xl shadow-lg relative flex flex-col gap-6 justify-between h-full py-8 px-8"
      >
        <p className="font-main text-primary text-[1.2rem] font-semibold">
          {t("doctors.add-doctor")}
        </p>

        <SelectField
          name="doctor_id"
          control={control}
          options={employees2}
          loading={isLoadingEmployees2}
          placeholder={t("permission.select")}
          error={errors.doctor_id?.message}
        />

        <div className="flex items-center gap-4">
          <PrimaryButton
            text={isSubmitting ? <LoadingElement size={18} /> : t("common.save")}
            variant={"solid"}
            type="submit"
            disabled={isSubmitting}
          />
          <SecondaryButton
            onClick={handleClose}
            text={t("common.cancel2")}
            type="button"
            disabled={isSubmitting}
          />
        </div>
      </form>
    </Modal>
  );
}
