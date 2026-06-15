/* eslint-disable complexity */
import { useNavigate } from "react-router-dom";
import PrimaryButton from "../shared/primaryButton";
import add from "@assets/svgs/common/arrow-down.svg";
import { useTranslation } from "react-i18next";

const BreadCrumb = ({
  title,
  link,
  onClick,
  isAdd = false,
  buttonText,
  buttonType = "button",
  isStatue,
  statue,
  bgColor,
  customSection,
  customButtonText,
  customStatus,
  hideBrimaryButton = false,
  showArrow = true,
}) => {
  const { i18n } = useTranslation();
  const navigate = useNavigate();

  return (
    <div
      className={
        "flex md:flex-row flex-col z-10 bg-[#f9f9f9] p-4 sticky top-0 left-0 items-start md:items-center justify-between w-full gap-4 md:gap-2 mb-4"
      }
    >
      <div className="flex gap-2">
        {isAdd ? (
          <div
            onClick={() => {
              navigate(-1);
            }}
            className="cursor-pointer flex gap-2 text-black text-[1.25rem]"
            to={link}
          >
            {isAdd && showArrow && (
              <img
                src={add}
                width={15}
                alt="add"
                className={`${i18n.language === "ar" ? "-rotate-90" : "rotate-90"} cursor-pointer`}
              />
            )}
            {title}
          </div>
        ) : (
          <p className="cursor-pointer text-black text-[1.25rem]">{title}</p>
        )}
        {isStatue &&
          (customStatus ? (
            customStatus
          ) : (
            <div
              className={`px-[33px] py-[6px] ${bgColor} text-white font-main text-[0.75rem] rounded`}
            >
              {statue}
            </div>
          ))}
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        {customSection && customSection}
        {!hideBrimaryButton && !isAdd && (
          <PrimaryButton
            text={customButtonText ? customButtonText : `+${buttonText}`}
            type={buttonType}
            onClick={onClick}
          />
        )}
      </div>
    </div>
  );
};

export default BreadCrumb;
