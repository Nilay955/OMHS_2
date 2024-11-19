// User Authentication and Profile Management
let currentUser = null;

// Maid Data
const maidsData = [
    {
        id: 1,
        name: "A",
        image: "https://t4.ftcdn.net/jpg/02/15/84/43/360_F_215844325_ttX9YiIIyeaR7Ne6EaLLjMAmy4GvPC69.jpg",
        experience: "5+ years",
        skills: ["Regular Cleaning", "Laundry", "Cooking"],
        rating: 4.8,
        reviews: 156,
        price: 2500
    },
    {
        id: 2,
        name: "B",
        image: "https://t4.ftcdn.net/jpg/02/15/84/43/360_F_215844325_ttX9YiIIyeaR7Ne6EaLLjMAmy4GvPC69.jpg",
        experience: "3-5 years",
        skills: ["Deep Cleaning", "Pet Care"],
        rating: 4.6,
        reviews: 98,
        price: 2800
    },
    {
        id: 3,
        name: "C",
        image: "https://t4.ftcdn.net/jpg/02/15/84/43/360_F_215844325_ttX9YiIIyeaR7Ne6EaLLjMAmy4GvPC69.jpg",
        experience: "7+ years",
        skills: ["Regular Cleaning", "Elderly Care", "Cooking"],
        rating: 4.9,
        reviews: 203,
        price: 3200
    },
    {
        id: 4,
        name: "D",
        image: "https://t4.ftcdn.net/jpg/02/15/84/43/360_F_215844325_ttX9YiIIyeaR7Ne6EaLLjMAmy4GvPC69.jpg",
        experience: "4+ years",
        skills: ["Deep Cleaning", "Laundry", "Organization"],
        rating: 4.7,
        reviews: 167,
        price: 1400
    }
];

// Authentication Functions
function checkAuth() {
    const user = JSON.parse(localStorage.getItem('maidmatch_user') || '{}');
    if (!user.isLoggedIn) {
        window.location.href = '/';
        return;
    }
    currentUser = user;
    updateUserDisplay();
    loadUserBookings();
}

function updateUserDisplay() {
    const userDisplayName = document.getElementById('userDisplayName');
    const profileImage = document.getElementById('profileImage');
    const navProfileImage = document.querySelector('.nav-profile img');
    
    if (userDisplayName) {
        userDisplayName.textContent = currentUser.name || 'Guest User';
    }
    if (profileImage && currentUser.profilePicture) {
        profileImage.src = currentUser.profilePicture;
        navProfileImage.src = currentUser.profilePicture;
    }
}

function handleLogout() {
    localStorage.removeItem('maidmatch_user');
    window.location.href = '/';
}

// Profile Management
function initializeProfile() {
    if (currentUser) {
        const fields = ['Name', 'Email', 'Phone', 'Address'];
        fields.forEach(field => {
            const element = document.getElementById(`profile${field}`);
            if (element) {
                element.value = currentUser[field.toLowerCase()] || '';
            }
        });

        if (currentUser.profilePicture) {
            document.getElementById('profileImage').src = currentUser.profilePicture;
        }
    }
}

function handleProfileUpdate(e) {
    e.preventDefault();
    const formData = {
        name: document.getElementById('profileName').value,
        email: document.getElementById('profileEmail').value,
        address: document.getElementById('profileAddress').value,
        phone: document.getElementById('profilePhone').value,
        profilePicture: currentUser.profilePicture,
        isLoggedIn: true
    };

    if (!formData.name || !formData.email || !formData.address) {
        showNotification('Please fill in all required fields', 'error');
        return;
    }

    currentUser = { ...currentUser, ...formData };
    localStorage.setItem('maidmatch_user', JSON.stringify(currentUser));
    
    showNotification('Profile updated successfully!', 'success');
    updateUserDisplay();
}

// Profile Picture Management
function initializeProfilePicture() {
    const avatarInput = document.getElementById('avatarInput');
    const changeAvatarBtn = document.querySelector('.change-avatar-btn');
    
    changeAvatarBtn?.addEventListener('click', () => avatarInput.click());
    
    avatarInput?.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5000000) {
                showNotification('Image size should be less than 5MB', 'error');
                return;
            }

            const reader = new FileReader();
            reader.onload = function(event) {
                const profileImage = document.getElementById('profileImage');
                profileImage.src = event.target.result;
                currentUser.profilePicture = event.target.result;
                localStorage.setItem('maidmatch_user', JSON.stringify(currentUser));
                updateUserDisplay();
                showNotification('Profile picture updated successfully!', 'success');
            };
            reader.readAsDataURL(file);
        }
    });
}

