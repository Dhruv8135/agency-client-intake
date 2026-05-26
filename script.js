/* ==========================================================================
   AeroInquire Interactive JS Engine
   Apple-Smooth UX, Live Preview Sync, Captcha Slider & Canvas Confetti
   ========================================================================== */

// n8n Webhook Configuration - Swap out for your production webhook URL as needed
const N8N_WEBHOOK_URL = 'http://127.0.0.1:5678/webhook-test/agency-lead';

document.addEventListener('DOMContentLoaded', () => {
    
    // ==========================================
    // 1. Core State Management
    // ==========================================
    const state = {
        formData: {
            name: '',
            email: '',
            phone: '',
            details: ''
        },
        verified: false,
        theme: 'dark'
    };

    // ==========================================
    // 2. DOM Selectors
    // ==========================================
    const form = document.getElementById('agency-inquiry-form');
    
    // Core Inputs
    const inputName = document.getElementById('client-name');
    const inputEmail = document.getElementById('client-email');
    const inputPhone = document.getElementById('client-phone');
    const inputDetails = document.getElementById('project-details');
    const detailsCharCounter = document.getElementById('details-char-counter');
    
    // Live Previews Left Column Card Elements
    const previewName = document.getElementById('preview-name');
    const previewEmail = document.getElementById('preview-email');
    const previewPhone = document.getElementById('preview-phone');
    const previewDetails = document.getElementById('preview-details');
    const previewAvatar = document.getElementById('preview-avatar');
    const cardDateTag = document.getElementById('current-card-date');

    // Captcha elements
    const sliderTrack = document.getElementById('slider-track');
    const sliderThumb = document.getElementById('slider-thumb');
    const sliderFill = document.getElementById('slider-fill');
    const sliderText = document.getElementById('slider-guide-text');
    const realSubmitBtn = document.getElementById('real-submit-btn');

    // Success Screen Overlay & Elements
    const successOverlay = document.getElementById('success-screen-overlay');
    const transactionHashBadge = document.getElementById('intake-transaction-hash');
    const successLeadName = document.getElementById('success-lead-name');
    const successLeadEmail = document.getElementById('success-lead-email');
    const successLeadDetails = document.getElementById('success-lead-details');
    const restartFormBtn = document.getElementById('restart-form-btn');
    const confettiCanvas = document.getElementById('confetti-canvas');
    
    // Theme Toggle
    const themeToggleBtn = document.getElementById('theme-toggle-btn');

    // Avatar Gradient Palette based on initials key
    const avatarGradients = [
        'linear-gradient(135deg, #4f46e5 0%, #8b5cf6 100%)', // Indigo Purple
        'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)', // Cyan Blue
        'linear-gradient(135deg, #10b981 0%, #059669 100%)', // Emerald Green
        'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', // Amber Orange
        'linear-gradient(135deg, #ec4899 0%, #be185d 100%)'  // Pink Red
    ];

    // ==========================================
    // 3. Theme Toggle Setup (Dark/Light Mode)
    // ==========================================
    function initTheme() {
        const storedTheme = localStorage.getItem('aero-inquire-theme');
        if (storedTheme) {
            state.theme = storedTheme;
        } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
            state.theme = 'light';
        }
        document.documentElement.setAttribute('data-theme', state.theme);
    }

    themeToggleBtn.addEventListener('click', () => {
        state.theme = state.theme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', state.theme);
        localStorage.setItem('aero-inquire-theme', state.theme);
        
        themeToggleBtn.style.transform = 'scale(0.85) rotate(45deg)';
        setTimeout(() => {
            themeToggleBtn.style.transform = '';
        }, 200);
    });

    initTheme();

    // Set Card Date to current month/year
    const dateOptions = { month: 'short', year: 'numeric' };
    cardDateTag.textContent = new Date().toLocaleDateString('en-US', dateOptions).toUpperCase();

    // ==========================================
    // 4. Deterministic Avatar Initials & Gradient Generator
    // ==========================================
    function updateAvatarProfile(nameVal) {
        if (!nameVal || !nameVal.trim()) {
            previewAvatar.textContent = 'CL';
            previewAvatar.style.background = avatarGradients[0];
            return;
        }

        const parts = nameVal.trim().split(/\s+/);
        let initials = 'CL';
        let firstLetter = 'C';

        if (parts.length === 1) {
            initials = parts[0].substring(0, 2).toUpperCase();
            firstLetter = parts[0].charAt(0).toUpperCase();
        } else if (parts.length > 1) {
            const first = parts[0].charAt(0).toUpperCase();
            const last = parts[parts.length - 1].charAt(0).toUpperCase();
            initials = first + last;
            firstLetter = first;
        }

        previewAvatar.textContent = initials;
        
        // Pick gradient deterministically based on character code
        const code = firstLetter.charCodeAt(0) || 67;
        const gradIdx = code % avatarGradients.length;
        previewAvatar.style.background = avatarGradients[gradIdx];
    }

    // ==========================================
    // 5. Live Interactive Preview Sync listeners
    // ==========================================
    
    // Name Input
    inputName.addEventListener('input', (e) => {
        const val = e.target.value.trim();
        previewName.textContent = val ? e.target.value : 'Creative Lead';
        updateAvatarProfile(val);
        clearFieldError(inputName);
    });

    // Email Input
    inputEmail.addEventListener('input', (e) => {
        const val = e.target.value.trim();
        previewEmail.textContent = val ? val : 'email@example.com';
        clearFieldError(inputEmail);
    });

    // Phone Input Auto-Formatter & Sync
    inputPhone.addEventListener('keydown', (e) => {
        const allowed = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'];
        if (allowed.includes(e.key)) return;
        if (!/\d/.test(e.key)) e.preventDefault();
    });

    inputPhone.addEventListener('input', (e) => {
        let rawDigits = e.target.value.replace(/\D/g, '');
        let formatted = '';
        
        if (rawDigits.length > 0) {
            formatted += '(' + rawDigits.substring(0, 3);
        }
        if (rawDigits.length > 3) {
            formatted += ') ' + rawDigits.substring(3, 6);
        }
        if (rawDigits.length > 6) {
            formatted += '-' + rawDigits.substring(6, 10);
        }
        
        e.target.value = formatted;
        
        previewPhone.textContent = formatted ? formatted : '(000) 000-0000';
        clearFieldError(inputPhone);
    });

    // Details Brief Textarea & counter
    inputDetails.addEventListener('input', (e) => {
        const val = e.target.value;
        const len = val.length;
        
        detailsCharCounter.textContent = `${len} / 300`;
        detailsCharCounter.className = 'char-count-badge';
        
        if (len >= 300) {
            detailsCharCounter.classList.add('limit-reached');
        } else if (len >= 260) {
            detailsCharCounter.classList.add('limit-warning');
        }

        previewDetails.textContent = val.trim() ? val : 'Add your project details to see this summary update in real-time...';
        clearFieldError(inputDetails);
    });

    // Error clear helpers
    function clearFieldError(inputElem) {
        const group = inputElem.closest('.floating-input-group');
        if (group) {
            group.classList.remove('invalid-error');
        }
    }

    function raiseFieldError(inputElem) {
        const group = inputElem.closest('.floating-input-group');
        if (group) {
            group.classList.add('invalid-error');
            // Trigger wiggle animation
            group.classList.add('shake-element');
            setTimeout(() => {
                group.classList.remove('shake-element');
            }, 450);
        }
    }

    // ==========================================
    // 6. Form Fields Validation
    // ==========================================
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    function validateWholeForm() {
        let isFormValid = true;

        // 1. Validate Name
        if (inputName.value.trim().length < 2) {
            raiseFieldError(inputName);
            isFormValid = false;
        }

        // 2. Validate Email
        if (!emailRegex.test(inputEmail.value.trim())) {
            raiseFieldError(inputEmail);
            isFormValid = false;
        }

        // 3. Validate Phone (Needs exactly 10 digits in (XXX) XXX-XXXX)
        const phoneDigits = inputPhone.value.replace(/\D/g, '');
        if (phoneDigits.length !== 10) {
            raiseFieldError(inputPhone);
            isFormValid = false;
        }

        // 4. Validate Details
        if (inputDetails.value.trim().length < 15) {
            raiseFieldError(inputDetails);
            isFormValid = false;
        }

        return isFormValid;
    }

    // ==========================================
    // 7. Anti-Spam Drag CAPTCHA (Desktop & Mobile Touch)
    // ==========================================
    let isDragging = false;
    let startX = 0;

    function handleDragStart(e) {
        // Validate inputs first! If fields are invalid, reject drag and nudge user
        if (!validateWholeForm()) {
            e.preventDefault();
            return;
        }
        
        if (state.verified) return;
        isDragging = true;
        
        const clientX = e.type.startsWith('touch') ? e.touches[0].clientX : e.clientX;
        startX = clientX - sliderThumb.offsetLeft;
        sliderThumb.style.transition = 'none';
        sliderFill.style.transition = 'none';
    }

    function handleDragMove(e) {
        if (!isDragging || state.verified) return;
        
        const clientX = e.type.startsWith('touch') ? e.touches[0].clientX : e.clientX;
        const trackWidth = sliderTrack.clientWidth;
        const thumbWidth = sliderThumb.clientWidth;
        const maxDrag = trackWidth - thumbWidth - 6;
        
        let x = clientX - startX;
        x = Math.max(0, Math.min(x, maxDrag)); // Clamp between 0 and max
        
        sliderThumb.style.transform = `translateX(${x}px)`;
        sliderFill.style.width = `${x + (thumbWidth / 2)}px`;
        
        // Hide slider text gradually
        const pct = x / maxDrag;
        sliderText.style.opacity = 1 - (pct * 1.5);
    }

    function handleDragEnd() {
        if (!isDragging || state.verified) return;
        isDragging = false;
        
        const trackWidth = sliderTrack.clientWidth;
        const thumbWidth = sliderThumb.clientWidth;
        const maxDrag = trackWidth - thumbWidth - 6;
        const currentLeft = parseInt(sliderThumb.style.transform.replace(/[^0-9]/g, '')) || 0;
        
        if (currentLeft >= maxDrag * 0.90) {
            triggerVerified();
        } else {
            // Rebound back to start
            sliderThumb.style.transition = 'transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
            sliderFill.style.transition = 'width 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
            sliderThumb.style.transform = 'translateX(0px)';
            sliderFill.style.width = '0px';
            sliderText.style.opacity = 1;
        }
    }

    function triggerVerified() {
        state.verified = true;
        sliderTrack.classList.add('verified');
        sliderThumb.style.transform = `translateX(${sliderTrack.clientWidth - sliderThumb.clientWidth - 6}px)`;
        sliderFill.style.width = '100%';
        sliderText.textContent = 'VERIFIED SECURE CONNECTION';
        sliderText.style.opacity = 1;
        
        // Unlock submit button
        realSubmitBtn.disabled = false;
        realSubmitBtn.focus();
    }

    // Attach dragging listeners (Desktop)
    sliderThumb.addEventListener('mousedown', handleDragStart);
    window.addEventListener('mousemove', handleDragMove);
    window.addEventListener('mouseup', handleDragEnd);

    // Attach dragging listeners (Mobile)
    sliderThumb.addEventListener('touchstart', handleDragStart, { passive: true });
    window.addEventListener('touchmove', handleDragMove, { passive: true });
    window.addEventListener('touchend', handleDragEnd);

    // Keyboard support for slider focus
    sliderThumb.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'Enter') {
            e.preventDefault();
            if (validateWholeForm() && !state.verified) {
                triggerVerified();
            }
        }
    });

    // ==========================================
    // 8. Submit securely & n8n webhook broadcasting
    // ==========================================
    function generateTransactionId() {
        const letters = '0123456789ABCDEF';
        let txId = 'INQ-';
        for (let i = 0; i < 6; i++) {
            txId += letters[Math.floor(Math.random() * 16)];
        }
        return txId;
    }

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        if (!state.verified) return;
        
        // Trigger Loading state on submit button
        realSubmitBtn.classList.add('loading');
        
        // Cycle premium security states
        const stages = [
            'Securing Pipeline...',
            'Signing AES-256 Block...',
            'Encoding Vault Transaction...',
            'Pushing secure envelope...'
        ];
        
        let sIdx = 0;
        const btnText = realSubmitBtn.querySelector('.btn-text');
        
        const txtInterval = setInterval(() => {
            if (sIdx < stages.length) {
                btnText.textContent = stages[sIdx];
                sIdx++;
            }
        }, 550);

        // Get dynamic n8n status elements
        const n8nSyncTag = document.getElementById('n8n-sync-tag');
        const n8nStatusText = document.getElementById('n8n-status-text');

        setTimeout(async () => {
            clearInterval(txtInterval);
            
            // Build Payload
            state.formData.name = inputName.value.trim();
            state.formData.email = inputEmail.value.trim();
            state.formData.phone = inputPhone.value.trim();
            state.formData.details = inputDetails.value.trim();

            const inquiryPayload = {
                transactionId: generateTransactionId(),
                timestamp: new Date().toISOString(),
                ...state.formData
            };

            // Save inside local storage securely
            let vaultData = JSON.parse(localStorage.getItem('clientInquiries') || '[]');
            vaultData.push(inquiryPayload);
            localStorage.setItem('clientInquiries', JSON.stringify(vaultData));

            // Set overlays values
            transactionHashBadge.textContent = inquiryPayload.transactionId;
            successLeadName.textContent = inquiryPayload.name;
            successLeadEmail.textContent = inquiryPayload.email;
            successLeadDetails.textContent = inquiryPayload.details;

            // Display Success overlay & launch Confetti particles immediately
            successOverlay.classList.add('active');
            startConfettiEngine();

            // Fire real POST request to n8n webhook in background
            try {
                const response = await fetch(N8N_WEBHOOK_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        transactionId: inquiryPayload.transactionId,
                        name: inquiryPayload.name,
                        email: inquiryPayload.email,
                        phone: inquiryPayload.phone,
                        details: inquiryPayload.details,
                        submittedAt: inquiryPayload.timestamp
                    })
                });

                if (response.ok) {
                    console.log('n8n Webhook Sync Successful! payload received by n8n workflow.');
                    // Update Badge in UI
                    n8nStatusText.textContent = 'ACTIVE & FIRED 🟢';
                    n8nStatusText.style.color = '#10b981';
                    n8nStatusText.style.background = 'rgba(16, 185, 129, 0.1)';
                    n8nSyncTag.style.borderColor = 'rgba(16, 185, 129, 0.3)';
                    n8nSyncTag.style.background = 'rgba(16, 185, 129, 0.05)';
                } else {
                    console.warn('n8n server rejected the request with status:', response.status);
                    n8nStatusText.textContent = 'DEV REJECTED 🟡';
                    n8nStatusText.style.color = '#f59e0b';
                    n8nStatusText.style.background = 'rgba(245, 158, 11, 0.1)';
                    n8nSyncTag.style.borderColor = 'rgba(245, 158, 11, 0.3)';
                    n8nSyncTag.style.background = 'rgba(245, 158, 11, 0.05)';
                }
            } catch (error) {
                console.error('n8n Webhook Network Error (Local server offline):', error);
                // Update UI badge to show offline fallback
                n8nStatusText.textContent = 'OFFLINE SAVE ONLY 🟡';
                n8nStatusText.style.color = '#f59e0b';
                n8nStatusText.style.background = 'rgba(245, 158, 11, 0.1)';
                n8nSyncTag.style.borderColor = 'rgba(245, 158, 11, 0.3)';
                n8nSyncTag.style.background = 'rgba(245, 158, 11, 0.05)';
            }

        }, 2400);
    });

    // ==========================================
    // 9. Lightweight Confetti Physics Engine
    // ==========================================
    let confettiActive = false;
    let confettiTimer = null;
    let confettiParticles = [];
    const colors = ['#6366f1', '#a855f7', '#06b6d4', '#10b981', '#f59e0b', '#ec4899'];

    function resizeConfettiCanvas() {
        confettiCanvas.width = successOverlay.clientWidth;
        confettiCanvas.height = successOverlay.clientHeight;
    }

    function createConfettiParticle() {
        return {
            x: Math.random() * confettiCanvas.width,
            y: -20 - Math.random() * 20,
            r: 4 + Math.random() * 6,
            d: Math.random() * confettiCanvas.height,
            color: colors[Math.floor(Math.random() * colors.length)],
            tilt: Math.random() * 10 - 5,
            tiltAngleIncremental: Math.random() * 0.07 + 0.02,
            tiltAngle: 0,
            wobble: Math.random() * 0.05 + 0.01,
            speed: 1.5 + Math.random() * 3
        };
    }

    function drawConfetti() {
        if (!confettiActive) return;
        
        const ctx = confettiCanvas.getContext('2d');
        ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
        
        confettiParticles.forEach((p, idx) => {
            p.tiltAngle += p.tiltAngleIncremental;
            p.y += p.speed;
            p.x += Math.sin(p.tiltAngle) * 0.5;
            p.tilt = Math.sin(p.tiltAngle - idx/3) * 6;
            
            ctx.beginPath();
            ctx.lineWidth = p.r * 2;
            ctx.strokeStyle = p.color;
            ctx.moveTo(p.x + p.tilt + p.r, p.y);
            ctx.lineTo(p.x + p.tilt, p.y + p.tilt + p.r);
            ctx.stroke();

            // Re-spawn or clear if particles go off-screen
            if (p.y > confettiCanvas.height) {
                confettiParticles[idx] = createConfettiParticle();
                confettiParticles[idx].y = -10;
            }
        });
        
        requestAnimationFrame(drawConfetti);
    }

    function startConfettiEngine() {
        resizeConfettiCanvas();
        confettiActive = true;
        confettiParticles = [];
        
        for (let i = 0; i < 90; i++) {
            confettiParticles.push(createConfettiParticle());
        }
        
        drawConfetti();

        // Gracefully kill execution to consume zero CPU after 4.5 seconds
        clearTimeout(confettiTimer);
        confettiTimer = setTimeout(() => {
            confettiActive = false;
            const ctx = confettiCanvas.getContext('2d');
            ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
        }, 4500);
    }

    window.addEventListener('resize', () => {
        if (confettiActive) resizeConfettiCanvas();
    });

    // ==========================================
    // 10. Form Resetting and Reconstructing
    // ==========================================
    restartFormBtn.addEventListener('click', () => {
        state.verified = false;
        
        // Reset Inputs
        form.reset();

        // Reset elements to placeholder states
        previewName.textContent = 'Creative Lead';
        previewEmail.textContent = 'email@example.com';
        previewPhone.textContent = '(000) 000-0000';
        previewDetails.textContent = 'Add your project details to see this summary update in real-time...';
        
        previewAvatar.textContent = 'CL';
        previewAvatar.style.background = avatarGradients[0];

        detailsCharCounter.textContent = '0 / 300';
        detailsCharCounter.className = 'char-count-badge';

        // Clear error classes
        document.querySelectorAll('.floating-input-group').forEach(group => {
            group.classList.remove('invalid-error');
        });

        // Reset Slider Captcha
        sliderTrack.classList.remove('verified');
        sliderThumb.style.transform = 'translateX(0px)';
        sliderFill.style.width = '0px';
        sliderText.textContent = 'SLIDE TO SECURE SUBMIT';
        
        // Reset Submit Button loader
        realSubmitBtn.disabled = true;
        realSubmitBtn.classList.remove('loading');
        realSubmitBtn.querySelector('.btn-text').textContent = 'Transmit Secured Inquiry';
        
        // Dismiss success overlay
        successOverlay.classList.remove('active');
    });

});
