/* eslint-disable no-undef */
/* eslint-disable curly */
/* eslint-disable complexity */

import React, { useEffect, useState } from "react";
import Input from "@/components/shared/input";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { showSuccess } from "@/libs/react.toastify";
import ControlledTimeField from "@/components/shared/controlledDatePicker";
import { useSettingsQueries } from "@/apis/setting/query";
import { apis } from "@/apis/setting/api";
import { useLocation } from "react-router-dom";
import PrimaryButton from "@/components/shared/primaryButton";
import { handleBackendErrors } from "@/utils/helpers";
import FileUploader from "@/components/shared/fileUploader";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import "leaflet/dist/leaflet.css";
import { PERMISSION_GROUP, PERMISSION_ACTION } from "@/constants/constants";
import { Can } from "@/components/shared/can/can";
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

function ChangeMapCenter({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) map.setView(center, map.getZoom());
  }, [center]);
  return null;
}
function LocationSelector({ onSelect }) {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      onSelect([lat, lng]); // إرسال الإحداثيات للأب
    },
  });

  return null;
}

export default function SpecialSetting() {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const domain = location.state?.domain || window.location.hostname;
  const [image, setImage] = useState([]);
  const [deletedLogo, setDeletedLogo] = useState(false);
  const [center, setCenter] = useState([31.9539, 35.9106]); // مركز افتراضي
  const defaultCenter = [33.3128, 44.3615];
  const [selectedPosition, setSelectedPosition] = useState(defaultCenter);
  const handleSelect = coords => {
    setSelectedPosition(coords);
    console.log("Selected coordinates:", coords);
    // هنا يمكنك إرسال coords للـ API
    // axios.post("/api/save-location", { latitude: coords[0], longitude: coords[1] })
  };

  const [isInitialized, setIsInitialized] = useState(false);
  const [value, setValue] = useState("");
  const [value1, setValue2] = useState("");

  const { data } = useSettingsQueries.GetAll({ domain_name: domain });

  const validationSchema = yup.object().shape({
    phone_number: yup.string().required(t("validation.required")),
    address: yup.string().required(t("validation.required")),
    company_name: yup.string().required(t("validation.required")),
    eyebrow_transplant_per_day: yup.string().required(t("validation.required")),
    hair_transplant_per_day: yup.string().required(t("validation.required")),
    whatsapp_number: yup.string(),
    facebook_link: yup
      .string()
      .url(t("validation.invalid_url"))
      .test("is-facebook", t("validation.facebook_url"), value => {
        if (!value) return true;
        return value.includes("facebook.com") || value.includes("fb.com");
      }),
    instagram_link: yup
      .string()
      .url(t("validation.invalid_url"))
      .test("is-instagram", t("validation.instagram_url"), value => {
        if (!value) return true;
        return value.includes("instagram.com");
      }),
    latitude: yup.string(),
    longitude: yup.string(),
    terms_of_use: yup.string(),
    privacy_policy: yup.string(),
    about_us: yup.string(),
    work_start_time: yup.string().required(t("validation.required")),
    work_end_time: yup
      .string()
      .required(t("validation.required"))
      .test("is-after-start", t("validation.end_time_after_start"), function (value) {
        const { work_start_time } = this.parent;
        if (!work_start_time || !value) return true;

        const startTime = new Date(`1970-01-01T${work_start_time}`);
        const endTime = new Date(`1970-01-01T${value}`);

        return endTime > startTime;
      }),
    booking_duration: yup.number().max(200, t("validation.max_200")),
  });

  const {
    register,
    handleSubmit,
    setError,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      phone_number: "",
      company_name: "",
      whatsapp_number: "",
      facebook_link: "",
      instagram_link: "",
      latitude: "",
      longitude: "",
      terms_of_use: "",
      privacy_policy: "",
      about_us: "",
      work_start_time: "",
      work_end_time: "",
      booking_duration: "",
      eyebrow_transplant_per_day: "",
      hair_transplant_per_day: "",
      address: "",
    },
  });

  useEffect(() => {
    if (data?.data) {
      const setting = data.data;
      reset({
        phone_number: setting.phone_number || "",
        company_name: setting.company_name || "",
        whatsapp_number: setting.whatsapp_number || "",
        facebook_link: setting.facebook_link || "",
        instagram_link: setting.instagram_link || "",
        // latitude: setting.latitude || "",
        // longitude: setting.longitude || "",
        about_us: setting.about_us || "",
        work_start_time: setting.work_start_time || "",
        work_end_time: setting.work_end_time || "",
        booking_duration: setting.booking_duration || "",
        eyebrow_transplant_per_day: setting.eyebrow_transplant_per_day || "",
        hair_transplant_per_day: setting.hair_transplant_per_day || "",
        address: setting.address,
      });
      setValue(setting.terms_of_use);
      setValue2(setting.privacy_policy);
      const lat = Number(setting.latitude);
      const lng = Number(setting.longitude);

      setCenter([lat, lng]);
      setSelectedPosition([lat, lng]);
      const logoUrl = data.data.image;
      if (logoUrl.length > 0) {
        setImage([
          {
            id: Date.now(),
            name: "image.png",
            url: logoUrl,
            file: null,
            size: 0,
            type: "image/png",
          },
        ]);
      }
      setIsInitialized(true);
      setDeletedLogo(false);
    }
  }, [data, reset]);
  const handleRemoveLogo = () => {
    setImage([]);
    setDeletedLogo(true);
  };
  const onSubmit = async formData => {
    try {
      const payload = {
        ...formData,
        privacy_policy: value1,
        terms_of_use: value,
        domain_name: domain,
        latitude: selectedPosition[0],
        longitude: selectedPosition[1],
      };
      if (image.length > 0) {
        if (image[0] instanceof File || image[0].file instanceof File) {
          formData.append("image", image[0].file || image[0]);
        }
      } else if (deletedLogo) {
        formData.append("delete_image", "true");
      }
      const res = await apis.update({ payload });
      showSuccess(res.data?.message);
      setDeletedLogo(false);
      setIsInitialized(true);
    } catch (error) {
      handleBackendErrors({ error, setError });
    }
  };

  return (
    <div className="flex flex-col">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6  !w-[80%] ">
        <div className="flex justify-end">
          <Can group={PERMISSION_GROUP.Setting} type={PERMISSION_ACTION.update}>
            <PrimaryButton text={t("common.save")} type="submit" isSubmitting={isSubmitting} />
          </Can>
        </div>
        <div className="flex flex-col gap-4 bg-white p-6 rounded-lg">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Input
              {...register("company_name")}
              error={errors.company_name?.message}
              label={t("setting.company_name")}
            />
            <Input
              {...register("phone_number")}
              error={errors.phone_number?.message}
              label={t("setting.phone_number")}
            />
            <Input
              {...register("address")}
              error={errors.address?.message}
              label={t("common.address")}
            />
            <Input
              {...register("whatsapp_number")}
              error={errors.whatsapp_number?.message}
              label={t("setting.whatsapp_number")}
            />
            <Input
              {...register("facebook_link")}
              error={errors.facebook_link?.message}
              label={t("setting.facebook_link")}
            />
            <Input
              {...register("instagram_link")}
              error={errors.instagram_link?.message}
              label={t("setting.instagram_link")}
            />
            {/* <Input
              {...register("latitude")}
              error={errors.latitude?.message}
              label={t("setting.latitude")}
            />
            <Input
              {...register("longitude")}
              error={errors.longitude?.message}
              label={t("setting.longitude")}
            /> */}
            <Input
              {...register("about_us")}
              error={errors.about_us?.message}
              label={t("setting.about_us")}
            />

            <ControlledTimeField
              name="work_start_time"
              control={control}
              errors={errors.work_start_time}
              label={t("setting.work_start_time")}
              type="time"
            />
            <ControlledTimeField
              name="work_end_time"
              control={control}
              errors={errors.work_end_time}
              label={t("setting.work_end_time")}
              type="time"
            />

            <Input
              name="booking_duration"
              control={control}
              error={errors.booking_duration?.message}
              label={t("setting.booking_duration")}
              isNumberWithCommas
            />
            {/* <Input
              name="eyebrow_transplant_per_day"
              control={control}
              error={errors.eyebrow_transplant_per_day?.message}
              label={t("examination.eyebrow")}
              isNumberWithCommas
            />
            <Input
              name="hair_transplant_per_day"
              control={control}
              error={errors.hair_transplant_per_day?.message}
              label={t("examination.hair")}
              isNumberWithCommas
            /> */}
          </div>

          <MapContainer center={center} zoom={7} style={{ height: "400px", width: "100%" }}>
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution="&copy; OpenStreetMap contributors"
            />

            <LocationSelector onSelect={handleSelect} />

            {selectedPosition && (
              <Marker position={selectedPosition}>
                <Popup>
                  Selected Location: <br />
                  Lat: {selectedPosition[0].toFixed(5)}, Lng: {selectedPosition[1].toFixed(5)}
                </Popup>
              </Marker>
            )}
            <ChangeMapCenter center={center} />
          </MapContainer>

          <div className="w-[50%] ">
            <p className={"text-sm mb-4 gray-color font-main"}>
              {i18n.language === "ar" ? "أيقونة الموقع" : "website icon"}
            </p>
            <FileUploader
              label={t("special.logo")}
              files={image}
              setFiles={setImage}
              maxFiles={1}
              control={control}
              acceptTypes={["image/jpg", "image/png", "image/jpeg", "image/webp", "image/svg+xml"]}
              removeFile={handleRemoveLogo}
            />
          </div>
          <div className="h-[600px] relative">
            <label className={"text-sm gray-color font-main"}>{t("setting.terms_of_use")}</label>
            <ReactQuill
              className="rounded-[4px] h-[80%] mt-2"
              theme="snow"
              value={value}
              onChange={setValue}
            />
          </div>
          <div className="h-[600px]">
            <label className={"text-sm gray-color font-main"}>{t("setting.privacy_policy")}</label>
            <ReactQuill
              className="rounded-[4px] h-[90%] mt-2"
              theme="snow"
              value={value1}
              onChange={setValue2}
            />
          </div>
        </div>
      </form>
    </div>
  );
}
