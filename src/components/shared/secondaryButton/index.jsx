const SecondaryButton = ({ text, onClick, type = "button", otherStyle }) => {
  return (
    <button
      className={`bg-white font-bold cursor-pointer border text-accent border-accent text-[0.7rem] ${otherStyle} px-[35px] py-[9px] rounded-full h-full`}
      onClick={onClick}
      type={type}
    >
      {text}
    </button>
  );
};

export default SecondaryButton;
