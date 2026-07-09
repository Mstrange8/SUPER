<template>
  <div class="donate-container">
    <div class="donate-card">
      <div class="donate-header">
        <h2>💚 Support Our Community</h2>
        <p class="subtitle">Help us maintain the community and organize events for Sanpete County pickleball players</p>
      </div>

      <div class="donate-body">
        <form @submit.prevent="handleSubmit" class="donate-form">
          <!-- Preset amounts -->
          <div class="form-group">
            <label>Select an amount</label>
            <div class="amount-buttons">
              <button
                v-for="preset in presetAmounts"
                :key="preset"
                type="button"
                class="amount-btn"
                :class="{ active: selectedAmount === preset * 100 && !customAmount }"
                @click="selectPreset(preset)"
              >
                ${{ preset }}
              </button>
              <button
                type="button"
                class="amount-btn"
                :class="{ active: customAmount }"
                @click="enableCustom"
              >
                Custom
              </button>
            </div>
          </div>

          <!-- Custom amount input -->
          <div v-if="customAmount" class="form-group">
            <label for="customAmount">Custom Amount ($)</label>
            <input
              id="customAmount"
              v-model.number="customAmountValue"
              type="number"
              min="1"
              max="10000"
              step="1"
              class="form-input"
              placeholder="Enter amount"
              required
            />
          </div>

          <!-- Donor information -->
          <div class="form-group">
            <label for="donorName">Your Name (Optional)</label>
            <input
              id="donorName"
              v-model="donorName"
              type="text"
              class="form-input"
              placeholder="Anonymous"
              maxlength="255"
            />
          </div>

          <div class="form-group">
            <label for="donorEmail">Email (Optional)</label>
            <input
              id="donorEmail"
              v-model="donorEmail"
              type="email"
              class="form-input"
              placeholder="For receipt"
              maxlength="255"
            />
          </div>

          <div class="form-group">
            <label for="message">Message (Optional)</label>
            <textarea
              id="message"
              v-model="message"
              class="form-textarea"
              placeholder="Leave a message with your donation"
              maxlength="500"
              rows="3"
            ></textarea>
          </div>

          <!-- Total display -->
          <div class="total-display">
            <span class="total-label">Your donation:</span>
            <span class="total-amount">${{ displayAmount }}</span>
          </div>

          <!-- Submit button -->
          <button type="submit" class="btn-donate" :disabled="loading || totalAmount < 100">
            <span v-if="!loading">💳 Proceed to Payment</span>
            <span v-else>Processing...</span>
          </button>

          <p class="secure-note">🔒 Secure payment powered by Stripe</p>
        </form>

        <!-- Impact message -->
        <div class="impact-message">
          <h3>Your Impact</h3>
          <ul>
            <li>🎾 Helps maintain local pickleball courts</li>
            <li>🏆 Supports community tournaments and leagues</li>
            <li>👥 Funds beginner clinics and events</li>
            <li>🛠️ Provides equipment for public use</li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Error display -->
    <div v-if="error" class="error-message">
      {{ error }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { donationService } from '../services/donation.service';

const presetAmounts = [5, 10, 25, 50, 100];
const selectedAmount = ref(500); // Default $25 in cents
const customAmount = ref(false);
const customAmountValue = ref(5);
const donorName = ref('');
const donorEmail = ref('');
const message = ref('');
const loading = ref(false);
const error = ref('');

const totalAmount = computed(() => {
  if (customAmount.value) {
    return customAmountValue.value * 100; // Convert to cents
  }
  return selectedAmount.value;
});

const displayAmount = computed(() => {
  return (totalAmount.value / 100).toFixed(2);
});

const selectPreset = (amount: number) => {
  customAmount.value = false;
  selectedAmount.value = amount * 100;
};

const enableCustom = () => {
  customAmount.value = true;
  customAmountValue.value = selectedAmount.value / 100;
};

const handleSubmit = async () => {
  error.value = '';
  
  if (totalAmount.value < 100) {
    error.value = 'Minimum donation is $1.00';
    return;
  }

  if (totalAmount.value > 1000000) {
    error.value = 'Maximum donation is $10,000';
    return;
  }

  loading.value = true;

  try {
    const response = await donationService.createCheckoutSession({
      amount: totalAmount.value,
      currency: 'usd',
      donorName: donorName.value || undefined,
      donorEmail: donorEmail.value || undefined,
      message: message.value || undefined,
    });

    // Redirect to Stripe Checkout
    window.location.href = response.url;
  } catch (err: any) {
    console.error('Donation error:', err);
    error.value = err.response?.data?.error || 'Failed to process donation. Please try again.';
    loading.value = false;
  }
};
</script>

<style scoped>
.donate-container {
  max-width: 600px;
  margin: 2rem auto;
  padding: 0 1rem;
}

.donate-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.donate-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 2rem;
  text-align: center;
}

.donate-header h2 {
  margin: 0 0 0.5rem 0;
  font-size: 2rem;
}

.subtitle {
  margin: 0;
  opacity: 0.95;
  font-size: 1rem;
}

.donate-body {
  padding: 2rem;
}

.donate-form {
  margin-bottom: 2rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #333;
}

.amount-buttons {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.75rem;
}

.amount-btn {
  padding: 1rem;
  border: 2px solid #e0e0e0;
  background: white;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.amount-btn:hover {
  border-color: #667eea;
  background: #f8f9ff;
}

.amount-btn.active {
  border-color: #667eea;
  background: #667eea;
  color: white;
}

.form-input,
.form-textarea {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.2s;
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: #667eea;
}

.form-textarea {
  resize: vertical;
  font-family: inherit;
}

.total-display {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  background: #f8f9ff;
  border-radius: 8px;
  margin-bottom: 1.5rem;
}

.total-label {
  font-size: 1.1rem;
  color: #666;
}

.total-amount {
  font-size: 2rem;
  font-weight: 700;
  color: #667eea;
}

.btn-donate {
  width: 100%;
  padding: 1rem 2rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.btn-donate:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.btn-donate:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.secure-note {
  text-align: center;
  margin-top: 1rem;
  color: #666;
  font-size: 0.9rem;
}

.impact-message {
  background: #f8f9ff;
  padding: 1.5rem;
  border-radius: 8px;
  border-left: 4px solid #667eea;
}

.impact-message h3 {
  margin: 0 0 1rem 0;
  color: #333;
}

.impact-message ul {
  margin: 0;
  padding-left: 1.5rem;
  color: #555;
}

.impact-message li {
  margin-bottom: 0.5rem;
}

.error-message {
  margin-top: 1rem;
  padding: 1rem;
  background: #fee;
  color: #c33;
  border-radius: 8px;
  text-align: center;
}

@media (max-width: 768px) {
  .donate-header h2 {
    font-size: 1.5rem;
  }

  .amount-buttons {
    grid-template-columns: repeat(2, 1fr);
  }

  .total-amount {
    font-size: 1.5rem;
  }
}
</style>
