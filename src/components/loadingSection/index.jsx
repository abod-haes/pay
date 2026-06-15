import LoadingElement from "../shared/loading";

const LoadingSection = ({ isLoading, otherStyle }) => {
  return (
    isLoading && (
      <div
        className={`h-[80%] absolute bg-white flex items-center justify-center z-10 w-[100%] ${otherStyle}`}
      >
        <LoadingElement color="#29b4c3" />
      </div>
    )
  );
};
export default LoadingSection;
