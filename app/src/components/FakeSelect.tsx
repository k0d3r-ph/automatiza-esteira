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
  const [busca, setBusca] = useState("");

  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const empresaSelecionada = empresas.find(
    (x) => String(x.id) === String(empresaId),
  );

  const empresasFiltradas = empresas
    .filter((e) => e.id)
    .filter((e) =>
      e.nomeEmpresa.toLowerCase().includes(busca.toLowerCase().trim()),
    );

  function fechar() {
    setOpen(false);
    setBusca("");
  }

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  });

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        fechar();
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="fake-select" ref={wrapperRef}>
      <button
        type="button"
        className="fake-select-button"
        onClick={() => setOpen((prev) => !prev)}
      >
        {empresaSelecionada ? empresaSelecionada.nomeEmpresa : "Selecione"}
        <span className={`arrow ${open ? "open" : ""}`}>▼</span>
      </button>

      {open && (
        <div className="fake-select-dropdown">
          <div className="fake-select-search">
            <input
              ref={inputRef}
              type="text"
              placeholder="Buscar empresa..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
            />
          </div>

          <div
            className="fake-option"
            onClick={() => {
              onSelect("");
              fechar();
            }}
          >
            Selecione
          </div>

          {empresasFiltradas.length > 0 ? (
            empresasFiltradas.map((empresa) => (
              <div
                key={empresa.id}
                className="fake-option"
                onClick={() => {
                  onSelect(String(empresa.id));
                  fechar();
                }}
              >
                {empresa.nomeEmpresa}
              </div>
            ))
          ) : (
            <div className="fake-option fake-option--empty">
              Nenhuma empresa encontrada
            </div>
          )}
        </div>
      )}
    </div>
  );
}
