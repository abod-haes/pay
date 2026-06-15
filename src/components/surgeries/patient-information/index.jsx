/* eslint-disable complexity */
/* eslint-disable no-unused-vars */
import Card from "@/components/card";
import TitleOfSections from "../titleOfSections";
import { useTranslation } from "react-i18next";
import SelectField from "@/components/shared/select";
import Input from "@/components/shared/input";
import usePatients from "@/hooks/usePaitients";
import useEmployees from "@/hooks/useEmployess";
import { useEffect, useState, useMemo, useRef } from "react";
import { Controller } from "react-hook-form";
import useCities from "@/hooks/useCities";
import { getUserData, isEmployee } from "@/utils/helpers";
import PhoneNumber from "@/components/phoneNumber";
import { getCountries, getCountryCallingCode } from "react-phone-number-input";
import DatePicker from "@/components/shared/controlledDatePicker";
import TextArea from "@/components/shared/textArea";

export const getCountryByCallingCode = code => {
  const countries = getCountries();
  return countries.find(c => getCountryCallingCode(c) === String(code));
};

// eslint-disable-next-line complexity
const PatientInformation = ({ control, watch, setValue, errors, dirtyFields, register }) => {
  const { t } = useTranslation();
  const { isLoadingPatients: isLoadingPatients, items: patients } = usePatients({
    available: false,
  });
  const { isLoadingPatients: isLoadingStates, items: stases } = useCities({});
  const { isLoadingPatients: isLoadingEmployees, items: employees } = useEmployees({
    type: "employee",
  });

  const [currentUser, setCurrentUser] = useState(null);
  const [isEmployeeUser, setIsEmployeeUser] = useState(false);
  const selectedPatientId = watch("patient_id")?.value;
  const isPatientSelected = !!selectedPatientId;

  useEffect(() => {
    const userData = getUserData();
    setCurrentUser(userData?.user || null);
    setIsEmployeeUser(isEmployee());
  }, []);

  // Create employee options based on user type
  const currentUserEmployeeOption = useMemo(() => {
    if (!currentUser) {
      return null;
    }
    return {
      label: currentUser.full_name,
      value: currentUser.id.toString(),
    };
  }, [currentUser]);

  const employeeOptions = isEmployeeUser
    ? currentUserEmployeeOption
      ? [currentUserEmployeeOption]
      : []
    : employees;

  // Set employee_id to current user if user is an employee
  useEffect(() => {
    if (isEmployeeUser && currentUserEmployeeOption) {
      const currentValue = watch("employee_id");

      if (!currentValue || currentValue.value !== currentUserEmployeeOption.value) {
        setValue("employee_id", currentUserEmployeeOption, {
          shouldValidate: true,
          shouldTouch: true,
        });
      }
    }
  }, [isEmployeeUser, currentUserEmployeeOption, setValue, watch]);

  const loadedPatientId = useRef(null);

  useEffect(() => {
    if (patients?.length && selectedPatientId) {
      // Only update if the patient ID has changed to prevent infinite loops
      // initiated by unstable 'patients' dependency reference
      if (loadedPatientId.current !== selectedPatientId) {
        const p = patients.find(p => p.id === selectedPatientId);
        if (p) {
          // Phone Numbers
          setValue("phone_number1", p.first_phone_number || "");
          setValue("phone_number2", p.second_phone_number || "");
          setValue("employee_id", { label: p.employee?.full_name, value: p.employee?.id });

          // City / State
          if (p.state) {
            setValue("city", {
              label: p.state.name,
              value: p.state.id,
            });
          }

          // Address
          setValue("address", p.address || "");

          // Birth Date
          setValue("birth_date", p.birth_date ? p.birth_date.split("T")[0] : "");

          // Gender
          if (p.gender) {
            setValue("gender", {
              label: p.gender === "male" ? t("common.male") : t("common.female"),
              value: p.gender,
            });
          }

          // Notes
          setValue("notes", p.notes || "");

          loadedPatientId.current = selectedPatientId;
        }
      }
    }

    if (!selectedPatientId) {
      // Only clear if we actually had a patient loaded or if the field is dirty
      if (loadedPatientId.current || dirtyFields?.patient_id) {
        setValue("phone_number1", "");
        setValue("phone_number2", "");
        setValue("city", null);
        setValue("address", "");
        setValue("birth_date", "");
        setValue("gender", null);
        setValue("notes", "");

        // Reset Medical Info
        setValue("chronic_diseases", "no");
        setValue("chronic_diseases_description", "");
        setValue("drug_allergy", "no");
        setValue("drug_allergy_description", "");
        setValue("previous_surgery", "no");
        setValue("previous_surgery_description", "");

        loadedPatientId.current = null;
      }
    }
  }, [patients, selectedPatientId, setValue, dirtyFields, t]);

  return (
    <div className="grid gap-[16px]">
      <TitleOfSections title={t("surgeries.patient-information")} />
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <SelectField
            name="patient_id"
            control={control}
            options={patients}
            loading={isLoadingPatients}
            placeholder={t("booking.patient")}
            error={errors?.patient_id?.message || errors?.patient_id?.label?.message}
          />
          <SelectField
            name="employee_id"
            control={control}
            options={employeeOptions}
            placeholder={t("surgeries.admin-of-name")}
            loading={isLoadingEmployees}
            error={errors?.employee_id?.message || errors?.employee_id?.label?.message}
            disabled={true}
          />

          <Input
            control={control}
            name={"phone_number1"}
            placeholder={t("surgeries.phone-number")}
            register={register}
            error={errors.phone_number1?.message}
            disable={isPatientSelected}
            type="number"
          />
          <Input
            control={control}
            name={"phone_number2"}
            placeholder={t("surgeries.phone-number2")}
            register={register}
            error={errors.phone_number2?.message}
            type="number"
            disable={isPatientSelected}
          />
          <SelectField
            name="city"
            control={control}
            options={stases}
            isDisabled={isPatientSelected}
            placeholder={t("users.city")}
          />
          <div className="col-span-1 md:col-span-2">
            <Controller
              name="notes"
              control={control}
              render={({ field }) => (
                <TextArea
                  {...field}
                  label={t("common.notes")}
                  placeholder={t("common.notes")}
                  disable={isPatientSelected}
                  rows={4}
                />
              )}
            />
          </div>
        </div>
      </Card>
    </div>
  );
};

export default PatientInformation;
