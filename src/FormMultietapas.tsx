// FormMultietapas · Criado por FlowCore Soluções LTDA · flowcoresolucoes.com.br/codigos · licença MIT
// Formulário de diagnóstico em etapas que qualifica o lead (porte, orçamento,
// prazo), com barra de progresso, voltar/avançar, revisão final e pontuação.
// Props: tema ("claro" padrão | "escuro"), accent, title, subtitle, onSubmit.
// Requisitos: React 18+ e Tailwind CSS 3+. Zero dependências. Sem chamadas de rede: use a prop onSubmit.

import { useId, useState, type CSSProperties } from "react";

export type Diagnostico = {
  porte: string;
  desafio: string;
  orcamento: string;
  prazo: string;
  nome: string;
  email: string;
  empresa: string;
  /** 0 a 100: quão quente é o lead (porte + orçamento + prazo). */
  score: number;
};

type Opcao = { valor: string; rotulo: string; pontos: number };

type Tema = "claro" | "escuro";

type Props = {
  /** Tema visual. Padrão "claro". */
  tema?: Tema;
  /** Cor de destaque (qualquer cor CSS). */
  accent?: string;
  title?: string;
  subtitle?: string;
  onSubmit?: (d: Diagnostico) => void | Promise<void>;
};

// Paleta do tema aplicada como CSS vars na raiz (não depende do tailwind.config).
const TEMAS: Record<Tema, Record<string, string>> = {
  claro: {
    "--fc-bg": "#F7F8FB", "--fc-surface": "#FFFFFF", "--fc-surface-2": "#F1F4F9",
    "--fc-border": "#E3E8F0", "--fc-border-strong": "#CBD3E1",
    "--fc-text": "#0B1220", "--fc-muted": "#4B5565", "--fc-subtle": "#8A94A6",
    "--fc-pos": "#059669", "--fc-neg": "#E11D48", "--fc-warn": "#D97706",
    "--fc-shadow": "0 1px 2px rgba(16,24,40,.06), 0 12px 32px -16px rgba(16,24,40,.18)",
    "--fc-label": "#1F2937", "--fc-text-2": "#334155", "--fc-track": "#E3E8F0",
    "--fc-opt": "#FFFFFF", "--fc-sel": "color-mix(in srgb, var(--accent) 7%, #FFFFFF)",
    "--fc-input": "#F1F4F9", "--fc-glow": "0.10",
  },
  escuro: {
    "--fc-bg": "#0B0F17", "--fc-surface": "rgba(255,255,255,0.03)", "--fc-surface-2": "rgba(255,255,255,0.06)",
    "--fc-border": "rgba(255,255,255,0.10)", "--fc-border-strong": "rgba(255,255,255,0.25)",
    "--fc-text": "#FFFFFF", "--fc-muted": "rgba(255,255,255,0.60)", "--fc-subtle": "rgba(255,255,255,0.40)",
    "--fc-pos": "#34D399", "--fc-neg": "#FB7185", "--fc-warn": "#FBBF24",
    "--fc-shadow": "0 24px 48px -24px rgba(0,0,0,.6)",
    "--fc-label": "rgba(255,255,255,0.80)", "--fc-text-2": "rgba(255,255,255,0.70)", "--fc-track": "rgba(255,255,255,0.10)",
    "--fc-opt": "rgba(255,255,255,0.02)", "--fc-sel": "rgba(255,255,255,0.06)",
    "--fc-input": "rgba(255,255,255,0.03)", "--fc-glow": "0.12",
  },
};

const CORES = ["var(--accent)", "#7C3AED", "#10B981", "#F59E0B", "#EC4899", "#06B6D4"];

