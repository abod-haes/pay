/* eslint-disable react/self-closing-comp */
/* eslint-disable complexity */
import React, { useEffect, useState, useMemo, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useForm, useFieldArray, useWatch } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useServicesQueries } from "@/apis/sercises/query";
import { apis } from "@/apis/sercises/api";
import { handleBackendErrors } from "@/utils/helpers";
import { showSuccess } from "@/libs/react.toastify";
import useBookingSections from "@/hooks/useBookingSection";
import PrimaryButton from "@/components/shared/primaryButton";
import Input from "@/components/shared/input";
import SelectField from "@/components/shared/select";
import DeleteModal from "@/components/shared/modals/deleteModal";
import LoadingElement from "@/components/shared/loading";
import deleteIcon from "@assets/svgs/table/trash.svg";
import Modal from "@/components/shared/modals/modal";
import SecondaryButton from "@/components/shared/secondaryButton";
import edit from "@assets/svgs/common/edit-menu.svg";
import { PERMISSION_GROUP, PERMISSION_ACTION } from "@/constants/constants";
import { Can } from "@/components/shared/can/can";
import { useMaterialQueries } from "@/apis/items/query";
import show from "@assets/svgs/common/eye-menu.svg";
import { useWarehouseQueries } from "@/apis/warehouse/query";

