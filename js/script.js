// ============ MOBILE MENU ============
const hamburger = document.querySelector('.hamburger');
const mobileMenu = document.getElementById('mobile-menu');
const closeMenu = document.getElementById('close-menu');

hamburger.addEventListener('click', () => mobileMenu.classList.add('active'));
closeMenu.addEventListener('click', () => mobileMenu.classList.remove('active'));

document.querySelectorAll('.mobile-nav-links a').forEach(link => {
    link.addEventListener('click', () => {
        if (!link.classList.contains('mobile-category')) {
            mobileMenu.classList.remove('active');
        }
    });
});

// ============ HEADER SCROLL ============
window.addEventListener('scroll', () => {
    document.getElementById('header').classList.toggle('scrolled', window.scrollY > 50);
    document.getElementById('back-to-top').classList.toggle('active', window.pageYOffset > 300);
});

document.getElementById('back-to-top').addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

// ============ SMOOTH SCROLL ============
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            e.preventDefault();
            window.scrollTo({ top: targetElement.offsetTop - 80, behavior: 'smooth' });
        }
    });
});

// ============ HERO SLIDER ============
const slides = document.querySelectorAll('.hero-slide');
const dots = document.querySelectorAll('.dot');
let currentSlide = 0;
const totalSlides = slides.length;

function goToSlide(index) {
    slides.forEach(s => s.classList.remove('active'));
    dots.forEach(d => d.classList.remove('active'));
    slides[index].classList.add('active');
    dots[index].classList.add('active');
    currentSlide = index;
}

dots.forEach(dot => {
    dot.addEventListener('click', () => goToSlide(parseInt(dot.getAttribute('data-index'))));
});

setInterval(() => {
    goToSlide((currentSlide + 1) % totalSlides);
}, 5000);

// ============ PRODUTOS - CARREGAMENTO DINÂMICO ============
const productsGrid = document.getElementById('products-grid');
const loadingEl = document.getElementById('loading-products');
const filterButtons = document.querySelectorAll('.filter-btn');
const dropdownItems = document.querySelectorAll('.dropdown-item');
const mobileCategories = document.querySelectorAll('.mobile-category');
let currentCategory = null;

// Cache para evitar múltiplos fetches
const cache = {};

async function loadProducts(category) {
    if (cache[category]) {
        renderProducts(cache[category], category);
        return;
    }

    productsGrid.innerHTML = '';
    loadingEl.style.display = 'block';

    try {
        const response = await fetch(`htmls/${category}.html`);
        if (!response.ok) throw new Error('Erro ao carregar');
        const html = await response.text();
        cache[category] = html;
        renderProducts(html, category);
    } catch (err) {
        productsGrid.innerHTML = '<p style="text-align:center;padding:3rem;">Erro ao carregar produtos. Tente novamente.</p>';
    } finally {
        loadingEl.style.display = 'none';
    }
}

function renderProducts(html, category) {
    productsGrid.innerHTML = html;

    // Atualizar botões de filtro ativos
    filterButtons.forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-category') === category);
    });

    // Reativar event listeners dos botões dos produtos
    attachProductEvents();
    updateCartButtons();
    currentCategory = category;

    // Scroll até a seção de produtos
    document.getElementById('products').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Eventos dos botões de filtro
filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        const category = btn.getAttribute('data-category');
        loadProducts(category);
    });
});

// Eventos do dropdown
dropdownItems.forEach(item => {
    item.addEventListener('click', (e) => {
        e.preventDefault();
        const category = item.getAttribute('data-category');
        loadProducts(category);
    });
});

// Eventos do menu mobile
mobileCategories.forEach(item => {
    item.addEventListener('click', (e) => {
        e.preventDefault();
        const category = item.getAttribute('data-category');
        loadProducts(category);
        mobileMenu.classList.remove('active');
    });
});

// ============ CARRINHO ============
let cart = JSON.parse(localStorage.getItem('cart')) || [];

function updateCartCount() {
    const count = cart.length;
    const countEl = document.getElementById('cart-count');
    countEl.textContent = count;
    countEl.style.display = count > 0 ? 'flex' : 'none';
}

function updateCartCount() {
    const totalQty = cart.reduce((sum, item) => sum + item.qty, 0);
    const countEl = document.getElementById('cart-count');
    countEl.textContent = totalQty;
    countEl.style.display = totalQty > 0 ? 'flex' : 'none';
}

