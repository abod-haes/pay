const Card = ({ children, otherStyle }) => {
  return (
    <div
      style={{
        boxShadow: "0px 1px 8px 0px #0000001A",
      }}
      className={`bg-white relative rounded-[16px] w-full max-sm:min-h-[68dvh] h-fit px-[26px] py-[16px] ${otherStyle}`}
    >
      {children}
    </div>
  );
};

export default Card;