// Maid Cards Management
function renderMaidCards(maids = maidsData) {
    const maidCardsContainer = document.querySelector('.maid-cards');
    if (!maidCardsContainer) return;

    maidCardsContainer.innerHTML = maids.map(maid => `
        <div class="maid-card">
            <img src="${maid.image}" alt="${maid.name}" class="maid-img">
            <div class="maid-info">
                <h4>${maid.name}</h4>
                <div class="rating">
                    ${Array(Math.floor(maid.rating)).fill('<i class="fas fa-star"></i>').join('')}
                    ${maid.rating % 1 !== 0 ? '<i class="fas fa-star-half-alt"></i>' : ''}
                    <span>(${maid.rating})</span>
                </div>
                <p class="experience"><i class="fas fa-briefcase"></i> ${maid.experience}</p>
                <p class="services">${maid.skills.join(', ')}</p>
                <div class="price">
                    <span class="amount">₹${maid.price}</span>/month
                </div>
                <button class="book-btn" onclick="openBookingModal(${maid.id})">Book Now</button>
            </div>
        </div>
    `).join('');
}

// Booking Management
function loadUserBookings() {
    const bookings = JSON.parse(localStorage.getItem('maidmatch_bookings') || '[]');
    const bookingsList = document.querySelector('.bookings-list');
    const activeTab = document.querySelector('.booking-tabs .tab.active')?.dataset.tab || 'upcoming';
    
    if (!bookingsList) return;

    const filteredBookings = bookings.filter(booking => {
        const maid = maidsData.find(m => m.id === booking.maidId);
        if (!maid) return false;

        const bookingDate = new Date(booking.date);
        const today = new Date();
        
        switch(activeTab) {
            case 'upcoming':
                return bookingDate >= today && booking.status !== 'cancelled';
            case 'pending':
                return booking.status === 'pending';
            case 'cancelled':
                return booking.status === 'cancelled';
            default:
                return true;
        }
    });

    if (filteredBookings.length === 0) {
        bookingsList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-calendar-times"></i>
                <p>No ${activeTab} bookings found</p>
            </div>
        `;
        return;
    }

    bookingsList.innerHTML = filteredBookings.map(booking => {
        const maid = maidsData.find(m => m.id === booking.maidId);
        return `
            <div class="booking-card">
                <div class="booking-info">
                    <img src="${maid.image}" alt="${maid.name}" class="booking-maid-img">
                    <div class="booking-details">
                        <h4>${maid.name}</h4>
                        <p class="service-type">${booking.service}</p>
                        <p class="booking-date">
                            <i class="fas fa-calendar"></i> ${new Date(booking.date).toLocaleDateString()}
                            <i class="fas fa-clock ml-2"></i> ${booking.time}
                        </p>
                        <p class="booking-duration">${booking.duration} months</p>
                        <p class="booking-price">₹${maid.price * booking.duration}</p>
                        <p class="booking-status ${booking.status}">${booking.status}</p>
                    </div>
                </div>
                <div class="booking-actions">
                    ${booking.status === 'pending' ? `
                        <button onclick="updateBookingStatus(${booking.maidId}, 'cancelled')" class="action-btn danger">
                            <i class="fas fa-times"></i> Cancel
                        </button>
                    ` : ''}
                    ${booking.status === 'upcoming' ? `
                        <button onclick="rescheduleBooking(${booking.maidId})" class="action-btn warning">
                            <i class="fas fa-clock"></i> Reschedule
                        </button>
                    ` : ''}
                </div>
            </div>
        `;
    }).join('');
}

function updateBookingStatus(maidId, newStatus) {
    const bookings = JSON.parse(localStorage.getItem('maidmatch_bookings') || '[]');
    const updatedBookings = bookings.map(booking => {
        if (booking.maidId === maidId) {
            return { ...booking, status: newStatus };
        }
        return booking;
    });
    
    localStorage.setItem('maidmatch_bookings', JSON.stringify(updatedBookings));
    showNotification(`Booking ${newStatus} successfully!`, 'success');
    loadUserBookings();
}

function rescheduleBooking(maidId) {
    showNotification('Rescheduling feature coming soon!', 'info');
}

// Booking Modal Management
function openBookingModal(maidId) {
    const maid = maidsData.find(m => m.id === maidId);
    if (!maid) return;

    const modal = document.getElementById('bookingModal');
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close-modal" onclick="closeBookingModal()">&times;</span>
            <h2>Book Your Service</h2>
            <div class="booking-maid-info">
                <img src="${maid.image}" alt="${maid.name}" class="modal-maid-img">
                <div>
                    <h3>${maid.name}</h3>
                    <p class="rating">
                        ${Array(Math.floor(maid.rating)).fill('<i class="fas fa-star"></i>').join('')}
                        ${maid.rating % 1 !== 0 ? '<i class="fas fa-star-half-alt"></i>' : ''}
                        <span>(${maid.rating})</span>
                    </p>
                    <p>₹${maid.price}/month</p>
                </div>
            </div>
            <form id="bookingForm" class="booking-form" onsubmit="handleBookingSubmit(event, ${maidId})">
                <div class="form-group">
                    <label>Service Date</label>
                    <input type="date" required min="${new Date().toISOString().split('T')[0]}">
                </div>
                <div class="form-group">
                    <label>Service Time</label>
                    <input type="time" required>
                </div>
                <div class="form-group">
                    <label>Duration (months)</label>
                    <input type="number" min="2" max="8" value="2" required onchange="updateTotalPrice(${maid.price})">
                </div>
                <div class="form-group">
                    <label>Service Type</label>
                    <select required>
                        ${maid.skills.map(skill => `<option value="${skill.toLowerCase()}">${skill}</option>`).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label>Special Instructions</label>
                    <textarea rows="3" placeholder="Any specific requirements..."></textarea>
                </div>
                <div class="total-price">
                    <span>Total Price:</span>
                    <span class="amount">₹${maid.price * 2}</span>
                </div>
                <div class="payment-section">
                    <h3>Payment Method</h3>
                    <div class="payment-options">
                        <label class="payment-option">
                            <input type="radio" name="payment" value="card" checked>
                            <i class="fas fa-credit-card"></i> Credit Card
                        </label>
                        <label class="payment-option">
                            <input type="radio" name="payment" value="UPI">
                            <i class="fab fa-UPI"></i> UPI
                        </label>
                    </div>
                    <div id="cardPayment" class="payment-details">
                        <div class="form-group">
                            <label>Card Number</label>
                            <input type="text" placeholder="1234 5678 9012 3456" maxlength="19" required>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label>Expiry Date</label>
                                <input type="text" placeholder="MM/YY" maxlength="5" required>
                            </div>
                            <div class="form-group">
                                <label>CVV</label>
                                <input type="text" placeholder="123" maxlength="3" required>
                            </div>
                        </div>
                    </div>
                </div>
                <button type="submit" class="submit-btn">Confirm Booking</button>
            </form>
        </div>
    `;
    modal.style.display = 'block';
}

function closeBookingModal() {
    const modal = document.getElementById('bookingModal');
    modal.style.display = 'none';
}

function updateTotalPrice(monthlyRate) {
    const duration = document.querySelector('#bookingForm input[type="number"]').value;
    const totalPriceElement = document.querySelector('.total-price .amount');
    totalPriceElement.textContent = `₹${monthlyRate * duration}`;
}

function handleBookingSubmit(event, maidId) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);
    const booking = {
        maidId,
        date: formData.get('date'),
        time: formData.get('time'),
        duration: formData.get('duration'),
        service: formData.get('service'),
        instructions: formData.get('instructions'),
        payment: formData.get('payment'),
        status: 'pending'
    };

    const bookings = JSON.parse(localStorage.getItem('maidmatch_bookings') || '[]');
    bookings.push(booking);
    localStorage.setItem('maidmatch_bookings', JSON.stringify(bookings));

    showNotification('Booking confirmed successfully!', 'success');
    closeBookingModal();
    loadUserBookings();
}

