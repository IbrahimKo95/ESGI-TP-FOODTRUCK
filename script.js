import {showToast} from "./globalFunction.js";
import {Cart} from "./class/Cart.js";

const menuContainer = document.getElementById('menuContainer')
const cartIndicator = document.getElementById('cartIndicator')
fetch('./menu.json')
    .then(response => response.json())
    .then(data => {
        data.forEach(item => {
            const menuItem = document.createElement('div')
            menuItem.className = 'bg-white p-6 rounded-2xl shadow-xl flex flex-col gap-4 items-center hover:scale-105 transition-transform duration-200';
            menuItem.innerHTML = `
                <img alt="${item.name}" src="${item.image}" class="w-48 h-36 object-cover rounded-xl shadow-md"/>
                <div class="flex flex-col items-center gap-1">
                    <h3 class="text-lg font-semibold text-gray-800">${item.name}</h3>
                    <p class="text-blue-600 font-bold text-base">$${item.price}</p>
                </div>
                <button class="addToCart bg-gradient-to-r from-blue-500 to-blue-700 text-white px-6 py-2 rounded-lg font-semibold shadow hover:from-blue-600 hover:to-blue-800 active:scale-95 transition-all" data-id="${item.id}">Ajouter au panier</button>
                `;
            menuContainer.appendChild(menuItem)
        })
        const addToCartButtons = document.querySelectorAll('.addToCart')
        addToCartButtons.forEach(button => {
            button.addEventListener('click', addToCart)
        })
    })



function addToCart(event) {
    const button = event.target
    const itemId = button.getAttribute('data-id')
    showToast(`Article ${itemId} ajouté au panier`)
    Cart.addItem(itemId)
    showCartIndicator()
}

document.addEventListener('DOMContentLoaded', () => {
    showCartIndicator()
})

function showCartIndicator() {
    const cart = localStorage.getItem('cart')
    cartIndicator.textContent = cart ? JSON.parse(cart).length : 0
}
