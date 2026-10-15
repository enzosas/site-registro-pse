// Identifica se é dispositivo tátil/celular
export const isMobileDevice = () => {
    return (
        typeof window !== 'undefined' &&
        (window.matchMedia('(pointer: coarse)').matches ||
            'ontouchstart' in window ||
            navigator.maxTouchPoints > 0)
    );
};

// Executa com delay de 250ms no celular e instantaneamente no desktop
export const navegarComFeedback = (acao, delay = 200) => {
    if (isMobileDevice()) {
        setTimeout(acao, delay);
    } else {
        acao();
    }
};