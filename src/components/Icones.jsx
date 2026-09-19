export function IconeVoltar() {
    return (
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
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
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
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
        <svg className={className} width="14" height="10" viewBox="0 0 14 10" fill="none" xmlns="http://www.w3.org/2000/svg">
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