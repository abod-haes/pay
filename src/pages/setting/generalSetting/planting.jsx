/* eslint-disable react/self-closing-comp */
/* eslint-disable complexity */
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useForm, useFieldArray } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { handleBackendErrors } from "@/utils/helpers";
import { showSuccess, showError } from "@/libs/react.toastify";
import useBookingSections from "@/hooks/useBookingSection";
import PrimaryButton from "@/components/shared/primaryButton";
import Input from "@/components/shared/input";
import SelectField from "@/components/shared/select";
import DeleteModal from "@/components/shared/modals/deleteModal";
import LoadingElement from "@/components/shared/loading";
import add from "@/assets/svgs/common/add.svg";
import deleteIcon from "@assets/svgs/table/trash.svg";
import Modal from "@/components/shared/modals/modal";
import SecondaryButton from "@/components/shared/secondaryButton";
import edit from "@assets/svgs/common/edit-menu.svg";
import { apis } from "@/apis/planting/api";
import { usePlantingQueries } from "@/apis/planting/query";
import { Can } from "@/components/shared/can/can";
import { PERMISSION_ACTION, PERMISSION_GROUP } from "@/constants/constants";
export default function Planting() {
  const { t } = useTranslation();

  const { bookingVia } = useBookingSections();

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingService, setEditingService] = useState(null);

  const { data: servicesData, isLoading, refetch: getServices } = usePlantingQueries.GetAll({});

  const validationSchema = yup.object().shape({
    name: yup.string().required(t("validation.required")),
    // total: yup.string().required(t("validation.required")),
    // section: yup
    //   .object()
    //   .shape({
    //     label: yup.string().required(),
    //     value: yup.string().required(),
    //   })
    //   .required(t("validation.required")),
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
      // total: "",
      // section: null,
    },
  });

  const handleOpenAddModal = () => {
    setEditingService(null);
    reset({
      name: "",
      // total: "",
      // section: null,
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = service => {
    setEditingService(service);

    // const sectionOption = bookingVia.find(option => option.value === service.section) || null;

    reset({
      name: service.name,
      // total: service.total,
      // section: sectionOption,
    });
    setIsAddModalOpen(true);
  };

  const handleCloseAddModal = () => {
    setIsAddModalOpen(false);
    setEditingService(null);
    reset();
  };

  const handleSaveService = async data => {
    setIsSubmitting(true);
    try {
      const payload = {
        name: data.name,
        // total: data.total,
        // section: data.section?.value,
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
      await apis.deleteApi({ id: serviceToDelete.id });
      showSuccess(t("service.deletedSuccessfully"));
      getServices();
    } catch (error) {
      handleBackendErrors({ error });
    } finally {
      setIsSubmitting(false);
      setIsDeleteModalOpen(false);
    }
  };

  const modalTitle = editingService ? t("setting.edit") : t("setting.add");
  return (
    <div className="flex flex-col gap-4 w-[80%] ">
      <div className="flex justify-between items-center">
        <p className="text-[1rem] primary-color font-main">{t("setting.services")}</p>
        <Can group={PERMISSION_GROUP.Setting} type={PERMISSION_ACTION.create}>
          <PrimaryButton text={t("common.add")} onClick={handleOpenAddModal} />
        </Can>
      </div>

      <div className="bg-white rounded-xl p-6">
        <div
          className={
            "hidden md:flex items-center font-main bg-table-header rounded-xl py-3 px-4 text-[0.75rem] mb-3"
          }
        >
          <div className="flex-1 min-w-0 px-2">{t("common.name")}</div>

          <div className="w-12 px-2"></div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-6">
            <LoadingElement />
          </div>
        ) : (
          <div className="relative">
            <div className="overflow-x-auto scrollbar-hide hover:scrollbar-default">
              <div className="max-h-[500px] overflow-y-auto scrollbar-hide hover:scrollbar-default min-w-[600px] md:min-w-0">
                {servicesData?.data?.map((field, index) => {
                  const row = field;
                  return (
                    <div
                      key={field.id}
                      className="flex items-center rounded-xl py-2 px-4 mb-3 border border-accent"
                    >
                      <div className="flex-1 min-w-0 px-2 border border-accent rounded-xl me-2">
                        <div className="p-2 text-gray-700">{row.name || "-"}</div>
                      </div>

                      <div className="w-20 px-1 flex items-center">
                        <Can group={PERMISSION_GROUP.Setting} type={PERMISSION_ACTION.delete}>
                          <button
                            type="button"
                            onClick={() => handleOpenDeleteModal(index, field)}
                            className="hover:bg-gray-100 p-2 rounded-full cursor-pointer"
                          >
                            <img src={deleteIcon} alt="delete" className="w-5 h-5" />
                          </button>
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
            <div className="bg-white p-10 rounded grid grid-cols-1 gap-4">
              <p className="font-main text-[1rem]">{modalTitle}</p>
              {/* <SelectField
                name="section"
                options={bookingVia}
                control={control}
                placeholder={t("complaints.service")}
                error={errors?.section?.message}
              /> */}

              <Input
                name="name"
                placeholder={t("common.name")}
                control={control}
                error={errors?.name?.message}
              />

              {/* <Input
                name="total"
                placeholder={t("voucher.total")}
                control={control}
                error={errors?.total?.message}
                isNumberWithCommas
              /> */}

              <div className="flex justify-end space-x-3 pt-4">
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
    </div>
  );
}
