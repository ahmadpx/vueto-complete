<template>
  <div
      class="autoComplete"
      :data-test-id="`${testKey}AutoCompleteContainer`"
      :style="allStyles.container"
  >
    <label
        :for="`${testKey}AutoCompleteInput`"
        :style="getInputWrapperStyles()"
        :data-test-id="`${testKey}AutoCompleteInputWrapper`"
        class="autoComplete__inputWrapper"
        :class="{
          'autoComplete__inputWrapper--focused': isInputFocused
        }"
    >
      <slot
          name="input-icon"
          :style="getInputIconStyles()"
          :data-test-id="`${testKey}AutoCompleteInputIcon`"
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
          @keyup.down="highlightDown"
          @keyup.up="highlightUp"
          @keyup.enter="handleSelect()"
          @focus="handleFocus"
          @blur="handleBlur"
          class="autoComplete__input"
          :class="{
            'autoComplete__input--focused': isInputFocused
          }"
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
          @click="handleSelect(index)"
          @mouseenter="highlightItem(index)"
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
import debounce from 'lodash/debounce';

/**
 * TODO:
 * 1. highlight keywords from search results that match the query
 * 4. base styling
 * 5. add different label from the wrapper for actual optional label
 * 2. tests
 */

/**
 * AutoComplete
 *
 * =PROPS=
 * @prop {Function} autoCompleteFetchHandler
 * @prop {Function} sortHandler
 * @prop {Function} filterHandler
 * @prop {Number} minCharsToFetch
 * @prop {Number} maxResultsToDisplay
 * @prop {String} placeholder
 * @prop {String} testKey
 * @prop {Boolean} emptyResultsOnEmptyQuery
 * @prop {Boolean} highlightResults
 * @prop {Object} styles
 *
 * =SLOTS=
 * @slot slot-scope = item [to control how to render autoComplete results]
 * @slot name = input-icon [to control how to render input icon]
 *
 * =EVENTS=
 * @event startedFetching [fired before fetch start]
 * @event fetchSuccess [fired on fetch success]
 * @event fetchError [fired on fetch error]
 * @event finishedFetching [fired after fetch resolve/reject]
 * @event select [fired on selecting autoComplete item]
 * @event inputFocus [fired on focusing the input]
 * @event inputBlur [fired on bluring the input]
 *
 * =STYLES=
 * @styleProp {Object} container
 * @styleProp {Object} input
 * @styleProp {Object} inputIcon
 * @styleProp {Object} inputWrapper
 * @styleProp {Object} focusedInput
 * @styleProp {Object} focusedInputIcon
 * @styleProp {Object} focusedInputWrapper
 * @styleProp {Object} resultsList
 * @styleProp {Object} resultItem
 * @styleProp {Object} highlightedItem
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
    debounceTime: {
      type: Number,
      default: 300,
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

  /**
   * computed
   */
  computed: {
    /**
     * compute all styles and fallback to empty object as default
     */
    allStyles() {
      return {
        container: this.styles.container || {},
        input: this.styles.input || {},
        inputIcon: this.styles.inputIcon || {},
        inputWrapper: this.styles.inputWrapper || {},
        focusedInput: this.styles.focusedInput || {},
        focusedInputIcon: this.styles.focusedInputIcon || {},
        focusedInputWrapper: this.styles.focusedInputWrapper || {},
        resultsList: this.styles.resultsList || {},
        resultItem: this.styles.resultItem || {},
        highlightedItem: this.styles.highlightedItem || {},
      };
    },
  },

  /**
   * methods
   */
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
      this.isInputFocused = true;
      this.$emit('inputFocus');
    },

    /**
     * handle blur
     */
    handleBlur() {
      this.showResults = true;
      this.isInputFocused = false;
      this.$emit('inputBlur');
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

  /**
   * mounted
   */
  mounted() {
    this.fetchResults = debounce(this.fetchResults, this.debounceTime);
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
