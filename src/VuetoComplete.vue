<template>
  <div
      class="autoComplete"
      ref="autoCompleteContainer"
      :data-test-id="`${testId}AutoCompleteContainer`"
      :style="allStyles.container"
  >
    <div
        :style="getInputWrapperStyles()"
        :data-test-id="`${testId}AutoCompleteInputWrapper`"
        class="autoComplete__inputWrapper"
        :class="{
          'autoComplete__inputWrapper--focused': isInputFocused
        }"
    >
      <label
          :for="`${testId}AutoCompleteInput`"
          :style="getInputLabelStyles()"
          :data-test-id="`${testId}AutoCompleteInputLabel`"
          class="autoComplete__inputLabel"
          :class="{
            'autoComplete__inputLabel--focused': isInputFocused
          }"
      >
        <slot name="input-label"></slot>
      </label>
      
      <slot name="input-icon"></slot>
      
      <input
          :id="`${testId}AutoCompleteInput`"
          type="text"
          v-model="query"
          @input="autoComplete"
          :placeholder="placeholder"
          :data-test-id="`${testId}AutoCompleteInput`"
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
  
      <slot name="loading-icon">
        <div v-if="showLoadingIcon && fetching" class="autoComplete__inputLoaderIcon lds-roller">
          <div v-for="dot in 8" :key="dot"></div>
        </div>
      </slot>
    </div>
    
    <ul
        v-if="showResults && results.length"
        :data-test-id="`${testId}AutoCompleteResultsList`"
        :style="allStyles.resultsList"
        class="autoComplete__list"
    >
      <template
          v-for="(item, index) in results"
          :data-test-id="`${testId}AutoCompleteResultItem_${index}`"
      >
        
        <li
          v-if="useCategories && categoryKey && isCategoryStart(item)"
          :data-test-id="`${testId}AutoCompleteCategory_${item[categoryKey]}`"
          class="autoComplete__categoryLabel"
          :style="allStyles.categoryLabel"
          :key="`${item[categoryKey]}_${index}`"
        >
          {{item[categoryLabel] || item[categoryKey]}}
        </li>
        
        <li
            :key="`${item.formattedDisplayTitle}_${index}`"
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
          
          <p v-else>{{ item.formattedDisplayTitle }}</p>
        </slot>
        </li>
      </template>
    </ul>
    
    <slot name="no-results">
      <div class="autoComplete__noResults" v-if="showNoResultsMessage && noResults">
        {{ noResultsMessage }}
      </div>
    </slot>
  </div>
</template>

<script>
import debounce from 'lodash.debounce';
import constants from './constants';

/**
 * TODO:
 * 2. rtl support
 * 3. tests
 */

/**
 * AutoComplete
 *
 * =PROPS=
 * @prop {Function} fetchHandler
 * @prop {Array} autoCompleteList
 * @prop {String} displayKey
 * @prop {Array | String} searchKeys
 * @prop {Function} sortHandler
 * @prop {Function} filterHandler
 * @prop {Function} resultsDisplayFormatHandler
 * @prop {Function} selectedItemFormatHandler
 * @prop {Number} minCharsToAutoComplete
 * @prop {Number} maxResultsToDisplay
 * @prop {Number} debounceTime
 * @prop {Boolean} highlightMatched
 * @prop {Boolean} showLoadingIcon
 * @prop {Boolean} fetchOnFocus
 * @prop {String} placeholder
 * @prop {Boolean} noResultsMessage
 * @prop {String} showNoResultsMessage
 * @prop {String} testId
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
 * @slot [name = item-caption, slot-scope = item] to control how to render item caption
 * @slot [name = no-results] to control how to render no results message
 * @slot [name = loading-icon] to control how to render loading icon
 *
 * =EVENTS=
 * @event input [fired on input change, you can use `v-model` on the component]
 * @event startedFetching [fired before fetch start]
 * @event fetchSuccess [fired on fetch success]
 * @event fetchError [fired on fetch error]
 * @event finishedFetching [fired after fetch resolve/reject]
 * @event select [fired on selecting autoComplete item]
 * @event inputFocus [fired on focusing the input]
 * @event inputBlur [fired on bluring the input]
 * @event highlightItem [fired on highlighting new item with hover/keyboard]
 * @event noResultsFound [fired on when no results found]
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
  name: 'vuetoComplete',
  props: {
    fetchHandler: {
      type: Function,
    },
    autoCompleteList: {
      type: Array,
      default: () => [],
    },
    displayKey: {
      type: String,
      default: constants.DISPLAY_KEY,
    },
    searchKeys: {
      type: Array | String,
      default: () => constants.SEARCH_KEYS,
    },
    sortHandler: {
      type: Function,
    },
    filterHandler: {
      type: Function,
    },
    resultsDisplayFormatHandler: {
      type: Function,
    },
    selectedItemFormatHandler: {
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
    showLoadingIcon: {
      type: Boolean,
      default: constants.SHOW_LOADING_ICON,
    },
    fetchOnFocus: {
      type: Boolean,
      default: constants.FETCH_ON_FOCUS,
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
    testId: {
      type: String,
      default: constants.DEFAULT_TEST_ID,
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
    fetching: false,
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
      this.$emit('input', this.query);

      this.showResults = true;
      this.noResults = false;
      this.fetching = true;

      if (this.emptyResultsOnEmptyQuery && this.query.trim() === '') {
        this.showResults = false;
        this.fetching = false;
        return;
      }

      this.results = this.highlightMatched ? this.results.map(this.markMatchedWords) : this.results;

      if (this.query.length < this.minCharsToAutoComplete) {
        this.fetching = false;
        return;
      }

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
      this.fetching = false;
    },

    /**
     * @prop {Array} results
     * @return {Array<{...item, itemIndex, formattedDisplayTitle}>} results
     */
    formatResultsStructure(results) {
      return results.map((item, index) => {
        if (typeof item === 'string') {
          return {
            itemIndex: index,
            formattedDisplayTitle: item,
          };
        }

        return {
          ...item,
          itemIndex: index,
          formattedDisplayTitle: this.resultsDisplayFormatHandler
            ? this.resultsDisplayFormatHandler(item)
            : item[this.displayKey],
        };
      });
    },

    /**
     * filter results by query
     * @param {Array} results
     * @return {Array} results
     */
    filteredResultsByQuery(results) {
      return results.filter(item => {
        const query = this.query.replace(/\./gi, '').trim();
        const searchKeys =
          typeof this.searchKeys === 'string'
            ? [this.searchKeys, 'formattedDisplayTitle']
            : Array.isArray(this.searchKeys)
              ? [...this.searchKeys, 'formattedDisplayTitle']
              : [];
        const searchContext = searchKeys.map(key => JSON.stringify(item[key])).join('');
        return query.length ? RegExp(query, 'gi').test(searchContext) : false;
      });
    },

    /**
     * mark matched words
     * @param {Object} item
     * @returns {{...item, matchedWord, words}} item
     */
    markMatchedWords(item) {
      const title = item.formattedDisplayTitle;
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
      this.query = this.selectedItemFormatHandler
        ? this.selectedItemFormatHandler(selectedItem)
        : selectedItem.formattedDisplayTitle;
      this.$emit('select', this.getHighlightedItem());
      this.$emit('input', this.query);
      this.showResults = false;
      this.noResults = false;
    },

    /**
     * handle focus
     */
    handleFocus() {
      this.showResults = true;
      this.isInputFocused = true;
      this.fetchOnFocus && this.autoComplete();
      this.$emit('inputFocus');
    },

    /**
     * handle blur
     */
    handleBlur() {
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
     * handle outside clicks
     * @param {Event} e
     */
    handleOutsideClicks(e) {
      if (!this.$refs.autoCompleteContainer.contains(e.target)) {
        this.showResults = false;
      }
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

    document.addEventListener('click', this.handleOutsideClicks, false);
  },

  /**
   * destroyed
   */
  destroyed() {
    document.removeEventListener('click', this.handleOutsideClicks, false);
  },
};
</script>

