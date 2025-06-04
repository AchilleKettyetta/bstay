// ==================== SYSTÈME DE SAUVEGARDE ====================
let currentUser = null;
let properties = [];
let reservations = [];
let users = [];

// Clés de stockage
const STORAGE_KEYS = {
    USERS: 'burkinaStay_users',
    PROPERTIES: 'burkinaStay_properties', 
    RESERVATIONS: 'burkinaStay_reservations',
    CURRENT_USER: 'burkinaStay_currentUser'
};

// Fonctions de sauvegarde et restauration
function saveToStorage(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
        console.error('Erreur de sauvegarde:', error);
    }
}

function loadFromStorage(key, defaultValue = []) {
    try {
        const stored = localStorage.getItem(key);
        return stored ? JSON.parse(stored) : defaultValue;
    } catch (error) {
        console.error('Erreur de chargement:', error);
        return defaultValue;
    }
}

// Restaurer toutes les données au chargement
function initializeData() {
    users = loadFromStorage(STORAGE_KEYS.USERS, []);
    properties = loadFromStorage(STORAGE_KEYS.PROPERTIES, getDefaultProperties());
    reservations = loadFromStorage(STORAGE_KEYS.RESERVATIONS, []);
    currentUser = loadFromStorage(STORAGE_KEYS.CURRENT_USER, null);
    
    // Mettre à jour l'interface utilisateur
    if (currentUser) {
        updateUserInterface();
    }
    
    // Charger les propriétés sur la page d'accueil
    if (document.getElementById('propertiesGrid')) {
        loadProperties();
    }
}

// Sauvegarder automatiquement avant fermeture
function saveAllDataBeforeUnload() {
    saveToStorage(STORAGE_KEYS.USERS, users);
    saveToStorage(STORAGE_KEYS.PROPERTIES, properties);
    saveToStorage(STORAGE_KEYS.RESERVATIONS, reservations);
    saveToStorage(STORAGE_KEYS.CURRENT_USER, currentUser);
}

// ==================== GESTION DES UTILISATEURS ====================
function register(event) {
    event.preventDefault();
    
    const name = document.getElementById('registerName').value.trim();
    const email = document.getElementById('registerEmail').value.trim();
    const phone = document.getElementById('registerPhone').value.trim();
    const password = document.getElementById('registerPassword').value;
    
    // Vérifier si l'email existe déjà
    if (users.find(user => user.email === email)) {
        alert('Cet email est déjà utilisé !');
        return;
    }
    
    // Créer le nouvel utilisateur
    const newUser = {
        id: Date.now(),
        name: name,
        email: email,
        phone: phone,
        password: password,
        joinDate: new Date().toISOString()
    };
    
    users.push(newUser);
    saveToStorage(STORAGE_KEYS.USERS, users);
    
    alert('Inscription réussie ! Vous pouvez maintenant vous connecter.');
    closeModal('registerModal');
    showLoginModal();
}

function login(event) {
    event.preventDefault();
    
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
        currentUser = user;
        saveToStorage(STORAGE_KEYS.CURRENT_USER, currentUser);
        updateUserInterface();
        closeModal('loginModal');
        alert(`Bienvenue ${user.name} !`);
    } else {
        alert('Email ou mot de passe incorrect !');
    }
}

function logout() {
    currentUser = null;
    saveToStorage(STORAGE_KEYS.CURRENT_USER, null);
    updateUserInterface();
    showHome();
    alert('Déconnexion réussie !');
}

function updateUserInterface() {
    const navMenu = document.getElementById('navMenu');
    const userMenu = document.getElementById('userMenu');
    const userName = document.getElementById('userName');
    
    if (currentUser) {
        navMenu.style.display = 'none';
        userMenu.style.display = 'flex';
        userName.textContent = currentUser.name;
    } else {
        navMenu.style.display = 'flex';
        userMenu.style.display = 'none';
    }
}

// ==================== GESTION DES PROPRIÉTÉS ====================
function getDefaultProperties() {
    return [
        {
            id: 1,
            title: "Villa moderne à Ouagadougou",
            location: "ouagadougou",
            price: 25000,
            rating: 4.8,
            image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400",
            description: "Belle villa moderne avec piscine dans le quartier résidentiel de Ouaga 2000",
            amenities: ["WiFi", "Piscine", "Parking", "Climatisation"],
            host: "Marie Ouédraogo",
            bedrooms: 3,
            bathrooms: 2,
            guests: 6
        },
        {
            id: 2,
            title: "Maison traditionnelle à Bobo-Dioulasso",
            location: "bobo-dioulasso",
            price: 15000,
            rating: 4.5,
            image: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400",
            description: "Authentique maison traditionnelle au cœur de la ville de Sya",
            amenities: ["WiFi", "Jardin", "Terrasse"],
            host: "Amadou Traoré",
            bedrooms: 2,
            bathrooms: 1,
            guests: 4
        },
        {
            id: 3,
            title: "Appartement central à Koudougou",
            location: "koudougou",
            price: 12000,
            rating: 4.2,
            image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400",
            description: "Appartement confortable en centre-ville, proche des commerces",
            amenities: ["WiFi", "Balcon", "Cuisine équipée"],
            host: "Fatou Sawadogo",
            bedrooms: 1,
            bathrooms: 1,
            guests: 2
        }
    ];
}

