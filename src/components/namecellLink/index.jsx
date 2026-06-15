import { Link } from "react-router-dom";

const NameCell = ({ to, customStyle, text }) => {
  return (
    <Link to={to} className={`text-secondary underline text-[0.8rem] ${customStyle}`}>
      {text}
    </Link>
  );
};

export default NameCell;
