

export function showToast(message) {
    let toast = document.createElement('div');
    toast.textContent = message;
    toast.className = 'fixed top-6 right-6 bg-green-600 text-white px-8 py-4 rounded-xl shadow-2xl z-50 opacity-0 transition-opacity duration-300 text-center text-lg font-semibold';
    document.body.appendChild(toast);
    setTimeout(() => { toast.style.opacity = '1'; }, 10);
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => document.body.removeChild(toast), 300);
    }, 2000);
}

export function showConfirm(message) {
    return new Promise((resolve) => {
        const overlay = document.createElement('div');
        overlay.className = 'fixed inset-0 bg-black/40 flex items-center justify-center z-50';

        const popup = document.createElement('div');
        popup.className = 'bg-white rounded-xl shadow-2xl p-8 flex flex-col items-center gap-6 min-w-[300px]';
        popup.innerHTML = `
            <div class="text-lg font-semibold text-gray-800 text-center">${message}</div>
            <div class="flex gap-4">
                <button class="px-5 py-2 rounded bg-blue-600 text-white font-bold hover:bg-blue-700 transition" id="confirmYes">Confirmer</button>
                <button class="px-5 py-2 rounded bg-gray-300 text-gray-700 font-bold hover:bg-gray-400 transition" id="confirmNo">Annuler</button>
            </div>
        `;

        overlay.appendChild(popup);
        document.body.appendChild(overlay);

        popup.querySelector('#confirmYes').onclick = () => {
            document.body.removeChild(overlay);
            resolve(true);
        };
        popup.querySelector('#confirmNo').onclick = () => {
            document.body.removeChild(overlay);
            resolve(false);
        };
    });
}