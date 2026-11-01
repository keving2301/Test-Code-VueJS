<template>
  <a class="skip-link" href="#products">Skip to products</a>
  <header class="masthead">
    <div class="container masthead__inner">
      <p class="masthead__brand">{{ company }}</p>
      <a class="masthead__contact" :href="`mailto:${email}`">{{ email }}</a>
    </div>
  </header>

  <main id="products" class="container page" tabindex="-1">
    <div class="intro">
      <h1 class="intro__title">{{ title }}</h1>
      <p class="intro__message">{{ message }}</p>
    </div>

    <ul v-if="products.length" class="grid" aria-label="Products">
      <li v-for="(product, index) in products" :key="product.ProductID">
        <product-card :product="product" @open="open(index)" />
      </li>
    </ul>
    <p v-else class="empty">No products in this line sheet yet.</p>
  </main>

  <footer class="footer">
    <div class="container footer__inner">
      <span>{{ company }} is a fictional company. Product photos from Unsplash.</span>
      <span>A demo by <a href="https://kevingarcia.dev" rel="noopener">Kevin Garcia</a></span>
    </div>
  </footer>

  <product-dialog
    :product="selected"
    :position="selectedIndex + 1"
    :total="products.length"
    :email="email"
    @close="selectedIndex = -1"
    @step="step"
  />
</template>

<script>
import lineSheet from './data/line-sheet.json';
import ProductCard from './components/ProductCard.vue';
import ProductDialog from './components/ProductDialog.vue';

export default {
  name: 'App',
  components: { ProductCard, ProductDialog },
  data: () => ({
    company: lineSheet.CompanyName,
    email: lineSheet.EmailAddress,
    title: lineSheet.Title || 'Products',
    message: lineSheet.Message || '',
    products: Array.isArray(lineSheet.items) ? lineSheet.items : [],
    selectedIndex: -1,
  }),
  computed: {
    selected() {
      return this.products[this.selectedIndex] || null;
    },
  },
  methods: {
    open(index) {
      this.selectedIndex = index;
    },
    step(direction) {
      const next = this.selectedIndex + direction;
      if (next >= 0 && next < this.products.length) this.selectedIndex = next;
    },
  },
};
</script>
