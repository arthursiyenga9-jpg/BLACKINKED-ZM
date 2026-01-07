// --- INITIALIZATION ---
const canvas = document.getElementById('tattoo-canvas');
const ctx = canvas?.getContext('2d');
const appointmentForm = document.getElementById('appointment-form');
const appointmentsList = document.getElementById('appointments');
const uploadInput = document.getElementById('customer-design-upload');
const previewGallery = document.getElementById('customer-preview-gallery');

// --- 1. UPLOAD FEATURE ---
if (uploadInput) {
    uploadInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(event) {
                const img = document.createElement('img');
                img.src = event.target.result;
                img.style.width = "100px";
                img.style.borderRadius = "10px";
                previewGallery.appendChild(img);
            };
            reader.readAsDataURL(file);
        }
    });
}

// --- 2. DRAWING TOOL ---
if (canvas && ctx) {
    let isDrawing = false;
    const startDraw = () => isDrawing = true;
    const stopDraw = () => { isDrawing = false; ctx.beginPath(); };
    
    canvas.addEventListener('mousedown', startDraw);
    window.addEventListener('mouseup', stopDraw);
    
    canvas.addEventListener('mousemove', (e) => {
        if (!isDrawing) return;
        const rect = canvas.getBoundingClientRect();
        ctx.lineWidth = 4;
        ctx.lineCap = 'round';
        ctx.strokeStyle = document.getElementById('color-picker').value;
        ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
    });

    document.getElementById('clear').onclick = () => ctx.clearRect(0, 0, canvas.width, canvas.height);
    document.getElementById('save').onclick = () => {
        const link = document.createElement('a');
        link.download = 'sketch.png';
        link.href = canvas.toDataURL();
        link.click();
    };
}

// --- 3. BOOKING LOGIC (WITH YOUR IDS) ---
appointmentForm?.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const apptData = {
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        date: document.getElementById('date').value,
        time: document.getElementById('time').value,
        description: document.getElementById('tattoo-description').value
    };

    // YOUR SERVICE AND TEMPLATE IDS
    emailjs.send("service_bmhafjm", "template_oztapjd", apptData)
    .then(() => {
        alert("✅ Success! Your booking request has been sent.");
        appointmentForm.reset();
        
        // Save to local storage for "My Bookings"
        const localAppts = JSON.parse(localStorage.getItem('appointments')) || [];
        localAppts.push({...apptData, id: Date.now()});
        localStorage.setItem('appointments', JSON.stringify(localAppts));
    })
    .catch((err) => {
        console.error("FAILED...", err);
        alert("❌ Error: Could not send email. Please check that your EmailJS Service ID is active.");
    });
});

// --- 4. MANAGE BOOKINGS ---
function loadAppointments() {
    const userEmail = document.getElementById('manage-email')?.value.toLowerCase();
    const appts = JSON.parse(localStorage.getItem('appointments')) || [];
    
    if (!userEmail) { alert("Enter email first."); return; }

    const filtered = appts.filter(a => a.email.toLowerCase() === userEmail);
    appointmentsList.innerHTML = filtered.length === 0 
        ? '<li>No bookings found.</li>' 
        : filtered.map(a => `<li class="appointment-card">${a.date} at ${a.time} <button onclick="deleteBooking(${a.id})">Cancel</button></li>`).join('');
}

function deleteBooking(id) {
    let appts = JSON.parse(localStorage.getItem('appointments')) || [];
    appts = appts.filter(a => a.id !== id);
    localStorage.setItem('appointments', JSON.stringify(appts));
    loadAppointments();
}