function loadProperties(filteredProperties = null) {
    const grid = document.getElementById('propertiesGrid');
    if (!grid) return;
    
    const propertiesToShow = filteredProperties || properties;
    
    grid.innerHTML = propertiesToShow.map(property => `
        <div class="property-card" onclick="showPropertyDetails(${property.id})">
            <img src="${property.image}" alt="${property.title}" class="property-image">
            <div class="property-info">
                <h3 class="property-title">${property.title}</h3>
                <p class="property-location">${property.location}</p>
                <div class="property-rating">⭐ ${property.rating}</div>
                <div class="property-price">${property.price.toLocaleString()} FCFA/nuit</div>
            </div>
        </div>
    `).join('');
}

function searchProperties(event) {
    event.preventDefault();
    
    const destination = document.getElementById('destination').value;
    const checkin = document.getElementById('checkin').value;
    const checkout = document.getElementById('checkout').value;
    
    if (!destination || !checkin || !checkout) {
        alert('Veuillez remplir tous les champs de recherche');
        return;
    }
    
    const filteredProperties = properties.filter(property => 
        property.location === destination
    );
    
    loadProperties(filteredProperties);
    
    if (filteredProperties.length === 0) {
        document.getElementById('propertiesGrid').innerHTML = 
            '<p style="text-align: center; grid-column: 1/-1;">Aucun logement trouvé pour cette destination.</p>';
    }
}

function searchByCity(city) {
    document.getElementById('destination').value = city;
    const filteredProperties = properties.filter(property => 
        property.location === city
    );
    loadProperties(filteredProperties);
    showHome();
}

function showPropertyDetails(propertyId) {
    const property = properties.find(p => p.id === propertyId);
    if (!property) return;
    
    const modalBody = document.getElementById('propertyModalBody');
    const modalTitle = document.getElementById('propertyModalTitle');
    
    modalTitle.textContent = property.title;
    modalBody.innerHTML = `
        <div class="property-details">
            <img src="${property.image}" alt="${property.title}" style="width: 100%; height: 300px; object-fit: cover; border-radius: 8px; margin-bottom: 20px;">
            <div class="property-info-detailed">
                <h4>Description</h4>
                <p>${property.description}</p>
                
                <h4>Informations</h4>
                <ul>
                    <li><strong>Hôte:</strong> ${property.host}</li>
                    <li><strong>Chambres:</strong> ${property.bedrooms}</li>
                    <li><strong>Salles de bain:</strong> ${property.bathrooms}</li>
                    <li><strong>Voyageurs:</strong> ${property.guests}</li>
                    <li><strong>Prix:</strong> ${property.price.toLocaleString()} FCFA/nuit</li>
                </ul>
                
                <h4>Équipements</h4>
                <div class="amenities">
                    ${property.amenities.map(amenity => `<span class="amenity-tag">${amenity}</span>`).join('')}
                </div>
                
                ${currentUser ? `
                    <button class="btn btn-primary" onclick="makeReservation(${property.id})" style="margin-top: 20px; width: 100%;">
                        Réserver maintenant
                    </button>
                ` : `
                    <button class="btn btn-primary" onclick="showLoginModal()" style="margin-top: 20px; width: 100%;">
                        Connectez-vous pour réserver
                    </button>
                `}
            </div>
        </div>
    `;
    
    showModal('propertyModal');
}

function makeReservation(propertyId) {
    if (!currentUser) {
        alert('Veuillez vous connecter pour faire une réservation');
        return;
    }
    
    const property = properties.find(p => p.id === propertyId);
    const checkin = document.getElementById('checkin').value;
    const checkout = document.getElementById('checkout').value;
    
    if (!checkin || !checkout) {
        alert('Veuillez sélectionner des dates de séjour');
        return;
    }
    
    const reservation = {
        id: Date.now(),
        userId: currentUser.id,
        propertyId: propertyId,
        propertyTitle: property.title,
        checkin: checkin,
        checkout: checkout,
        totalPrice: property.price * Math.ceil((new Date(checkout) - new Date(checkin)) / (1000 * 60 * 60 * 24)),
        status: 'confirmé',
        bookingDate: new Date().toISOString()
    };
    
    reservations.push(reservation);
    saveToStorage(STORAGE_KEYS.RESERVATIONS, reservations);
    
    alert('Réservation confirmée ! Vous pouvez voir vos réservations dans votre tableau de bord.');
    closeModal('propertyModal');
}

