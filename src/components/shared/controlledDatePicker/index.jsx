// components/ControlledTimeField.tsx
import React from "react";
import { useController } from "react-hook-form";
import DateTimeField from "../dateTime";

const ControlledTimeField = ({
  name,
  control,
  label,
  placeholder,
  variant = "white",
  type = "date",
  icon,
  errors,
  disable,
  disablePastDates,
  className,
  max,
  min,
}) => {
  const { field } = useController({
    name,
    control,
  });

  return (
    <DateTimeField
      {...field}
      label={label}
      placeholder={placeholder}
      type={type}
      icon={icon}
      disable={disable}
      variant={variant}
      error={errors?.message}
      className={className}
      disablePastDates={disablePastDates}
      max={max}
      min={min}
    />
  );
};

export default ControlledTimeField;