const PORTE: Opcao[] = [
  { valor: "ate-20", rotulo: "Até 20 funcionários", pontos: 10 },
  { valor: "21-100", rotulo: "21 a 100 funcionários", pontos: 25 },
  { valor: "101-500", rotulo: "101 a 500 funcionários", pontos: 35 },
  { valor: "500+", rotulo: "Mais de 500", pontos: 40 },
];
const DESAFIO: Opcao[] = [
  { valor: "planilhas", rotulo: "Muita planilha e retrabalho", pontos: 0 },
  { valor: "integracao", rotulo: "Sistemas que não conversam", pontos: 0 },
  { valor: "visibilidade", rotulo: "Falta de indicadores confiáveis", pontos: 0 },
  { valor: "escala", rotulo: "Operação não acompanha o crescimento", pontos: 0 },
];
const ORCAMENTO: Opcao[] = [
  { valor: "ate-30k", rotulo: "Até R$ 30 mil", pontos: 5 },
  { valor: "30-100k", rotulo: "R$ 30 mil a R$ 100 mil", pontos: 20 },
  { valor: "100-300k", rotulo: "R$ 100 mil a R$ 300 mil", pontos: 30 },
  { valor: "300k+", rotulo: "Acima de R$ 300 mil", pontos: 35 },
];
const PRAZO: Opcao[] = [
  { valor: "imediato", rotulo: "Imediato (até 30 dias)", pontos: 25 },
  { valor: "trimestre", rotulo: "Neste trimestre", pontos: 18 },
  { valor: "semestre", rotulo: "Neste semestre", pontos: 10 },
  { valor: "pesquisando", rotulo: "Só pesquisando", pontos: 2 },
];

const ETAPAS = ["Empresa", "Investimento", "Contato", "Revisão"];
const rotulo = (lista: Opcao[], v: string) => lista.find((o) => o.valor === v)?.rotulo ?? "—";

type CampoEscolha = "porte" | "desafio" | "orcamento" | "prazo";

