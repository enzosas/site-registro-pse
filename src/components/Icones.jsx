export function IconeVoltar() {
    return (
        <svg width="1em" height="1em" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
                d="M20.625 11H1.375M1.375 11L11 20.625M1.375 11L11 1.375"
                stroke="#1E1E1E"
                strokeWidth="2.75"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    )
}

export function IconePesquisa() {
    return (
        <svg width="1em" height="1em" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
                d="M12.8 12.8L9.90005 9.89999M11.4667 6.13332C11.4667 9.07884 9.0789 11.4667 6.13338 11.4667C3.18786 11.4667 0.800049 9.07884 0.800049 6.13332C0.800049 3.1878 3.18786 0.799988 6.13338 0.799988C9.0789 0.799988 11.4667 3.1878 11.4667 6.13332Z"
                stroke="#1E1E1E"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    )
}

export function IconeCheck({ className, bold = false }) {
    return (
        <svg className={className} width="1em" height="1em" viewBox="0 0 14 10" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
                d="M1.5 5.5L4.5 8.5L12.5 1.5"
                stroke="currentColor"
                strokeWidth={bold ? "3" : "1.5"}
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    )
}
export function IconeRelogio() {
    return (
        <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <circle cx="12" cy="12" r="9" />
            <path d="M12 7v5l3 2" />
        </svg>
    )
}

export function IconeAlerta() {
    return (
        <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
            <circle cx="12" cy="12" r="9" />
            <path d="M12 7.5v5.5" />
            <path d="M12 16.5v.01" />
        </svg>
    )
}

export function IconeSemInternet() {
    return (
        <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M3 3l18 18" />
            <path d="M8.5 8.6A5.5 5.5 0 0 0 6.5 17H17" />
            <path d="M11 6.1A5.5 5.5 0 0 1 18 11.5a4 4 0 0 1 1.8 4.7" />
        </svg>
    )
}

export function IconeDocumento() {
    return (
        <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
            <path d="M14 3v5h5" />
            <path d="M9 13h6M9 17h6" />
        </svg>
    )
}

export function IconeUsuarios() {
    return (
        <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="9" cy="8" r="3.5" />
            <path d="M2.5 20a6.5 6.5 0 0 1 13 0" />
            <path d="M16 4.6a3.5 3.5 0 0 1 0 6.8M18 14.3A6.5 6.5 0 0 1 21.5 20" />
        </svg>
    )
}

export function IconeVinculo() {
    return (
        <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M10 14a4 4 0 0 0 5.66 0l3-3a4 4 0 0 0-5.66-5.66l-1 1" />
            <path d="M14 10a4 4 0 0 0-5.66 0l-3 3a4 4 0 0 0 5.66 5.66l1-1" />
        </svg>
    )
}

export function IconeEnviarArquivo() {
    return (
        <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M4 16v3h16v-3" />
            <path d="M12 4v11" />
            <path d="M7 9l5-5 5 5" />
        </svg>
    )
}

export function IconeSetaDireita() {
    return (
        <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M9 6l6 6-6 6" />
        </svg>
    )
}

export function IconeBaixar() {
    return (
        <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M4 16v3h16v-3" />
            <path d="M12 4v11" />
            <path d="M7 10l5 5 5-5" />
        </svg>
    )
}
