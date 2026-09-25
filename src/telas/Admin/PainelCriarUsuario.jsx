import { TELAS_ADMIN, TIPO_USUARIO } from '../../constantes';

export function PainelCriarUsuario({ tipoUsuario }) {
    const isAdminGeral = tipoUsuario === TIPO_USUARIO.ADMIN;
    const ESCOLAS_MOCK = [
        { id: 1, nome: 'Escola Municipal Manoel Ribas' },
        { id: 2, nome: 'Escola Estadual Cilon Rosa' },
        { id: 3, nome: 'Colégio Politécnico UFSM' },
        { id: 4, nome: 'Instituto Estadual de Educação Olavo Bilac' },
        { id: 5, nome: 'Escola Básica Paulo Freire' },
    ];
    return (
        <>
            <p className="app__title">Criar Usuário</p>

            <div className='app__combobox-group'>
                <label>Tipo de usuário</label>
                <select className='app__select'>
                    <option value={TIPO_USUARIO.COMUM}>Comum</option>
                    <option value={TIPO_USUARIO.ESCOLA}>Escola</option>
                    <option value={TIPO_USUARIO.UBS}>UBS</option>
                </select>
            </div>
            <div className='app__input-group'>
                <label>Nome Completo</label>
                <input
                    type="text"
                    placeholder="Escreva aqui o nome completo do novo usuário"
                />
            </div>
            <div className='app__input-group'>
                <label>Escola / UBS</label>
                <input
                    type="text"
                    placeholder="Escreva aqui a escola ou UBS relacionada ao usuário"
                    list="lista-escolas-mock"
                />
                <datalist id="lista-escolas-mock">
                    {ESCOLAS_MOCK.map((escola) => (
                        <option key={escola.id} value={escola.nome} />
                    ))}
                </datalist>
            </div>
            <div className='app__input-group'>
                <label>E-mail</label>
                <input
                    type="text"
                    placeholder="Escreva aqui a o email do novo usuário"
                />
            </div>
            <div className='app__input-group'>
                <label>Senha</label>
                <input
                    type="text"
                    placeholder="Escreva aqui a senha do novo usuário"
                />
            </div>
            <div className='app__footer'>
                <button
                    className={'app__buttonMain'}
                >
                    <p>Avançar</p>
                </button>
            </div>
        </>
    );
}