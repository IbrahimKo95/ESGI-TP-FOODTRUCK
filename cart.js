import {showConfirm, showToast} from "./globalFunction.js";
import {Cart} from "./class/Cart.js";
import {OrderHistory} from "./class/OrderHistory.js";
import {Payment} from "./class/Payment.js";


const cartItems = document.getElementById('cartItems');
const totalPrice = document.getElementById('totalPrice');
const totalHT = document.getElementById('totalHT');
const confirmButton = document.getElementById('confirmButton');
const orderHistory = document.getElementById('orderHistory');
const clearCartButton = document.getElementById('clearCartButton');

function loadCart() {
    const cart = Cart.getItems()
    cartItems.innerHTML = '';
    if (cart) {
        let total = 0;
        const menu = fetch('./menu.json')
            .then(response => response.json())
            .then(data => {
                const uniqueCartItems = [...new Set(cart)];
                uniqueCartItems.forEach(itemId => {
                    const quantity = cart.filter(id => id == itemId).length;
                    const item = data.find(item => item.id == itemId);

                    total += item.price * quantity;
                    if (item) {
                        const cartItem = document.createElement('div');
                        cartItem.className = 'flex flex-row gap-4 p-6 justify-between items-center border-b border-gray-200 bg-white rounded-xl shadow-lg mb-4';
                        cartItem.innerHTML = `
                            <h3 class="text-lg font-bold text-gray-700">${item.name}</h3>
                            <div class="flex flex-col items-end gap-1">
                                <button class="removeButton text-red-600 hover:text-red-800 font-semibold text-sm" data-id="${item.id}">Retirer</button>
                                <p class="text-sm text-gray-500">Quantité : <span class="font-semibold text-gray-800">${quantity}</span></p>
                                <p class="text-base text-blue-700 font-bold">Prix : ${item.price}€</p>
                            </div>
                        `;
                        cartItems.appendChild(cartItem);
                    }
                });
                const removeButtons = document.querySelectorAll('.removeButton');
                removeButtons.forEach(button => {
                    button.addEventListener('click', removeItem);
                });
                totalHT.textContent = `${(total).toFixed(2)}€`;
                totalPrice.textContent = `${(total * (1+ 0.20)).toFixed(2)}€`;
            });

    } else {
        cartItems.textContent = 'Votre panier est vide.';
    }
}
document.addEventListener('DOMContentLoaded', () => {
    loadOrderHistory()
    loadCart()
})

confirmButton.addEventListener('click', confirmCart);

async function confirmCart() {
    const cart = Cart.getItems();
    if (!cart || cart.length === 0) {
        showToast('Le panier est vide');
        return;
    }

    try {
        const confirmed = await showConfirm('Êtes-vous sûr de vouloir valider votre panier ?');
        if (!confirmed) {
            showToast('Votre commande n\'a pas été validée.');
            return;
        }

        if (countOrderInPreparation() > 5) {
            showToast('Trop de commandes en préparation, veuillez réessayer plus tard.');
            return;
        }

        const amount = totalPrice.textContent;
        cartItems.innerHTML = '<p class="text-blue-600 font-semibold">Traitement du paiement en cours...</p>';

        const paymentResult = await Payment.processPayment(amount);

        await addOnHistory();
        Cart.clearCart();
        cartItems.innerHTML = '<p class="text-green-600 font-semibold">Votre commande a été validée avec succès !</p>';
        totalPrice.textContent = '0€';
        totalHT.textContent = '0€';
        showToast('Paiement accepté ! Votre commande a été validée.');

    } catch (error) {
        cartItems.innerHTML = Cart.getItems().length ? '' : 'Votre panier est vide.';
        loadCart();
        showToast('Le paiement a échoué, veuillez réessayer.');
    }
}

async function addOnHistory() {
    const cart = localStorage.getItem('cart');
    if (cart) {
        const cartItemsArray = JSON.parse(cart);
        const uniqueCartItems = [...new Set(cartItemsArray)];
        const order = {
            date: new Date().toISOString(),
            items: uniqueCartItems,
            total: totalPrice.textContent,
            status: 'Préparation'
        };
        OrderHistory.addItem(order);
        loadOrderHistory();
        await fakePostCommande(OrderHistory.getCount() - 1);
    }
}

async function fakePostCommande(index) {
    setTimeout(() => {
        const order = OrderHistory.getItems()[index];
        if (index < OrderHistory.getCount() && order.status === 'Préparation') {
            OrderHistory.changeStatus(index, 'En Livraison');
            loadOrderHistory();
            showToast(`Commande ${index + 1} en livraison !`);
        }
    }, 5000);
    setTimeout(() => {
        const order = OrderHistory.getItems()[index];
        if (index < OrderHistory.getCount() && order.status === 'En Livraison') {
            OrderHistory.changeStatus(index, 'Livré');
            loadOrderHistory();
            showToast(`Commande ${index + 1} livrée avec succès !`);
        }
    }, 8000);
}

function loadOrderHistory() {
    orderHistory.innerHTML = '';
    if (OrderHistory.getCount() === 0) {
        orderHistory.innerHTML = '<p class="text-gray-500">Aucune commande passée.</p>';
        return;
    }
    OrderHistory.getItems().forEach((order, index) => {
        const orderItem = document.createElement('div');
        orderItem.className = 'bg-white p-6 rounded-xl shadow-lg mb-4';
        orderItem.innerHTML = `
            <h3 class="text-lg font-bold text-gray-800">Commande du ${new Date(order.date).toLocaleDateString()}</h3>
            <p class="text-gray-600">Articles : ${order.items.join(', ')}</p>
            <p class="text-blue-700 font-bold">Total : ${order.total}</p>
            <p class="text-sm font-semibold text-gray-500">Statut : <span class="${order.status == "Annulée" ? 'text-red-600': 'text-green-600'}">${order.status || 'Inconnu'}</span></p>
        `;
        if( order.status === 'Préparation') {
            const cancelButton = document.createElement('button');
            cancelButton.textContent = 'Annuler la commande';
            cancelButton.className = 'mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition';
            cancelButton.onclick = () => {
                showConfirm('Êtes-vous sûr de vouloir annuler cette commande ?').then((confirmed) => {
                    if (confirmed) {
                        OrderHistory.changeStatus(index, 'Annulée');
                        loadOrderHistory();
                        showToast('Commande annulée avec succès !');
                    }
                });
            };
            orderItem.appendChild(cancelButton);
        }
        orderHistory.appendChild(orderItem);
    });
}

function countOrderInPreparation() {
    const orders = JSON.parse(localStorage.getItem('orderHistory') || '[]');
    return orders.filter(order => order.status === 'Préparation').length;
}

function removeItem() {
    const itemId = this.getAttribute('data-id');
    Cart.removeItem(itemId);
    showToast(`Article ${itemId} retiré du panier`);
    loadCart();
}

clearCartButton.addEventListener('click', clearAllCart);

function clearAllCart() {
    showConfirm('Êtes-vous sûr de vouloir vider votre panier ?').then((confirmed) => {
        if (confirmed) {
            Cart.clearCart();
            loadCart();
            showToast('Votre panier a été vidé avec succès !');
        }
    });
}