// Utility Functions
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
}

function showSection(sectionId) {
    const sections = document.querySelectorAll('.section');
    const navLinks = document.querySelectorAll('.nav-menu a');
    
    sections.forEach(section => section.classList.remove('active'));
    navLinks.forEach(link => link.classList.remove('active'));
    
    document.getElementById(sectionId).classList.add('active');
    document.querySelector(`[data-section="${sectionId.replace('-section', '')}"]`).classList.add('active');
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    initializeProfile();
    initializeProfilePicture();
    renderMaidCards();
    
    // Navigation
    document.querySelectorAll('.nav-menu a').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const section = e.target.closest('a').dataset.section;
            showSection(`${section}-section`);
        });
    });
    
    // Profile Form
    const profileForm = document.getElementById('profileForm');
    profileForm?.addEventListener('submit', handleProfileUpdate);
    
    // Booking Tabs
    document.querySelectorAll('.booking-tabs .tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.booking-tabs .tab').forEach(t => 
                t.classList.remove('active')
            );
            tab.classList.add('active');
            loadUserBookings();
        });
    });

    // Reset Profile Form
    const resetBtn = document.querySelector('.secondary-btn');
    resetBtn?.addEventListener('click', () => {
        initializeProfile();
        showNotification('Form reset to original values', 'info');
    });
    
    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        const modal = document.getElementById('bookingModal');
        if (e.target === modal) {
            closeBookingModal();
        }
    });
});