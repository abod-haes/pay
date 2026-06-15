/* eslint-disable complexity */
import React, { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useTranslation } from "@hooks/useTranslation";
import { useForm } from "react-hook-form";
import Card from "@/components/card";
import BreadCrumb from "@/components/breadcrumb";
import PrimaryButton from "@/components/shared/primaryButton";
import SecondaryButton from "@/components/shared/secondaryButton";
import { showError, showSuccess } from "@/libs/react.toastify";
import { decryptId, handleBackendErrors } from "@/utils/helpers";
import CustomFlexButtons from "@/components/shared/CustomFlexButtons";
import CheckboxField from "@/components/shared/checkbox";
import GroupCheckbox from "@/components/shared/checkbox/GroupCheckbox";
import Input from "@/components/shared/input";
import { useRolesQueries } from "@/apis/roles/query";
import LoadingSection from "@/components/loadingSection";
import useGroupDisplayName from "@/hooks/useGroupedDisplayName";
import useActionLabel from "@/hooks/useActionlabels";
import { apis } from "@/apis/roles/api";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useBookingStatusQueries } from "@/apis/booking-status/query";

const PermissionsDetails = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { id: encryptedId } = useParams();
  const location = useLocation();

  const isAdd = location.pathname.endsWith("/add");
  const isShow = new URLSearchParams(location.search).get("show") === "true";

  const id = encryptedId ? decryptId(encryptedId) : null;
  const isEdit = Boolean(id) && !isShow;

  const { data, isLoading } = useRolesQueries.GetAllPermissions();
  const { data: statusData, isLoading: isLoadingStatus } = useBookingStatusQueries.GetAll({
    page: 1,
    per_page: 100,
  });
  const { data: getOne, isLoading: isLoadingItem } = useRolesQueries.GetOne({ id });

  const generalPermissions = (() => {
    const copy = { ...(data?.data || {}) };

    if (copy.booking_status) {
      copy.booking_status = copy.booking_status.filter(item => item.type !== "change_status");
    }

    return copy;
  })();

  const reservationPermissions = {
    booking_status:
      statusData?.data
        ?.filter(item => item?.permission?.type === "change_status")
        ?.map(item => ({
          id: item.permission.id,
          group: "booking_status",
          type: `perm_${item.permission.id}`,
          label: item.name,
        })) || [],
  };
  const TABS = [
    { key: "general", label: t("permission.general") || "General" },
    { key: "reservation", label: t("permission.reservation") || "Reservation" },
  ];

  const [activeTab, setActiveTab] = useState("general");

  const permissionsConfig = {
    general: generalPermissions,
    reservation: reservationPermissions,
  };

  const schema = yup.object().shape({
    name: yup.string().required(t("validation.required")),
    permissions: yup.object(),
  });

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    setError,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      name: "",
      permissions: {},
    },
    resolver: yupResolver(schema),
  });

  const watchedPermissions = watch("permissions");

  const getGroupStatus = (tab, groupName) => {
    const groupPermissions = permissionsConfig[tab][groupName] || [];
    const checkedCount = groupPermissions.filter(
      perm => watchedPermissions?.[perm.group]?.[perm.type]
    ).length;

    if (checkedCount === 0) return "none";
    if (checkedCount === groupPermissions.length) return "all";
    return "partial";
  };

  useEffect(() => {
    if (!getOne?.data?.data || (!isEdit && !isShow)) return;

    const response = getOne.data.data;
    const permissionsObj = {};

    response.permissions.forEach(perm => {
      const group = perm.group;

      if (group === "booking_status") {
        if (perm.type === "change_status") {
          if (!permissionsObj[group]) permissionsObj[group] = {};
          permissionsObj[group][`perm_${perm.id}`] = true;
        } else {
          if (!permissionsObj[group]) permissionsObj[group] = {};
          permissionsObj[group][perm.type] = true;
        }
        return;
      }

      if (!permissionsObj[group]) permissionsObj[group] = {};
      permissionsObj[group][perm.type] = true;
    });

    reset({
      name: response.name || "",
      permissions: permissionsObj,
    });
  }, [getOne?.data?.data, isEdit, isShow]);

  const toggleGroupPermissions = (tab, groupName, checked) => {
    const groupPermissions = permissionsConfig[tab][groupName];
    groupPermissions.forEach(perm => {
      setValue(`permissions.${perm.group}.${perm.type}`, checked);
    });
  };

  const toggleAllPermissions = (tab, checked) => {
    Object.entries(permissionsConfig[tab]).forEach(([group, perms]) => {
      perms.forEach(perm => {
        setValue(`permissions.${perm.group}.${perm.type}`, checked);
      });
    });
  };

  const getGroupDisplayName = useGroupDisplayName();
  const getActionLabel = useActionLabel();

  const onSubmit = async formData => {
    try {
      const selectedIds = [];

      ["general", "reservation"].forEach(tab => {
        Object.entries(permissionsConfig[tab]).forEach(([group, perms]) => {
          perms.forEach(perm => {
            if (formData.permissions?.[perm.group]?.[perm.type]) {
              selectedIds.push(perm.id);
            }
          });
        });
      });

      if (selectedIds?.length === 0) {
        showError(t("validation.permission_requeierd"));
        return;
      }

      const payload = {
        name: formData.name,
        permissions: selectedIds,
      };

      const response = isAdd ? await apis.add({ payload }) : await apis.update({ payload, id });

      showSuccess(response?.data?.message);
      navigate(-1);
    } catch (error) {
      console.log("error", error);
      handleBackendErrors({ error, setError });
    }
  };

  const TITLE = isAdd
    ? t("permissions.add-permission")
    : isShow
    ? t("permissions.view-permission")
    : t("permissions.edit-permission");

  return (
    <div>
      <BreadCrumb isAdd title={TITLE} link="/branches" />
      <Card otherStyle="!w-[80%] relative">
        <LoadingSection
          isLoading={isLoading || isLoadingItem || isLoadingStatus}
          otherStyle="h-[100vh] !w-[98%]"
        />
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="mb-6 w-[50%]">
            <Input
              name="name"
              control={control}
              placeholder={t("permissions.permission-name")}
              error={errors.name?.message}
              disable={isShow}
            />
          </div>
          <div className="flex gap-4  pb-2 mb-4">
            {TABS.map(tab => (
              <button
                type="button"
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`pb-2 px-4 cursor-pointer ${
                  activeTab === tab.key ? "border-b-2 border-primary font-bold" : ""
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <GroupCheckbox
            checked={Object.keys(permissionsConfig[activeTab]).every(
              group => getGroupStatus(activeTab, group) === "all"
            )}
            indeterminate={Object.keys(permissionsConfig[activeTab]).some(
              group => getGroupStatus(activeTab, group) === "partial"
            )}
            onChange={e => toggleAllPermissions(activeTab, e.target.checked)}
            label={t("permissions.select_all")}
            disabled={isShow}
          />

          {Object.entries(permissionsConfig[activeTab]).map(([group, permissions]) => {
            const status = getGroupStatus(activeTab, group);

            return (
              <div key={group} className="grid gap-4">
                <GroupCheckbox
                  checked={status === "all"}
                  indeterminate={status === "partial"}
                  onChange={e => toggleGroupPermissions(activeTab, group, e.target.checked)}
                  label={getGroupDisplayName(group)}
                  disabled={isShow}
                />

                <div className="flex gap-6 flex-wrap">
                  {permissions.map(perm => (
                    <CheckboxField
                      key={perm.id}
                      control={control}
                      name={`permissions.${perm.group}.${perm.type}`}
                      label={perm.label || getActionLabel(perm.type)}
                      disabled={isShow}
                    />
                  ))}
                </div>
              </div>
            );
          })}

          <CustomFlexButtons
            gap="gap-4"
            justify="justify-start"
            reverse={false}
            buttons={[
              {
                show: !isShow,
                component: (
                  <PrimaryButton
                    text={isAdd ? t("common.add") : t("common.save_changes")}
                    type="submit"
                    isSubmitting={isSubmitting}
                  />
                ),
              },
              {
                show: true,
                component: (
                  <SecondaryButton text={t("common.cancel2")} onClick={() => navigate(-1)} />
                ),
              },
            ]}
          />
        </form>
      </Card>
    </div>
  );
};

export default PermissionsDetails;
