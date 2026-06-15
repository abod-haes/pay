import PhoneInput from "../phoneInput";
import { useState } from "react";
import Input from "../shared/input";
const PhoneNumber = ({
  errors,
  control,
  register,
  name,
  placeholder,
  phoneName,
  defaultCountry,
  label,
  wrapperElementClasses,
  inputCalsses,
  lableClasses,
  disable,
}) => {
  const [isOpenMenu, setIsOpenMenu] = useState(false);
  const [focus, setFocus] = useState(false);

  return (
    <div className="h-full relative">
      <div className={`flex flex-col gap-1 h-auto ${wrapperElementClasses || ""}`}>
        {label && (
          <label className={`text-sm gray-color mb-1 font-din-regular-base ${lableClasses}`}>
            {label}
          </label>
        )}

        <div
          className={`flex w-full h-full border border-accent bg-white transition-all duration-300 rounded-[10px] ${
            errors ? "border-red-500 bg-[#FFF1F2]" : ""
          }`}
          onFocus={() => setFocus(true)}
          onBlur={() => setFocus(false)}
        >
          <div className="w-[6em] flex items-end">
            <PhoneInput
              control={control}
              defaultCountry={defaultCountry || "EG"}
              name={phoneName}
              errorMessage={errors}
              isOpenMenu={isOpenMenu}
              setIsOpenMenu={setIsOpenMenu}
              inputCalsses={inputCalsses}
              disabled={disable}
              disabledStyle="cursor-default"
            />
          </div>

          <div className="w-full h-full">
            <Input
              control={control}
              name={name}
              placeholder={placeholder}
              disable={disable}
              otherInputStyle={"!border-none focus:!ring-0 focus:!border-none"}
              variant="white"
              type="number"
            />
          </div>
        </div>
      </div>

      {errors && <span className="pt-2 text-sm text-red-500">{errors}</span>}
    </div>
  );
};

export default PhoneNumber;
