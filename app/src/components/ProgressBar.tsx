interface Props {
  value: number;
}

export default function ProgressBar({ value }: Props) {
  return (
    <div className="progress-container">
      <div className="progress-fill" style={{ width: `${value}%` }} />

      <span>{value}%</span>
    </div>
  );
}
