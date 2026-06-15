import LoadingElement from "../loading";

const PrimaryButton = ({ text, onClick, type, otherStyle, isSubmitting, disabled, ...res }) => {
  return (
    <button
      className={`bg-primary font-bold cursor-pointer text-white text-[0.7rem] ${otherStyle} px-[35px] py-[9px] rounded-full h-full ${
        disabled && "!bg-gray-300 !text-[#232232] !cursor-not-allowed"
      }`}
      onClick={onClick}
      type={type}
      disabled={disabled}
      {...res}
    >
      {isSubmitting ? <LoadingElement color="29b4c3" size={18} /> : text}
    </button>
  );
};

export default PrimaryButton;
