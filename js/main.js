let eventBus = new Vue();

Vue.component("product", {
  template: `
    <div class="product">
	    <div class="product-image">
            <img :src="image" :alt="altText"/>
        </div>
        <div class="product-info">
            <h1>{{ title }}</h1>
            <span v-show="onSale">{{ sale }}</span>
            <p>Price: {{ this.variants[this.selectedVariant].variantPrice }}$</p>
            <p v-if="inStock > 10">In stock</p>
            <p v-else-if="inStock <= 10 && inStock > 0">Almost sold out!</p>
            <p v-else :class="{ outStock: !inStock }">Out of Stock</p>
            <div
                    class="color-box"
                    v-for="(variant, index) in variants"
                    :key="variant.variantId"
                    :style="{ backgroundColor:variant.variantColor }"
                    @mouseover="updateProduct(index)"
            ></div>
            <ul>
                <li v-for="size in sizes">{{ size }}</li>
            </ul>
            <p>{{ description }}</p>
            <button
                    v-on:click="addToCart"
                    :disabled="!inStock"
                    :class="{ disabledButton: !inStock }"
            >
                Add to cart
            </button>
            <button @click="removeFromCart">Remove from cart</button>
            <a :href="link">More products like this</a>
        </div>
        <product-tabs :reviews="reviews" :shipping="shipping" :details="details"></product-tabs>
    </div>
    `,
  props: {
    premium: { type: Boolean, required: true },
  },
  data() {
    return {
      product: "Socks",
      brand: "Vue Mastery",
      description: "A pair of warm, fuzzy socks",
      selectedVariant: 0,
      altText: "A pair of socks",
      link: "https://www.amazon.com",
      onSale: true,
      details: ["80% cotton", "20% polyester", "Gender-neutral"],
      variants: [
        {
          variantId: 2234,
          variantColor: "green",
          variantImage: "./assets/vmSocks-green-onWhite.jpg",
          variantQuantity: 80,
          variantPrice: 15,
        },
        {
          variantId: 2235,
          variantColor: "blue",
          variantImage: "./assets/vmSocks-blue-onWhite.jpg",
          variantQuantity: 42,
          variantPrice: 12,
        },
      ],
      sizes: ["S", "M", "L", "XL", "XXL", "XXXL"],
      reviews: [],
    };
  },
  methods: {
    addToCart() {
      this.$emit("add-to-cart", this.variants[this.selectedVariant]);
    },
    removeFromCart() {
      this.$emit(
        "remove-from-cart",
        this.variants[this.selectedVariant].variantId,
      );
    },
    updateProduct(index) {
      this.selectedVariant = index;
    },
    saveReviews() {
      localStorage.setItem("product-reviews", JSON.stringify(this.reviews));
    },
  },
  mounted() {
    const savedReviews = localStorage.getItem("product-reviews");
    if (savedReviews) {
      this.reviews = JSON.parse(savedReviews);
    }
    eventBus.$on("review-submitted", (productReview) => {
      this.reviews.push(productReview);
      this.saveReviews();
    });
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
      return this.onSale
        ? this.brand + " " + this.product + " is on sale"
        : this.brand + " " + this.product + " is not on sale";
    },
    shipping() {
      return this.premium ? "Free" : 2.99;
    },
  },
});

Vue.component("product-details", {
  template: `<ul><li v-for="detail in details">{{ detail }}</li></ul>`,
  props: { details: { type: Array, required: true } },
});

Vue.component("product-review", {
  template: `
        <form class="review-form" @submit.prevent="onSubmit">
            <p v-if="errors.length">
                <b>Please correct the following error(s):</b>
                <ul><li v-for="error in errors">{{ error }}</li></ul>
            </p>
            <p><label for="name">Name:</label><input id="name" v-model="name"></p>
            <p><label for="review">Review:</label><textarea id="review" v-model="review"></textarea></p>
            <p>
                <label for="rating">Rating:</label>
                <select id="rating" v-model.number="rating">
                    <option>5</option><option>4</option><option>3</option><option>2</option><option>1</option>
                </select>
            </p>
            <p>Would you recommend this product?</p>
            <div><label for="yes">yes</label><input type="radio" value="yes" v-model="recommend" id="yes"/></div>
            <div><label for="no">no</label><input type="radio" value="no" v-model="recommend" id="no"/></div>
            <p><input type="submit" value="Submit"></p>
        </form>
    `,
  data() {
    return {
      name: null,
      review: null,
      rating: null,
      recommend: null,
      errors: [],
    };
  },
  methods: {
    onSubmit() {
      this.errors = [];
      if (this.name && this.review && this.rating && this.recommend) {
        eventBus.$emit("review-submitted", {
          name: this.name,
          review: this.review,
          rating: this.rating,
          recommend: this.recommend,
        });
        this.name = this.review = this.rating = this.recommend = null;
      } else {
        if (!this.name) this.errors.push("Name required.");
        if (!this.review) this.errors.push("Review required.");
        if (!this.rating) this.errors.push("Rating required.");
        if (!this.recommend) this.errors.push("Recommend required.");
      }
    },
  },
});

Vue.component("product-tabs", {
  template: `
        <div>
            <ul>
                <span class="tab" :class="{ activeTab: selectedTab === tab }"
                    v-for="(tab, index) in tabs" @click="selectedTab = tab">{{ tab }}</span>
            </ul>
            <div v-show="selectedTab === 'Reviews'">
                <p v-if="!reviews.length">There are no reviews yet.</p>
                <ul><li v-for="review in reviews"><p>{{ review.name }}</p><p>Rating: {{ review.rating }}</p><p>{{ review.review }}</p></li></ul>
            </div>
            <div v-show="selectedTab === 'Make a Review'"><product-review></product-review></div>
            <div v-show="selectedTab === 'Shipping'"><p>Shipping Cost: {{ shipping }}</p></div>
            <div v-show="selectedTab === 'Details'"><product-details :details="details"></product-details></div>
        </div>
    `,
  props: ["reviews", "shipping", "details"],
  data() {
    return {
      tabs: ["Reviews", "Make a Review", "Shipping", "Details"],
      selectedTab: "Reviews",
    };
  },
});

let app = new Vue({
  el: "#app",
  data: {
    premium: true,
    greenSocks: [],
    blueSocks: [],
  },
  computed: {
    totalPrice() {
      let totalItems = this.greenSocks.length + this.blueSocks.length;
      if (totalItems === 0) return 0;

      let shippingCost = this.premium ? 0 : 2.99;

      let greenPaid =
        this.greenSocks.length - Math.floor(this.greenSocks.length / 3);
      let bluePaid =
        this.blueSocks.length - Math.floor(this.blueSocks.length / 3);

      let total = greenPaid * 15 + bluePaid * 12;
      return (total + shippingCost).toFixed(2);
    },
  },
  methods: {
    updateCart(variant) {
      if (variant.variantId === 2234) this.greenSocks.push(variant);
      else if (variant.variantId === 2235) this.blueSocks.push(variant);
    },
    removeFromCart(variantId) {
      if (variantId === 2234) this.greenSocks.pop();
      else if (variantId === 2235) this.blueSocks.pop();
    },
  },
});