function attachProductEvents() {
    document.querySelectorAll('.add-to-fav, .add-to-favorites').forEach(button => {
        button.removeEventListener('click', handleAddToCart);
        button.addEventListener('click', handleAddToCart);
    });

    document.querySelectorAll('.quick-view').forEach(button => {
        button.removeEventListener('click', handleQuickView);
        button.addEventListener('click', handleQuickView);
    });
}

function handleAddToCart(e) {
    e.stopPropagation();
    const productCard = e.target.closest('.product-card');
    const productId = productCard.getAttribute('data-id');
    const productTitle = productCard.querySelector('.product-title').textContent;
    const productPrice = productCard.querySelector('.price').textContent;
    const productImg = productCard.querySelector('.product-img img').src;

    // Converte o preço para número (remove "R$ " e vírgulas)
    const priceNumber = parseFloat(productPrice.replace('R$', '').replace(',', '.').trim());

    const existingItem = cart.find(item => item.id === productId);

    if (existingItem) {
        // Já existe: aumenta 10 unidades
        existingItem.qty += 10;
    } else {
        // Novo item: começa com 10 unidades
        cart.push({
            id: productId,
            title: productTitle,
            price: priceNumber,
            img: productImg,
            qty: 10
        });
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    updateCartButtons();
    updateCartSidebar();
}

function updateCartSidebar() {
    const cartItems = document.getElementById('cart-items');
    const cartEmpty = document.getElementById('cart-empty');

    if (cart.length === 0) {
        cartItems.innerHTML = '';
        cartItems.appendChild(cartEmpty);
        return;
    }

    cartItems.innerHTML = '';
    cart.forEach(item => {
        const totalPrice = (item.price * item.qty).toFixed(2).replace('.', ',');
        const div = document.createElement('div');
        div.className = 'favorites-item';
        div.innerHTML = `
            <div class="favorites-item-img"><img src="${item.img}" alt="${item.title}"></div>
            <div class="favorites-item-details">
                <h4 class="favorites-item-title">${item.title}</h4>
                <p class="favorites-item-price">R$ ${item.price.toFixed(2).replace('.', ',')} x ${item.qty} = <strong>R$ ${totalPrice}</strong></p>
            </div>
            <button class="remove-favorite" data-id="${item.id}"><i class="fas fa-times"></i></button>
        `;
        cartItems.appendChild(div);
    });

   document.querySelectorAll('.remove-favorite').forEach(btn => {
    btn.addEventListener('click', (e) => {
        const id = btn.getAttribute('data-id');
        // Remove do array
        cart = cart.filter(item => item.id !== id);
        localStorage.setItem('cart', JSON.stringify(cart));
        
        // Remove o elemento pai (.favorites-item) do DOM imediatamente
        const itemElement = btn.closest('.favorites-item');
        if (itemElement) {
            itemElement.remove();
        }
        
        updateCartCount();
        updateCartButtons();
        
        // Se o carrinho ficou vazio, mostra a mensagem de vazio
        if (cart.length === 0) {
            const cartItems = document.getElementById('cart-items');
            cartItems.innerHTML = '';
            const cartEmpty = document.getElementById('cart-empty');
            if (cartEmpty) {
                cartItems.appendChild(cartEmpty);
            }
        }
    });
});

}

// Abrir/fechar carrinho
document.getElementById('cart-icon').addEventListener('click', () => {
    document.getElementById('cart-overlay').classList.add('active');
    document.getElementById('cart-sidebar').classList.add('active');
    updateCartSidebar();
});

document.getElementById('close-cart').addEventListener('click', () => {
    document.getElementById('cart-overlay').classList.remove('active');
    document.getElementById('cart-sidebar').classList.remove('active');
});

document.getElementById('cart-overlay').addEventListener('click', () => {
    document.getElementById('cart-overlay').classList.remove('active');
    document.getElementById('cart-sidebar').classList.remove('active');
});

// Enviar carrinho por WhatsApp
document.getElementById('send-cart-whatsapp').addEventListener('click', () => {
    if (cart.length === 0) {
        alert('Seu carrinho está vazio!');
        return;
    }
    let message = 'Olá, estou interessado nos seguintes produtos:\n\n';
    cart.forEach((item, index) => {
        const total = (item.price * item.qty).toFixed(2).replace('.', ',');
        message += `${index + 1}. ${item.title} - R$ ${item.price.toFixed(2).replace('.', ',')} x ${item.qty} = R$ ${total}\n`;
    });
    message += '\nPor favor, me informe mais sobre esses itens. Obrigado!';
    window.open(`https://wa.me/5543999241227?text=${encodeURIComponent(message)}`, '_blank');
});

// ============ GALLERY MODAL ============
const productImagesData = {
    '1': ['img/caixa quadrada grande.jpeg', 'img/caixa quadrada grande 2.jpeg', 'img/caixa quadrada grande 3.jpeg'],
    '2': ['img/caixa quadrada média.jpeg', 'img/caixa quadrada média 2.jpeg', 'img/caixa quadrada média 3.jpeg', 'img/caixa quadrada média 4.jpeg'],
    '3': ['img/caixa média.jpeg', 'img/caixa média 2.jpeg', 'img/caixa média 3.jpeg'],
    '4': ['img/caixa retangular grande.jpeg', 'img/caixa retangular grande 2.jpeg', 'img/caixa retangular grande 3.jpeg', 'img/caixa retangular grande 4.jpeg'],
    '5': ['img/caixa retangular média.jpeg', 'img/caixa retangular média 2.jpeg', 'img/caixa retangular média 3.jpeg', 'img/caixa retangular média 4.jpeg'],
    '6': ['img/caixa passa fita méd..jpeg', 'img/caixa passa fita méd. 2.jpeg', 'img/caixa passa fita méd. 3.jpeg'],
    '7': ['img/caixa passa fita peq..jpeg', 'img/caixa passa fita peq. 2.jpeg', 'img/caixa passa fita peq. 3.jpeg'],
    '8': ['img/caixa com tampa de correr.jpeg', 'img/caixa com tampa de correr 2.jpeg', 'img/caixa com tampa de correr 3.jpeg'],
    '9': ['img/caixa porta jóia.jpeg', 'img/caixa porta jóia 2.jpeg', 'img/caixa porta jóia 3.jpeg'],
    '10': ['img/caixa 14x14 passa fita.jpeg', 'img/caixa 14x14 passa fita 2.jpeg', 'img/caixa 14x14 passa fita 3.jpeg'],
    '11': ['img/caixa 14x14 lisa.jpeg', 'img/caixa 14x14 lisa 2.jpeg', 'img/caixa 14x14 lisa 3.jpeg'],
    '12': ['img/caixa 12x15 passa fita.jpeg', 'img/caixa 12x15 passa fita 2.jpeg', 'img/caixa 12x15 passa fita 3.jpeg'],
    '13': ['img/caixa 12x15 lisa.jpeg', 'img/caixa 12x15 lisa 2.jpeg', 'img/caixa 12x15 lisa 3.jpeg'],
    '14': ['img/caixa 12x12 passa fita.jpeg', 'img/caixa 12x12 passa fita 2.jpeg', 'img/caixa 12x12 passa fita 3.jpeg'],
    '15': ['img/caixa 12x12 lisa.jpeg', 'img/caixa 12x12 lisa 2.jpeg', 'img/caixa 12x12 lisa 3.jpeg'],
    '16': ['img/caixa 10x10 passa fita.jpeg', 'img/caixa 10x10 passa fita 2.jpeg', 'img/caixa 10x10 passa fita 3.jpeg'],
    '17': ['img/caixa 10x10 lisa.jpeg', 'img/caixa 10x10 lisa 2.jpeg', 'img/caixa 10x10 lisa 3.jpeg'],
    '18': ['img/caixa 10x13 lisa.jpeg', 'img/caixa 10x13 lisa 2.jpeg', 'img/caixa 10x13 lisa 3.jpeg'],
    '19': ['img/bandeja.jpeg', 'img/bandeja 2.jpeg', 'img/bandeja 3.jpeg'],
    '20': ['img/bandeja quadrada.jpeg', 'img/bandeja quadrada 2.jpeg', 'img/bandeja quadrada 3.jpeg'],
    '21': ['img/bandeja média.jpeg', 'img/bandeja média 2.jpeg', 'img/bandeja média 3.jpeg'],
    '22': ['img/bandeja passa fita.jpeg', 'img/bandeja passa fita 2.jpeg', 'img/bandeja passa fita 3.jpeg'],
    '23': ['img/bandeja passa fita grande.jpeg', 'img/bandeja passa fita grande 2.jpeg', 'img/bandeja passa fita grande 3.jpeg'],
    '24': ['img/porta batom.jpeg', 'img/porta batom 2.jpeg', 'img/porta batom 3.jpeg'],
    '25': ['img/porta guardanapo.jpeg', 'img/porta guardanapo 2.jpeg', 'img/porta guardanapo 3.jpeg'],
    '26': ['img/porta sabonete.jpeg', 'img/porta sabonete 2.jpeg', 'img/porta sabonete 3.jpeg'],
    '27': ['img/porta controle.jpeg', 'img/porta controle 2.jpeg', 'img/porta controle 3.jpeg'],
    '28': ['img/porta talher.jpeg', 'img/porta talher 2.jpeg', 'img/porta talher 3.jpeg'],
    '29': ['img/porta celular.jpeg', 'img/porta celular 2.jpeg', 'img/porta celular 3.jpeg'],
    '30': ['img/porta papel toalha.jpeg', 'img/porta papel toalha 2.jpeg', 'img/porta papel toalha 3.jpeg'],
    '31': ['img/cachepo de angulo.jpeg', 'img/cachepo de angulo 2.jpeg', 'img/cachepo de angulo 3.jpeg'],
    '32': ['img/cachepo quadrado.jpeg', 'img/cachepo quadrado 2.jpeg', 'img/cachepo quadrado 3.jpeg'],
    '33': ['img/cachepô 15x15x8.jpeg', 'img/cachepô 15x15x8 2.jpeg', 'img/cachepô 15x15x8 3.jpeg'],
    '34': ['img/cachepô 16x16x6.jpeg', 'img/cachepô 16x16x6 2.jpeg', 'img/cachepô 16x16x6 3.jpeg'],
    '35': ['img/cachepô 11,5x11,5x11.jpeg', 'img/cachepô 11,5x11,5x11 2.jpeg', 'img/cachepô 11,5x11,5x11 3.jpeg'],
    '36': ['img/caixa 10x13 passa fita.jpeg', 'img/caixa 10x13 passa fita 2.jpeg', 'img/caixa 10x13 passa fita 3.jpeg'],
    '37': ['img/bandeja retangular.jpeg', 'img/bandeja retangular 2.jpeg', 'img/bandeja retangular 3.jpeg'],
    '38': ['img/bandeja retangular gg.jpeg', 'img/bandeja retangular gg 2.jpeg', 'img/bandeja retangular gg 3.jpeg'],
    '39': ['img/vaso riscado.jpeg', 'img/vaso riscado 2.jpeg', 'img/vaso riscado 3.jpeg'],
    '40': ['img/vaso passa fita.jpeg', 'img/vaso passa fita 2.jpeg', 'img/vaso passa fita 3.jpeg'],
    '41': ['img/vaso 11x11.jpeg', 'img/vaso 11x11 2.jpeg', 'img/vaso 11x11 3.jpeg'],
    '42': ['img/caixote.jpeg', 'img/caixote 2.jpeg', 'img/caixote 3.jpeg'],
    '43': ['img/caixote passa fita.jpeg', 'img/caixote passa fita 2.jpeg', 'img/caixote passa fita 3.jpeg'],
    '44': ['img/caixotinho.jpeg', 'img/caixotinho 2.jpeg', 'img/caixotinho 3.jpeg'],
    '45': ['img/caixotinho passa fita.jpeg', 'img/caixotinho passa fita 2.jpeg', 'img/caixotinho passa fita 3.jpeg'],
    '46': ['img/cesto.jpeg', 'img/cesto 2.jpeg', 'img/cesto 3.jpeg'],
    '47': ['img/cestinho.jpeg', 'img/cestinho 2.jpeg', 'img/cestinho 3.jpeg'],
    '48': ['img/floreira.jpeg', 'img/floreira 2.jpeg', 'img/floreira 3.jpeg'],
    '49': ['img/floreira de parede.jpeg', 'img/floreira de parede 2.jpeg', 'img/floreira de parede 3.jpeg'],
    '50': ['img/baú.jpeg', 'img/baú 2.jpeg', 'img/baú 3.jpeg'],
    '51': ['img/baú cofre.jpeg', 'img/baú cofre 2.jpeg', 'img/baú cofre 3.jpeg'],
    '52': ['img/descanso de panela.jpeg', 'img/descanso de panela 2.jpeg', 'img/descanso de panela 3.jpeg'],
    '53': ['img/cadeirinha grande.jpeg', 'img/cadeirinha grande 2.jpeg', 'img/cadeirinha grande 3.jpeg'],
    '54': ['img/cadeirinha grande pintada.jpeg', 'img/cadeirinha grande pintada 2.jpeg', 'img/cadeirinha grande pintada 3.jpeg'],
    '55': ['img/cadeirinha pequena.jpeg', 'img/cadeirinha pequena 2.jpeg', 'img/cadeirinha pequena 3.jpeg'],
    '56': ['img/cadeirinha pequena pintada.jpeg', 'img/cadeirinha pequena pintada 2.jpeg', 'img/cadeirinha pequena pintada 3.jpeg'],
    '57': ['img/banquinho.jpeg', 'img/banquinho 2.jpeg', 'img/banquinho 3.jpeg'],
    '58': ['img/banquinho pintado.jpeg', 'img/banquinho pintado 2.jpeg', 'img/banquinho pintado 3.jpeg'],
    '59': [''],
    '60': [''],
    '61': [''],
    '62': [''],
    '63': [''],
    '64': [''],
    '65': [''],
    '66': [''],
    '67': [''],
    '68': [''],
    '69': [''],
    '70': [''],
    '71': [''],
    '72': [''],
    '73': [''],
    '74': [''],
    '75': [''],
    '76': [''],
    '77': [''],
    '78': [''],
    '79': [''],
    '80': [''],
    '81': [''],
    '82': [''],
    '83': [''],
    '84': [''],
    '85': [''],
    '86': ['img/carriola.jpeg', 'img/carriola 2.jpeg', 'img/carriola 3.jpeg'],
    '87': [''],
    '88': ['img/floreira de parede pequena.jpeg', 'img/floreira de parede pequena 2.jpeg', 'img/floreira de parede pequena 3.jpeg'],
    '89': [''],
    '90': ['img/cachepo sextavado.jpeg', 'img/cachepo sextavado 2.jpeg', 'img/cachepo sextavado 3.jpeg'],
    '91': ['img/casa cofre.jpeg', 'img/casa cofre 2.jpeg', 'img/casa cofre 3.jpeg'],
    '92': ['img/porta chave.jpeg', 'img/porta chave 2.jpeg', 'img/porta chave 3.jpeg'],
    '93': ['img/caixa encaixe.jpeg', 'img/caixa encaixe 2.jpeg', 'img/caixa encaixe 3.jpeg']
};

let galleryProductId = null;
let galleryIndex = 0;

function handleQuickView(e) {
    e.stopPropagation();
    const productCard = e.target.closest('.product-card');
    galleryProductId = productCard.getAttribute('data-id');
    galleryIndex = 0;
    openGallery(galleryProductId);
}

function openGallery(productId) {
    const images = productImagesData[productId];
    if (!images || images.length === 0) return;

    document.getElementById('gallery-main-image').src = images[0];
    const thumbnailsContainer = document.getElementById('gallery-thumbnails');
    thumbnailsContainer.innerHTML = '';

    images.forEach((img, index) => {
        const thumb = document.createElement('div');
        thumb.className = 'gallery-thumbnail' + (index === 0 ? ' active' : '');
        thumb.innerHTML = `<img src="${img}" alt="Thumbnail ${index + 1}">`;
        thumb.addEventListener('click', () => {
            document.getElementById('gallery-main-image').src = img;
            galleryIndex = index;
            document.querySelectorAll('.gallery-thumbnail').forEach(t => t.classList.remove('active'));
            thumb.classList.add('active');
        });
        thumbnailsContainer.appendChild(thumb);
    });

    document.getElementById('gallery-modal').classList.add('active');
}

document.getElementById('close-gallery').addEventListener('click', () => {
    document.getElementById('gallery-modal').classList.remove('active');
});

document.getElementById('gallery-prev').addEventListener('click', () => {
    const images = productImagesData[galleryProductId];
    if (!images) return;
    galleryIndex = (galleryIndex - 1 + images.length) % images.length;
    document.getElementById('gallery-main-image').src = images[galleryIndex];
    const thumbs = document.querySelectorAll('.gallery-thumbnail');
    thumbs.forEach((t, i) => t.classList.toggle('active', i === galleryIndex));
});

document.getElementById('gallery-next').addEventListener('click', () => {
    const images = productImagesData[galleryProductId];
    if (!images) return;
    galleryIndex = (galleryIndex + 1) % images.length;
    document.getElementById('gallery-main-image').src = images[galleryIndex];
    const thumbs = document.querySelectorAll('.gallery-thumbnail');
    thumbs.forEach((t, i) => t.classList.toggle('active', i === galleryIndex));
});

document.getElementById('gallery-modal').addEventListener('click', (e) => {
    if (e.target === document.getElementById('gallery-modal')) {
        document.getElementById('gallery-modal').classList.remove('active');
    }
});

document.addEventListener('keydown', (e) => {
    if (document.getElementById('gallery-modal').classList.contains('active')) {
        if (e.key === 'Escape') document.getElementById('gallery-modal').classList.remove('active');
        if (e.key === 'ArrowLeft') document.getElementById('gallery-prev').click();
        if (e.key === 'ArrowRight') document.getElementById('gallery-next').click();
    }
});

// ============ INIT ============
updateCartCount();