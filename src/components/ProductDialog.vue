<template>
  <dialog ref="dialog" class="dialog" aria-labelledby="product-title" @cancel.prevent="close" @click="onBackdrop" @keydown="onKeydown">
    <div v-if="last" class="dialog__panel">
      <button ref="closeButton" type="button" class="icon-button dialog__close" aria-label="Close details" @click="close">
        <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" /></svg>
      </button>
      <div class="dialog__image">
        <img :key="last.ProductID" :src="last.PhotoName" :alt="last.ItemName" width="960" height="1200" :class="{ 'is-ready': imageReady }" @load="imageReady = true" />
      </div>

      <div class="dialog__info">
        <p class="dialog__id">Item {{ last.ItemID }}</p>

        <h2 id="product-title" class="dialog__title">{{ last.ItemName }}</h2>
        <p class="dialog__price">{{ price }} <span class="dialog__price-note">wholesale</span></p>

        <p class="dialog__description" :class="{ 'dialog__description--empty': !last.Description }">
          {{ last.Description || 'No description yet. Email us for details on this piece.' }}
        </p>

        <dl class="specs">
          <div class="specs__row">
            <dt>Dimensions</dt>
            <dd>{{ last.Dimensions || 'On request' }}</dd>
          </div>
          <div v-if="last.udf16" class="specs__row">
            <dt>Color</dt>
            <dd>{{ last.udf16 }}</dd>
          </div>
          <div v-if="last.udf17" class="specs__row">
            <dt>Material</dt>
            <dd>{{ last.udf17 }}</dd>
          </div>
          <div v-if="last.OrderMinimumQuantity" class="specs__row">
            <dt>Minimum order</dt>
            <dd>{{ last.OrderMinimumQuantity }} {{ last.OrderMinimumQuantity === 1 ? 'unit' : 'units' }}</dd>
          </div>
        </dl>

        <a class="button" :href="mailto">Email to order</a>

        <div class="dialog__nav">
          <button type="button" class="text-button" :disabled="!hasPrevious" @click="$emit('step', -1)">
            <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M15 6l-6 6 6 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" /></svg>
            Previous
          </button>
          <span class="dialog__count" aria-live="polite">{{ lastPosition }} of {{ total }}</span>
          <button type="button" class="text-button" :disabled="!hasNext" @click="$emit('step', 1)">
            Next
            <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M9 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" /></svg>
          </button>
        </div>
      </div>
    </div>
  </dialog>
</template>

<script>
import { formatMoney } from '../format';

export default {
  name: 'ProductDialog',
  props: {
    product: { type: Object, default: null },
    position: { type: Number, default: 0 },
    total: { type: Number, default: 0 },
    email: { type: String, default: '' },
    returnTo: { type: Object, default: null },
  },
  emits: ['close', 'step'],
  data: () => ({
    opener: null,
    // The product on screen. It stays until the dialog has faded out.
    last: null,
    lastPosition: 0,
    imageReady: false,
    closeTimer: null,
  }),
  computed: {
    price() {
      return this.last ? formatMoney(this.last.BasePrice) : '';
    },
    hasPrevious() {
      return this.lastPosition > 1;
    },
    hasNext() {
      return this.lastPosition < this.total;
    },
    mailto() {
      if (!this.last) return '#';
      const subject = encodeURIComponent(`Order: ${this.last.ItemID} ${this.last.ItemName}`);
      return `mailto:${this.email}?subject=${subject}`;
    },
  },
  watch: {
    product(next, previous) {
      if (next) {
        this.imageReady = false;
        this.last = next;
        this.lastPosition = this.position;
        this.$nextTick(() => {
          const img = this.$refs.dialog && this.$refs.dialog.querySelector('.dialog__image img');
          if (img && img.complete) this.imageReady = true;
        });
      }
      if (next && !previous) this.show();
      if (!next && previous) this.hide();
    },
  },
  beforeUnmount() {
    document.documentElement.classList.remove('is-locked');
  },
  methods: {
    show() {
      clearTimeout(this.closeTimer);
      this.$refs.dialog.classList.remove('is-closing');
      this.opener = this.returnTo || document.activeElement;
      document.documentElement.classList.add('is-locked');
      this.$nextTick(() => {
        this.$refs.dialog.showModal();
        this.$refs.closeButton.focus();
      });
    },
    hide() {
      const dialog = this.$refs.dialog;
      document.documentElement.classList.remove('is-locked');
      const finish = () => {
        dialog.classList.remove('is-closing');
        if (dialog.open) dialog.close();
        this.last = null;
        if (this.opener && document.contains(this.opener)) this.opener.focus();
        this.opener = null;
      };
      if (!dialog.open || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        finish();
        return;
      }
      // Fade out first, then close the native dialog.
      dialog.classList.add('is-closing');
      this.closeTimer = setTimeout(finish, 150);
    },
    close() {
      this.$emit('close');
    },
    // The modal dialog already makes the page inert; this keeps Tab cycling inside it instead of leaving for the browser bar.
    trapFocus(event) {
      const focusable = Array.from(this.$refs.dialog.querySelectorAll('a[href], button:not([disabled])'));
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    },
    onBackdrop(event) {
      // A click on the dialog element itself (not its panel) is a click on the backdrop.
      if (event.target === this.$refs.dialog) this.close();
    },
    onKeydown(event) {
      if (event.key === 'Tab') {
        this.trapFocus(event);
        return;
      }
      if (event.target.closest && event.target.closest('a, input, textarea')) return;
      if (event.key === 'ArrowLeft' && this.hasPrevious) this.$emit('step', -1);
      if (event.key === 'ArrowRight' && this.hasNext) this.$emit('step', 1);
    },
  },
};
</script>

