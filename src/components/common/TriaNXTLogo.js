import "./TriaNXTLogo.css";

function TriaNXTLogo({ className = "", onClick, size = "default" }) {
  return (
    <div
      className={`trianxt-logo trianxt-logo--${size} ${className}`.trim()}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? (event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                onClick();
              }
            }
          : undefined
      }
    >
      TriaNXT
    </div>
  );
}

export default TriaNXTLogo;
