import React from "react";
import Modal from "../modal";
import DeleteButton from "../../deleteButton";
import SecondaryButton from "../../secondaryButton";
import LoadingElement from "../../loading";
export default function DeleteModal({
  isOpen,
  onClose,
  onDelete,
  title,
  warning,
  deleteText,
  cancelText,
  isSubmitting,
}) {
  return (
    <Modal open={isOpen}>
      <div className="bg-white w-full  md:min-w-sm  rounded-2xl shadow-lg text-center  relative flex flex-col gap-6 justify-between h-full  py-8">
        <p className="font-main text-error text-[1rem] ">{title}</p>
        <p className="font-main text-[#333333] text-[0.875rem] max-w-[296px] text-center mx-auto">
          {warning}
        </p>
        <div className="flex items-center justify-center gap-4 ">
          <DeleteButton
            onClick={onDelete}
            text={isSubmitting ? <LoadingElement size={18} /> : deleteText}
            type={"button"}
          />{" "}
          <SecondaryButton onClick={onClose} text={cancelText} type={"button"} />
        </div>
      </div>
    </Modal>
  );
}
