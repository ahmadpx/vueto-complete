<template>
  <div
      class="autoComplete"
      :data-test-id="`${testKey}AutoCompleteContainer`"
      :style="allStyles.container"
  >
    <label
        :for="`${testKey}AutoCompleteInput`"
        :style="getInputWrapperStyles()"
        class="autoComplete__inputWrapper"
        :class="{
            'autoComplete__inputWrapper--focused': isInputFocused
          }"
    >
      <slot
          name="input-icon"
          :style="getInputIconStyles()"
          class="autoComplete__inputIcon"
          :class="{
            'autoComplete__inputIcon--focused': isInputFocused
          }"
      ></slot>
      <input
          :id="`${testKey}AutoCompleteInput`"
          type="text"
          v-model="query"
          @input="fetchResults"
          :placeholder="placeholder"
          :data-test-id="`${testKey}AutoCompleteInput`"
          :style="getInputStyles()"
          class="autoComplete__input"
          :class="{
            'autoComplete__input--focused': isInputFocused
          }"
          @keyup.down="highlightDown"
          @keyup.up="highlightUp"
          @keyup.enter="handleSelect()"
          @focus="handleFocus"
          @blur="toggleFocus(false)"
      />
    </label>
    
    <ul
        v-if="showResults && results.length"
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
          @click="handleSelect(index)"
          @mouseenter="highlightItem(index)"
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
 * 4. tests
 * 5. documentation [props, events, styling]
 * 7. debounce fetching
 * 8. base styling
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
  name: 'AutoComplete',
  props: {
    autoCompleteFetchHandler: {
      type: Function,
      required: true,
    },
    sortHandler: {
      type: Function,
    },
    filterHandler: {
      type: Function,
    },
    minCharsToFetch: {
      type: Number,
      default: 2,
    },
    maxResultsToDisplay: {
      type: Number,
    },
    placeholder: {
      type: String,
      default: '',
    },
    emptyResultsOnEmptyQuery: {
      type: Boolean,
      default: true,
    },
    testKey: {
      type: String,
      default: '',
    },
    highlightResults: {
      type: Boolean,
      default: true,
    },
    styles: {
      type: Object,
      default: () => ({}),
    },
  },
  data: () => ({
    query: '',
    results: [],
    highlightedItem: 0,
    showResults: false,
    isInputFocused: false,
  }),
  computed: {
    /**
     * compute all styles and fallback to empty object as default
     */
    allStyles() {
      return {
        container: this.styles.container ? this.styles.container : {},
        input: this.styles.input ? this.styles.input : {},
        inputIcon: this.styles.inputIcon ? this.styles.inputIcon : {},
        inputWrapper: this.styles.inputWrapper ? this.styles.inputWrapper : {},
        focusedInput: this.styles.focusedInput ? this.styles.focusedInput : {},
        focusedInputIcon: this.styles.focusedInputIcon ? this.styles.focusedInputIcon : {},
        focusedInputWrapper: this.styles.focusedInputWrapper ? this.styles.focusedInputWrapper : {},
        resultsList: this.styles.resultsList ? this.styles.resultsList : {},
        resultItem: this.styles.resultItem ? this.styles.resultItem : {},
        highlightedItem: this.styles.highlightedItem ? this.styles.highlightedItem : {},
      };
    },
  },
  methods: {
    /**
     * fetch results
     * @returns {Promise<void>}
     */
    async fetchResults() {
      this.showResults = true;

      if (this.emptyResultsOnEmptyQuery && this.query === '') {
        this.results = [];
        this.showResults = false;
        return;
      }

      if (this.query.length < this.minCharsToFetch) return;

      try {
        this.$emit('startedFetching');

        let results = await this.autoCompleteFetchHandler(this.query);
        results = this.filterHandler ? this.filterHandler(results) : results;
        results = this.sortHandler ? this.sortHandler(results) : results;
        results = this.maxResultsToDisplay ? results.slice(0, this.maxResultsToDisplay) : results;
        this.results = results;

        this.$emit('fetchSuccess', results);
      } catch (e) {
        this.$emit('fetchError', e);
      }
      this.$emit('finishedFetching');
    },

    /**
     * get highlighted item
     */
    getHighlightedItem() {
      if (!this.results.length) return;
      return this.results[this.highlightedItem];
    },

    /**
     * handle item select
     */
    handleSelect(index) {
      if (index) {
        this.highlightedItem = index;
      }
      const selectedItem = this.getHighlightedItem();
      this.query = selectedItem.name;
      this.$emit('select', this.getHighlightedItem());
      this.showResults = false;
    },

    /**
     * handle focus
     */
    handleFocus() {
      this.showResults = true;
      this.toggleFocus(true);
    },

    /**
     * highlight item
     * @param {Number} index
     */
    highlightItem(index) {
      this.highlightedItem = index;
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
      this.highlightedItem = this.results.length > nextHighlightedItem ? nextHighlightedItem : 0;
    },

    /**
     * highlight up
     */
    highlightUp() {
      const nextHighlightedItem = this.highlightedItem - 1;
      this.highlightedItem = nextHighlightedItem === -1 ? this.results.length - 1 : nextHighlightedItem;
    },

    /**
     * get item styles [normal and highlighted]
     * @param {Number} index highlighted
     * @returns {Object} styles
     */
    getItemStyles(index) {
      return {
        ...this.allStyles.resultItem,
        ...(this.isHighlighted(index) ? this.allStyles.highlightedItem : {}),
      };
    },

    /**
     * toggle focus
     * @param {Boolean} focusState
     */
    toggleFocus(focusState) {
      this.isInputFocused = focusState;
    },

    /**
     * get input styles [normal and focused]
     */
    getInputStyles() {
      return {
        ...this.allStyles.input,
        ...(this.isInputFocused ? this.allStyles.focusedInput : {}),
      };
    },

    /**
     * get input styles [normal and focused]
     */
    getInputWrapperStyles() {
      return {
        ...this.allStyles.inputWrapper,
        ...(this.isInputFocused ? this.allStyles.focusedInputWrapper : {}),
      };
    },

    /**
     * get input styles [normal and focused]
     */
    getInputIconStyles() {
      return {
        ...this.allStyles.inputIcon,
        ...(this.isInputFocused ? this.allStyles.focusedInputIcon : {}),
      };
    },
  },
};
</script>

<style lang="scss" scoped>
.autoComplete {
  &__input {
    &--focused {
      background: yellow;
    }
  }
  &__item {
    &--highlighted {
      color: blue;
    }
  }
}
</style>
