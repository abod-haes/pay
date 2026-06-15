const DateUnderTime = ({ date, time }) => {
  return (
    <div style={{ textAlign: "start" }}>
      <div>{date}</div>
      <div style={{ fontSize: "0.75rem", color: "#888" }}>{time}</div>
    </div>
  );
};

export default DateUnderTime;