<style scoped>
.dialog {
  width: min(960px, calc(100vw - 48px));
  max-width: none;
  max-height: calc(100vh - 48px);
  padding: 0;
  border: 0;
  border-radius: 10px;
  color: var(--ink);
  background: var(--paper);
  box-shadow: 0 24px 64px rgba(16, 24, 32, 0.24);
  overflow: hidden;
}

.dialog::backdrop {
  background: rgba(23, 29, 34, 0.56);
}

.dialog[open] {
  animation: dialog-in 200ms cubic-bezier(0.2, 0.8, 0.2, 1);
}

.dialog[open]::backdrop {
  animation: backdrop-in 200ms ease-out;
}

.dialog.is-closing {
  animation: dialog-out 150ms ease-in forwards;
}

.dialog.is-closing::backdrop {
  animation: backdrop-out 150ms ease-in forwards;
}

@keyframes dialog-in {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: none;
  }
}

@keyframes dialog-out {
  to {
    opacity: 0;
    transform: translateY(8px);
  }
}

@keyframes backdrop-in {
  from {
    opacity: 0;
  }
}

@keyframes backdrop-out {
  to {
    opacity: 0;
  }
}

.dialog__panel {
  position: relative;
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  max-height: calc(100vh - 48px);
}

.dialog__image {
  background: var(--well);
  min-height: 0;
}

.dialog__image img {
  display: block;
  width: 100%;
  height: 100%;
  max-height: calc(100vh - 48px);
  object-fit: cover;
  opacity: 0;
  transition: opacity 200ms ease-out;
}

.dialog__image img.is-ready {
  opacity: 1;
}

.dialog__info {
  display: flex;
  flex-direction: column;
  padding: 24px 32px 24px;
  overflow-y: auto;
}

.dialog__close {
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 1;
}

.dialog__id {
  margin: 8px 48px 0 0;
  font-size: 0.875rem;
  color: var(--muted);
}

.dialog__title {
  margin: 8px 0 0;
  font-size: 1.75rem;
  line-height: 1.2;
  font-weight: 600;
  letter-spacing: -0.01em;
}

.dialog__price {
  margin: 12px 0 0;
  font-size: 1.25rem;
  font-weight: 550;
  font-variant-numeric: tabular-nums;
}

.dialog__price-note {
  font-size: 0.875rem;
  font-weight: 400;
  color: var(--muted);
}

.dialog__description {
  margin: 20px 0 0;
  font-size: 1rem;
  line-height: 1.6;
}

.dialog__description--empty {
  color: var(--muted);
}

.specs {
  margin: 24px 0 0;
  border-top: 1px solid var(--line);
}

.specs__row {
  display: grid;
  grid-template-columns: 132px 1fr;
  gap: 16px;
  padding: 10px 0;
  border-bottom: 1px solid var(--line);
  font-size: 0.9375rem;
}

.specs dt {
  color: var(--muted);
}

.specs dd {
  margin: 0;
}

.button {
  display: inline-flex;
  align-items: center;
  min-height: 44px;
  align-self: flex-start;
  margin-top: 24px;
  padding: 10px 20px;
  border-radius: 6px;
  background: var(--accent);
  color: #fff;
  font-weight: 550;
  text-decoration: none;
}

.button:hover {
  background: var(--accent-strong);
}

.dialog__nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-top: auto;
  padding-top: 24px;
}

.dialog__count {
  font-size: 0.875rem;
  color: var(--muted);
}

.icon-button,
.text-button {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  border: 0;
  background: none;
  color: var(--ink);
  font: inherit;
  cursor: pointer;
  border-radius: 6px;
}

.icon-button {
  width: 44px;
  height: 44px;
  justify-content: center;
}

.text-button {
  min-height: 44px;
  padding: 8px 10px;
  font-weight: 550;
  font-size: 0.9375rem;
}

.icon-button:hover,
.text-button:hover:not(:disabled) {
  background: var(--well);
}

.icon-button,
.text-button,
.button {
  transition: background-color 150ms ease-out;
}

.text-button:disabled {
  color: var(--muted);
  opacity: 0.5;
  cursor: default;
}

.text-button:first-child {
  margin-left: -10px;
}

.text-button:last-child {
  margin-right: -10px;
}

@media (max-width: 759px) {
  .dialog {
    width: 100vw;
    max-height: 100vh;
    height: 100%;
    margin: 0;
    border-radius: 0;
  }

  @supports (height: 100dvh) {
    .dialog {
      max-height: 100dvh;
    }
  }

  .dialog__panel {
    display: block;
    height: 100%;
    max-height: none;
    overflow-y: auto;
  }

  .dialog__image img {
    max-height: 56vh;
    aspect-ratio: 4 / 5;
  }

  .dialog__info {
    padding: 16px 16px 24px;
    overflow: visible;
  }

  .dialog__close {
    position: fixed;
    background: var(--paper);
    box-shadow: 0 2px 8px rgba(16, 24, 32, 0.2);
    border-radius: 50%;
  }

  .dialog__id {
    margin-top: 0;
  }

  .dialog__title {
    font-size: 1.5rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  .dialog[open],
  .dialog[open]::backdrop,
  .dialog.is-closing,
  .dialog.is-closing::backdrop {
    animation: none;
  }

  .dialog__image img,
  .icon-button,
  .text-button,
  .button {
    transition: none;
  }
}
</style>
