import "./StatusFarol.css";
import type { StatusFarolType } from "../utils/monitoramento/calcularFarol";

type Props = {
  status: StatusFarolType;
};

export default function StatusFarol({ status }: Props) {
  return <div className={`farol ${status}`} />;
}
