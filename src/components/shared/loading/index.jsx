import { ClipLoader } from "react-spinners";

const LoadingElement = ({ color = "#fff", size = 30, containerStyle }) => {
  return (
    <div className={`flex items-center justify-center ${containerStyle}`}>
      <ClipLoader color={color} size={size} />
    </div>
  );
};

export default LoadingElement;
