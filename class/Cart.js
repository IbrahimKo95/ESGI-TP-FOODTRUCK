export class Cart {
    static addItem(itemId) {
        const items = Cart.getItems();
        items.push(itemId);
        localStorage.setItem('cart', JSON.stringify(items));
    }
    static getItems() {
        return JSON.parse(localStorage.getItem('cart') || '[]');
    }

    static clearCart() {
        localStorage.removeItem('cart');
    }

    static removeItem(itemId) {
        const items = Cart.getItems();
        const index = items.findIndex(id => id === itemId);
        if (index !== -1) {
            items.splice(index, 1);
            localStorage.setItem('cart', JSON.stringify(items));
        }
    }
}