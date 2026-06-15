import React, { useEffect } from "react";
import logo from "@assets/svgs/common/logo.svg";
import { useTranslation } from "react-i18next";
export default function ForgetPassword() {
  const { t } = useTranslation();
  useEffect(() => {
    document.body.style.backgroundColor = "white";
    document.documentElement.style.backgroundColor = "white";

    return () => {
      document.body.style.backgroundColor = "";
      document.documentElement.style.backgroundColor = "";
    };
  }, []);
  return (
    <div className="flex flex-col justify-center items-center bg-white gap-4 py-6 min-h-screen ">
      <div className="w-[416px] h-[300px] ">
        <img src={logo} alt="logo" className="w-full h-full object-contain" />
      </div>
      <div className="bg-white w-full md:max-w-[35%] shadow-[0_0_10px_rgba(0,0,0,0.1)] py-10 px-10 rounded-md h-full">
        <h1 className="text-secondary text-[1.25rem] mb-4">{t("login.forget")}</h1>
        <p className="text-accent font-main text-[1rem]  ">{t("login.text2")}</p>
      </div>
    </div>
  );
}
