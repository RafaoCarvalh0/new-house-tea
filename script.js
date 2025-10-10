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
    
    // Detectar se é mobile
    const isMobile = window.innerWidth <= 768;
    
    if (isMobile) {
        // Criar cards para mobile
        const container = giftsList.parentElement.parentElement; // Pegar o container da tabela
        
        // Criar div para cards se não existir
        let mobileContainer = document.getElementById('mobile-gifts-container');
        if (!mobileContainer) {
            mobileContainer = document.createElement('div');
            mobileContainer.id = 'mobile-gifts-container';
            container.appendChild(mobileContainer);
        }
        
        mobileContainer.innerHTML = '';
        
        gifts.forEach(gift => {
            const card = document.createElement('div');
            card.className = `mobile-card ${gift.reserved ? 'reserved' : ''}`;
            card.innerHTML = `
                <img src="${gift.image_url}" alt="${gift.description}">
                <h3>${gift.description}</h3>
                <a href="${gift.link}" target="_blank" class="buy-link">Ver produto de referência</a>
                ${
                    gift.reserved
                        ? `<button onclick="unreserveGift(${gift.id})" class="unreserve-button">Remover reserva</button>`
                        : `<button onclick="reserveGift(${gift.id})" class="reserve-button">Reservar</button>`
                }
            `;
            mobileContainer.appendChild(card);
        });
        
        // Esconder tabela no mobile
        document.getElementById('gifts-table').style.display = 'none';
        
    } else {
        // Layout desktop normal
        gifts.forEach(gift => {
            const row = document.createElement('tr');
            row.className = gift.reserved ? 'reserved' : '';
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
        
        // Mostrar tabela no desktop
        document.getElementById('gifts-table').style.display = 'table';
        
        // Remover container mobile se existir
        const mobileContainer = document.getElementById('mobile-gifts-container');
        if (mobileContainer) {
            mobileContainer.remove();
        }
    }
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
    
    // Adicionar listener para redimensionamento da tela
    window.addEventListener('resize', () => {
        // Aguardar um pouco para evitar múltiplas execuções
        clearTimeout(window.resizeTimeout);
        window.resizeTimeout = setTimeout(() => {
            loadGifts(); // Recarregar para ajustar o layout
        }, 250);
    });
}

// Funcionalidade de toggle da imagem PIX no mobile
document.addEventListener('DOMContentLoaded', function() {
    // Criar a imagem do Bob Money
    const pixImage = document.createElement('img');
    pixImage.src = 'bob_money-removebg-preview.png';
    pixImage.className = 'pix-image';
    pixImage.alt = 'Bob Money PIX';
    
    // Adicionar a imagem ao info-container
    const infoContainer = document.querySelector('.info-container');
    if (infoContainer) {
        infoContainer.appendChild(pixImage);
    }
    
    // Encontrar o elemento PIX
    const pixElement = document.querySelector('.info-message.pix');
    let isImageVisible = false;
    
    if (pixElement && window.innerWidth <= 768) {
        // Adicionar evento de clique no texto PIX para mostrar
        pixElement.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation(); // Evitar que o clique se propague
            
            if (!isImageVisible) {
                // Mostrar imagem
                pixImage.style.display = 'block';
                isImageVisible = true;
            }
        });
        
        // Adicionar evento de clique em qualquer lugar da tela para esconder
        document.addEventListener('click', function(e) {
            // Se a imagem está visível e o clique não foi no texto PIX
            if (isImageVisible && !pixElement.contains(e.target)) {
                pixImage.style.display = 'none';
                isImageVisible = false;
            }
        });
        
        // Adicionar cursor pointer para indicar que é clicável
        pixElement.style.cursor = 'pointer';
    }
    
    // Funcionalidade de copiar chave PIX no mobile
    const pixKeyElement = document.querySelector('.info-message.pix-key');
    
    if (pixKeyElement && window.innerWidth <= 768) {
        // Criar elemento de feedback
        const feedbackElement = document.createElement('div');
        feedbackElement.className = 'copy-feedback';
        feedbackElement.textContent = 'Chave PIX copiada!';
        document.body.appendChild(feedbackElement);
        
        // Adicionar evento de clique na chave PIX
        pixKeyElement.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            // Copiar para área de transferência
            const pixKey = pixKeyElement.textContent;
            
            if (navigator.clipboard && navigator.clipboard.writeText) {
                // Método moderno
                navigator.clipboard.writeText(pixKey).then(function() {
                    showCopyFeedback();
                }).catch(function() {
                    // Fallback se falhar
                    copyToClipboardFallback(pixKey);
                });
            } else {
                // Fallback para navegadores mais antigos
                copyToClipboardFallback(pixKey);
            }
        });
        
        // Função para mostrar feedback
        function showCopyFeedback() {
            feedbackElement.classList.add('show');
            setTimeout(function() {
                feedbackElement.classList.remove('show');
            }, 2000);
        }
        
        // Função fallback para copiar
        function copyToClipboardFallback(text) {
            const textArea = document.createElement('textarea');
            textArea.value = text;
            textArea.style.position = 'fixed';
            textArea.style.left = '-999999px';
            textArea.style.top = '-999999px';
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            
            try {
                document.execCommand('copy');
                showCopyFeedback();
            } catch (err) {
                console.error('Falha ao copiar:', err);
            }
            
            document.body.removeChild(textArea);
        }
        
        // Adicionar cursor pointer para indicar que é clicável
        pixKeyElement.style.cursor = 'pointer';
    }
    
    // Atualizar comportamento quando a tela é redimensionada
    window.addEventListener('resize', function() {
        if (window.innerWidth > 768) {
            // Desktop: esconder imagem e remover cursor
            pixImage.style.display = 'none';
            isImageVisible = false;
            if (pixElement) {
                pixElement.style.cursor = 'default';
            }
            if (pixKeyElement) {
                pixKeyElement.style.cursor = 'default';
            }
        } else {
            // Mobile: adicionar cursor pointer
            if (pixElement) {
                pixElement.style.cursor = 'pointer';
            }
            if (pixKeyElement) {
                pixKeyElement.style.cursor = 'pointer';
            }
        }
    });
});
