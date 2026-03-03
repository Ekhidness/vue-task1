Vue.component("product-details", {
  props: ["details"],
  template: `
    <ul>
      <li v-for="detail in details">{{ detail }}</li>
    </ul>
  `,
});
Vue.component("product", {
  template: `
    <div class="product">
      <div class="product-image">
        <img :src="image" :alt="altText" />
      </div>
      <div class="product-info">
        <h1>{{ title }}</h1>
        <p>{{ description }}</p>
        <p v-if="inStock >= 10">In stock</p>
        <p v-else-if="inStock > 0 && inStock < 10">Almost sold out</p>
        <p v-else :class="{ outStock: !inStock }">Out of stock</p>
        <span>{{ sale }}</span>
<       <p>Shipping: {{ shipping }}</p>
        <product-details :details="details"></product-details>
        <ul>
          <li v-for="size in sizes">{{ size }}</li>
        </ul>
        <div
          class="color-box"
          v-for="(variant, index) in variants"
          :key="variant.variantId"
          :style="{ backgroundColor: variant.variantColor }"
          @mouseover="updateProduct(index)"
        ></div>
        <div class="cart">
          <p>Cart({{ cart }})</p>
        </div>
        <button
          v-on:click="addToCart"
          :disabled="!inStock"
          :class="{ disabledButton: !inStock }"
        >
          Add to cart
        </button>
        <button v-on:click="removeFromCart">Remove from cart</button>
        <a :href="link">More products like this</a>
      </div>
    </div>
  `,
  props: {
    premium: {
      type: Boolean,
      required: true,
    },
  },

  data() {
    return {
      product: "Socks",
      brand: "Vue Mastery",
      description: "A pair of warm, fuzzy socks",
      selectedVariant: 0,
      altText: "A pair of socks",
      link: "https://www.amazon.com/s/ref=nb_sb_noss?url=search-alias%3Daps&field-keywords=socks",
      details: ["80% cotton", "20% polyester", "Gender-neutral"],
      variants: [
        {
          variantId: 2234,
          variantColor: "green",
          variantImage: "./assets/vmSocks-green-onWhite.jpg",
          variantQuantity: 9,
          onSale: true,
        },
        {
          variantId: 2235,
          variantColor: "blue",
          variantImage: "./assets/vmSocks-blue-onWhite.jpg",
          variantQuantity: 0,
          onSale: false,
        },
      ],
      sizes: ["S", "M", "L", "XL", "XXL", "XXXL"],
      cart: 0,
    };
  },
  methods: {
    addToCart() {
      this.cart += 1;
    },
    updateProduct(index) {
      this.selectedVariant = index;
      console.log(index);
    },
    removeFromCart() {
      this.cart -= 1;
      if (this.cart < 0) this.cart = 0;
    },
  },
  computed: {
    title() {
      return this.brand + " " + this.product;
    },
    image() {
      return this.variants[this.selectedVariant].variantImage;
    },
    inStock() {
      return this.variants[this.selectedVariant].variantQuantity;
    },
    sale() {
      if (this.variants[this.selectedVariant].onSale) {
        return (
          this.brand +
          " " +
          this.product +
          " " +
          this.variants[this.selectedVariant].variantColor +
          " is on sale!"
        );
      }
      return "";
    },
    shipping() {
      if (this.premium) {
        return "Free";
      } else {
        return 2.99;
      }
    },
  },
});

let app = new Vue({
  el: "#app",
  data: {
    premium: true,
  },
});
