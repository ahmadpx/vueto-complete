<template>
  <div
      class="autoComplete"
      :data-test-id="`${testKey}AutoCompleteContainer`"
      :style="allStyles.container"
  >
    <div
        :style="getInputWrapperStyles()"
        :data-test-id="`${testKey}AutoCompleteInputWrapper`"
        class="autoComplete__inputWrapper"
        :class="{
          'autoComplete__inputWrapper--focused': isInputFocused
        }"
    >
      <label
          :for="`${testKey}AutoCompleteInput`"
          :style="getInputLabelStyles()"
          :data-test-id="`${testKey}AutoCompleteInputLabel`"
          class="autoComplete__inputLabel"
          :class="{
            'autoComplete__inputLabel--focused': isInputFocused
          }"
      >
        <slot name="input-label"></slot>
      </label>
      
      <slot name="input-icon"></slot>
      
      <input
          :id="`${testKey}AutoCompleteInput`"
          type="text"
          v-model="query"
          @input="autoComplete"
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
    </div>
    
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
          <p v-if="highlightMatched && item.words && item.words.length">
            <span v-for="(word, wordIndex) in item.words" :key="word + wordIndex">
              <span
                  v-if="wordIndex > 0"
                  class="autoComplete__itemMatched"
                  :style="getMatchedWordsStyles(index)"
              >{{ item.matchedWord }}</span><span>{{ word }}</span>
            </span>
          </p>
          <p v-else>{{ item.name }}</p>
        </slot>
      </li>
    </ul>
    
    <div v-if="showNoResultsMessage && noResults">
      {{ noResultsMessage }}
    </div>
  </div>
</template>

<script>
import debounce from 'lodash/debounce';
import constants from './constants';

/**
 * TODO:
 * 1. add anchor to be instead of the <name> and make it optional
 * 1. add a slot for the item icon and make the scope is the item also
 * 1. multiple selection
 * 4. base styling
 * 2. tests
 */

/**
 * AutoComplete
 *
 * =PROPS=
 * @prop {Function} fetchHandler
 * @prop {Array} autoCompleteList
 * @prop {Function} sortHandler
 * @prop {Function} filterHandler
 * @prop {Number} minCharsToAutoComplete
 * @prop {Number} maxResultsToDisplay
 * @prop {Number} debounceTime
 * @prop {Boolean} highlightMatched
 * @prop {String} placeholder
 * @prop {Boolean} noResultsMessage
 * @prop {String} showNoResultsMessage
 * @prop {String} testKey
 * @prop {Boolean} emptyResultsOnEmptyQuery
 * @prop {Boolean} highlightResults
 * @prop {Object} styles
 *
 * =SLOTS=
 * @slot slot-scope = item [to control how to render autoComplete results]
 * @slot name = input-icon [to control how to render input icon]
 * @slot name = input-label [to control how to render input label]
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
 * @styleProp {Object} focusedInput
 * @styleProp {Object} inputWrapper
 * @styleProp {Object} focusedInputWrapper
 * @styleProp {Object} inputLabel
 * @styleProp {Object} focusedInputLabel
 * @styleProp {Object} resultsList
 * @styleProp {Object} resultItem
 * @styleProp {Object} highlightedItem
 * @styleProp {Object} matchedWords
 * @styleProp {Object} highlightedMatchedWords
 */