function Grupo({
  nome,
  legenda,
  opcoes,
  valor,
  onChange,
}: {
  nome: string;
  legenda: string;
  opcoes: Opcao[];
  valor: string;
  onChange: (v: string) => void;
}) {
  return (
    <fieldset>
      <legend className="text-sm font-medium text-[var(--fc-label)]">{legenda}</legend>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        {opcoes.map((o) => {
          const sel = valor === o.valor;
          return (
            <label
              key={o.valor}
              className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 text-sm transition-colors has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-[var(--accent)] ${
                sel ? "border-[var(--accent)] bg-[var(--fc-sel)] text-[var(--fc-text)] shadow-[0_0_0_3px_color-mix(in_srgb,var(--accent)_10%,transparent)]" : "border-[var(--fc-border)] bg-[var(--fc-opt)] text-[var(--fc-text-2)] hover:border-[var(--fc-border-strong)]"
              }`}
            >
              <input type="radio" name={nome} value={o.valor} checked={sel} onChange={() => onChange(o.valor)} className="sr-only" />
              <span aria-hidden className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${sel ? "border-[var(--accent)]" : "border-[var(--fc-border-strong)]"}`}>
                {sel && <span className="h-2 w-2 rounded-full bg-[var(--accent)]" />}
              </span>
              {o.rotulo}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

export default function FormMultietapas({
  tema = "claro",
  accent = "#0057FF",
  title = "Diagnóstico da operação",
  subtitle = "4 passos, menos de 2 minutos. Você recebe um plano de ação personalizado.",
  onSubmit,
}: Props) {
  const id = useId();
  const escuro = tema === "escuro";
  const [passo, setPasso] = useState(0);
  const [d, setD] = useState({ porte: "", desafio: "", orcamento: "", prazo: "", nome: "", email: "", empresa: "" });
  const [erro, setErro] = useState("");
  const [enviado, setEnviado] = useState<Diagnostico | null>(null);

  const score = Math.min(
    100,
    (PORTE.find((o) => o.valor === d.porte)?.pontos ?? 0) +
      (ORCAMENTO.find((o) => o.valor === d.orcamento)?.pontos ?? 0) +
      (PRAZO.find((o) => o.valor === d.prazo)?.pontos ?? 0),
  );

  const validarPasso = () => {
    if (passo === 0 && (!d.porte || !d.desafio)) return "Selecione o porte e o principal desafio.";
    if (passo === 1 && (!d.orcamento || !d.prazo)) return "Selecione orçamento e prazo.";
    if (passo === 2) {
      if (d.nome.trim().length < 3) return "Informe seu nome.";
      if (d.empresa.trim().length < 2) return "Informe o nome da empresa.";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(d.email.trim())) return "Informe um e-mail válido.";
    }
    return "";
  };

  const avancar = async () => {
    const e = validarPasso();
    setErro(e);
    if (e) return;
    if (passo < ETAPAS.length - 1) return setPasso(passo + 1);
    const final: Diagnostico = { ...d, nome: d.nome.trim(), email: d.email.trim().toLowerCase(), empresa: d.empresa.trim(), score };
    await onSubmit?.(final);
    setEnviado(final);
  };

  const g = (nome: CampoEscolha, legenda: string, opcoes: Opcao[]) => (
    <Grupo nome={`${id}-${nome}`} legenda={legenda} opcoes={opcoes} valor={d[nome]} onChange={(v) => setD((x) => ({ ...x, [nome]: v }))} />
  );

  const input = `mt-2 h-12 w-full rounded-xl border border-[var(--fc-border)] bg-[var(--fc-input)] px-4 text-sm text-[var(--fc-text)] placeholder:text-[var(--fc-subtle)] transition-colors hover:border-[var(--fc-border-strong)] focus:border-[var(--accent)] focus:outline-none ${
    escuro ? "" : "focus:bg-[var(--fc-surface)] focus:shadow-[0_0_0_4px_color-mix(in_srgb,var(--accent)_14%,transparent)]"
  }`;

  return (
    <section style={{ ...TEMAS[tema], "--accent": accent } as CSSProperties} className="relative isolate overflow-hidden bg-[var(--fc-bg)] px-6 py-20 text-[var(--fc-text)] sm:py-28 lg:px-8">
      <div aria-hidden className="pointer-events-none absolute left-1/2 top-0 -z-10 h-[22rem] w-[44rem] -translate-x-1/2 rounded-full bg-[var(--accent)] opacity-[var(--fc-glow)] blur-[130px]" />
      {!escuro && <div aria-hidden className="pointer-events-none absolute -right-24 bottom-10 -z-10 h-80 w-80 rounded-full bg-[#7C3AED] opacity-[0.08] blur-[120px]" />}
      <div className="mx-auto max-w-2xl">
        <div className="text-center">
          <h2 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h2>
          <p className="mt-4 text-pretty text-[var(--fc-muted)]">{subtitle}</p>
        </div>

        <div className="relative mt-10 overflow-hidden rounded-3xl border border-[var(--fc-border)] bg-[var(--fc-surface)] p-5 shadow-[var(--fc-shadow)] sm:p-8">
          {!escuro && <span aria-hidden className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[var(--accent)] via-[#7C3AED] to-[#EC4899]" />}
          {enviado ? (
            <div role="status" className="py-6 text-center">
              {!escuro && (
                <span aria-hidden className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--fc-pos)] text-white shadow-[0_10px_28px_-10px_var(--fc-pos)]">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m5 12 5 5L20 7" />
                  </svg>
                </span>
              )}
              <p className="text-xs uppercase tracking-[0.2em] text-[var(--fc-subtle)]">Diagnóstico enviado</p>
              <h3 className="mt-3 text-2xl font-semibold tracking-tight">Obrigado, {enviado.nome.split(" ")[0]}.</h3>
              <p className="mx-auto mt-3 max-w-sm text-sm text-[var(--fc-muted)]">
                {enviado.score >= 60
                  ? "Seu perfil tem alto potencial de retorno. Um consultor sênior entra em contato hoje."
                  : "Vamos enviar um plano de ação por e-mail em até 2 dias úteis."}
              </p>
              <button type="button" onClick={() => { setEnviado(null); setPasso(0); }} className="mt-6 text-sm font-medium text-[var(--accent)] hover:underline focus-visible:underline focus-visible:outline-none">
                Refazer diagnóstico
              </button>
            </div>
          ) : (
            <form noValidate onSubmit={(e) => { e.preventDefault(); avancar(); }}>
              {/* Progresso */}
              <ol className="flex gap-2" aria-label="Progresso">
                {ETAPAS.map((e, i) => (
                  <li key={e} className="flex-1" aria-current={i === passo ? "step" : undefined}>
                    <div className="h-1 overflow-hidden rounded-full bg-[var(--fc-track)]">
                      <div className="h-full rounded-full transition-all duration-500" style={{ width: i <= passo ? "100%" : "0%", background: escuro ? "var(--accent)" : CORES[i % CORES.length] }} />
                    </div>
                    <span className={`mt-2 block text-[11px] ${i === passo ? "font-medium text-[var(--fc-text)]" : "text-[var(--fc-subtle)]"}`}>
                      <span className="tabular-nums">{i + 1}.</span> <span className="hidden sm:inline">{e}</span>
                    </span>
                  </li>
                ))}
              </ol>

              <div className="mt-8 min-h-[16rem] space-y-6" key={passo}>
                {passo === 0 && (
                  <>
                    {g("porte", "Qual o porte da empresa?", PORTE)}
                    {g("desafio", "Principal desafio hoje", DESAFIO)}
                  </>
                )}
                {passo === 1 && (
                  <>
                    {g("orcamento", "Orçamento previsto para o projeto", ORCAMENTO)}
                    {g("prazo", "Quando pretende começar?", PRAZO)}
                  </>
                )}
                {passo === 2 && (
                  <div className="space-y-4">
                    {([
                      ["nome", "Seu nome", "Ana Ribeiro", "name", "text"],
                      ["empresa", "Empresa", "Nortec Industrial LTDA", "organization", "text"],
                      ["email", "E-mail corporativo", "ana@nortec.com.br", "email", "email"],
                    ] as const).map(([k, l, ph, ac, t]) => (
                      <div key={k}>
                        <label htmlFor={`${id}-${k}`} className="text-sm font-medium text-[var(--fc-label)]">{l}</label>
                        <input id={`${id}-${k}`} type={t} autoComplete={ac} placeholder={ph} value={d[k]} onChange={(e) => setD({ ...d, [k]: e.target.value })} className={input} />
                      </div>
                    ))}
                  </div>
                )}
                {passo === 3 && (
                  <dl className={`divide-y divide-[var(--fc-border)] rounded-2xl border border-[var(--fc-border)] ${escuro ? "" : "bg-[var(--fc-surface-2)]"}`}>
                    {[
                      ["Porte", rotulo(PORTE, d.porte), 0],
                      ["Desafio", rotulo(DESAFIO, d.desafio), 0],
                      ["Orçamento", rotulo(ORCAMENTO, d.orcamento), 1],
                      ["Prazo", rotulo(PRAZO, d.prazo), 1],
                      ["Contato", `${d.nome} · ${d.empresa} · ${d.email}`, 2],
                    ].map(([k, v, p]) => (
                      <div key={k as string} className="flex items-start justify-between gap-4 px-4 py-3 text-sm">
                        <dt className="text-[var(--fc-subtle)]">{k}</dt>
                        <dd className="min-w-0 flex-1 break-words text-right text-[var(--fc-label)]">{v}</dd>
                        <button type="button" onClick={() => setPasso(p as number)} className="text-xs text-[var(--accent)] hover:underline focus-visible:underline focus-visible:outline-none">
                          Editar
                        </button>
                      </div>
                    ))}
                  </dl>
                )}
              </div>

              {erro && <p role="alert" className="mt-4 text-sm text-[var(--fc-neg)]">{erro}</p>}

              <div className="mt-8 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => { setErro(""); setPasso((p) => Math.max(0, p - 1)); }}
                  disabled={passo === 0}
                  className="h-11 rounded-full border border-[var(--fc-border-strong)] bg-[var(--fc-surface)] px-5 text-sm font-medium text-[var(--fc-label)] transition hover:border-[var(--fc-subtle)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--accent)] disabled:invisible"
                >
                  Voltar
                </button>
                <button
                  type="submit"
                  className="h-11 rounded-full bg-[var(--accent)] px-6 text-sm font-semibold text-white shadow-[0_8px_32px_-8px_var(--accent)] transition hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
                >
                  {passo === ETAPAS.length - 1 ? "Enviar diagnóstico" : "Continuar"}
                </button>
              </div>
            </form>
          )}
        </div>

        <p className="mt-12 text-center text-[11px] text-[var(--fc-subtle)]">
          <a href="https://flowcoresolucoes.com.br/codigos" target="_blank" rel="noopener" className="transition-colors hover:text-[var(--fc-text)]">
            Criado por FlowCore Soluções LTDA
          </a>
        </p>
      </div>
    </section>
  );
}
