import '../styles/components/AvisoCartao.css';
import { IconeRelogio, IconeAlerta, IconeSemInternet, IconeCheck } from './Icones';

const ICONES = {
    pendente: IconeRelogio,
    erro: IconeAlerta,
    offline: IconeSemInternet,
    sucesso: IconeCheck,
};

// Cartão de aviso: ícone colorido ao lado do título, texto e botões abaixo.
// tipo: 'pendente' (azul), 'offline' (azul), 'erro' (vermelho) ou 'sucesso' (verde)
// emFundoBranco: usa borda em vez de sombra (para cartões dentro de outro cartão branco)
export function AvisoCartao({ tipo = 'pendente', titulo, children, acoes, emFundoBranco = false }) {
    const Icone = ICONES[tipo] || IconeRelogio;
    const classes = [
        'aviso-cartao',
        tipo === 'erro' ? 'aviso-cartao--erro' : '',
        tipo === 'sucesso' ? 'aviso-cartao--sucesso' : '',
        emFundoBranco ? 'aviso-cartao--em-fundo-branco' : '',
    ].join(' ');

    return (
        <div className={classes} role={tipo === 'erro' ? 'alert' : 'status'}>
            <div className="aviso-cartao__topo">
                <span className="aviso-cartao__icone">
                    <Icone />
                </span>
                <p className="aviso-cartao__titulo">{titulo}</p>
            </div>
            {children && <div className="aviso-cartao__texto">{children}</div>}
            {acoes && <div className="aviso-cartao__acoes">{acoes}</div>}
        </div>
    );
}
