import { useEffect, useRef } from "react";

interface Props {
  value: number;
}

export default function ProgressBar({ value }: Props) {
  const fillRef = useRef<HTMLDivElement>(null);
  const clamped = Math.min(value, 100);

  useEffect(() => {
    if (fillRef.current) {
      fillRef.current.style.width = "0%";
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (fillRef.current) {
            fillRef.current.style.width = `${clamped}%`;
          }
        });
      });
    }
  }, [clamped]);

  return (
    <div
      style={{
        width: "100%",
        height: "8px",
        borderRadius: "999px",
        background: "rgba(255,255,255,0.1)",
      }}
    >
      <div
        ref={fillRef}
        style={{
          width: "0%",
          height: "100%",
          borderRadius: "999px",
          background: "#2ecc71",
          transition: "width 0.8s ease",
        }}
      />
    </div>
  );
}
