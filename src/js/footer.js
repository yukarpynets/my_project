// ============================================================
// FOOTER — Subscription form con validazione email
// API: POST https://your-energy.b.goit.study/api/subscription
// ============================================================


// --- 1. PATTERN DI VALIDAZIONE ---
// Questa espressione regolare (regex) definisce com'è fatto un'email valida.
// Il pattern viene preso dal Technical Assignment del progetto.
// ^ = inizio della stringa
// \w+ = una o più lettere/numeri/underscore (es. "mario")
// (\.\w+)? = opzionalmente un punto seguito da altre lettere (es. ".rossi")
// @ = il simbolo @, obbligatorio
// [a-zA-Z_]+? = il dominio, una o più lettere (es. "gmail")
// \. = un punto obbligatorio
// [a-zA-Z]{2,3} = estensione da 2 a 3 lettere (es. "com" o "it")
// $ = fine della stringa
const EMAIL_PATTERN = /^\w+(\.\w+)?@[a-zA-Z_]+?\.[a-zA-Z]{2,3}$/;

// L'URL dell'API a cui inviare la richiesta di iscrizione
const API_URL = 'https://your-energy.b.goit.study/api/subscription';


// --- 2. SELEZIONE ELEMENTI DAL DOM ---
// Prendiamo i riferimenti agli elementi HTML che ci servono.
// document.getElementById cerca un elemento con quell'id nella pagina.
const form = document.getElementById('subscriptionForm');
const emailInput = document.getElementById('subscriptionEmail');
const emailError = document.getElementById('emailError');
const submitBtn = form.querySelector('.footer__btn');


// --- 3. FUNZIONE DI VALIDAZIONE ---
// Questa funzione riceve una stringa (il valore dell'input)
// e restituisce true se è una email valida, false se no.
// .test() è un metodo delle regex: controlla se la stringa corrisponde al pattern.
// .trim() rimuove spazi bianchi all'inizio e alla fine (es. " mario@gmail.com ")
function isValidEmail(value) {
    return EMAIL_PATTERN.test(value.trim());
}


// --- 4. FUNZIONI PER MOSTRARE/NASCONDERE ERRORE ---
// showError: aggiunge la classe CSS "is-invalid" all'input (bordo rosso)
//            e aggiunge "visible" all'errore (lo rende visibile)
function showError() {
    emailInput.classList.add('is-invalid');
    emailInput.classList.remove('is-valid');
    emailError.classList.add('visible');
}

// hideError: fa il contrario — rimuove le classi di errore
//            e aggiunge "is-valid" (bordo verde) se l'email è corretta
function hideError() {
    emailInput.classList.remove('is-invalid');
    emailInput.classList.add('is-valid');
    emailError.classList.remove('visible');
}

// clearState: usata quando il campo è vuoto — rimuove tutti gli stati
function clearState() {
    emailInput.classList.remove('is-invalid', 'is-valid');
    emailError.classList.remove('visible');
}


// --- 5. VALIDAZIONE IN TEMPO REALE (evento "input") ---
// L'evento "input" si attiva ogni volta che l'utente digita nel campo.
// Così l'utente riceve feedback immediato mentre scrive.
emailInput.addEventListener('input', () => {
    // Se il campo è vuoto, rimuovi tutti gli stati visivi
    if (emailInput.value.trim() === '') {
        clearState();
        return; // esci dalla funzione, non fare altro
    }

    // Se c'è testo, valida e mostra il risultato
    if (isValidEmail(emailInput.value)) {
        hideError(); // email corretta → bordo verde
    } else {
        showError(); // email errata → bordo rosso + messaggio
    }
});


// --- 6. FUNZIONE NOTIFICA (toast) ---
// Crea un piccolo popup in fondo allo schermo per comunicare successo/errore.
// type = 'success' (verde) oppure 'error' (rosso)
function showNotification(message, type = 'success') {
    // Rimuovi eventuale notifica già presente
    const existing = document.querySelector('.footer-toast');
    if (existing) existing.remove();

    // Crea un nuovo elemento div per la notifica
    const toast = document.createElement('div');
    toast.className = 'footer-toast';

    // Imposta lo stile direttamente (così non serve aggiungere CSS)
    Object.assign(toast.style, {
        position: 'fixed',          // posizionato rispetto alla finestra
        bottom: '32px',             // 32px dal basso
        right: '32px',              // 32px da destra
        padding: '14px 24px',
        borderRadius: '8px',
        fontSize: '14px',
        fontWeight: '500',
        color: '#fff',
        zIndex: '9999',             // sopra tutto il resto
        background: type === 'success' ? '#27ae60' : '#e74c3c',
        boxShadow: '0 4px 16px rgba(0,0,0,0.25)',
        transition: 'opacity 0.3s ease',
    });

    toast.textContent = message;
    document.body.appendChild(toast); // aggiungi al DOM

    // Dopo 3 secondi, fai sparire la notifica
    setTimeout(() => {
        toast.style.opacity = '0';
        // Dopo che la transizione CSS finisce (0.3s), rimuovi l'elemento
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}


// --- 7. GESTIONE DEL SUBMIT DEL FORM ---
// L'evento "submit" si attiva quando l'utente clicca "Send"
// o preme Invio nel campo email.
form.addEventListener('submit', async event => {
    // event.preventDefault() impedisce il comportamento default del form
    // (cioè ricaricare la pagina), perché gestiamo noi l'invio via JS
    event.preventDefault();

    const email = emailInput.value.trim();

    // Controlla che l'email sia valida prima di inviare
    if (!isValidEmail(email)) {
        showError();
        emailInput.focus(); // porta il cursore nel campo
        return; // blocca l'esecuzione, non inviare
    }

    // --- 8. DISABILITA IL BOTTONE DURANTE LA RICHIESTA ---
    // Evita che l'utente clicchi più volte mentre aspetta la risposta
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending...';

    try {
        // --- 9. CHIAMATA ALL'API ---
        // fetch() invia una richiesta HTTP all'URL specificato.
        // method: 'POST' = stiamo inviando dati (non solo leggendo)
        // headers: diciamo al server che mandiamo JSON
        // body: i dati da inviare, convertiti in stringa JSON
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email }),
        });

        // --- 10. CONTROLLO RISPOSTA ---
        // response.ok è true se lo status HTTP è 200-299 (successo)
        // Se non è ok, creiamo un errore manualmente per andare al catch
        if (!response.ok) {
            const data = await response.json().catch(() => ({}));
            throw new Error(data.message || `Error ${response.status}`);
        }

        // --- 11. SUCCESSO ---
        form.reset();    // svuota il campo email
        clearState();    // rimuovi bordi colorati
        showNotification('Successfully subscribed! 🎉', 'success');

    } catch (error) {
        // --- 12. GESTIONE ERRORE ---
        // Se qualcosa va storto (rete, server, ecc.), mostriamo il messaggio
        showNotification(error.message || 'Something went wrong. Try again.', 'error');

    } finally {
        // --- 13. FINALLY — si esegue SEMPRE, sia in caso di successo che errore ---
        // Riabilitiamo il bottone in ogni caso
        submitBtn.disabled = false;
        submitBtn.textContent = 'Send';
    }
});