export default {
  name: 'AutoComplete',
  props: {
    fetchHandler: {
      type: Function,
    },
    autoCompleteList: {
      type: Array,
      default: () => [],
    },
    sortHandler: {
      type: Function,
    },
    filterHandler: {
      type: Function,
    },
    minCharsToAutoComplete: {
      type: Number,
      default: constants.MIN_CHARS_TO_AUTOCOMPLETE_RESULTS,
    },
    debounceTime: {
      type: Number,
      default: constants.DEBOUNCE_TIME,
    },
    highlightMatched: {
      type: Boolean,
      default: constants.HIGHLIGHT_MATCHED_WORDS,
    },
    maxResultsToDisplay: {
      type: Number,
    },
    placeholder: {
      type: String,
      default: constants.DEFAULT_PLACEHOLDER,
    },
    noResultsMessage: {
      type: String,
      default: constants.NO_RESULTS_MESSAGE,
    },
    showNoResultsMessage: {
      type: Boolean,
      default: constants.SHOW_NO_RESULTS_MESSAGE,
    },
    emptyResultsOnEmptyQuery: {
      type: Boolean,
      default: constants.EMPTY_RESULTS_ON_EMPTY_QUERY,
    },
    testKey: {
      type: String,
      default: constants.DEFAULT_TEST_KEY,
    },
    highlightResults: {
      type: Boolean,
      default: constants.HIGHLIGHT_RESULTS,
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
    noResults: false,
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
        focusedInput: this.styles.focusedInput || {},
        inputWrapper: this.styles.inputWrapper || {},
        focusedInputWrapper: this.styles.focusedInputWrapper || {},
        inputLabel: this.styles.inputLabel || {},
        focusedInputLabel: this.styles.focusedInputLabel || {},
        resultsList: this.styles.resultsList || {},
        resultItem: this.styles.resultItem || {},
        highlightedItem: this.styles.highlightedItem || {},
        matchedWords: this.styles.matchedWords || {},
        highlightedMatchedWords: this.styles.highlightedMatchedWords || {},
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
    async autoComplete() {
      this.showResults = true;
      this.noResults = false;

      if (this.emptyResultsOnEmptyQuery && this.query.trim() === '') {
        this.showResults = false;
        return;
      }

      this.results = this.highlightMatched ? this.results.map(this.markMatchedWords) : this.results;

      if (this.query.length < this.minCharsToAutoComplete) return;

      try {
        this.$emit('startedFetching');

        let results = this.autoCompleteList.length ? this.autoCompleteList : await this.fetchHandler(this.query);
        results = results.map(this.formatResultItemStructure);
        results = results.map(this.formatResultItemStructure);
        results = this.filterHandler ? this.filterHandler(results) : results;
        results = this.sortHandler ? this.sortHandler(results) : results;
        results = this.maxResultsToDisplay ? results.slice(0, this.maxResultsToDisplay) : results;
        results = this.highlightMatched ? results.map(this.markMatchedWords) : results;
        results = this.filteredResultsByQuery(results);
        this.results = results;

        this.$emit('fetchSuccess', results);

        if (!results.length && this.query.trim() !== '') {
          this.noResults = true;
        }
      } catch (e) {
        this.$emit('fetchError', e);
      }
      this.$emit('finishedFetching');
    },

    /**
     * @prop {string|object} item
     * @return {Object} item
     */
    formatResultItemStructure(item) {
      if (typeof item === 'string') {
        return {
          name: item,
        };
      }

      return item;
    },

    /**
     * filter results by query
     */
    filteredResultsByQuery(results) {
      return results.filter(item => {
        const query = this.query.replace(/\./gi, '').trim();
        return query.length ? RegExp(query, 'gi').test(item.name) : false;
      });
    },

    /**
     * mark matched words
     * @param {Object} item
     * @returns {{...item, words}} item
     */
    markMatchedWords(item) {
      const { name } = item;
      const matchedIndex = name.toLowerCase().indexOf(this.query.toLowerCase());
      const matchedWord = matchedIndex < 0 ? '' : name.slice(matchedIndex, matchedIndex + this.query.length);
      const words = name.split(new RegExp(this.query, 'i'));

      return {
        ...item,
        matchedWord,
        words,
      };
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
      this.noResults = false;
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
     * get matched words styles [normal, highlighted]
     * @param {Number} index highlighted
     * @returns {Object} styles
     */
    getMatchedWordsStyles(index) {
      return {
        ...this.allStyles.matchedWords,
        ...(this.isHighlighted(index) ? this.allStyles.highlightedMatchedWords : {}),
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
    getInputLabelStyles() {
      return {
        ...this.allStyles.inputLabel,
        ...(this.isInputFocused ? this.allStyles.focusedInputLabel : {}),
      };
    },
  },

  /**
   * mounted
   */
  mounted() {
    const debounceTime = this.autoCompleteList.length ? 0 : this.debounceTime;
    this.autoComplete = debounce(this.autoComplete, debounceTime);
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
  &__itemMatched {
    color: blue;
  }
}
</style>
