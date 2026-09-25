import { TELAS_ADMIN, TIPO_USUARIO } from '../../constantes';

export function PainelUsuarios({ tipoUsuario }) {
    const isAdminGeral = tipoUsuario === TIPO_USUARIO.ADMIN;

    return (
        <>
            <p className="app__title">Gerenciar Usuários</p>
            <div className='admin__grupo-filtros'>
                <div className='app__combobox-group'>
                    <label>Tipo</label>
                    <select className='app__select'>
                        <option value="">Sem filtro</option>
                        <option value={TIPO_USUARIO.ADMIN}>Administrador</option>
                        <option value={TIPO_USUARIO.ESCOLA}>Escola</option>
                        <option value={TIPO_USUARIO.UBS}>UBS</option>
                        <option value={TIPO_USUARIO.COMUM}>Comum</option>
                    </select>
                </div>
                <div className='app__combobox-group'>
                    <label>Escola</label>
                    <select className='app__select'>
                        <option value="">Sem filtro</option>
                        <option value={TIPO_USUARIO.ADMIN}>Administrador</option>
                        <option value={TIPO_USUARIO.ESCOLA}>Escola</option>
                        <option value={TIPO_USUARIO.UBS}>UBS</option>
                        <option value={TIPO_USUARIO.COMUM}>Comum</option>
                    </select>
                </div>
                <div className='app__combobox-group'>
                    <label>UBS</label>
                    <select className='app__select'>
                        <option value="">Sem filtro</option>
                        <option value={TIPO_USUARIO.ADMIN}>Administrador</option>
                        <option value={TIPO_USUARIO.ESCOLA}>Escola</option>
                        <option value={TIPO_USUARIO.UBS}>UBS</option>
                        <option value={TIPO_USUARIO.COMUM}>Comum</option>
                    </select>
                </div>
            </div>
            <div className='app__search-bar'>
                <input
                    type="text"
                    placeholder="Digite aqui para pesquisar um usuário"
                />
            </div>
            <div className='app__search-list'>
                <div className='app__search-list__unidade'> aaaa </div>
                <div className='app__search-list__unidade'> aaaa </div>
                <div className='app__search-list__unidade'> aaaa </div>
                <div className='app__search-list__unidade'> aaaa </div>
            </div>
            <div className='app__footer'>
                <button
                    className={'app__buttonMain'}
                >
                    <p>Criar novo usuário</p>
                </button>
            </div>
        </>
    );
}