import React, { useMemo, useRef, useState } from "react";
import Select from "react-select";
import downArrow from "@assets/svgs/common/arrow-down.svg";
import close from "@assets/svgs/common/cross.svg";
import { Controller } from "react-hook-form";
import { truncateText } from "@/utils/helpers";
import { useTranslation } from "react-i18next";

const CustomMenuList = props => {
  const { children, selectProps } = props;
  const listRef = useRef(null);

  const handleScroll = e => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    const isBottom = scrollHeight - scrollTop <= clientHeight + 5;
    if (isBottom && selectProps.hasNextPage && !selectProps.isFetchingNextPage) {
      selectProps.fetchNextPage();
    }
  };

  return (
    <div ref={listRef} style={{ maxHeight: "200px", overflowY: "auto" }} onScroll={handleScroll}>
      {children}
      {selectProps.isFetchingNextPage && (
        <div className="text-center p-2 text-gray-500">Loading more...</div>
      )}
    </div>
  );
};

const SelectField = ({
  label,
  name,
  options = [],
  placeholder,
  value = [],
  onChange,
  disabled,
  error,
  width,
  labelStyle,
  selectStyle,
  icon,
  withSearch = true,
  multiple = false,
  loading = false,
  onSearchChange,
  minHeight,
  control,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
  menuPlacement = "auto",
  isClearable = true,
  useMenuPortal = false, // prop جديدة لتفعيل البورتال عند الحاجة
  ...rest
}) => {
  const [menuIsOpen, setMenuIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const { i18n } = useTranslation();
  const isRTL = ["ar", "fa"].includes(i18n.language);
  const customStyles = {
    control: (provided, state) => ({
      ...provided,
      minHeight: minHeight || "46px",
      borderColor: state.isFocused ? "#29b4c3" : error ? "#ef4444" : "#c1c1c1",
      borderRadius: "0.5rem",
      backgroundColor: disabled ? "#f6f3f4" : loading ? "#F9FAFB" : "white",
      cursor: disabled ? "not-allowed" : loading ? "wait" : "pointer",
      boxShadow: "none",
      fontSize: "0.87rem",
      "&:hover": {
        borderColor: state.isFocused ? "#29b4c3" : error ? "#ef4444" : "#c1c1c1",
      },
      ...(selectStyle && typeof selectStyle === "object" ? selectStyle : {}),
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected ? "#E5E7EB" : state.isFocused ? "#F3F4F6" : "white",
      color: "#2A2B2D",
      textAlign: isRTL ? "right" : "left",
      padding: "12px",
      cursor: "pointer",
      fontSize: "14px",
    }),
    menu: provided => ({
      ...provided,
      zIndex: 9999,
      borderRadius: "0.5rem",
      marginTop: "4px",
      maxHeight: "200px",
      border: "1px solid #E5E7EB",
      backgroundColor: "white",
      overflow: "hidden",
    }),
    multiValue: provided => ({
      ...provided,
      backgroundColor: "#F3F4F6",
      borderRadius: "4px",
      padding: "2px",
      marginRight: "4px",
    }),
    multiValueLabel: provided => ({
      ...provided,
      color: "#2A2B2D",
      padding: "2px",
    }),
    multiValueRemove: provided => ({
      ...provided,
      color: "#6B7280",
      ":hover": {
        backgroundColor: "transparent",
        color: "#EF4444",
      },
    }),
    placeholder: provided => ({
      ...provided,
      color: "#c1c1c1",
    }),
    valueContainer: provided => ({
      ...provided,
      flexWrap: multiple ? "wrap" : "nowrap",
      gap: multiple ? "4px" : "0",
    }),
    singleValue: provided => ({
      ...provided,
      color: disabled ? "#2A2B2D" : "#333333",
    }),
    input: provided => ({
      ...provided,
      color: disabled ? "#2A2B2D" : "#333333",
    }),
  };

  const DropdownIndicator = () => (
    <div className={`absolute ${!isClearable ? "left-2" : isRTL ? "left-8" : "right-8"}`}>
      <img src={downArrow} alt="dropdown arrow" className="w-4 h-4" />
    </div>
  );

  const ClearIndicator = props => (
    <div
      {...props.innerProps}
      className={`absolute ${isRTL ? "left-2" : "right-3"} cursor-pointer`}
    >
      <img
        src={close}
        alt="remove"
        className="w-[20px] h-[15px]"
        style={{ filter: "invert(0.6)" }}
      />
    </div>
  );

  // تخصيص مكون Option لعرض النص المقطوع
  const CustomOption = props => {
    return (
      <div {...props.innerProps} style={props?.getStyles("option", props)}>
        {truncateText({ text: props.label, maxLength: 5 })}
      </div>
    );
  };

  // تخصيص مكون SingleValue لعرض النص المقطوع
  const CustomSingleValue = props => {
    return (
      <div {...props.innerProps} style={props?.getStyles("singleValue", props)}>
        {truncateText({ text: props.data.label, maxLength: 5 })}
      </div>
    );
  };

  // تخصيص مكون MultiValueLabel لعرض النص المقطوع
  const CustomMultiValueLabel = props => {
    return (
      <div {...props.innerProps} style={props.style || {}}>
        {truncateText({ text: props.data.label, maxLength: 5 })}
      </div>
    );
  };

  const filteredOptions = useMemo(() => {
    if (onSearchChange) {
      return options;
    }

    const lowerInput = inputValue.toLowerCase();

    return options.filter(option => option.label?.toLowerCase().includes(lowerInput));
  }, [inputValue, options, onSearchChange]);

  return (
    <div
      className={`flex flex-col ${width ? `w-[${width}]` : "w-full"}`}
      dir={isRTL ? "rtl" : "ltr"}
    >
      {label && (
        <label className={`text-sm text-[#2A2B2D] mb-1 font-din-regular-base ${labelStyle}`}>
          {label}
        </label>
      )}

      <div className="relative">
        <Controller
          name={name}
          control={control}
          render={({ field }) => {
            const getOptionFromValue = (value, options, isMulti = false) => {
              if (isMulti) {
                return Array.isArray(value) ? value : [];
              } else {
                return value || null;
              }
            };

            // يمكنك الآن حذف منطق selectedOptions ودمجها، لأن القيم المختارة ستكون دومًا كائنات كاملة
            const memoizeOption = useMemo(() => {
              return getOptionFromValue(field.value, options, multiple);
            }, [field.value, options, multiple]);

            // تحديد إذا كان هناك قيمة مختارة
            const hasValue = multiple
              ? Array.isArray(field.value) && field.value.length > 0
              : !!field.value;

            // اختيار المكون المناسب حسب الحالة (عكس المطلوب سابقاً)
            const selectComponents = {
              MenuList: CustomMenuList,
              IndicatorSeparator: null,
              ClearIndicator,
              Option: CustomOption,
              SingleValue: CustomSingleValue,
              MultiValueLabel: CustomMultiValueLabel,
            };
            if (hasValue) {
              selectComponents.DropdownIndicator = DropdownIndicator;
            }

            return (
              <Select
                {...field}
                isMulti={multiple}
                styles={{
                  ...customStyles,
                  ...(useMenuPortal && {
                    menuPortal: base => ({ ...base, zIndex: 20000 }),
                  }),
                }}
                // options={options}
                options={filteredOptions}
                filterOption={() => true}
                placeholder={placeholder}
                value={memoizeOption}
                onChange={selected => {
                  if (multiple) {
                    field.onChange(selected || []);
                  } else {
                    field.onChange(selected || null);
                  }
                  onChange?.(selected);
                }}
                onInputChange={val => {
                  setInputValue(val);
                  if (onSearchChange) {
                    onSearchChange(val);
                  }
                  setMenuIsOpen(true);
                }}
                isClearable={isClearable}
                inputValue={inputValue}
                menuIsOpen={menuIsOpen}
                onMenuOpen={() => setMenuIsOpen(true)}
                onMenuClose={() => setMenuIsOpen(false)}
                isLoading={loading}
                isDisabled={disabled}
                components={selectComponents}
                menuPlacement="auto"
                fetchNextPage={fetchNextPage}
                hasNextPage={hasNextPage}
                isFetchingNextPage={isFetchingNextPage}
                {...(useMenuPortal
                  ? { menuPortalTarget: document.body, menuPlacement }
                  : { menuPlacement })}
                {...rest}
              />
            );
          }}
        />

        {icon && (
          <div
            className={`absolute ${
              isRTL ? "right-3" : "left-3"
            } top-1/2 transform -translate-y-1/2 pointer-events-none`}
          >
            <img src={icon} alt="icon" className="w-5 h-5" />
          </div>
        )}
      </div>

      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
};

export default SelectField;
