import LoadingElement from "../loading";

const CancelButton = ({ text, onClick, type, otherStyle, isSubmitting, ...res }) => {
  return (
    <button
      className={`bg-transparent font-normal cursor-pointer text-error text-[0.9rem] ${otherStyle} rounded-full h-full`}
      onClick={onClick}
      type={type}
      {...res}
    >
      {isSubmitting ? <LoadingElement color="29b4c3" size={18} /> : text}
    </button>
  );
};

export default CancelButton;
