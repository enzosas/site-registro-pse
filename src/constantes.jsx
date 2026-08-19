export const EIXOS_ID = {
	SAUDE_AMBIENTAL: 1,
	ATIVIDADE_FISICA: 2,
	ANTROPOMETRIA: 3,
	CULTURA_PAZ: 4,
	PREVENCAO_VIOLENCIAS: 5,
	DOENCAS_NEGLIGENCIADAS: 6,
	VACINACAO: 7,
	SAUDE_SEXUAL: 8,
	PREVENCAO_DROGAS: 9,
	SAUDE_BUCAL: 10,
	SAUDE_AUDITIVA: 11,
	SAUDE_OCULAR: 12,
	PREVENCAO_COVID: 13,
	HIGIENE_PESSOAL: 14,
	TEMATICA_LOCAL: 15,
};

export const EIXOS_TEMATICOS = [
	{ id: EIXOS_ID.SAUDE_AMBIENTAL, label: "1. Saúde ambiental (ações de combate ao mosquito Aedes aegypti)" },
	{ id: EIXOS_ID.ATIVIDADE_FISICA, label: "2. Promoção da atividade física (práticas corporais)" },
	{ id: EIXOS_ID.ANTROPOMETRIA, label: "3. Alimentação saudável e prevenção da obesidade (antropometria)" },
	{ id: EIXOS_ID.CULTURA_PAZ, label: "4. Promoção da cultura de paz e direitos humanos" },
	{ id: EIXOS_ID.PREVENCAO_VIOLENCIAS, label: "5. Prevenção das violências e dos acidentes" },
	{ id: EIXOS_ID.DOENCAS_NEGLIGENCIADAS, label: "6. Prevenção de doenças negligenciadas" },
	{ id: EIXOS_ID.VACINACAO, label: "7. Verificação da situação vacinal" },
	{ id: EIXOS_ID.SAUDE_SEXUAL, label: "8. Saúde sexual e reprodutiva e prevenção do HIV/IST" },
	{ id: EIXOS_ID.PREVENCAO_DROGAS, label: "9. Prevenção ao uso de álcool, tabaco e outras drogas" },
	{ id: EIXOS_ID.SAUDE_BUCAL, label: "10. Saúde bucal (aplicação tópica de flúor/ escovação supervisionada)" },
	{ id: EIXOS_ID.SAUDE_AUDITIVA, label: "11. Saúde auditiva" },
	{ id: EIXOS_ID.SAUDE_OCULAR, label: "12. Saúde ocular" },
	{ id: EIXOS_ID.PREVENCAO_COVID, label: "13. Prevenção à covid-19" },
	{ id: EIXOS_ID.HIGIENE_PESSOAL, label: "14. Cuidados com higiene pessoal" },
	{ id: EIXOS_ID.TEMATICA_LOCAL, label: "15. Temática Local" }
];

export const OPCOES_VACINACAO = {
	POSITIVO: {
		valor: 'completo',
		label: 'Completo',
	},
	NEGATIVO: {
		valor: 'incompleto',
		label: 'Incompleto',
	}
}

export const formatarVacinacao = (valor) => {
	if (valor === OPCOES_VACINACAO.POSITIVO.valor) return OPCOES_VACINACAO.POSITIVO.label
	if (valor === OPCOES_VACINACAO.NEGATIVO.valor) return OPCOES_VACINACAO.NEGATIVO.label
	return '-'
}

export const OPCOES_SAUDE_OCULAR = {
	POSITIVO: {
		valor: 'normal',
		label: 'Normal',
	},
	NEGATIVO: {
		valor: 'alterada',
		label: 'Alterada',
	}
}

export const formatarSaudeOcular = (valor) => {
	if (valor === OPCOES_SAUDE_OCULAR.POSITIVO.valor) return OPCOES_SAUDE_OCULAR.POSITIVO.label
	if (valor === OPCOES_SAUDE_OCULAR.NEGATIVO.valor) return OPCOES_SAUDE_OCULAR.NEGATIVO.label
	return '-'
}