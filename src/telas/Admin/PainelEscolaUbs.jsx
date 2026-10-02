import { useState, useEffect } from 'react';
import { TIPO_USUARIO } from '../../constantes';
import { useAuth } from '../../context/AuthContext';
import { carregarRelacaoUbsEscolasDB } from '../../services/supabaseService';

export function PainelEscolaUbs({ onEditar, onAdicionarUbs, onRemoverUbs }) {
    const { tipoUsuario } = useAuth();
    const isAdminGeral = tipoUsuario === TIPO_USUARIO.ADMIN;

    const [listaUbs, setListaUbs] = useState([]);
    const [carregando, setCarregando] = useState(true);
    const [escolasSemUbs, setEscolasSemUbs] = useState([]);

    useEffect(() => {
        let montado = true;
        async function carregarDados() {
            setCarregando(true);
            const { ubs, escolasSemUbs: semUbs } = await carregarRelacaoUbsEscolasDB();
            if (montado) {
                setListaUbs(ubs || []);
                setEscolasSemUbs(semUbs || []);
                setCarregando(false);
            }
        }
        carregarDados();
        return () => {
            montado = false;
        };
    }, []);

    if (!isAdminGeral) {
        return (
            <div>
                <p className="app__title">Acesso Restrito</p>
                <p>Você não tem permissão para acessar esta área.</p>
            </div>
        );
    }

    return (
        <>
            <p className="app__title">Relação Escola e UBS</p>
            <div className="admin__escola_ubs__container">
                {carregando && (
                    <p className="admin__escola_ubs__vazio">Carregando unidades e escolas...</p>
                )}
                {!carregando && listaUbs.length === 0 && (
                    <p className="admin__escola_ubs__vazio">Nenhuma UBS cadastrada.</p>
                )}
                {!carregando && listaUbs.map((ubs) => (
                    <div key={ubs.id} className="admin__escola_ubs__card">
                        <p className="admin__escola_ubs__card-titulo">{ubs.nome}</p>
                        <div className="admin__escola_ubs__escolas-lista">
                            {ubs.escolas && ubs.escolas.length > 0 ? (
                                ubs.escolas.map((escola) => (
                                    <div key={escola.id} className="admin__escola_ubs__escola-item">
                                        {escola.nome}
                                    </div>
                                ))
                            ) : (
                                <p className="admin__escola_ubs__sem-escolas">
                                    Nenhuma escola vinculada
                                </p>
                            )}
                        </div>
                    </div>
                ))}
                {!carregando && (
                    escolasSemUbs.length > 0 ? (
                        <div className="admin__escola_ubs__card admin__escola_ubs__card--sem-vinculo">
                            <div className="admin__escola_ubs__card-header-alerta">
                                <p className="admin__escola_ubs__card-titulo admin__escola_ubs__card-titulo--alerta">
                                    Escolas sem UBS vinculada
                                </p>
                                <span className="admin__escola_ubs__badge-contador">
                                    {escolasSemUbs.length}
                                </span>
                            </div>
                            <div className="admin__escola_ubs__escolas-lista">
                                {escolasSemUbs.map((escola) => (
                                    <div key={escola.id} className="admin__escola_ubs__escola-item">
                                        {escola.nome}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <p> Todas as escolas estão associadas a uma UBS. </p>
                    )
                )}
            </div>
            <div className="app__footer">
                <div className="admin__escola_ubs__botoes_grupo">
                    <button
                        type="button"
                        className="app__buttonSecondary admin__escola_ubs__botao_secundario"
                        onClick={onAdicionarUbs}
                        disabled={carregando}
                    >
                        <p>Adicionar UBS</p>
                    </button>
                    <button
                        type="button"
                        className="app__buttonSecondary admin__escola_ubs__botao_secundario"
                        onClick={onRemoverUbs}
                        disabled={carregando}
                    >
                        <p>Remover UBS</p>
                    </button>
                </div>
                <button
                    type="button"
                    className="app__buttonMain"
                    onClick={onEditar}
                    disabled={carregando}
                >
                    <p>Editar Vínculo</p>
                </button>
            </div>
        </>
    );
}