// ==================== NAVIGATION ====================
function showHome() {
    hideAllSections();
    document.getElementById('homeSection').style.display = 'block';
    loadProperties();
}

function showAddProperty() {
    alert('Fonctionnalité d\'ajout de bien en cours de développement');
}

function showDashboard() {
    if (!currentUser) {
        alert('Veuillez vous connecter pour accéder à votre tableau de bord');
        showLoginModal();
        return;
    }
    
    hideAllSections();
    document.getElementById('dashboardSection').style.display = 'block';
    showDashboardTab('reservations');
}

function showDashboardTab(tab) {
    // Mettre à jour les onglets
    document.querySelectorAll('.dashboard-tab').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    const content = document.getElementById('dashboardContent');
    
    switch(tab) {
        case 'reservations':
            const userReservations = reservations.filter(r => r.userId === currentUser.id);
            content.innerHTML = `
                <h3>Mes réservations</h3>
                ${userReservations.length > 0 ? 
                    userReservations.map(reservation => `
                        <div class="reservation-card">
                            <h4>${reservation.propertyTitle}</h4>
                            <p><strong>Du:</strong> ${reservation.checkin} <strong>au:</strong> ${reservation.checkout}</p>
                            <p><strong>Total:</strong> ${reservation.totalPrice.toLocaleString()} FCFA</p>
                            <p><strong>Statut:</strong> <span class="status-${reservation.status}">${reservation.status}</span></p>
                        </div>
                    `).join('') 
                    : '<p>Aucune réservation trouvée.</p>'
                }
            `;
            break;
        case 'properties':
            content.innerHTML = '<h3>Mes biens</h3><p>Fonctionnalité en cours de développement</p>';
            break;
        case 'profile':
            content.innerHTML = `
                <h3>Mon profil</h3>
                <div class="profile-info">
                    <p><strong>Nom:</strong> ${currentUser.name}</p>
                    <p><strong>Email:</strong> ${currentUser.email}</p>
                    <p><strong>Téléphone:</strong> ${currentUser.phone}</p>
                    <p><strong>Membre depuis:</strong> ${new Date(currentUser.joinDate).toLocaleDateString()}</p>
                </div>
            `;
            break;
    }
}

function hideAllSections() {
    document.getElementById('homeSection').style.display = 'none';
    document.getElementById('dashboardSection').style.display = 'none';
}

// ==================== MODALS ====================
function showModal(modalId) {
    document.getElementById(modalId).style.display = 'flex';
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

function showLoginModal() {
    closeModal('registerModal');
    showModal('loginModal');
}

function showRegisterModal() {
    closeModal('loginModal');
    showModal('registerModal');
}

// ==================== INITIALISATION ====================
document.addEventListener('DOMContentLoaded', function() {
    initializeData();
    showHome();
    
    // Fermer les modals en cliquant à l'extérieur
    window.onclick = function(event) {
        if (event.target.classList.contains('modal')) {
            event.target.style.display = 'none';
        }
    }
    
    // Définir les dates min/max pour les champs date
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('checkin').min = today;
    document.getElementById('checkout').min = today;
    
    // Mettre à jour la date de départ quand la date d'arrivée change
    document.getElementById('checkin').addEventListener('change', function() {
        const checkinDate = new Date(this.value);
        const nextDay = new Date(checkinDate);
        nextDay.setDate(nextDay.getDate() + 1);
        document.getElementById('checkout').min = nextDay.toISOString().split('T')[0];
    });
});

// Sauvegarder avant fermeture de page
window.addEventListener('beforeunload', saveAllDataBeforeUnload);

// ==================== FONCTIONS FOOTER ====================
function showHelp() {
    alert('Centre d\'aide - Fonctionnalité en cours de développement');
}

function showSafety() {
    alert('Informations sécurité - Fonctionnalité en cours de développement');
}

function showTerms() {
    alert('Conditions d\'utilisation - Fonctionnalité en cours de développement');
}

function showPrivacy() {
    alert('Politique de confidentialité - Fonctionnalité en cours de développement');
}

function showCookies() {
    alert('Politique des cookies - Fonctionnalité en cours de développement');
}