import "./StatusFarol.css";
import type { StatusFarolType } from "../utils/monitoramento/calcularFarol";

type Props = {
  status: StatusFarolType;
};

export default function StatusFarol({ status }: Props) {
  if (status === "none") return null;

  return <div className={`farol farol-${status}`} />;
}
