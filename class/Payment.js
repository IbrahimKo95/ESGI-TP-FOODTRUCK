export class Payment {
    static async processPayment(amount) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const isSuccess = Math.random() < 0.8;
                if (isSuccess) {
                    resolve({ success: true, message: 'Paiement réussi' });
                } else {
                    reject(new Error('Le paiement a échoué'));
                }
            }, 2000);
        });
    }
}