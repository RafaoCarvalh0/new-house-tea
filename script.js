const API_URL = 'https://new-house-tea-production.up.railway.app';

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
            <td><a href="${gift.link}" target="_blank" class="buy-link">Ver produto de referência</a></td>
            <td>
                ${
                    gift.reserved
                        ? `<button onclick="unreserveGift(${gift.id})" class="unreserve-button">Remover reserva</button>`
                        : `<button onclick="reserveGift(${gift.id})" class="reserve-button">Reservar</button>`
                }
            </td>
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

// Function to unreserve a gift
async function unreserveGift(giftId) {
    const passkey = prompt('Digite a senha de administrador para remover a reserva:');
    if (!passkey) return;

    try {
        const response = await fetch(`${API_URL}/gifts/${giftId}/unreserve?passkey=${encodeURIComponent(passkey)}`, {
            method: 'POST',
        });

        if (response.ok) {
            alert('Reserva removida com sucesso!');
            loadGifts();
        } else {
            alert('Senha incorreta.');
        }
    } catch (error) {
        console.error('Error removing reservation:', error);
        alert('Erro ao remover a reserva. Por favor, tente novamente.');
    }
}

// Load gifts when the list page is opened
if (window.location.pathname.includes('lista.html')) {
    loadGifts();
}
