<template>
  <button type="button" class="card" :aria-label="`${product.ItemName}, ${price}. Show details`" @click="$emit('open', $event.currentTarget)">
    <span class="card__image">
      <img :src="product.PhotoName" alt="" width="960" height="1200" loading="lazy" decoding="async" />
    </span>
    <span class="card__name">{{ product.ItemName }}</span>
    <span class="card__meta">
      <span class="card__id">{{ product.ItemID }}</span>
      <span class="card__price">{{ price }}</span>
    </span>
  </button>
</template>

<script>
import { formatMoney } from '../format';

export default {
  name: 'ProductCard',
  props: {
    product: { type: Object, required: true },
  },
  emits: ['open'],
  computed: {
    price() {
      return formatMoney(this.product.BasePrice);
    },
  },
};
</script>

<style scoped>
.card {
  display: block;
  width: 100%;
  padding: 0;
  border: 0;
  background: none;
  color: inherit;
  font: inherit;
  text-align: left;
  cursor: pointer;
  border-radius: 6px;
}

.card:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 4px;
}

.card__image {
  display: block;
  aspect-ratio: 4 / 5;
  border-radius: 6px;
  overflow: hidden;
  background: var(--well);
}

.card__image img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.card__name {
  display: block;
  margin-top: 12px;
  font-size: 1rem;
  font-weight: 550;
  line-height: 1.35;
}

.card:hover .card__name {
  text-decoration: underline;
  text-underline-offset: 3px;
}

.card__meta {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  margin-top: 4px;
  font-size: 0.875rem;
}

.card__id {
  color: var(--muted);
}

.card__price {
  font-weight: 550;
  font-variant-numeric: tabular-nums;
}

@media (max-width: 599px) {
  .card__name {
    margin-top: 8px;
    font-size: 0.9375rem;
  }

  .card__meta {
    display: block;
    font-size: 0.8125rem;
  }

  .card__price {
    display: block;
    margin-top: 2px;
    font-size: 0.875rem;
  }
}
</style>
