import { useState } from "react";
import { Link } from "react-router";
import { ArrowDownLeft, ArrowRight, ArrowUpRight, ChartNoAxesCombined, Check, ChevronRight, Code2, LayoutDashboard, ListFilter, PieChart, ShieldCheck, Sparkles, Wallet } from "lucide-react";
import { formatarMoeda } from "../utils/formatarmoeda";
import { mesesDemo, resumirMovimentosDemo } from "../utils/demoDashboard";
import "./presentation.css";

function GitHubIcon({ size = 16 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 .75a11.25 11.25 0 0 0-3.56 21.92c.56.1.77-.24.77-.54v-2.1c-3.13.68-3.79-1.33-3.79-1.33-.51-1.3-1.25-1.65-1.25-1.65-1.02-.7.08-.68.08-.68 1.13.08 1.72 1.16 1.72 1.16 1 .1.76 1.83 3.27 1.2.1-.72.4-1.2.72-1.48-2.5-.28-5.13-1.25-5.13-5.56 0-1.23.44-2.23 1.16-3.01-.12-.29-.5-1.43.11-2.98 0 0 .95-.3 3.1 1.15A10.8 10.8 0 0 1 12 6.47c.96 0 1.92.13 2.82.38 2.15-1.45 3.1-1.15 3.1-1.15.61 1.55.23 2.69.11 2.98.72.78 1.16 1.78 1.16 3.01 0 4.32-2.63 5.27-5.14 5.55.4.35.76 1.03.76 2.08v2.81c0 .3.2.65.78.54A11.25 11.25 0 0 0 12 .75Z" /></svg>;
}
const separadores = [
  { nome: "Visão geral", Icone: LayoutDashboard },
  { nome: "Movimentos", Icone: ListFilter },
  { nome: "Categorias", Icone: PieChart },
] as const;
type Separador = typeof separadores[number]["nome"];
const coresCategorias = ["#4479ee", "#71b6a0", "#edbc6a", "#ac9cdb"];

function DemonstracaoDashboard() {
  const [mes, setMes] = useState(1);
  const [separador, setSeparador] = useState<Separador>("Visão geral");
  const [filtro, setFiltro] = useState("todos");
  const dados = mesesDemo[mes];
  const resumo = resumirMovimentosDemo(dados.movimentos);
  const categorias = ["Casa", "Alimentação", "Transportes", "Lazer"].map((nome, indice) => ({
    nome,
    cor: coresCategorias[indice],
    total: dados.movimentos.filter(item => item.categoria === nome).reduce((total, item) => total + item.valor, 0),
  }));
  let percentagem = 0;
  const gradiente = categorias.map(categoria => {
    const inicio = percentagem;
    percentagem += categoria.total / resumo.despesas * 100;
    return categoria.cor + " " + inicio + "% " + percentagem + "%";
  }).join(", ");
  const movimentosFiltrados = dados.movimentos.filter(item => filtro === "todos" || item.tipo === filtro);

  return (
    <section className="demo-shell" id="demonstracao" aria-label="Demonstração interativa da dashboard">
      <div className="demo-browser"><span className="browser-dots" aria-hidden="true"><i /><i /><i /></span><span>O teu espaço financeiro</span><span className="demo-live"><i /> Demo interativa</span></div>
      <div className="demo-workspace">
        <aside className="demo-sidebar">
          <div className="demo-brand"><Wallet size={20} /><span>gestor<span className="brand-dot">.</span></span></div>
          <span className="demo-menu-label">O TEU ESPAÇO</span>
          <nav aria-label="Explorar demonstração">
            {separadores.map(({ nome, Icone }) => <button type="button" key={nome} aria-pressed={separador === nome} className={separador === nome ? "demo-tab active" : "demo-tab"} onClick={() => setSeparador(nome)}><Icone size={16} /><span>{nome}</span></button>)}
          </nav>
          <div className="demo-sidebar-bottom"><div className="demo-avatar">R</div><span>Rodrigo<small>Conta de exemplo</small></span></div>
        </aside>
        <div className="demo-content">
          <div className="demo-heading"><div><p>Vamos pôr tudo em dia.</p><h3>{separador}</h3></div><label className="demo-month"><span className="sr-only">Mês da demonstração</span><select value={mes} onChange={event => setMes(Number(event.target.value))}>{mesesDemo.map((item, indice) => <option value={indice} key={item.nome}>{item.nome}</option>)}</select></label></div>
          <div className="demo-stats" aria-live="polite" aria-atomic="true">
            <div className="demo-stat balance"><span><Wallet size={14} /> Saldo disponível</span><strong>{formatarMoeda.format(resumo.saldo)}</strong><small>Receitas menos despesas</small></div>
            <div className="demo-stat"><span><ArrowDownLeft size={14} /> Receitas</span><strong>{formatarMoeda.format(resumo.receitas)}</strong><small className="positive">Entradas este mês</small></div>
            <div className="demo-stat"><span><ArrowUpRight size={14} /> Despesas</span><strong>{formatarMoeda.format(resumo.despesas)}</strong><small>Saídas este mês</small></div>
          </div>
          {separador === "Visão geral" ? (
            <div className="demo-panels">
              <section className="demo-panel"><div className="panel-title"><h4>Despesas por categoria</h4><PieChart size={15} /></div><div className="demo-category-overview"><div className="demo-donut" role="img" aria-label={"Total de despesas: " + formatarMoeda.format(resumo.despesas)} style={{ background: "conic-gradient(" + gradiente + ")" }}><div><small>Este mês</small><strong>{formatarMoeda.format(resumo.despesas)}</strong></div></div><div className="demo-legend">{categorias.map(categoria => <div key={categoria.nome}><i style={{ background: categoria.cor }} /><span>{categoria.nome}</span><b>{Math.round(categoria.total / resumo.despesas * 100)}%</b></div>)}</div></div><button className="demo-text-button" type="button" onClick={() => setSeparador("Categorias")}>Explorar categorias <ArrowRight size={13} /></button></section>
              <section className="demo-panel"><div className="panel-title"><h4>Últimos movimentos</h4><span className="tiny-label">EUR</span></div><div className="demo-mini-list">{dados.movimentos.slice(-3).reverse().map(item => <div key={item.titulo}><span className={item.tipo === "receita" ? "movement-icon income" : "movement-icon"}>{item.tipo === "receita" ? <ArrowDownLeft size={15} /> : <ArrowUpRight size={15} />}</span><span className="movement-name">{item.titulo}<small>{item.categoria}</small></span><strong className={item.tipo === "receita" ? "positive" : ""}>{item.tipo === "receita" ? "+" : "−"}{formatarMoeda.format(item.valor)}</strong></div>)}</div><button className="demo-text-button" type="button" onClick={() => setSeparador("Movimentos")}>Ver movimentos <ArrowRight size={13} /></button></section>
            </div>
          ) : separador === "Movimentos" ? (
            <section className="demo-panel demo-detail"><div className="panel-title"><h4>Os movimentos do mês</h4><label><span className="sr-only">Filtrar movimentos</span><select className="demo-filter" value={filtro} onChange={event => setFiltro(event.target.value)}><option value="todos">Todos</option><option value="receita">Receitas</option><option value="despesa">Despesas</option></select></label></div><div className="demo-mini-list detailed" aria-live="polite">{movimentosFiltrados.map(item => <div key={item.titulo}><span className={item.tipo === "receita" ? "movement-icon income" : "movement-icon"}>{item.tipo === "receita" ? <ArrowDownLeft size={15} /> : <ArrowUpRight size={15} />}</span><span className="movement-name">{item.titulo}<small>{item.categoria} · dia {item.dia}</small></span><strong className={item.tipo === "receita" ? "positive" : ""}>{item.tipo === "receita" ? "+" : "−"}{formatarMoeda.format(item.valor)}</strong></div>)}</div></section>
          ) : (
            <section className="demo-panel demo-detail"><div className="panel-title"><h4>Para onde vai o teu dinheiro?</h4><span className="tiny-label">{categorias.length} categorias</span></div><div className="demo-category-bars">{categorias.map(categoria => <div key={categoria.nome}><div><span><i style={{ background: categoria.cor }} />{categoria.nome}</span><strong>{formatarMoeda.format(categoria.total)}</strong></div><div className="category-track"><span style={{ width: categoria.total / resumo.despesas * 100 + "%", background: categoria.cor }} /></div></div>)}</div></section>
          )}
          <p className="demo-disclaimer"><ShieldCheck size={12} /> Dados fictícios. Explora à vontade, sem criar conta.</p>
        </div>
      </div>
    </section>
  );
}

function App() {
  return (
    <div className="presentation">
      <a className="presentation-skip" href="#conteudo">Saltar para o conteúdo</a>
      <header className="presentation-header">
        <Link to="/" className="presentation-logo" aria-label="Gestor de Despesas — início"><span className="logo-symbol"><Wallet size={21} /></span><span>Gestor de Despesas<span className="brand-dot">.</span></span></Link>
        <nav aria-label="Navegação principal"><a className="desktop-link" href="#projeto">O projeto</a><a className="desktop-link" href="https://github.com/Rodrigo0133" target="_blank" rel="noopener noreferrer"><GitHubIcon size={16} /> GitHub <ArrowUpRight size={13} /></a><Link className="login-link" to="/login">Entrar</Link><Link className="presentation-button small" to="/registrar">Criar conta <ArrowRight size={15} /></Link></nav>
      </header>
      <main id="conteudo">
        <section className="presentation-hero">
          <div className="hero-copy"><span className="presentation-eyebrow"><span /> FINANÇAS PESSOAIS, SEM COMPLICAÇÕES</span><h1>O teu dinheiro,<br />com mais <span>clareza.</span></h1><p>As receitas, as despesas e tudo o que fica pelo meio. Um só lugar para perceberes os teus hábitos e acompanhares as tuas finanças.</p><div className="hero-actions"><Link className="presentation-button" to="/registrar">Começar a organizar <ArrowRight size={18} /></Link><a className="presentation-secondary" href="#demonstracao">Explorar a demo <ChevronRight size={17} /></a></div><div className="hero-note"><span><Check size={14} /> Receitas e despesas</span><span><Check size={14} /> Visão mensal</span><span><Check size={14} /> Tudo por categoria</span></div><div className="hero-author"><span className="author-avatar">R</span><span>Uma ideia, muitas linhas de código.<br /><strong>Um projeto desenvolvido por Rodrigo.</strong></span></div></div>
          <div className="hero-visual"><div className="demo-intro"><Sparkles size={14} /><span>Experimenta: muda o mês e explora o menu.</span><span className="demo-intro-line" /></div><DemonstracaoDashboard /><span className="demo-caption">Uma pequena amostra do que podes fazer.</span></div>
        </section>
        <section className="presentation-features" aria-label="Funcionalidades do gestor">
          <article><span className="feature-icon"><Wallet size={21} /></span><div><h2>Cada movimento conta.</h2><p>Regista entradas e saídas e mantém o teu histórico organizado.</p></div></article>
          <article><span className="feature-icon"><ChartNoAxesCombined size={21} /></span><div><h2>Vê o mês com outros olhos.</h2><p>Consulta o saldo e acompanha as receitas e despesas do mês.</p></div></article>
          <article><span className="feature-icon"><PieChart size={21} /></span><div><h2>Dá um lugar a cada despesa.</h2><p>Organiza por categorias para perceberes onde estás a gastar.</p></div></article>
        </section>
        <section className="presentation-project" id="projeto"><div><span className="presentation-eyebrow">DO CÓDIGO AO DIA A DIA</span><h2>Um projeto para aprender.<br />Uma ferramenta para usar.</h2><p>Sou o Rodrigo e desenvolvi este gestor de despesas para pôr em prática o desenvolvimento de uma aplicação completa: da interface aos dados, passando pela autenticação e pela organização financeira.</p><a className="project-github" href="https://github.com/Rodrigo0133/Gestor-de-despesas" target="_blank" rel="noopener noreferrer"><GitHubIcon size={18} /> Conhecer o projeto no GitHub <ArrowUpRight size={16} /></a></div><aside className="project-card"><span className="code-symbol"><Code2 size={25} /></span><h3>Feito por Rodrigo<span className="brand-dot">.</span></h3><p>Desenvolvimento, aprendizagem e atenção aos detalhes.</p><div className="project-stack">{["React", "TypeScript", "Tailwind CSS", "Node.js", "Express", "MongoDB"].map(item => <span key={item}>{item}</span>)}</div><a href="https://github.com/Rodrigo0133" target="_blank" rel="noopener noreferrer">@Rodrigo0133 <ArrowUpRight size={15} /></a></aside></section>
      </main>
      <footer className="presentation-footer"><span>Gestor de Despesas <span className="brand-dot">/</span> Desenvolvido por Rodrigo</span><a href="https://github.com/Rodrigo0133" target="_blank" rel="noopener noreferrer"><GitHubIcon size={15} /> GitHub <ArrowUpRight size={13} /></a><span>Mais organização. Mais clareza.</span></footer>
    </div>
  );
}
export default App;
