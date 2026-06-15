/* eslint-disable complexity */
import React, { useEffect, useState } from "react";
import logo from "@assets/svgs/common/logo.svg";
import { useForm } from "react-hook-form";
import LoadingElement from "@/components/shared/loading";
import Input from "@/components/shared/input";
import eye from "@assets/svgs/login/eye.svg";
import eyeSlach from "@assets/svgs/login/eye-slash.svg";
import lock from "@assets/svgs/login/lock.svg";
import user from "@assets/svgs/login/user.svg";
import { Link, useNavigate } from "react-router-dom";
import CheckboxField from "@/components/shared/checkbox";
import { useTranslation } from "react-i18next";
import { showSuccess } from "@/libs/react.toastify";
import { handleBackendErrors } from "@/utils/helpers";
import { AuthApis } from "@/apis/auth/api";
import { useSettingsQueries } from "@/apis/setting/query";

export default function Login() {
  const { t } = useTranslation();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const domain = location.state?.domain || window.location.hostname;
  const { data: specialData } = useSettingsQueries.GetAll({ domain_name: domain });
  const {
    control,
    register,
    handleSubmit,
    reset,
    clearErrors,
    setValue,
    watch,
    setError,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  useEffect(() => {
    let authData = localStorage.getItem("authData");
    if (!authData) {
      authData = sessionStorage.getItem("authData");
    }
    if (authData) {
      navigate("/homepage");
    }
  }, [navigate]);

  useEffect(() => {
    const savedCredentials = localStorage.getItem("rememberedCredentials");

    if (savedCredentials) {
      try {
        const { email, password, expires } = JSON.parse(savedCredentials);

        if (!expires || Date.now() < expires) {
          setValue("email", email);
          setValue("password", password);
          setValue("rememberMe", true);
        } else {
          localStorage.removeItem("rememberedCredentials");
        }
      } catch (error) {
        console.error("Error parsing credentials:", error);
      }
    }
  }, [setValue]);

  useEffect(() => {
    if (!watch("rememberMe")) {
      const handleTabClose = () => {
        localStorage.removeItem("rememberedCredentials");
      };
      window.addEventListener("beforeunload", handleTabClose);
      return () => {
        window.removeEventListener("beforeunload", handleTabClose);
      };
    }
  }, [watch("rememberMe")]);

  useEffect(() => {
    document.body.style.backgroundColor = "white";
    document.documentElement.style.backgroundColor = "white";

    return () => {
      document.body.style.backgroundColor = "";
      document.documentElement.style.backgroundColor = "";
    };
  }, []);

  const onSubmit = async data => {
    setIsLoading(true);
    try {
      clearErrors();
      const domain = window.location.hostname;
      const response = await AuthApis.login({
        email: data.email,
        password: data.password,
        domain_name: domain,
        // fcm_token: localStorage.getItem("fcm_token"),
      });

      const authData = JSON.stringify({
        token: response.token,
        user: response.user,
        permissions: response.user.role,
      });

      localStorage.setItem("authData", authData);
      sessionStorage.removeItem("authData");
      localStorage.setItem("is_admin", response.user.is_admin ? "1" : "0");
      sessionStorage.setItem("is_admin", response.user.is_admin ? "1" : "0");
      localStorage.setItem("is_default", response.user.is_default ? "1" : "0");
      sessionStorage.setItem("is_default", response.user.is_default ? "1" : "0");
      localStorage.setItem("type", response.user.type);
      sessionStorage.setItem("type", response.user.type);
      if (data.email && data.password) {
        localStorage.setItem(
          "rememberedCredentials",
          JSON.stringify({
            email: data.email,
            password: data.password,
            expires: Date.now() + 30 * 24 * 60 * 60 * 1000,
          })
        );
      }

      showSuccess(response.message);
      navigate("/homepage");
    } catch (error) {
      handleBackendErrors({ error, setError, removeRedirect: false });
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="flex flex-col justify-center items-center bg-white gap-4 py-6 min-h-screen">
      <div className="w-[400px] h-[200px] ">
        <img
          src={!Array.isArray(specialData?.data?.image) ? specialData?.data?.image : logo}
          alt="logo"
          className="w-full h-full object-contain"
        />
      </div>
      <div className="bg-white w-full md:max-w-lg shadow-[0_0_10px_rgba(0,0,0,0.1)] py-8 px-10 rounded-md h-full">
        {" "}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <h1 className="text-secondary text-[1.1rem]">{t("login.login")}</h1>
          <h3 className="text-accent text-[0.9rem]">{t("login.text")}</h3>
          <Input
            name="email"
            label={t("login.userName")}
            placeholder={t("login.enter1")}
            icon={user}
            error={errors.email?.message}
            autoComplete="username"
            otherInputStyle={"!rounded-[4px] text-[0.8rem]"}
            {...register("email")}
          />

          <Input
            name="password"
            label={t("login.password")}
            placeholder={t("login.enter2")}
            icon={lock}
            labelStyle={eye}
            type={showPassword ? "text" : "password"}
            leftIcon={showPassword ? eye : eyeSlach}
            onLeftIconClick={togglePasswordVisibility}
            leftIconClickable={true}
            // autoComplete={rememberMe ? "current-password" : "off"}
            error={errors.password?.message}
            otherInputStyle={"!rounded-[4px] text-[0.8rem]"}
            {...register("password")}
          />

          <button
            type="submit"
            className="btn w-full font-title text-white rounded-[4px] py-3 bg-primary text-[0.8rem] cursor-pointer mb-4 mt-2  "
          >
            {isLoading ? <LoadingElement size={20} /> : t("login.login")}
          </button>
          <div className="flex justify-between items-center gap-2">
            <div className="flex items-center gap-2">
              {" "}
              <CheckboxField control={control} name="rememberMe" />
              <p className="text-accent text-[0.8rem] font-main">{t("login.remember")}</p>
            </div>

            <Link to="/forget-password" className="text-primary text-[0.8rem] font-main underline">
              {t("login.forget-password")}
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
