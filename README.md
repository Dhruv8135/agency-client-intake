# AeroInquire // Premium Digital Agency Client Intake Form & AI Lead Automation

AeroInquire is a modern, single-page, glassmorphic client inquiry intake form designed for digital agencies and startups. The interface is engineered with a high-fidelity split-pane layout featuring real-time visual client profile updates on the left, smart validated inputs on the right, a custom touch-friendly security verification slider, and simulated encrypted payload submission with high-performance canvas confetti overlays.

This form is pre-configured to connect directly to an automated **n8n + Groq AI Lead Follow-up Workflow**.

---

## ✨ Features & Interactive Elements

* **Desktop Split Layout & Mobile Stacking**: Responsive layout that presents a dynamic "client profile pass card" alongside the form on desktop, and stacks elegantly on mobile.
* **Apple/Stripe Inspired Glassmorphic Theme**: Deep blur backdrops (`backdrop-filter: blur(28px)`), slow-drifting neon orbital ambient glow orbs, and delicate border treatments.
* **Live Profile Syncing**: Updates the preview card initials avatar, name, email, phone, and project scope details instantly as the user types.
* **Floating Labels & Smart Focus Glows**: Inputs float elegantly on focus/fill, accompanied by color-shifting border glows.
* **Phone Auto-Formatter**: Automatically formats digit keystrokes to `(XXX) XXX-XXXX` on-the-fly.
* **Smart Textarea Character Counter**: Tracks details length, changing indicator colors and triggering physics wiggles when nearing limits.
* **Anti-Spam Drag CAPTCHA Slider**: Modern, visual verification slider (supporting both desktop mouse dragging and mobile touch swipes) that unlocks the transmit button upon completion.
* **Confetti Success Screen**: Renders a custom canvas particle physics engine (with gravity and wind drift properties) on successful intake.
* **Dark/Light Mode Support**: Seamless theme switching with smooth transitions and state persistence.
* **n8n Live Webhook Sync Badge**: Dynamically displays transmission results (`🟢 ACTIVE & FIRED` or local backup fallback statuses) in the thank-you screen.

---

## ⚙️ AI Lead Automation Workflow (n8n + Groq AI)

When a lead submits the form, it triggers a multi-stage background automation workflow inside n8n:

1. **Intake Trigger**: n8n Webhook node listens for `POST` payloads from the form.
2. **Sheet Logging**: Appends raw lead details to a Google Sheet row.
3. **Groq AI Agent**: Reads the project details context and drafts a highly personalized, custom follow-up email response using the Groq AI model (e.g. Llama 3).
4. **Gmail Dispatch**: Sends the drafted email to the client instantly.
5. **Wait Timer**: Pauses the workflow for **4 hours**.
6. **Reply Validator**: Checks the email thread to verify if the client replied:
   * **If Reply Received (True)**: Updates the Google Sheet row status to `Confirmed` and automatically schedules an alignment call event on Google Calendar.
   * **If No Reply (False)**: Automatically fires a follow-up email detailing agency packages and core services.

---

## 🚀 Setup & Customization

The project is built on **zero-dependency static web technologies (HTML/CSS/JS)**.

### 1. Running Locally
Simply open the `index.html` file in any modern web browser or use a VS Code extension like **Live Server**.

### 2. Configuring n8n Webhook URL
To direct form submissions to your n8n workflow:
1. Open the [script.js](script.js) file.
2. Locate the `N8N_WEBHOOK_URL` constant at the top of the file:
   ```javascript
   const N8N_WEBHOOK_URL = 'http://127.0.0.1:5678/webhook-test/agency-lead';
   ```
3. Replace this URL with your production or active test n8n webhook URL.

### 3. Data Storage
Submissions are automatically backed up inside the user's browser `localStorage` under `clientInquiries` for offline protection.
