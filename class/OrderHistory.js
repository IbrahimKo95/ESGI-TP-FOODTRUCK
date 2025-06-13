
export class OrderHistory {
    static getItems() {
        return JSON.parse(localStorage.getItem('orderHistory') || '[]');
    }

    static addItem(order) {
        const orders = OrderHistory.getItems();
        orders.push(order);
        localStorage.setItem('orderHistory', JSON.stringify(orders));
    }

    static changeStatus(index, status) {
        const orders = OrderHistory.getItems();
        if (index >= 0 && index < orders.length) {
            orders[index].status = status;
            localStorage.setItem('orderHistory', JSON.stringify(orders));
        }
    }

    static getCount() {
        return OrderHistory.getItems().length;
    }
}