const ServiceMaterialRow = ({ index, control, setValue, errors, warehouseOptions, t, remove }) => {
  const warehouse = useWatch({
    control,
    name: `materials.${index}.warehouse`,
  });
  const material = useWatch({
    control,
    name: `materials.${index}.material`,
  });

  const { data: materialData, isLoading: isLoadingMaterial } = useMaterialQueries.GetAll({
    warehouse_id: warehouse || null,
    page: 1,
    per_page: 10000,
    enabled: !!warehouse?.value,
  });

  const materialOptions = useMemo(
    () =>
      materialData?.data?.map(item => ({
        label: item.name,
        value: item.id,
      })) || [],
    [materialData?.data]
  );

  const prevWarehouseRef = useRef(warehouse?.value);
  const prevMaterialRef = useRef(material?.value);

  useEffect(() => {
    if (prevWarehouseRef.current !== warehouse?.value) {
      if (prevWarehouseRef.current !== undefined) {
        setValue(`materials.${index}.material`, null);
        setValue(`materials.${index}.quantity`, "");
      }
      prevWarehouseRef.current = warehouse?.value;
    }
  }, [warehouse?.value, setValue, index]);

  useEffect(() => {
    if (prevMaterialRef.current !== material?.value) {
      if (prevMaterialRef.current !== undefined) {
        setValue(`materials.${index}.quantity`, "");
      }
      prevMaterialRef.current = material?.value;
    }
  }, [material?.value, setValue, index]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-4 items-start  p-4  relative ">
      <div className="md:col-span-4">
        <SelectField
          name={`materials.${index}.warehouse`}
          control={control}
          options={warehouseOptions}
          placeholder={t("warehouse.name")}
          error={errors?.materials?.[index]?.warehouse?.message}
        />
      </div>
      <div className="md:col-span-4">
        <SelectField
          name={`materials.${index}.material`}
          options={materialOptions}
          control={control}
          placeholder={t("sidebar.items")}
          loading={isLoadingMaterial}
          error={errors?.materials?.[index]?.material?.message}
        />
      </div>

      <div className="md:col-span-3">
        <Input
          name={`materials.${index}.quantity`}
          placeholder={t("hair.quantity")}
          control={control}
          error={errors?.materials?.[index]?.quantity?.message}
          isNumberWithCommas
        />
      </div>
      <div className="md:col-span-1 flex items-center justify-center pt-2">
        <button
          type="button"
          onClick={() => remove(index)}
          className="text-red-500 hover:bg-red-100 p-2 rounded-full transition-colors"
        >
          <img src={deleteIcon} alt="delete" className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default function Services() {
  const { t } = useTranslation();
  const { bookingVia } = useBookingSections();
  const { data: warehouseData, isLoading: isLoadingWarehouse } = useWarehouseQueries.GetAll({});

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [serviceToShow, setServiceToShow] = useState(null);
  const [isShowMaterialsOpen, setIsShowMaterialsOpen] = useState(false);
  const { data: servicesData, isLoading, refetch: getServices } = useServicesQueries.GetAll({});

  const validationSchema = yup.object().shape({
    name: yup.string().required(t("validation.required")),
    total: yup.string().required(t("validation.required")),
    max_per_day: yup.string().required(t("validation.required")),
    section: yup
      .object()
      .shape({
        label: yup.string().required(),
        value: yup.string().required(),
      })
      .required(t("validation.required")),
    // materials: yup
    //   .array()
    //   .of(
    //     yup.object().shape({
    //       warehouse: yup.object().nullable(),
    //       material: yup
    //         .object()
    //         .nullable()
    //         .when("warehouse", {
    //           is: val => val && val.value,
    //           then: schema => schema.required(t("validation.required")),
    //         }),
    //       quantity: yup
    //         .number()
    //         .nullable()
    //         .transform((v, o) => (o === "" ? null : v))
    //         .when("warehouse", {
    //           is: val => val && val.value,
    //           then: schema =>
    //             schema.required(t("validation.required")).typeError(t("validation.required")),
    //         }),
    //     })
    //   )
    //   .min(1, t("validation.required")),
  });

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    setError,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      name: "",
      total: "",
      max_per_day: "",
      section: null,
      materials: [{ warehouse: null, material: null, quantity: "" }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "materials",
  });

  const handleOpenAddModal = () => {
    setEditingService(null);
    reset({
      name: "",
      total: "",
      max_per_day: "",
      section: null,
      materials: [{ warehouse: null, material: null, quantity: "" }],
    });
    setIsAddModalOpen(true);
  };

  const warehouseOptions = warehouseData?.data?.map(item => ({
    label: item.name,
    value: item.id,
  }));

  const handleOpenEditModal = service => {
    setEditingService(service);

    const sectionOption = bookingVia.find(option => option.value === service.section) || null;
    const warehouseOption = service.materials?.warehouse;
    reset({
      name: service.name,
      total: service.total,
      max_per_day: service.max_per_day,
      section: sectionOption,
      materials:
        service.materials?.length > 0
          ? service.materials.map(m => ({
            warehouse: { label: m.warehouse.name, value: m.warehouse.id },
            material: { label: m.name, value: m.id },
            quantity: m.quantity,
          }))
          : [{ warehouse: warehouseOption, material: null, quantity: "" }],
    });
    setIsAddModalOpen(true);
  };

  const handleCloseAddModal = () => {
    setIsAddModalOpen(false);
    setEditingService(null);
    reset();
  };
  const handleOpenShowModal = service => {
    setServiceToShow(service);
    setIsShowMaterialsOpen(true);
  };
  const handleCloseShowModal = () => {
    setIsShowMaterialsOpen(false);
    setServiceToShow(null);
  };
  const handleSaveService = async data => {
    setIsSubmitting(true);
    try {
      const validMaterials =
        data.materials?.filter(m => m.warehouse?.value && m.material?.value) || [];

      const payload = {
        name: data.name,
        total: data.total,
        max_per_day: data.max_per_day,
        section: data.section?.value,
        materials: validMaterials.map(m => ({
          warehouse_id: m.warehouse?.value,
          material_id: Number(m.material?.value),
          quantity: Number(m.quantity),
        })),
      };

      let response;

      if (editingService) {
        response = await apis.update({ id: editingService.id, payload });
        showSuccess(response.data?.message);
      } else {
        response = await apis.add({ payload });
        showSuccess(response.data?.message);
      }

      getServices();
      handleCloseAddModal();
    } catch (error) {
      handleBackendErrors({ error, setError });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenDeleteModal = (index, service) => {
    setServiceToDelete({ index, ...service });
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    setIsSubmitting(true);
    try {
      const response = await apis.deleteApi({ id: serviceToDelete.id });
      showSuccess(response?.data?.message);
      getServices();
    } catch (error) {
      handleBackendErrors({ error, setError });
    } finally {
      setIsSubmitting(false);
      setIsDeleteModalOpen(false);
    }
  };

  const modalTitle = editingService ? t("setting.edit") : t("setting.add");
  const canAddNewRow = () => {
    const materials = control._formValues.materials;
    const last = materials[materials.length - 1];

    const isFilled =
      last?.warehouse?.value &&
      last?.material?.value &&
      last?.quantity !== "" &&
      last?.quantity !== null &&
      !isNaN(last?.quantity);

    return isFilled;
  };
  return (
    <div className="flex flex-col gap-4 h-[70vh] w-[80%]">
      <div className="flex justify-between items-center">
        <p className="text-[1rem] primary-color font-main">{t("setting.services")}</p>
        <Can group={PERMISSION_GROUP.Setting} type={PERMISSION_ACTION.create}>
          <PrimaryButton text={t("common.add")} onClick={handleOpenAddModal} />
        </Can>
      </div>

      <div className="bg-white h-full rounded-xl p-6">
        <div
          className={
            "hidden md:flex items-center font-main bg-table-header rounded-xl py-3 px-4 text-[0.75rem] mb-3"
          }
        >
          <div className="flex-1 min-w-0 text-start">{t("complaints.service")}</div>
          <div className="flex-1 min-w-0 text-start">{t("common.name")}</div>
          <div className="flex-1 min-w-0 text-start">{t("voucher.total")}</div>
          <div className="flex-1 min-w-0 text-start ">{t("setting.max_per_day")}</div>
          <div className="w-12 px-2"></div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-6">
            <LoadingElement />
          </div>
        ) : (
          <div className="relative h-full">
            <div className="overflow-x-auto h-full scrollbar-hide hover:scrollbar-default">
              <div className="h-full overflow-y-auto scrollbar-hide hover:scrollbar-default min-w-[600px] md:min-w-0">
                {servicesData?.data?.map((field, index) => {
                  const row = field;

                  const sectionLabel =
                    bookingVia.find(option => option.value === row.section)?.label || row.section;

                  return (
                    <div
                      key={field.id}
                      className="flex items-center rounded-xl py-2 px-4 mb-3 border border-accent"
                    >
                      <div className="flex-1 min-w-0 px-2 border border-accent rounded-xl me-2">
                        <div className="p-2 text-gray-700">{sectionLabel || "-"}</div>
                      </div>

                      <div className="flex-1 min-w-0 px-2 border border-accent rounded-xl me-2">
                        <div className="p-2 text-gray-700">{row.name || "-"}</div>
                      </div>

                      <div className="flex-1 min-w-0 px-2 border border-accent rounded-xl me-2">
                        <div className="p-2 text-gray-700">{row.total || "-"}</div>
                      </div>

                      <div className="flex-1 min-w-0 px-2 border border-accent rounded-xl me-2">
                        <div className="p-2 text-gray-700">{row.max_per_day || "-"}</div>
                      </div>

                      <div className="w-30 px-1 flex items-center">
                        <Can group={PERMISSION_GROUP.Setting} type={PERMISSION_ACTION.delete}>
                          {!row.is_default && (
                            <button
                              type="button"
                              onClick={() => handleOpenDeleteModal(index, field)}
                              className="hover:bg-gray-100 p-2 rounded-full cursor-pointer"
                            >
                              <img src={deleteIcon} alt="delete" className="w-5 h-5" />
                            </button>
                          )}
                        </Can>
                        <Can group={PERMISSION_GROUP.Setting} type={PERMISSION_ACTION.update}>
                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(field)}
                            className="hover:bg-gray-100 p-2 rounded-full cursor-pointer"
                          >
                            <img src={edit} alt="edit" className="w-5 h-5" />
                          </button>
                        </Can>
                        <Can group={PERMISSION_GROUP.Setting} type={PERMISSION_ACTION.index}>
                          <button
                            type="button"
                            onClick={() => handleOpenShowModal(field)}
                            className="hover:bg-gray-100 p-2 rounded-full cursor-pointer"
                          >
                            <img src={show} alt="show" className="w-5 h-5" />
                          </button>
                        </Can>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {isAddModalOpen && (
        <Modal open={isAddModalOpen} onClose={handleCloseAddModal}>
          <form onSubmit={handleSubmit(handleSaveService)} className="space-y-4">
            <div className="bg-white max-h-[70vh] overflow-y-auto rounded w-[60vw] py-2">
              <div className="  bg-white p-4">
                <p className="font-main text-[1rem] mb-4">{modalTitle}</p>
                <div className=" grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                  <SelectField
                    name="section"
                    options={bookingVia}
                    control={control}
                    placeholder={t("complaints.service")}
                    error={errors?.section?.message}
                  />

                  <Input
                    name="name"
                    placeholder={t("common.name")}
                    control={control}
                    error={errors?.name?.message}
                  />

                  <Input
                    name="total"
                    placeholder={t("voucher.total")}
                    control={control}
                    error={errors?.total?.message}
                    isNumberWithCommas
                  />

                  <Input
                    name="max_per_day"
                    placeholder={t("setting.max_per_day")}
                    control={control}
                    error={errors?.max_per_day?.message}
                    isNumberWithCommas
                  />
                </div>
                <div className="flex px-4 justify-between items-center mb-2">
                  <p className="font-main text-[1rem]">{t("hair.add")}</p>
                  <button
                    type="button"
                    onClick={() => {
                      if (!canAddNewRow()) {
                        handleBackendErrors({
                          error: { message: t("validation.fillPreviousRow") },
                        });
                        return;
                      }

                      append({ warehouse: null, material: null, quantity: "" });
                    }}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1"
                  >
                    <span>+ {t("common.add")}</span>
                  </button>
                </div>
              </div>
              {fields.map((item, index) => (
                <ServiceMaterialRow
                  key={item.id}
                  index={index}
                  control={control}
                  setValue={setValue}
                  errors={errors}
                  warehouseOptions={warehouseOptions}
                  t={t}
                  remove={remove}
                />
              ))}
              <div className="flex px-4 mb-4 justify-end space-x-3 pt-4 border-t  border-gray-300 mt-4 sticky bottom-0 bg-white z-50">
                <SecondaryButton text={t("common.cancel")} onClick={handleCloseAddModal} />

                <PrimaryButton
                  type="submit"
                  text={editingService ? t("complaints.save2") : t("common.save")}
                  disabled={isSubmitting}
                />
              </div>
            </div>
          </form>
        </Modal>
      )}

      {isDeleteModalOpen && (
        <DeleteModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onDelete={confirmDelete}
          title={t("common.delete")}
          warning={t("delayed.warning")}
          deleteText={t("common.delete")}
          cancelText={t("common.cancel2")}
          isSubmitting={isSubmitting}
        />
      )}
      {isShowMaterialsOpen && (
        <Modal open={isShowMaterialsOpen} onClose={handleCloseShowModal}>
          <div className="bg-white rounded-xl shadow-lg w-[90vw] max-w-[500px] p-6">
            {/* Title */}
            <p className="font-main text-xl mb-6  pb-3">
              {t("permission.items") + ": " + (serviceToShow?.name || "-")}
            </p>

            <div className="grid grid-cols-2 px-2 py-2 bg-gray-100 rounded-lg font-semibold text-gray-700 mb-3">
              <span>{t("hair.item-name")}</span>
              <span>{t("hair.quantity")}</span>
            </div>

            <div className="max-h-[45vh] overflow-y-auto pr-1">
              {serviceToShow?.materials?.length > 0 ? (
                serviceToShow.materials.map((m, i) => (
                  <div
                    key={i}
                    className="grid grid-cols-2 px-2 py-3 border-b border-gray-100 last:border-none text-gray-700"
                  >
                    <span>{m.name}</span>
                    <span>{m.quantity}</span>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-sm mt-4 text-center">{t("common.noData")}</p>
              )}
            </div>

            <div className="flex justify-end pt-6  mt-4">
              <SecondaryButton text={t("common.cancel")} onClick={handleCloseShowModal} />
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