<style lang="scss" scoped>
.autoComplete {
  font-family: 'helvetica';
  width: 400px;

  &,
  * {
    box-sizing: border-box;
  }

  &__inputWrapper {
    position: relative;
    width: 100%;
  }

  &__input {
    width: 100%;
    padding: 12px 15px;
    border-radius: 4px;
    border: 1px solid #d0d0d0;
    font-size: 14px;

    &--focused {
      border: 1px solid #c0c0c0;
      outline: none;
      box-shadow: 0 0 3px rgba(0, 0, 0, 0.3);
    }
  }

  &__inputLoaderIcon {
    position: absolute;
    top: -4px;
    right: 0;
  }

  &__list {
    width: 100%;
    list-style: none;
    padding: 0;
    margin: 4px 0 0;
    border: 1px solid #d0d0d0;
    box-shadow: 0 0 3px rgba(0, 0, 0, 0.3);
    border-radius: 2px;
    max-height: 50vh;
    overflow-y: scroll;
  }

  &__item {
    padding: 10px 15px;
    width: 100%;

    p {
      width: 100%;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      margin: 0;
    }

    &--highlighted {
      background: #e0e0e0;
    }
  }

  &__itemMatched {
    font-weight: bold;
  }

  &__categoryLabel {
    background: #efefef;
    padding: 5px 15px;
    border-bottom: 1px solid #d0d0d0;
  }

  &__noResults {
    padding: 5px 15px;
    margin: 4px 0 0;
    border: 1px solid #d0d0d0;
    box-shadow: 0 0 3px rgba(0, 0, 0, 0.3);
    border-radius: 2px;
  }
}

.lds-roller {
  display: inline-block;
  width: 64px;
  height: 100%;
  transform: scale(0.5);
}

.lds-roller div {
  animation: lds-roller 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite;
  transform-origin: 32px 32px;
}

.lds-roller div:after {
  content: ' ';
  display: block;
  position: absolute;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #a0a0a0;
  margin: -3px 0 0 -3px;
}

.lds-roller div:nth-child(1) {
  animation-delay: -0.036s;
}

.lds-roller div:nth-child(1):after {
  top: 50px;
  left: 50px;
}

.lds-roller div:nth-child(2) {
  animation-delay: -0.072s;
}

.lds-roller div:nth-child(2):after {
  top: 54px;
  left: 45px;
}

.lds-roller div:nth-child(3) {
  animation-delay: -0.108s;
}

.lds-roller div:nth-child(3):after {
  top: 57px;
  left: 39px;
}

.lds-roller div:nth-child(4) {
  animation-delay: -0.144s;
}

.lds-roller div:nth-child(4):after {
  top: 58px;
  left: 32px;
}

.lds-roller div:nth-child(5) {
  animation-delay: -0.18s;
}

.lds-roller div:nth-child(5):after {
  top: 57px;
  left: 25px;
}

.lds-roller div:nth-child(6) {
  animation-delay: -0.216s;
}

.lds-roller div:nth-child(6):after {
  top: 54px;
  left: 19px;
}

.lds-roller div:nth-child(7) {
  animation-delay: -0.252s;
}

.lds-roller div:nth-child(7):after {
  top: 50px;
  left: 14px;
}

.lds-roller div:nth-child(8) {
  animation-delay: -0.288s;
}

.lds-roller div:nth-child(8):after {
  top: 45px;
  left: 10px;
}

@keyframes lds-roller {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
