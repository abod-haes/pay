import { Controller } from "react-hook-form";
import PhoneInputLib, { getCountries, getCountryCallingCode } from "react-phone-number-input";
import Arrow from "@assets/svgs/common/arrow-down.svg";
import { useState, useRef, useEffect } from "react";
import ReactCountryFlag from "react-country-flag";
import i18n from "i18n-iso-countries";
import en from "i18n-iso-countries/langs/en.json";
import ar from "i18n-iso-countries/langs/ar.json";
import "react-phone-number-input/style.css";
import { useTranslation } from "react-i18next";
import { useVirtualizer } from "@tanstack/react-virtual";

// Initialize i18n
i18n.registerLocale(en);
i18n.registerLocale(ar);

const CustomArrowIcon = ({ isOpen }) => (
  <div>
    <img
      src={Arrow}
      alt="arrow"
      className={`max-w-[10px] ${isOpen ? "rotate-180 transition-all duration-200" : ""}`}
    />
  </div>
);

const PhoneInput = ({
  control,
  name,
  defaultCountry = "EG",
  customStyle,
  showCodeBeforeFlag = true,
  phoneNumberFontSize = "14px",
  disabled,
  disabledStyle,
  containerStyle,
  setIsOpenMenu,
  isOpenMenu,
}) => {
  const [phoneNumber, setPhoneNumber] = useState(defaultCountry);
  const phoneInputRef = useRef(null);
  const countries = getCountries();
  const [searchValue, setSearchValue] = useState("");
  const { i18n: languga } = useTranslation();

  const filteredCountries = countries.filter(country => {
    const name = i18n.getName(country, "ar");
    return name?.toLowerCase().includes(searchValue.toLowerCase());
  });

  useEffect(() => {
    const handleClickOutside = event => {
      if (phoneInputRef.current && !phoneInputRef.current.contains(event.target)) {
        setIsOpenMenu(false);
      }
    };
    const handleKeyDown = event => {
      if (event.key === "Escape") setIsOpenMenu(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const getCountryName = countryCode => {
    return i18n.getName(countryCode, languga.language);
  };

  const { t } = useTranslation();

  const parentRef = useRef(null);

  const rowVirtualizer = useVirtualizer({
    count: filteredCountries.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 50, // height of each row
  });

  return (
    <div
      className={`flex items-center border-e border-gray-50 border-border_stroke w-full h-full px-3 relative cursor-pointer ${
        containerStyle || ""
      } ${disabled ? disabledStyle : ""}`}
      onClick={() => {
        if (!disabled) setIsOpenMenu(true);
      }}
      ref={phoneInputRef}
    >
      <style>
        {`
  /* PhoneInput font size */
  .phoneNumber p {
    font-size: 14px;
  }


  /* Disabled state */
  .PhoneInput--disabled {
    cursor: not-allowed !important;
  }

  /* Country select container */
  .PhoneInputCountry {
    background: transparent !important;
    cursor: pointer !important;
    position: relative !important;
    z-index: 1 !important;
  }

  /* Country flag icon */
  .PhoneInputCountryIcon {
    width: 20px !important;
    height: auto !important;
  }

  /* Hidden country select overlay */
  .PhoneInputCountrySelect {
    position: absolute !important;
    top: 0 !important;
    left: 0 !important;
    height: 100% !important;
    width: 100% !important;
    z-index: 2 !important;
    opacity: 0 !important;
    cursor: pointer !important;
  }

  /* Hide default arrow */
  .PhoneInputCountrySelectArrow {
    display: none !important;
  }

  /* Hide default input inside PhoneInput */
  .PhoneInput input {
    display: none !important;
  }

  /* Dropdown country item */
  .country-item {
    padding: 12px;
    display: flex;
    gap: 12px;
    align-items: center;
    cursor: pointer;
    transition: all 0.3s;
    border-bottom: 1px solid #d9dfe4;
  }

  /* Active country highlight */
  .country-item.active {
    background-color: #E0F2FE; /* Primary_100 */
  }

  /* Search input in dropdown */
  .phone-search-input {
    width: 100%;
    padding: 8px 12px;
    border: 1px solid #d9dfe4;
    border-radius: 6px;
    background: #f5f5f5;
    font-size: 13px;
    outline: none;
  }

  .phone-search-input:focus {
    border-color: #43C3F0;
    box-shadow: 0 0 0 2px rgba(67, 195, 240, 0.2);
  }

  /* Empty state */
  .no-data {
    height: 235px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 13px;
    color: #9CA3AF; /* text-text_secondary */
  }
`}
      </style>

      <div className="flex gap-2 items-center ml-2">
        <Controller
          control={control}
          name={name}
          render={({ field: { onChange, onBlur, ref } }) => (
            <PhoneInputLib
              ref={ref}
              onBlur={() => {
                onBlur();
                setTimeout(() => setIsOpenMenu(false), 200);
              }}
              defaultCountry={phoneNumber}
              className="phoneNumber w-full"
              international
              disabled
              countryCallingCodeEditable={false}
              onCountryChange={e => {
                onChange(getCountryCallingCode(e));
                setPhoneNumber(e);
              }}
              countryCallingCodePosition={showCodeBeforeFlag ? "before" : "after"}
              style={customStyle}
            />
          )}
        />

        {/* Virtualized Country List */}
        <div
          className={`absolute top-10 w-[220px] start-0 bg-[#fff] border border-gray-200 rounded-md z-20 overflow-hidden ${
            isOpenMenu ? "block" : "hidden"
          }`}
        >
          {/* Search Input */}
          <div className="p-2">
            <input
              type="text"
              placeholder={t("common.search")}
              value={searchValue}
              onChange={e => setSearchValue(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 border-border_stroke rounded-md text-[13px] bg-[#f5f5f5] focus:outline-none focus:ring-2 focus:ring-Primary"
            />
          </div>

          {/* Virtualized List */}
          {filteredCountries.length > 0 ? (
            <div className="max-h-[235px] overflow-y-auto">
              {filteredCountries.map(country => (
                <div
                  key={country}
                  className={`px-3 py-3 hover:bg-gray-200 flex items-center gap-2 text-[13px] border-b border-stroke border-gray-300 cursor-pointer transition-all duration-300 hover:bg-Primary_100 ${
                    country === phoneNumber ? "bg-Primary_100" : ""
                  }`}
                  onClick={e => {
                    e.stopPropagation();
                    setIsOpenMenu(false);
                    setPhoneNumber(country);
                    setSearchValue("");
                  }}
                >
                  <ReactCountryFlag countryCode={country} svg />
                  <span>{getCountryName(country)}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-[235px] flex items-center justify-center text-[13px] text-text_secondary">
              {t("noData")}
            </div>
          )}
        </div>

        <p className="" style={{ fontSize: phoneNumberFontSize }}>
          +{getCountryCallingCode(phoneNumber)}
        </p>
        <CustomArrowIcon isOpen={isOpenMenu} />
      </div>
    </div>
  );
};

export default PhoneInput;
