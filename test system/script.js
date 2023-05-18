const items = document.querySelectorAll('input[type="text"]');
const prices = document.querySelectorAll('input[type="number"]');
const quantities = document.querySelectorAll('input[type="number"]');
const totals = document.querySelectorAll('input[type="number"]');
const grandTotal = document.querySelector('input[name="grand-total"]');

for (let i = 0; i < items.length; i++) {
	prices[i].addEventListener('input', updateTotal);
	quantities[i].addEventListener('input', updateTotal);
}

function updateTotal(event) {
	const price = Number(event.target.parentNode.parentNode.querySelector('input[type="number"][name^="price"]').value);
	const quantity = Number(event.target.parentNode.parentNode.querySelector('input[type="number"][name^="quantity"]').value);
	const total = price * quantity;
	event.target.parentNode.parentNode.querySelector('input[type="number"][name^="total"]').value = total.toFixed(2);
	updateGrandTotal();
}

function updateGrandTotal() {
	let grandTotalValue = 0;
	for (let i = 0; i < totals.length; i++) {
		grandTotalValue += Number(totals[i].value);
	}
	grandTotal.value = grandTotalValue.toFixed(2);
}
