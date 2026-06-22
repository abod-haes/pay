/* eslint-disable complexity */
import React, { useEffect, useMemo, useState } from "react";
import logo from "@assets/svgs/common/logo.svg";
import { useForm } from "react-hook-form";
import LoadingElement from "@/components/shared/loading";
import Input from "@/components/shared/input";
import SelectField from "@/components/shared/select";
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

const LOGIN_STEP = {
  EMAIL: "email",
  BRANCH: "branch",
  PASSWORD: "password",
};

const getBranchId = branch => branch?.id ?? branch?.branch_id ?? branch?.value;

const getBranchLabel = branch => {
  const name = branch?.name || branch?.title || branch?.branch?.name || branch?.domain_name;
  const username = branch?.default_user?.username || branch?.username;
  const email = branch?.default_user?.email || branch?.email;
  const id = getBranchId(branch);

  return [name || (id ? `Branch ${id}` : "Branch"), username, email].filter(Boolean).join(" - ");
};

const extractBranchesFromResponse = response => {
  const payload = response?.data ?? response;
  const candidate =
    payload?.branches ??
    payload?.branchs ??
    payload?.data?.branches ??
    payload?.data?.branchs ??
    payload?.data ??
    payload?.branch ??
    payload?.default_branch;

  if (Array.isArray(candidate)) return candidate;
  if (candidate && typeof candidate === "object") return [candidate];

  return [];
};

export default function Login() {
  const { t } = useTranslation();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loginStep, setLoginStep] = useState(LOGIN_STEP.EMAIL);
  const [branches, setBranches] = useState([]);
  const navigate = useNavigate();
  const domain = location.state?.domain || window.location.hostname;
  const { data: specialData } = useSettingsQueries.GetAll({ domain_name: domain });
  const {
    control,
    register,
    handleSubmit,
    clearErrors,
    setValue,
    watch,
    setError,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: "",
      branch: null,
      password: "",
      rememberMe: false,
    },
  });

  const branchOptions = useMemo(
    () =>
      branches.map(branch => ({
        label: getBranchLabel(branch),
        value: getBranchId(branch),
        branch,
      })),
    [branches]
  );

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

  const handleCheckEmail = async data => {
    if (!data.email) {
      setError("email", { type: "manual", message: t("validation.required") });
      return;
    }

    setIsLoading(true);
    try {
      clearErrors();
      const response = await AuthApis.checkEmail({
        email: data.email,
        domain_name: window.location.hostname,
      });
      const availableBranches = extractBranchesFromResponse(response);
      const validBranches = availableBranches.filter(branch => getBranchId(branch));

      setBranches(validBranches);

      if (validBranches.length === 0) {
        setError("email", {
          type: "manual",
          message: response?.message || "لا يوجد فروع مرتبطة بهذا البريد",
        });
        return;
      }

      if (validBranches.length === 1) {
        const onlyBranch = validBranches[0];
        setValue("branch", {
          label: getBranchLabel(onlyBranch),
          value: getBranchId(onlyBranch),
          branch: onlyBranch,
        });
        setLoginStep(LOGIN_STEP.PASSWORD);
        return;
      }

      setValue("branch", null);
      setLoginStep(LOGIN_STEP.BRANCH);
    } catch (error) {
      handleBackendErrors({ error, setError, removeRedirect: false });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChooseBranch = data => {
    if (!data.branch?.value) {
      setError("branch", { type: "manual", message: t("validation.required") });
      return;
    }

    clearErrors("branch");
    setLoginStep(LOGIN_STEP.PASSWORD);
  };

  const handleLogin = async data => {
    if (!data.password) {
      setError("password", { type: "manual", message: t("validation.required") });
      return;
    }

    if (!data.branch?.value) {
      setError("branch", { type: "manual", message: t("validation.required") });
      setLoginStep(LOGIN_STEP.BRANCH);
      return;
    }

    setIsLoading(true);
    try {
      clearErrors();
      const response = await AuthApis.login({
        email: data.email,
        password: data.password,
        branch_id: data.branch.value,
        domain_name: window.location.hostname,
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
            branch_id: data.branch.value,
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

  const onSubmit = async data => {
    if (loginStep === LOGIN_STEP.EMAIL) {
      await handleCheckEmail(data);
      return;
    }

    if (loginStep === LOGIN_STEP.BRANCH) {
      handleChooseBranch(data);
      return;
    }

    await handleLogin(data);
  };

  const handleBackToEmail = () => {
    setBranches([]);
    setValue("branch", null);
    setValue("password", "");
    clearErrors();
    setLoginStep(LOGIN_STEP.EMAIL);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const getSubmitText = () => {
    if (loginStep === LOGIN_STEP.EMAIL) {
      return t("login.check_email", { defaultValue: "تحقق من البريد" });
    }

    if (loginStep === LOGIN_STEP.BRANCH) {
      return t("login.continue", { defaultValue: "متابعة" });
    }

    return t("login.login");
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
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <h1 className="text-secondary text-[1.1rem]">{t("login.login")}</h1>
          <h3 className="text-accent text-[0.9rem]">
            {loginStep === LOGIN_STEP.EMAIL
              ? t("login.text")
              : t("login.select_branch_text", {
                  defaultValue: "اختر الفرع ثم أدخل كلمة المرور لتسجيل الدخول",
                })}
          </h3>

          <Input
            name="email"
            label={t("login.userName")}
            placeholder={t("login.enter1")}
            icon={user}
            error={errors.email?.message}
            autoComplete="username"
            otherInputStyle={"!rounded-[4px] text-[0.8rem]"}
            disable={loginStep !== LOGIN_STEP.EMAIL}
            {...register("email")}
          />

          {loginStep !== LOGIN_STEP.EMAIL && (
            <button
              type="button"
              onClick={handleBackToEmail}
              className="text-primary text-[0.8rem] font-main underline cursor-pointer"
            >
              {t("login.change_email", { defaultValue: "تغيير البريد" })}
            </button>
          )}

          {loginStep === LOGIN_STEP.BRANCH && (
            <SelectField
              name="branch"
              control={control}
              options={branchOptions}
              placeholder={t("branches.branches")}
              error={errors.branch?.message}
            />
          )}

          {loginStep === LOGIN_STEP.PASSWORD && watch("branch") && (
            <div className="rounded-[4px] bg-primary/5 border border-primary/20 px-3 py-2 text-[0.8rem] text-secondary">
              {watch("branch")?.label}
            </div>
          )}

          {loginStep === LOGIN_STEP.PASSWORD && (
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
              error={errors.password?.message}
              otherInputStyle={"!rounded-[4px] text-[0.8rem]"}
              {...register("password")}
            />
          )}

          <button
            type="submit"
            className="btn w-full font-title text-white rounded-[4px] py-3 bg-primary text-[0.8rem] cursor-pointer mb-4 mt-2"
          >
            {isLoading ? <LoadingElement size={20} /> : getSubmitText()}
          </button>

          {loginStep === LOGIN_STEP.PASSWORD && (
            <div className="flex justify-between items-center gap-2">
              <div className="flex items-center gap-2">
                <CheckboxField control={control} name="rememberMe" />
                <p className="text-accent text-[0.8rem] font-main">{t("login.remember")}</p>
              </div>

              <Link to="/forget-password" className="text-primary text-[0.8rem] font-main underline">
                {t("login.forget-password")}
              </Link>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
