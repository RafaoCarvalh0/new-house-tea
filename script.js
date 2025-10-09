const API_URL = 'http://localhost:8080';

// Function to load gifts from the backend
async function loadGifts() {
    try {
        const response = await fetch(`${API_URL}/gifts`);
        const gifts = await response.json();
        displayGifts(gifts);
    } catch (error) {
        console.error('Error loading gifts:', error);
    }
}

// Function to display gifts in the table
function displayGifts(gifts) {
    const giftsList = document.getElementById('gifts-list');
    if (!giftsList) return;

    giftsList.innerHTML = '';
    gifts.forEach(gift => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><img src="${gift.image_url}" alt="${gift.description}" class="gift-image"></td>
            <td>${gift.description}</td>
            <td><a href="${gift.purchase_url}" target="_blank" class="buy-link">Ver produto</a></td>
            <td><button onclick="reserveGift(${gift.id})" class="reserve-button">Reservar</button></td>
        `;
        giftsList.appendChild(row);
    });
}

// Function to reserve a gift
async function reserveGift(giftId) {
    const confirmed = confirm('Você confirma a reserva deste presente?');
    if (!confirmed) return;

    try {
        const response = await fetch(`${API_URL}/gifts/${giftId}/reserve`, {
            method: 'POST',
        });

        if (response.ok) {
            alert('Presente reservado com sucesso!');
            loadGifts(); // Reload the list
        } else {
            alert('Erro ao reservar o presente. Por favor, tente novamente.');
        }
    } catch (error) {
        console.error('Error reserving gift:', error);
        alert('Erro ao reservar o presente. Por favor, tente novamente.');
    }
}

// Load gifts when the list page is opened
if (window.location.pathname.includes('lista.html')) {
    loadGifts();
}