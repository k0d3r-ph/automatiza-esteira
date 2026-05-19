import { useState, useRef, useEffect } from "react";

type Empresa = {
  id: string;
  nomeEmpresa: string;
};

type Props = {
  empresas: Empresa[];
  empresaId: string;
  onSelect: (id: string) => void;
};

export default function FakeSelect({ empresas, empresaId, onSelect }: Props) {
  const [open, setOpen] = useState(false);

  const wrapperRef = useRef<HTMLDivElement | null>(null);

  const empresaSelecionada = empresas.find(
    (x) => String(x.id) === String(empresaId),
  );

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.addEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="fake-select" ref={wrapperRef}>
      <button
        type="button"
        className="fake-select-button"
        onClick={() => setOpen(!open)}
      >
        {empresaSelecionada ? empresaSelecionada.nomeEmpresa : "Selecione"}

        <span className={`arrow ${open ? "open" : ""}`}>▼</span>
      </button>

      {open && (
        <div className="fake-select-dropdown">
          <div
            className="fake-option"
            onClick={() => {
              onSelect("");
              setOpen(false);
            }}
          >
            Selecione
          </div>

          {empresas
            .filter((empresa) => empresa.id)
            .map((empresa) => (
              <div
                key={empresa.id}
                className="fake-option"
                onClick={() => {
                  onSelect(String(empresa.id));
                  setOpen(false);
                }}
              >
                {empresa.nomeEmpresa}
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
