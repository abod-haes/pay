/* eslint-disable no-nested-ternary */
/* eslint-disable complexity */
/* eslint-disable indent */
/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useTranslation } from "@hooks/useTranslation";
import { useForm } from "react-hook-form";
import Input from "@/components/shared/input";
import arrow from "@assets/svgs/hair-care/arrow-down.svg";

import Card from "@/components/card";
import BreadCrumb from "@/components/breadcrumb";
import PrimaryButton from "@/components/shared/primaryButton";
import SecondaryButton from "@/components/shared/secondaryButton";
import { showSuccess } from "@/libs/react.toastify";
import { decryptId, Permissions } from "@/utils/helpers";
import CustomFlexButtons from "@/components/shared/CustomFlexButtons";
import { apis } from "@/apis/maintenance/api";
import { handleBackendErrors } from "@/utils/helpers";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useMaintenanceQueries } from "@/apis/maintenance/query";
import { number } from "framer-motion";
import useMaintenanceStatus from "@/hooks/useMaintenenceStatue";
import StatusButtonWithMenu from "@/components/statusMainteneceWithMenu";
import { getUserData, isSuperAdmin } from "@/utils/helpers";
import FileUploader from "@/components/shared/fileUploader";
export default function ActionMaintenance() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { id } = useParams();
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const [isChangeStatus, setIsChangeStatus] = useState(false);

  // حالة إضافة
  const isAdd = location.pathname.endsWith("/add");

  // حالة عرض
  const isShow = query.get("show") === "true";

  // حالة تعديل
  // const id = encryptedId ? decryptId(encryptedId) : null;
  const isEdit = Boolean(id) && !isShow;
  const [currentUser, setCurrentUser] = useState(null);
  const [isUserSuperAdmin, setUserSuperAdmin] = useState(false);
  const [beforeMaintenanceFiles, setBeforeMaintenanceFiles] = useState([]);
  const [afterMaintenanceFiles, setAfterMaintenanceFiles] = useState([]);
  const [bondMaintenanceFiles, setBondMaintenanceFiles] = useState([]);

  useEffect(() => {
    const userData = getUserData();
    setCurrentUser(userData?.user || null);
    setUserSuperAdmin(isSuperAdmin());
  }, []);
  const { data: responseData, refetch } = useMaintenanceQueries.GetOne({ id });
  const schema = yup.object().shape({
    type: yup.string().required(t("validation.required")),
    item: yup.string().required(t("validation.required")),
    cost: yup.string().required(t("validation.required")),
    no: yup.string().required(t("validation.required")),
  });
  const {
    control,
    handleSubmit,
    reset,
    setValue,
    register,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      type: "",
      item: "",
      cost: "",
      no: "",
      description: "",
    },
  });
  const resetFiles = item => {
    const formatFiles = arr =>
      arr?.map(file => ({
        id: file.id,
        name: file.name,
        type: file.mime_type,
        url: file.url,
        uploading: false,
        media_id: file.id,
      })) || [];

    setBeforeMaintenanceFiles(formatFiles(item.images?.before_maintenance));
    setAfterMaintenanceFiles(formatFiles(item.images?.after_maintenance));
    setBondMaintenanceFiles(formatFiles(item.images?.bond_maintenance));
  };
  useEffect(() => {
    if ((isEdit || isShow) && responseData?.data) {
      const maintenanceData = responseData.data?.data;

      reset({
        type: maintenanceData.type || "",
        item: maintenanceData.item || "",
        cost: maintenanceData.cost || "",
        no: maintenanceData.no || "",
        description: maintenanceData.description || "",
      });
      resetFiles(maintenanceData);
    }
  }, [responseData, reset, isEdit, isShow]);

  const onSubmit = async formData => {
    try {
      const payload = {
        ...formData,
        before_maintenance_ids: beforeMaintenanceFiles.map(f => f.media_id),
        after_maintenance_ids: afterMaintenanceFiles.map(f => f.media_id),
        bond_maintenance_id: bondMaintenanceFiles.map(f => f.media_id),
      };
      if (!isAdd) {
        const response = await apis.update({ id, payload });
        showSuccess(response?.data.message);
      } else {
        const response = await apis.add({ payload });
        showSuccess(response?.data.message);
      }
      navigate(-1);
    } catch (error) {
      handleBackendErrors({ error, setError });
    }
  };

  const handleCancel = () => {
    navigate(-1);
  };

  const TITLE = isAdd
    ? t("maintenance.add")
    : isShow
    ? t("maintenance.show")
    : t("maintenance.edit");

  const handelCHangeStatus = async status => {
    try {
      setIsChangeStatus(true);
      const response = await apis.changeStatus({ id, status: status });
      showSuccess(response?.data?.message);
      setIsChangeStatus(false);
      refetch();
    } catch (error) {
      handleBackendErrors({ error: error });
      setIsChangeStatus(false);
    }
  };

  const clickHandlers = {
    waiting: () => {
      handelCHangeStatus("waiting");
    },
    in_progress: () => handelCHangeStatus("in_progress"),
    ...(isUserSuperAdmin && { done: () => handelCHangeStatus("done") }),
  };

  const { complaintStatus } = useMaintenanceStatus(clickHandlers);
  const BUTTONSLIST = [
    {
      show: !isShow,
      component: (
        <PrimaryButton
          text={!isAdd ? t("complaints.save2") : t("common.add")}
          type="submit"
          isSubmitting={isSubmitting}
        />
      ),
    },
    {
      show: true,
      component: <SecondaryButton text={t("common.cancel2")} onClick={handleCancel} />,
    },
  ];
  const breadCrumbProps = isAdd
    ? {
        isAdd: true,
        title: TITLE,
        link: "/maintenance",
      }
    : isEdit
    ? {
        isAdd: true,
        title: TITLE,
        link: "/maintenance",
        // isStatue: true,
        // customStatus: !isAdd && (
        //   <StatusButtonWithMenu
        //     status={responseData?.data.data.status}
        //     items={complaintStatus}
        //     isSuperAdmin={isUserSuperAdmin}
        //     isSending={isChangeStatus}
        //   />
        // ),
      }
    : {
        isAdd: true,
        title: TITLE,
        link: "/maintenance",
      };
  return (
    <div>
      <BreadCrumb {...breadCrumbProps} />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="flex flex-col lg:flex-row gap-[20px] ">
          <Card otherStyle={"flex flex-col gap-6 "}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 ">
              <Input
                name="type"
                control={control}
                placeholder={t("maintenance.type")}
                error={errors.type?.message}
                disable={isShow}
              />
              <Input
                name="item"
                control={control}
                placeholder={t("maintenance.item")}
                error={errors.item?.message}
                disable={isShow}
              />
              <Input
                name="cost"
                control={control}
                placeholder={t("maintenance.costs")}
                error={errors.cost?.message}
                disable={isShow}
                isNumberWithCommas
              />
              <Input
                name="no"
                control={control}
                placeholder={t("maintenance.contact")}
                error={errors.no?.message}
                disable={isShow}
              />
            </div>

            <Input
              name="description"
              control={control}
              placeholder={t("maintenance.problem")}
              error={errors.description?.message}
              disable={isShow}
            />

            <CustomFlexButtons
              gap="gap-4"
              justify="justify-start"
              reverse={false}
              buttons={BUTTONSLIST}
            />
          </Card>
          <div className="flex flex-col gap-[16px] w-[30%]">
            <Card otherStyle={"grid gap-[16px] !py-6 !px-6"}>
              <div className="grid gap-4">
                <p className="font-normal text-[0.9rem] leading-[125%]">{t("permission.old")}</p>
                <FileUploader
                  files={beforeMaintenanceFiles}
                  setFiles={setBeforeMaintenanceFiles}
                  removeFile={file =>
                    setBeforeMaintenanceFiles(prev => prev.filter(f => f.id !== file.id))
                  }
                  name="before_maintenance_ids"
                  control={control}
                  placeholder={t("common.upload-image")}
                />
              </div>
              <div className="grid gap-4">
                <p className="font-normal text-[0.9rem] leading-[125%]">{t("permission.new")}</p>
                <FileUploader
                  files={afterMaintenanceFiles}
                  setFiles={setAfterMaintenanceFiles}
                  removeFile={file =>
                    setAfterMaintenanceFiles(prev => prev.filter(f => f.id !== file.id))
                  }
                  name="after_maintenance_ids"
                  control={control}
                  placeholder={t("common.upload-image")}
                />
              </div>
              <div className="grid gap-4">
                <p className="font-normal text-[0.9rem] leading-[125%]">{t("permission.bond")}</p>
                <FileUploader
                  files={bondMaintenanceFiles}
                  setFiles={setBondMaintenanceFiles}
                  removeFile={file =>
                    setBondMaintenanceFiles(prev => prev.filter(f => f.id !== file.id))
                  }
                  name="bond_maintenance_id"
                  control={control}
                  placeholder={t("common.upload-image")}
                />
              </div>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}
