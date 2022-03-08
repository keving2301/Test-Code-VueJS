<template>
  <div id="products-page">
    <div id="products-content">
      <div class="navbar">
        <h2 style="padding: 20px 0; font-weight: 200;color: #FFFFFF ">Products</h2>
      </div>
      <div class="product-grid">
        <div class="" style="height: 400px" v-for="p in products" :key="p.ProductId">
          <div class="card" @click="showProductModal(p)">
            <div class="image">
              <img class="thumbnail" :src="p.PhotoName" alt="Product Thumbnail">
            </div>
            <div class="chip">
              <h5 style="font-size: 13px; font-weight: 500">{{ p.ItemName }}</h5>
            </div>
          </div>
          <img class="thumbnail-company"
               :src="'http://images.repzio.com/productimages/' + p.ManufacturerID + '/logo' + p.ManufacturerID + '_lg.jpg'"
               alt="Product Thumbnail">
        </div>
      </div>
      <div class="footer">
        <h5 class="" style="padding: 20px 0 0 0; font-weight: 600">Company: <span>{{ companyname }}</span></h5>
        <h5 class="" style="padding: 5px 0 20px 0; font-weight: 600">Contact: <a
            class="email-link" :href="'mailto:' + contactemail">{{ contactemail }}</a></h5>
      </div>
    </div>

    <transition name="fade">
      <div v-if="showmodal">
        <div class="overlay" @click.self="showmodal = false;">
          <div class="modal">
            <i @click.self="showmodal = false;" class="fas fa-times-circle close-icon"></i>
            <div class="product-grid-modal">
              <div class="image-modal">
                <img class="thumbnail-modal" :src="selectedproduct.PhotoName" alt="Product Thumbnail">
              </div>
              <div class="product-info">
                <div class="product-info-details-group">
                  <div class="product-info-details">
                    <h4 class="product-info-details-category">Item ID </h4>
                    <h4>{{ selectedproduct.ItemID }}</h4>
                  </div>
                  <div class="product-info-details">
                    <h4 class="product-info-details-category">Item Name </h4>
                    <h4>{{ selectedproduct.ItemName }}</h4>
                  </div>
                  <div class="product-info-details">
                    <h4 class="product-info-details-category">Description </h4>
                    <h4>{{ selectedproduct.Description ? selectedproduct.Description : 'N/A' }}</h4>
                  </div>
                  <div class="product-info-details">
                    <h4 class="product-info-details-category">Dimensions </h4>
                    <h4>{{ selectedproduct.Dimensions }}</h4>
                  </div>
                  <div class="product-info-details">
                    <h4 class="product-info-details-category">Base Price </h4>
                    <h4>${{ formatMoney(selectedproduct.BasePrice) }}</h4>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>
    </transition>

  </div>
</template>

<script>
import productsData from "./Raw Data/test.json";
import './css/style.css'

export default {
  name: 'App',
  data() {
    return {
      companyname: '',
      products: [],
      selectedproduct: [],
      showmodal: false
    }
  },
  beforeMount() {
    console.log("Data: ", productsData)
    this.products = productsData.items;
    this.companyname = productsData.CompanyName;
    this.contactemail = productsData.EmailAddress;
  },
  watch: {
    showmodal() {
      document.getElementById("products-content").style.transition = '0.5s filter linear';
      if (this.showmodal)
        document.getElementById("products-content").style.filter = 'blur(4px)';
      else
        document.getElementById("products-content").style.filter = 'blur(0)';
    }
  },
  methods: {
    showProductModal(product) {
      this.selectedproduct = product;
      this.showmodal = true;
    },
    formatMoney(value) {
      return value.toFixed(2)
    }
  }

}
</script>

<style>
</style>
