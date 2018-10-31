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
      <template
          v-for="(item, index) in results"
          :data-test-id="`${testKey}AutoCompleteResultItem_${index}`"
      >
        
        <li
          v-if="useCategories && categoryKey && isCategoryStart(item)"
          :data-test-id="`${testKey}AutoCompleteCategory_${item[categoryKey]}`"
          :style="allStyles.categoryLabel"
          :key="`${item[categoryKey]}_${index}`"
        >
          {{item[categoryLabel] || item[categoryKey]}}
        </li>
        
        <li
            :key="item[searchKey]"
            @click="handleSelect(index)"
            :style="getItemStyles(index)"
            @mouseenter="highlightItem(index)"
            class="autoComplete__item"
            :class="{
            'autoComplete__item--highlighted': isHighlighted(index)
          }"
        >
          <slot name="item" :item="item">
          <!-- Fallback content -->
          <p v-if="highlightMatched && item.words && item.words.length">
            <slot name="item-icon" :item="item"></slot>
            
            <span v-for="(word, wordIndex) in item.words" :key="word + wordIndex">
              <span
                  v-if="wordIndex > 0"
                  class="autoComplete__itemMatched"
                  :style="getMatchedWordsStyles(index)"
              >{{ item.matchedWord }}</span><span>{{ word }}</span>
            </span>
  
            <slot name="item-caption" :item="item"></slot>
          </p>
          
          <p v-else>{{ item[searchKey] }}</p>
        </slot>
        </li>
      </template>
    </ul>
    
    <slot name="no-results">
      <div v-if="showNoResultsMessage && noResults">
        {{ noResultsMessage }}
      </div>
    </slot>
  </div>
</template>

<script>
import debounce from 'lodash/debounce';
import constants from './constants';

/**
 * TODO:
 * 2. base styling
 * 3. tests
 */

/**
 * AutoComplete
 *
 * =PROPS=
 * @prop {Function} fetchHandler
 * @prop {Array} autoCompleteList
 * @prop {String} searchKey
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
 * @prop {Boolean} useCategories
 * @prop {String} categoryKey
 * @prop {String} categoryLabel
 * @prop {String} initialValue
 * @prop {Object} styles
 *
 * =SLOTS=
 * @slot [name = input-icon] to control how to render input icon
 * @slot [name = input-label] to control how to render input label
 * @slot [name = item, slot-scope = item] to control how to render autoComplete results
 * @slot [name = item-icon, slot-scope = item] to control how to render item icon
 * @slot [name = item-label, slot-scope = item] to control how to render item label
 * @slot [name = no-results] to control how to render no results message
 *
 * =EVENTS=
 * @event startedFetching [fired before fetch start]
 * @event fetchSuccess [fired on fetch success]
 * @event fetchError [fired on fetch error]
 * @event finishedFetching [fired after fetch resolve/reject]
 * @event select [fired on selecting autoComplete item]
 * @event inputFocus [fired on focusing the input]
 * @event inputBlur [fired on bluring the input]
 * @event highlightItem [fired on bluring the input]
 * @event noResultsFound [fired on bluring the input]
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
 * @styleProp {Object} categoryLabel
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
    searchKey: {
      type: String,
      default: constants.SEARCH_KEY,
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
    useCategories: {
      type: Boolean,
      default: constants.USE_CATEGORIES,
    },
    categoryKey: {
      type: String,
    },
    categoryLabel: {
      type: String,
    },
    initialValue: {
      type: String,
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
        categoryLabel: this.styles.categoryLabel || {},
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
        results = this.formatResultsStructure(results);
        results = this.filterHandler ? this.filterHandler(results) : results;
        results = this.sortHandler ? this.sortHandler(results) : results;
        results = this.maxResultsToDisplay ? results.slice(0, this.maxResultsToDisplay) : results;
        results = this.highlightMatched ? results.map(this.markMatchedWords) : results;
        results = this.filteredResultsByQuery(results);
        this.results = results;

        this.$emit('fetchSuccess', results);

        if (!results.length && this.query.trim() !== '') {
          this.noResults = true;
          this.$emit('noResultsFound');
        }
      } catch (e) {
        this.$emit('fetchError', e);
      }
      this.$emit('finishedFetching');
    },

    /**
     * @prop {Array} results
     * @return {Array} results
     */
    formatResultsStructure(results) {
      return results.map((item, index) => {
        if (typeof item === 'string') {
          return {
            itemIndex: index,
            [this.searchKey]: item,
          };
        }

        return { ...item, itemIndex: index };
      });
    },

    /**
     * filter results by query
     */
    filteredResultsByQuery(results) {
      return results.filter(item => {
        const query = this.query.replace(/\./gi, '').trim();
        return query.length ? RegExp(query, 'gi').test(item[this.searchKey]) : false;
      });
    },

    /**
     * mark matched words
     * @param {Object} item
     * @returns {{...item, matchedWord, words}} item
     */
    markMatchedWords(item) {
      const title = item[this.searchKey];
      const matchedIndex = title.toLowerCase().indexOf(this.query.toLowerCase());
      const matchedWord = matchedIndex < 0 ? '' : title.slice(matchedIndex, matchedIndex + this.query.length);
      const words = title.split(new RegExp(this.query, 'i'));

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
      this.query = selectedItem[this.searchKey];
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
      this.autoComplete();
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
      this.$emit('highlightItem', index);
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
     * is category start
     * @param {Object} item
     * @return {Boolean} true
     */
    isCategoryStart(item) {
      const prevItem = this.results[item.itemIndex - 1] || {};
      return item[this.categoryKey] !== prevItem[this.categoryKey];
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

    if (this.initialValue) {
      this.query = this.initialValue;
    }
  },
};
</script>

<style lang="scss" scoped>
.autoComplete {
  * {
    box-sizing: border-box;
  }

  &__input {
    &--focused {
      background: yellow;
    }
  }

  &__list {
    list-style: none;
    padding: 0;
    margin: 2px 0 0;
  }

  &__item {
    p {
      margin: 0;
    }

    &--highlighted {
      color: blue;
    }
  }
  &__itemMatched {
    color: blue;
  }
}
</style>
