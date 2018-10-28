<template>
  <div
      class="autoComplete"
      :data-test-id="`${testKey}AutoCompleteContainer`"
      :style="allStyles.container"
  >
    <input
        type="text"
        v-model="query"
        @input="fetchResults"
        :data-test-id="`${testKey}AutoCompleteInput`"
        :style="allStyles.input"
        class="autoComplete__input"
        @keyup.down="highlightDown"
        @keyup.up="highlightUp"
    />
    
    <ul
        v-if="results.length"
        :data-test-id="`${testKey}AutoCompleteResultsList`"
        :style="allStyles.resultsList"
        class="autoComplete__list"
    >
      <li
          v-for="(item, index) in results"
          :data-test-id="`${testKey}AutoCompleteResultItem_${index}`"
          :key="item.name"
          :style="getItemStyles(index)"
          class="autoComplete__item"
          :class="{
            'autoComplete__item--highlighted': isHighlighted(index)
          }"
      >
        <slot :item="item">
          <!-- Fallback content -->
          {{ item.name }}
        </slot>
      </li>
    </ul>
  </div>
</template>

<script>
/**
 * TODO:
 * 1. highlight keywords from search results that match the query
 * 3. add index for the whole component for test keys
 * 4. tests
 * 5. documentation [props, events, styling]
 * 6. @select event
 * 7. debounce fetching
 * 8. base styling
 * 9. add wrapper for the input to add an icon and to be optional
 * 10. add label for the input
 * 11. sorting results
 * 12 filtering results
 */

/**
 * AutoComplete
 *
 * @prop {Function} autoCompleteFetchHandler
 * @prop {Number} minCharsToFetch
 * @prop {Boolean} emptyResultsOnEmptyQuery
 * @prop {String} testKey [for automation testing]
 */
export default {
  name: "AutoComplete",
  props: {
    autoCompleteFetchHandler: {
      type: Function,
      required: true
    },
    minCharsToFetch: {
      type: Number,
      default: 2
    },
    maxResultsToDisplay: {
      type: Number
    },
    emptyResultsOnEmptyQuery: {
      type: Boolean,
      default: true
    },
    testKey: {
      type: String,
      default: ""
    },
    highlightResults: {
      type: Boolean,
      default: true
    },
    styles: {
      type: Object,
      default: () => ({
        container: {},
        input: {},
        resultsList: {},
        resultItem: {},
        highlightedItem: {}
      })
    }
  },
  data: () => ({
    query: "",
    results: [],
    highlightedItem: 0
  }),
  computed: {
    /**
     * compute all styles and fallback to empty object as default
     */
    allStyles() {
      return {
        container: this.styles.container ? this.styles.container : {},
        input: this.styles.input ? this.styles.input : {},
        resultsList: this.styles.resultsList ? this.styles.resultsList : {},
        resultItem: this.styles.resultItem ? this.styles.resultItem : {},
        highlightedItem: this.styles.highlightedItem
          ? this.styles.highlightedItem
          : {}
      };
    }
  },
  methods: {
    /**
     * fetch results
     * @returns {Promise<void>}
     */
    async fetchResults() {
      if (this.emptyResultsOnEmptyQuery && this.query === "") {
        this.results = [];
        return;
      }

      if (this.query.length < this.minCharsToFetch) return;

      try {
        this.$emit("startedFetching");
        const results = await this.autoCompleteFetchHandler(this.query);
        this.results = this.maxResultsToDisplay
          ? results.slice(0, this.maxResultsToDisplay)
          : results;
        this.$emit("fetchSuccess", this.results);
      } catch (e) {
        this.$emit("fetchError", e);
      }
      this.$emit("finishedFetching");
    },

    /**
     * highlight the current result
     * @param {Number} index
     * @returns {boolean} is highlighted
     */
    isHighlighted(index) {
      return this.highlightResults && this.highlightedItem === index;
    },

    /**
     * highlight down
     */
    highlightDown() {
      const nextHighlightedItem = this.highlightedItem + 1;
      this.highlightedItem =
        this.results.length > nextHighlightedItem ? nextHighlightedItem : 0;
    },

    /**
     * highlight up
     */
    highlightUp() {
      const nextHighlightedItem = this.highlightedItem - 1;
      this.highlightedItem =
        nextHighlightedItem === -1
          ? this.results.length - 1
          : nextHighlightedItem;
    },

    /**
     * get item styles [normal and highlighted]
     * @param {Number} index highlighted
     * @returns {Object} styles
     */
    getItemStyles(index) {
      return {
        ...this.allStyles.resultItem,
        ...(this.isHighlighted(index) ? this.allStyles.highlightedItem : {})
      };
    }
  }
};
</script>

<style lang="scss" scoped>
.autoComplete {
  &__item {
    &--highlighted {
      color: blue;
    }
  }
}
</style>
