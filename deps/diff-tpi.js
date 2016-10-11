(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["JsDiff"] = factory();
	else
		root["JsDiff"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	/*istanbul ignore start*/'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.canonicalize = exports.convertChangesToXML = exports.convertChangesToDMP = exports.parsePatch = exports.applyPatches = exports.applyPatch = exports.createPatch = exports.createTwoFilesPatch = exports.structuredPatch = exports.diffJson = exports.diffCss = exports.diffSentences = exports.diffTrimmedLines = exports.diffLines = exports.diffWordsWithSpace = exports.diffWords = exports.diffChars = exports.Diff = undefined;

	/*istanbul ignore end*/var /*istanbul ignore start*/_base = __webpack_require__(1) /*istanbul ignore end*/;

	/*istanbul ignore start*/var _base2 = _interopRequireDefault(_base);

	/*istanbul ignore end*/var /*istanbul ignore start*/_character = __webpack_require__(2) /*istanbul ignore end*/;

	var /*istanbul ignore start*/_word = __webpack_require__(3) /*istanbul ignore end*/;

	var /*istanbul ignore start*/_line = __webpack_require__(5) /*istanbul ignore end*/;

	var /*istanbul ignore start*/_sentence = __webpack_require__(6) /*istanbul ignore end*/;

	var /*istanbul ignore start*/_css = __webpack_require__(7) /*istanbul ignore end*/;

	var /*istanbul ignore start*/_json = __webpack_require__(8) /*istanbul ignore end*/;

	var /*istanbul ignore start*/_apply = __webpack_require__(9) /*istanbul ignore end*/;

	var /*istanbul ignore start*/_parse = __webpack_require__(10) /*istanbul ignore end*/;

	var /*istanbul ignore start*/_create = __webpack_require__(12) /*istanbul ignore end*/;

	var /*istanbul ignore start*/_dmp = __webpack_require__(13) /*istanbul ignore end*/;

	var /*istanbul ignore start*/_xml = __webpack_require__(14) /*istanbul ignore end*/;

	/*istanbul ignore start*/function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	/* See LICENSE file for terms of use */

	/*
	 * Text diff implementation.
	 *
	 * This library supports the following APIS:
	 * JsDiff.diffChars: Character by character diff
	 * JsDiff.diffWords: Word (as defined by \b regex) diff which ignores whitespace
	 * JsDiff.diffLines: Line based diff
	 *
	 * JsDiff.diffCss: Diff targeted at CSS content
	 *
	 * These methods are based on the implementation proposed in
	 * "An O(ND) Difference Algorithm and its Variations" (Myers, 1986).
	 * http://citeseerx.ist.psu.edu/viewdoc/summary?doi=10.1.1.4.6927
	 */
	exports. /*istanbul ignore end*/Diff = _base2['default'];
	/*istanbul ignore start*/exports. /*istanbul ignore end*/diffChars = _character.diffChars;
	/*istanbul ignore start*/exports. /*istanbul ignore end*/diffWords = _word.diffWords;
	/*istanbul ignore start*/exports. /*istanbul ignore end*/diffWordsWithSpace = _word.diffWordsWithSpace;
	/*istanbul ignore start*/exports. /*istanbul ignore end*/diffLines = _line.diffLines;
	/*istanbul ignore start*/exports. /*istanbul ignore end*/diffTrimmedLines = _line.diffTrimmedLines;
	/*istanbul ignore start*/exports. /*istanbul ignore end*/diffSentences = _sentence.diffSentences;
	/*istanbul ignore start*/exports. /*istanbul ignore end*/diffCss = _css.diffCss;
	/*istanbul ignore start*/exports. /*istanbul ignore end*/diffJson = _json.diffJson;
	/*istanbul ignore start*/exports. /*istanbul ignore end*/structuredPatch = _create.structuredPatch;
	/*istanbul ignore start*/exports. /*istanbul ignore end*/createTwoFilesPatch = _create.createTwoFilesPatch;
	/*istanbul ignore start*/exports. /*istanbul ignore end*/createPatch = _create.createPatch;
	/*istanbul ignore start*/exports. /*istanbul ignore end*/applyPatch = _apply.applyPatch;
	/*istanbul ignore start*/exports. /*istanbul ignore end*/applyPatches = _apply.applyPatches;
	/*istanbul ignore start*/exports. /*istanbul ignore end*/parsePatch = _parse.parsePatch;
	/*istanbul ignore start*/exports. /*istanbul ignore end*/convertChangesToDMP = _dmp.convertChangesToDMP;
	/*istanbul ignore start*/exports. /*istanbul ignore end*/convertChangesToXML = _xml.convertChangesToXML;
	/*istanbul ignore start*/exports. /*istanbul ignore end*/canonicalize = _json.canonicalize;
	
//**no source maps!**=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9pbmRleC5qcyJdLCJuYW1lcyI6WyJEaWZmIiwiZGlmZkNoYXJzIiwiZGlmZldvcmRzIiwiZGlmZldvcmRzV2l0aFNwYWNlIiwiZGlmZkxpbmVzIiwiZGlmZlRyaW1tZWRMaW5lcyIsImRpZmZTZW50ZW5jZXMiLCJkaWZmQ3NzIiwiZGlmZkpzb24iLCJzdHJ1Y3R1cmVkUGF0Y2giLCJjcmVhdGVUd29GaWxlc1BhdGNoIiwiY3JlYXRlUGF0Y2giLCJhcHBseVBhdGNoIiwiYXBwbHlQYXRjaGVzIiwicGFyc2VQYXRjaCIsImNvbnZlcnRDaGFuZ2VzVG9ETVAiLCJjb252ZXJ0Q2hhbmdlc1RvWE1MIiwiY2Fub25pY2FsaXplIl0sIm1hcHBpbmdzIjoiOzs7Ozs7O3VCQWdCQTs7Ozt1QkFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFFQTs7QUFDQTs7QUFFQTs7QUFDQTs7QUFDQTs7QUFFQTs7QUFDQTs7OztBQTlCQTs7QUFFQTs7Ozs7Ozs7Ozs7Ozs7Z0NBK0JFQSxJO3lEQUVBQyxTO3lEQUNBQyxTO3lEQUNBQyxrQjt5REFDQUMsUzt5REFDQUMsZ0I7eURBQ0FDLGE7eURBRUFDLE87eURBQ0FDLFE7eURBRUFDLGU7eURBQ0FDLG1CO3lEQUNBQyxXO3lEQUNBQyxVO3lEQUNBQyxZO3lEQUNBQyxVO3lEQUNBQyxtQjt5REFDQUMsbUI7eURBQ0FDLFkiLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKiBTZWUgTElDRU5TRSBmaWxlIGZvciB0ZXJtcyBvZiB1c2UgKi9cblxuLypcbiAqIFRleHQgZGlmZiBpbXBsZW1lbnRhdGlvbi5cbiAqXG4gKiBUaGlzIGxpYnJhcnkgc3VwcG9ydHMgdGhlIGZvbGxvd2luZyBBUElTOlxuICogSnNEaWZmLmRpZmZDaGFyczogQ2hhcmFjdGVyIGJ5IGNoYXJhY3RlciBkaWZmXG4gKiBKc0RpZmYuZGlmZldvcmRzOiBXb3JkIChhcyBkZWZpbmVkIGJ5IFxcYiByZWdleCkgZGlmZiB3aGljaCBpZ25vcmVzIHdoaXRlc3BhY2VcbiAqIEpzRGlmZi5kaWZmTGluZXM6IExpbmUgYmFzZWQgZGlmZlxuICpcbiAqIEpzRGlmZi5kaWZmQ3NzOiBEaWZmIHRhcmdldGVkIGF0IENTUyBjb250ZW50XG4gKlxuICogVGhlc2UgbWV0aG9kcyBhcmUgYmFzZWQgb24gdGhlIGltcGxlbWVudGF0aW9uIHByb3Bvc2VkIGluXG4gKiBcIkFuIE8oTkQpIERpZmZlcmVuY2UgQWxnb3JpdGhtIGFuZCBpdHMgVmFyaWF0aW9uc1wiIChNeWVycywgMTk4NikuXG4gKiBodHRwOi8vY2l0ZXNlZXJ4LmlzdC5wc3UuZWR1L3ZpZXdkb2Mvc3VtbWFyeT9kb2k9MTAuMS4xLjQuNjkyN1xuICovXG5pbXBvcnQgRGlmZiBmcm9tICcuL2RpZmYvYmFzZSc7XG5pbXBvcnQge2RpZmZDaGFyc30gZnJvbSAnLi9kaWZmL2NoYXJhY3Rlcic7XG5pbXBvcnQge2RpZmZXb3JkcywgZGlmZldvcmRzV2l0aFNwYWNlfSBmcm9tICcuL2RpZmYvd29yZCc7XG5pbXBvcnQge2RpZmZMaW5lcywgZGlmZlRyaW1tZWRMaW5lc30gZnJvbSAnLi9kaWZmL2xpbmUnO1xuaW1wb3J0IHtkaWZmU2VudGVuY2VzfSBmcm9tICcuL2RpZmYvc2VudGVuY2UnO1xuXG5pbXBvcnQge2RpZmZDc3N9IGZyb20gJy4vZGlmZi9jc3MnO1xuaW1wb3J0IHtkaWZmSnNvbiwgY2Fub25pY2FsaXplfSBmcm9tICcuL2RpZmYvanNvbic7XG5cbmltcG9ydCB7YXBwbHlQYXRjaCwgYXBwbHlQYXRjaGVzfSBmcm9tICcuL3BhdGNoL2FwcGx5JztcbmltcG9ydCB7cGFyc2VQYXRjaH0gZnJvbSAnLi9wYXRjaC9wYXJzZSc7XG5pbXBvcnQge3N0cnVjdHVyZWRQYXRjaCwgY3JlYXRlVHdvRmlsZXNQYXRjaCwgY3JlYXRlUGF0Y2h9IGZyb20gJy4vcGF0Y2gvY3JlYXRlJztcblxuaW1wb3J0IHtjb252ZXJ0Q2hhbmdlc1RvRE1QfSBmcm9tICcuL2NvbnZlcnQvZG1wJztcbmltcG9ydCB7Y29udmVydENoYW5nZXNUb1hNTH0gZnJvbSAnLi9jb252ZXJ0L3htbCc7XG5cbmV4cG9ydCB7XG4gIERpZmYsXG5cbiAgZGlmZkNoYXJzLFxuICBkaWZmV29yZHMsXG4gIGRpZmZXb3Jkc1dpdGhTcGFjZSxcbiAgZGlmZkxpbmVzLFxuICBkaWZmVHJpbW1lZExpbmVzLFxuICBkaWZmU2VudGVuY2VzLFxuXG4gIGRpZmZDc3MsXG4gIGRpZmZKc29uLFxuXG4gIHN0cnVjdHVyZWRQYXRjaCxcbiAgY3JlYXRlVHdvRmlsZXNQYXRjaCxcbiAgY3JlYXRlUGF0Y2gsXG4gIGFwcGx5UGF0Y2gsXG4gIGFwcGx5UGF0Y2hlcyxcbiAgcGFyc2VQYXRjaCxcbiAgY29udmVydENoYW5nZXNUb0RNUCxcbiAgY29udmVydENoYW5nZXNUb1hNTCxcbiAgY2Fub25pY2FsaXplXG59O1xuIl19


/***/ },
/* 1 */
/***/ function(module, exports) {

	/*istanbul ignore start*/'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports['default'] = /*istanbul ignore end*/Diff;
	function Diff() {}

	Diff.prototype = {
	  /*istanbul ignore start*/ /*istanbul ignore end*/diff: function diff(oldString, newString) {
	    /*istanbul ignore start*/var /*istanbul ignore end*/options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

	    var callback = options.callback;
	    if (typeof options === 'function') {
	      callback = options;
	      options = {};
	    }
	    this.options = options;

	    var self = this;

	    function done(value) {
	      if (callback) {
	        setTimeout(function () {
	          callback(undefined, value);
	        }, 0);
	        return true;
	      } else {
	        return value;
	      }
	    }

	    // Allow subclasses to massage the input prior to running
	    oldString = this.castInput(oldString);
	    newString = this.castInput(newString);

	    oldString = this.removeEmpty(this.tokenize(oldString));
	    newString = this.removeEmpty(this.tokenize(newString));

	    var newLen = newString.length,
	        oldLen = oldString.length;
	    var editLength = 1;
	    var maxEditLength = newLen + oldLen;
	    var bestPath = [{ newPos: -1, components: [] }];

	    // Seed editLength = 0, i.e. the content starts with the same values
	    var oldPos = this.extractCommon(bestPath[0], newString, oldString, 0);
	    if (bestPath[0].newPos + 1 >= newLen && oldPos + 1 >= oldLen) {
	      // Identity per the equality and tokenizer
	      return done([{ value: newString.join(''), count: newString.length }]);
	    }

	    // Main worker method. checks all permutations of a given edit length for acceptance.
	    function execEditLength() {
	      for (var diagonalPath = -1 * editLength; diagonalPath <= editLength; diagonalPath += 2) {
	        var basePath = /*istanbul ignore start*/void 0 /*istanbul ignore end*/;
	        var addPath = bestPath[diagonalPath - 1],
	            removePath = bestPath[diagonalPath + 1],
	            _oldPos = (removePath ? removePath.newPos : 0) - diagonalPath;
	        if (addPath) {
	          // No one else is going to attempt to use this value, clear it
	          bestPath[diagonalPath - 1] = undefined;
	        }

	        var canAdd = addPath && addPath.newPos + 1 < newLen,
	            canRemove = removePath && 0 <= _oldPos && _oldPos < oldLen;
	        if (!canAdd && !canRemove) {
	          // If this path is a terminal then prune
	          bestPath[diagonalPath] = undefined;
	          continue;
	        }

	        // Select the diagonal that we want to branch from. We select the prior
	        // path whose position in the new string is the farthest from the origin
	        // and does not pass the bounds of the diff graph
	        if (!canAdd || canRemove && addPath.newPos < removePath.newPos) {
	          basePath = clonePath(removePath);
	          self.pushComponent(basePath.components, undefined, true);
	        } else {
	          basePath = addPath; // No need to clone, we've pulled it from the list
	          basePath.newPos++;
	          self.pushComponent(basePath.components, true, undefined);
	        }

	        _oldPos = self.extractCommon(basePath, newString, oldString, diagonalPath);

	        // If we have hit the end of both strings, then we are done
	        if (basePath.newPos + 1 >= newLen && _oldPos + 1 >= oldLen) {
	          return done(buildValues(self, basePath.components, newString, oldString, self.useLongestToken));
	        } else {
	          // Otherwise track this path as a potential candidate and continue.
	          bestPath[diagonalPath] = basePath;
	        }
	      }

	      editLength++;
	    }

	    // Performs the length of edit iteration. Is a bit fugly as this has to support the
	    // sync and async mode which is never fun. Loops over execEditLength until a value
	    // is produced.
	    if (callback) {
	      (function exec() {
	        setTimeout(function () {
	          // This should not happen, but we want to be safe.
	          /* istanbul ignore next */
	          if (editLength > maxEditLength) {
	            return callback();
	          }

	          if (!execEditLength()) {
	            exec();
	          }
	        }, 0);
	      })();
	    } else {
	      while (editLength <= maxEditLength) {
	        var ret = execEditLength();
	        if (ret) {
	          return ret;
	        }
	      }
	    }
	  },
	  /*istanbul ignore start*/ /*istanbul ignore end*/pushComponent: function pushComponent(components, added, removed) {
	    var last = components[components.length - 1];
	    if (last && last.added === added && last.removed === removed) {
	      // We need to clone here as the component clone operation is just
	      // as shallow array clone
	      components[components.length - 1] = { count: last.count + 1, added: added, removed: removed };
	    } else {
	      components.push({ count: 1, added: added, removed: removed });
	    }
	  },
	  /*istanbul ignore start*/ /*istanbul ignore end*/extractCommon: function extractCommon(basePath, newString, oldString, diagonalPath) {
	    var newLen = newString.length,
	        oldLen = oldString.length,
	        newPos = basePath.newPos,
	        oldPos = newPos - diagonalPath,
	        commonCount = 0;
	    while (newPos + 1 < newLen && oldPos + 1 < oldLen && this.equals(newString[newPos + 1], oldString[oldPos + 1])) {
	      newPos++;
	      oldPos++;
	      commonCount++;
	    }

	    if (commonCount) {
	      basePath.components.push({ count: commonCount });
	    }

	    basePath.newPos = newPos;
	    return oldPos;
	  },
	  /*istanbul ignore start*/ /*istanbul ignore end*/equals: function equals(left, right) {
	    return left === right;
	  },
	  /*istanbul ignore start*/ /*istanbul ignore end*/removeEmpty: function removeEmpty(array) {
	    var ret = [];
	    for (var i = 0; i < array.length; i++) {
	      if (array[i]) {
	        ret.push(array[i]);
	      }
	    }
	    return ret;
	  },
	  /*istanbul ignore start*/ /*istanbul ignore end*/castInput: function castInput(value) {
	    return value;
	  },
	  /*istanbul ignore start*/ /*istanbul ignore end*/tokenize: function tokenize(value) {
	    return value.split('');
	  }
	};

	function buildValues(diff, components, newString, oldString, useLongestToken) {
	  var componentPos = 0,
	      componentLen = components.length,
	      newPos = 0,
	      oldPos = 0;

	  for (; componentPos < componentLen; componentPos++) {
	    var component = components[componentPos];
	    if (!component.removed) {
	      if (!component.added && useLongestToken) {
	        var value = newString.slice(newPos, newPos + component.count);
	        value = value.map(function (value, i) {
	          var oldValue = oldString[oldPos + i];
	          return oldValue.length > value.length ? oldValue : value;
	        });

	        component.value = value.join('');
	      } else {
	        component.value = newString.slice(newPos, newPos + component.count).join('');
	      }
	      newPos += component.count;

	      // Common case
	      if (!component.added) {
	        oldPos += component.count;
	      }
	    } else {
	      component.value = oldString.slice(oldPos, oldPos + component.count).join('');
	      oldPos += component.count;

	      // Reverse add and remove so removes are output first to match common convention
	      // The diffing algorithm is tied to add then remove output and this is the simplest
	      // route to get the desired output with minimal overhead.
	      if (componentPos && components[componentPos - 1].added) {
	        var tmp = components[componentPos - 1];
	        components[componentPos - 1] = components[componentPos];
	        components[componentPos] = tmp;
	      }
	    }
	  }

	  // Special case handle for when one terminal is ignored. For this case we merge the
	  // terminal into the prior string and drop the change.
	  var lastComponent = components[componentLen - 1];
	  if (componentLen > 1 && (lastComponent.added || lastComponent.removed) && diff.equals('', lastComponent.value)) {
	    components[componentLen - 2].value += lastComponent.value;
	    components.pop();
	  }

	  return components;
	}

	function clonePath(path) {
	  return { newPos: path.newPos, components: path.components.slice(0) };
	}
	
//**no source maps!**=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9kaWZmL2Jhc2UuanMiXSwibmFtZXMiOlsiRGlmZiIsInByb3RvdHlwZSIsImRpZmYiLCJvbGRTdHJpbmciLCJuZXdTdHJpbmciLCJvcHRpb25zIiwiY2FsbGJhY2siLCJzZWxmIiwiZG9uZSIsInZhbHVlIiwic2V0VGltZW91dCIsInVuZGVmaW5lZCIsImNhc3RJbnB1dCIsInJlbW92ZUVtcHR5IiwidG9rZW5pemUiLCJuZXdMZW4iLCJsZW5ndGgiLCJvbGRMZW4iLCJlZGl0TGVuZ3RoIiwibWF4RWRpdExlbmd0aCIsImJlc3RQYXRoIiwibmV3UG9zIiwiY29tcG9uZW50cyIsIm9sZFBvcyIsImV4dHJhY3RDb21tb24iLCJqb2luIiwiY291bnQiLCJleGVjRWRpdExlbmd0aCIsImRpYWdvbmFsUGF0aCIsImJhc2VQYXRoIiwiYWRkUGF0aCIsInJlbW92ZVBhdGgiLCJjYW5BZGQiLCJjYW5SZW1vdmUiLCJjbG9uZVBhdGgiLCJwdXNoQ29tcG9uZW50IiwiYnVpbGRWYWx1ZXMiLCJ1c2VMb25nZXN0VG9rZW4iLCJleGVjIiwicmV0IiwiYWRkZWQiLCJyZW1vdmVkIiwibGFzdCIsInB1c2giLCJjb21tb25Db3VudCIsImVxdWFscyIsImxlZnQiLCJyaWdodCIsImFycmF5IiwiaSIsInNwbGl0IiwiY29tcG9uZW50UG9zIiwiY29tcG9uZW50TGVuIiwiY29tcG9uZW50Iiwic2xpY2UiLCJtYXAiLCJvbGRWYWx1ZSIsInRtcCIsImxhc3RDb21wb25lbnQiLCJwb3AiLCJwYXRoIl0sIm1hcHBpbmdzIjoiOzs7Ozs0Q0FBd0JBLEk7QUFBVCxTQUFTQSxJQUFULEdBQWdCLENBQUU7O0FBRWpDQSxLQUFLQyxTQUFMLEdBQWlCO0FBQUEsbURBQ2ZDLElBRGUsZ0JBQ1ZDLFNBRFUsRUFDQ0MsU0FERCxFQUMwQjtBQUFBLHdEQUFkQyxPQUFjLHVFQUFKLEVBQUk7O0FBQ3ZDLFFBQUlDLFdBQVdELFFBQVFDLFFBQXZCO0FBQ0EsUUFBSSxPQUFPRCxPQUFQ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QSxNQUFJQSxlQUFlLENBQWYsS0FDSU0sY0FBY2xCLEtBQWQsSUFBdUJrQixjQUFjakIsT0FEekMsS0FFR3ZDLEtBQUsyQyxNQUFMLENBQVksRUFBWixFQUFnQmEsY0FBY2pELEtBQTlCLENBRlAsRUFFNkM7QUFDM0NhLGVBQVc4QixlQUFlLENBQTFCLEVBQTZCM0MsS0FBN0IsSUFBc0NpRCxjQUFjakQsS0FBcEQ7QUFDQWEsZUFBV3FDLEdBQVg7QUFDRDs7QUFFRCxTQUFPckMsVUFBUDtBQUNEOztBQUVELFNBQVNZLFNBQVQsQ0FBbUIwQixJQUFuQixFQUF5QjtBQUN2QixTQUFPLEVBQUV2QyxRQUFRdUMsS0FBS3ZDLE1BQWYsRUFBdUJDLFlBQVlzQyxLQUFLdEMsVUFBTCxDQUFnQmdDLEtBQWhCLENBQXNCLENBQXRCLENBQW5DLEVBQVA7QUFDRCIsImZpbGUiOiJiYXNlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gRGlmZigpIHt9XG5cbkRpZmYucHJvdG90eXBlID0ge1xuICBkaWZmKG9sZFN0cmluZywgbmV3U3RyaW5nLCBvcHRpb25zID0ge30pIHtcbiAgICBsZXQgY2FsbGJhY2sgPSBvcHRpb25zLmNhbGxiYWNrO1xuICAgIGlmICh0eXBlb2Ygb3B0aW9ucyA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgY2FsbGJhY2sgPSBvcHRpb25zO1xuICAgICAgb3B0aW9ucyA9IHt9O1xuICAgIH1cbiAgICB0aGlzLm9wdGlvbnMgPSBvcHRpb25zO1xuXG4gICAgbGV0IHNlbGYgPSB0aGlzO1xuXG4gICAgZnVuY3Rpb24gZG9uZSh2YWx1ZSkge1xuICAgICAgaWYgKGNhbGxiYWNrKSB7XG4gICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7IGNhbGxiYWNrKHVuZGVmaW5lZCwgdmFsdWUpOyB9LCAwKTtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gQWxsb3cgc3ViY2xhc3NlcyB0byBtYXNzYWdlIHRoZSBpbnB1dCBwcmlvciB0byBydW5uaW5nXG4gICAgb2xkU3RyaW5nID0gdGhpcy5jYXN0SW5wdXQob2xkU3RyaW5nKTtcbiAgICBuZXdTdHJpbmcgPSB0aGlzLmNhc3RJbnB1dChuZXdTdHJpbmcpO1xuXG4gICAgb2xkU3RyaW5nID0gdGhpcy5yZW1vdmVFbXB0eSh0aGlzLnRva2VuaXplKG9sZFN0cmluZykpO1xuICAgIG5ld1N0cmluZyA9IHRoaXMucmVtb3ZlRW1wdHkodGhpcy50b2tlbml6ZShuZXdTdHJpbmcpKTtcblxuICAgIGxldCBuZXdMZW4gPSBuZXdTdHJpbmcubGVuZ3RoLCBvbGRMZW4gPSBvbGRTdHJpbmcubGVuZ3RoO1xuICAgIGxldCBlZGl0TGVuZ3RoID0gMTtcbiAgICBsZXQgbWF4RWRpdExlbmd0aCA9IG5ld0xlbiArIG9sZExlbjtcbiAgICBsZXQgYmVzdFBhdGggPSBbeyBuZXdQb3M6IC0xLCBjb21wb25lbnRzOiBbXSB9XTtcblxuICAgIC8vIFNlZWQgZWRpdExlbmd0aCA9IDAsIGkuZS4gdGhlIGNvbnRlbnQgc3RhcnRzIHdpdGggdGhlIHNhbWUgdmFsdWVzXG4gICAgbGV0IG9sZFBvcyA9IHRoaXMuZXh0cmFjdENvbW1vbihiZXN0UGF0aFswXSwgbmV3U3RyaW5nLCBvbGRTdHJpbmcsIDApO1xuICAgIGlmIChiZXN0UGF0aFswXS5uZXdQb3MgKyAxID49IG5ld0xlbiAmJiBvbGRQb3MgKyAxID49IG9sZExlbikge1xuICAgICAgLy8gSWRlbnRpdHkgcGVyIHRoZSBlcXVhbGl0eSBhbmQgdG9rZW5pemVyXG4gICAgICByZXR1cm4gZG9uZShbe3ZhbHVlOiBuZXdTdHJpbmcuam9pbignJyksIGNvdW50OiBuZXdTdHJpbmcubGVuZ3RofV0pO1xuICAgIH1cblxuICAgIC8vIE1haW4gd29ya2VyIG1ldGhvZC4gY2hlY2tzIGFsbCBwZXJtdXRhdGlvbnMgb2YgYSBnaXZlbiBlZGl0IGxlbmd0aCBmb3IgYWNjZXB0YW5jZS5cbiAgICBmdW5jdGlvbiBleGVjRWRpdExlbmd0aCgpIHtcbiAgICAgIGZvciAobGV0IGRpYWdvbmFsUGF0aCA9IC0xICogZWRpdExlbmd0aDsgZGlhZ29uYWxQYXRoIDw9IGVkaXRMZW5ndGg7IGRpYWdvbmFsUGF0aCArPSAyKSB7XG4gICAgICAgIGxldCBiYXNlUGF0aDtcbiAgICAgICAgbGV0IGFkZFBhdGggPSBiZXN0UGF0aFtkaWFnb25hbFBhdGggLSAxXSxcbiAgICAgICAgICAgIHJlbW92ZVBhdGggPSBiZXN0UGF0aFtkaWFnb25hbFBhdGggKyAxXSxcbiAgICAgICAgICAgIG9sZFBvcyA9IChyZW1vdmVQYXRoID8gcmVtb3ZlUGF0aC5uZXdQb3MgOiAwKSAtIGRpYWdvbmFsUGF0aDtcbiAgICAgICAgaWYgKGFkZFBhdGgpIHtcbiAgICAgICAgICAvLyBObyBvbmUgZWxzZSBpcyBnb2luZyB0byBhdHRlbXB0IHRvIHVzZSB0aGlzIHZhbHVlLCBjbGVhciBpdFxuICAgICAgICAgIGJlc3RQYXRoW2RpYWdvbmFsUGF0aCAtIDFdID0gdW5kZWZpbmVkO1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IGNhbkFkZCA9IGFkZFBhdGggJiYgYWRkUGF0aC5uZXdQb3MgKyAxIDwgbmV3TGVuLFxuICAgICAgICAgICAgY2FuUmVtb3ZlID0gcmVtb3ZlUGF0aCAmJiAwIDw9IG9sZFBvcyAmJiBvbGRQb3MgPCBvbGRMZW47XG4gICAgICAgIGlmICghY2FuQWRkICYmICFjYW5SZW1vdmUpIHtcbiAgICAgICAgICAvLyBJZiB0aGlzIHBhdGggaXMgYSB0ZXJtaW5hbCB0aGVuIHBydW5lXG4gICAgICAgICAgYmVzdFBhdGhbZGlhZ29uYWxQYXRoXSA9IHVuZGVmaW5lZDtcbiAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFNlbGVjdCB0aGUgZGlhZ29uYWwgdGhhdCB3ZSB3YW50IHRvIGJyYW5jaCBmcm9tLiBXZSBzZWxlY3QgdGhlIHByaW9yXG4gICAgICAgIC8vIHBhdGggd2hvc2UgcG9zaXRpb24gaW4gdGhlIG5ldyBzdHJpbmcgaXMgdGhlIGZhcnRoZXN0IGZyb20gdGhlIG9yaWdpblxuICAgICAgICAvLyBhbmQgZG9lcyBub3QgcGFzcyB0aGUgYm91bmRzIG9mIHRoZSBkaWZmIGdyYXBoXG4gICAgICAgIGlmICghY2FuQWRkIHx8IChjYW5SZW1vdmUgJiYgYWRkUGF0aC5uZXdQb3MgPCByZW1vdmVQYXRoLm5ld1BvcykpIHtcbiAgICAgICAgICBiYXNlUGF0aCA9IGNsb25lUGF0aChyZW1vdmVQYXRoKTtcbiAgICAgICAgICBzZWxmLnB1c2hDb21wb25lbnQoYmFzZVBhdGguY29tcG9uZW50cywgdW5kZWZpbmVkLCB0cnVlKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBiYXNlUGF0aCA9IGFkZFBhdGg7ICAgLy8gTm8gbmVlZCB0byBjbG9uZSwgd2UndmUgcHVsbGVkIGl0IGZyb20gdGhlIGxpc3RcbiAgICAgICAgICBiYXNlUGF0aC5uZXdQb3MrKztcbiAgICAgICAgICBzZWxmLnB1c2hDb21wb25lbnQoYmFzZVBhdGguY29tcG9uZW50cywgdHJ1ZSwgdW5kZWZpbmVkKTtcbiAgICAgICAgfVxuXG4gICAgICAgIG9sZFBvcyA9IHNlbGYuZXh0cmFjdENvbW1vbihiYXNlUGF0aCwgbmV3U3RyaW5nLCBvbGRTdHJpbmcsIGRpYWdvbmFsUGF0aCk7XG5cbiAgICAgICAgLy8gSWYgd2UgaGF2ZSBoaXQgdGhlIGVuZCBvZiBib3RoIHN0cmluZ3MsIHRoZW4gd2UgYXJlIGRvbmVcbiAgICAgICAgaWYgKGJhc2VQYXRoLm5ld1BvcyArIDEgPj0gbmV3TGVuICYmIG9sZFBvcyArIDEgPj0gb2xkTGVuKSB7XG4gICAgICAgICAgcmV0dXJuIGRvbmUoYnVpbGRWYWx1ZXMoc2VsZiwgYmFzZVBhdGguY29tcG9uZW50cywgbmV3U3RyaW5nLCBvbGRTdHJpbmcsIHNlbGYudXNlTG9uZ2VzdFRva2VuKSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgLy8gT3RoZXJ3aXNlIHRyYWNrIHRoaXMgcGF0aCBhcyBhIHBvdGVudGlhbCBjYW5kaWRhdGUgYW5kIGNvbnRpbnVlLlxuICAgICAgICAgIGJlc3RQYXRoW2RpYWdvbmFsUGF0aF0gPSBiYXNlUGF0aDtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBlZGl0TGVuZ3RoKys7XG4gICAgfVxuXG4gICAgLy8gUGVyZm9ybXMgdGhlIGxlbmd0aCBvZiBlZGl0IGl0ZXJhdGlvbi4gSXMgYSBiaXQgZnVnbHkgYXMgdGhpcyBoYXMgdG8gc3VwcG9ydCB0aGVcbiAgICAvLyBzeW5jIGFuZCBhc3luYyBtb2RlIHdoaWNoIGlzIG5ldmVyIGZ1bi4gTG9vcHMgb3ZlciBleGVjRWRpdExlbmd0aCB1bnRpbCBhIHZhbHVlXG4gICAgLy8gaXMgcHJvZHVjZWQuXG4gICAgaWYgKGNhbGxiYWNrKSB7XG4gICAgICAoZnVuY3Rpb24gZXhlYygpIHtcbiAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgICAvLyBUaGlzIHNob3VsZCBub3QgaGFwcGVuLCBidXQgd2Ugd2FudCB0byBiZSBzYWZlLlxuICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG4gICAgICAgICAgaWYgKGVkaXRMZW5ndGggPiBtYXhFZGl0TGVuZ3RoKSB7XG4gICAgICAgICAgICByZXR1cm4gY2FsbGJhY2soKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAoIWV4ZWNFZGl0TGVuZ3RoKCkpIHtcbiAgICAgICAgICAgIGV4ZWMoKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0sIDApO1xuICAgICAgfSgpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgd2hpbGUgKGVkaXRMZW5ndGggPD0gbWF4RWRpdExlbmd0aCkge1xuICAgICAgICBsZXQgcmV0ID0gZXhlY0VkaXRMZW5ndGgoKTtcbiAgICAgICAgaWYgKHJldCkge1xuICAgICAgICAgIHJldHVybiByZXQ7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH0sXG5cbiAgcHVzaENvbXBvbmVudChjb21wb25lbnRzLCBhZGRlZCwgcmVtb3ZlZCkge1xuICAgIGxldCBsYXN0ID0gY29tcG9uZW50c1tjb21wb25lbnRzLmxlbmd0aCAtIDFdO1xuICAgIGlmIChsYXN0ICYmIGxhc3QuYWRkZWQgPT09IGFkZGVkICYmIGxhc3QucmVtb3ZlZCA9PT0gcmVtb3ZlZCkge1xuICAgICAgLy8gV2UgbmVlZCB0byBjbG9uZSBoZXJlIGFzIHRoZSBjb21wb25lbnQgY2xvbmUgb3BlcmF0aW9uIGlzIGp1c3RcbiAgICAgIC8vIGFzIHNoYWxsb3cgYXJyYXkgY2xvbmVcbiAgICAgIGNvbXBvbmVudHNbY29tcG9uZW50cy5sZW5ndGggLSAxXSA9IHtjb3VudDogbGFzdC5jb3VudCArIDEsIGFkZGVkOiBhZGRlZCwgcmVtb3ZlZDogcmVtb3ZlZCB9O1xuICAgIH0gZWxzZSB7XG4gICAgICBjb21wb25lbnRzLnB1c2goe2NvdW50OiAxLCBhZGRlZDogYWRkZWQsIHJlbW92ZWQ6IHJlbW92ZWQgfSk7XG4gICAgfVxuICB9LFxuICBleHRyYWN0Q29tbW9uKGJhc2VQYXRoLCBuZXdTdHJpbmcsIG9sZFN0cmluZywgZGlhZ29uYWxQYXRoKSB7XG4gICAgbGV0IG5ld0xlbiA9IG5ld1N0cmluZy5sZW5ndGgsXG4gICAgICAgIG9sZExlbiA9IG9sZFN0cmluZy5sZW5ndGgsXG4gICAgICAgIG5ld1BvcyA9IGJhc2VQYXRoLm5ld1BvcyxcbiAgICAgICAgb2xkUG9zID0gbmV3UG9zIC0gZGlhZ29uYWxQYXRoLFxuXG4gICAgICAgIGNvbW1vbkNvdW50ID0gMDtcbiAgICB3aGlsZSAobmV3UG9zICsgMSA8IG5ld0xlbiAmJiBvbGRQb3MgKyAxIDwgb2xkTGVuICYmIHRoaXMuZXF1YWxzKG5ld1N0cmluZ1tuZXdQb3MgKyAxXSwgb2xkU3RyaW5nW29sZFBvcyArIDFdKSkge1xuICAgICAgbmV3UG9zKys7XG4gICAgICBvbGRQb3MrKztcbiAgICAgIGNvbW1vbkNvdW50Kys7XG4gICAgfVxuXG4gICAgaWYgKGNvbW1vbkNvdW50KSB7XG4gICAgICBiYXNlUGF0aC5jb21wb25lbnRzLnB1c2goe2NvdW50OiBjb21tb25Db3VudH0pO1xuICAgIH1cblxuICAgIGJhc2VQYXRoLm5ld1BvcyA9IG5ld1BvcztcbiAgICByZXR1cm4gb2xkUG9zO1xuICB9LFxuXG4gIGVxdWFscyhsZWZ0LCByaWdodCkge1xuICAgIHJldHVybiBsZWZ0ID09PSByaWdodDtcbiAgfSxcbiAgcmVtb3ZlRW1wdHkoYXJyYXkpIHtcbiAgICBsZXQgcmV0ID0gW107XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBhcnJheS5sZW5ndGg7IGkrKykge1xuICAgICAgaWYgKGFycmF5W2ldKSB7XG4gICAgICAgIHJldC5wdXNoKGFycmF5W2ldKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHJldDtcbiAgfSxcbiAgY2FzdElucHV0KHZhbHVlKSB7XG4gICAgcmV0dXJuIHZhbHVlO1xuICB9LFxuICB0b2tlbml6ZSh2YWx1ZSkge1xuICAgIHJldHVybiB2YWx1ZS5zcGxpdCgnJyk7XG4gIH1cbn07XG5cbmZ1bmN0aW9uIGJ1aWxkVmFsdWVzKGRpZmYsIGNvbXBvbmVudHMsIG5ld1N0cmluZywgb2xkU3RyaW5nLCB1c2VMb25nZXN0VG9rZW4pIHtcbiAgbGV0IGNvbXBvbmVudFBvcyA9IDAsXG4gICAgICBjb21wb25lbnRMZW4gPSBjb21wb25lbnRzLmxlbmd0aCxcbiAgICAgIG5ld1BvcyA9IDAsXG4gICAgICBvbGRQb3MgPSAwO1xuXG4gIGZvciAoOyBjb21wb25lbnRQb3MgPCBjb21wb25lbnRMZW47IGNvbXBvbmVudFBvcysrKSB7XG4gICAgbGV0IGNvbXBvbmVudCA9IGNvbXBvbmVudHNbY29tcG9uZW50UG9zXTtcbiAgICBpZiAoIWNvbXBvbmVudC5yZW1vdmVkKSB7XG4gICAgICBpZiAoIWNvbXBvbmVudC5hZGRlZCAmJiB1c2VMb25nZXN0VG9rZW4pIHtcbiAgICAgICAgbGV0IHZhbHVlID0gbmV3U3RyaW5nLnNsaWNlKG5ld1BvcywgbmV3UG9zICsgY29tcG9uZW50LmNvdW50KTtcbiAgICAgICAgdmFsdWUgPSB2YWx1ZS5tYXAoZnVuY3Rpb24odmFsdWUsIGkpIHtcbiAgICAgICAgICBsZXQgb2xkVmFsdWUgPSBvbGRTdHJpbmdbb2xkUG9zICsgaV07XG4gICAgICAgICAgcmV0dXJuIG9sZFZhbHVlLmxlbmd0aCA+IHZhbHVlLmxlbmd0aCA/IG9sZFZhbHVlIDogdmFsdWU7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGNvbXBvbmVudC52YWx1ZSA9IHZhbHVlLmpvaW4oJycpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29tcG9uZW50LnZhbHVlID0gbmV3U3RyaW5nLnNsaWNlKG5ld1BvcywgbmV3UG9zICsgY29tcG9uZW50LmNvdW50KS5qb2luKCcnKTtcbiAgICAgIH1cbiAgICAgIG5ld1BvcyArPSBjb21wb25lbnQuY291bnQ7XG5cbiAgICAgIC8vIENvbW1vbiBjYXNlXG4gICAgICBpZiAoIWNvbXBvbmVudC5hZGRlZCkge1xuICAgICAgICBvbGRQb3MgKz0gY29tcG9uZW50LmNvdW50O1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBjb21wb25lbnQudmFsdWUgPSBvbGRTdHJpbmcuc2xpY2Uob2xkUG9zLCBvbGRQb3MgKyBjb21wb25lbnQuY291bnQpLmpvaW4oJycpO1xuICAgICAgb2xkUG9zICs9IGNvbXBvbmVudC5jb3VudDtcblxuICAgICAgLy8gUmV2ZXJzZSBhZGQgYW5kIHJlbW92ZSBzbyByZW1vdmVzIGFyZSBvdXRwdXQgZmlyc3QgdG8gbWF0Y2ggY29tbW9uIGNvbnZlbnRpb25cbiAgICAgIC8vIFRoZSBkaWZmaW5nIGFsZ29yaXRobSBpcyB0aWVkIHRvIGFkZCB0aGVuIHJlbW92ZSBvdXRwdXQgYW5kIHRoaXMgaXMgdGhlIHNpbXBsZXN0XG4gICAgICAvLyByb3V0ZSB0byBnZXQgdGhlIGRlc2lyZWQgb3V0cHV0IHdpdGggbWluaW1hbCBvdmVyaGVhZC5cbiAgICAgIGlmIChjb21wb25lbnRQb3MgJiYgY29tcG9uZW50c1tjb21wb25lbnRQb3MgLSAxXS5hZGRlZCkge1xuICAgICAgICBsZXQgdG1wID0gY29tcG9uZW50c1tjb21wb25lbnRQb3MgLSAxXTtcbiAgICAgICAgY29tcG9uZW50c1tjb21wb25lbnRQb3MgLSAxXSA9IGNvbXBvbmVudHNbY29tcG9uZW50UG9zXTtcbiAgICAgICAgY29tcG9uZW50c1tjb21wb25lbnRQb3NdID0gdG1wO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8vIFNwZWNpYWwgY2FzZSBoYW5kbGUgZm9yIHdoZW4gb25lIHRlcm1pbmFsIGlzIGlnbm9yZWQuIEZvciB0aGlzIGNhc2Ugd2UgbWVyZ2UgdGhlXG4gIC8vIHRlcm1pbmFsIGludG8gdGhlIHByaW9yIHN0cmluZyBhbmQgZHJvcCB0aGUgY2hhbmdlLlxuICBsZXQgbGFzdENvbXBvbmVudCA9IGNvbXBvbmVudHNbY29tcG9uZW50TGVuIC0gMV07XG4gIGlmIChjb21wb25lbnRMZW4gPiAxXG4gICAgICAmJiAobGFzdENvbXBvbmVudC5hZGRlZCB8fCBsYXN0Q29tcG9uZW50LnJlbW92ZWQpXG4gICAgICAmJiBkaWZmLmVxdWFscygnJywgbGFzdENvbXBvbmVudC52YWx1ZSkpIHtcbiAgICBjb21wb25lbnRzW2NvbXBvbmVudExlbiAtIDJdLnZhbHVlICs9IGxhc3RDb21wb25lbnQudmFsdWU7XG4gICAgY29tcG9uZW50cy5wb3AoKTtcbiAgfVxuXG4gIHJldHVybiBjb21wb25lbnRzO1xufVxuXG5mdW5jdGlvbiBjbG9uZVBhdGgocGF0aCkge1xuICByZXR1cm4geyBuZXdQb3M6IHBhdGgubmV3UG9zLCBjb21wb25lbnRzOiBwYXRoLmNvbXBvbmVudHMuc2xpY2UoMCkgfTtcbn1cbiJdfQ==


/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	/*istanbul ignore start*/'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.characterDiff = undefined;
	exports. /*istanbul ignore end*/diffChars = diffChars;

	var /*istanbul ignore start*/_base = __webpack_require__(1) /*istanbul ignore end*/;

	/*istanbul ignore start*/var _base2 = _interopRequireDefault(_base);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	/*istanbul ignore end*/var characterDiff = /*istanbul ignore start*/exports. /*istanbul ignore end*/characterDiff = new /*istanbul ignore start*/_base2['default'] /*istanbul ignore end*/();
	function diffChars(oldStr, newStr, callback) {
	  return characterDiff.diff(oldStr, newStr, callback);
	}
	
//**no source maps!**=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9kaWZmL2NoYXJhY3Rlci5qcyJdLCJuYW1lcyI6WyJkaWZmQ2hhcnMiLCJjaGFyYWN0ZXJEaWZmIiwib2xkU3RyIiwibmV3U3RyIiwiY2FsbGJhY2siLCJkaWZmIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Z0NBR2dCQSxTLEdBQUFBLFM7O0FBSGhCOzs7Ozs7dUJBRU8sSUFBTUMseUZBQWdCLHdFQUF0QjtBQUNBLFNBQVNELFNBQVQsQ0FBbUJFLE1BQW5CLEVBQTJCQyxNQUEzQixFQUFtQ0MsUUFBbkMsRUFBNkM7QUFBRSxTQUFPSCxjQUFjSSxJQUFkLENBQW1CSCxNQUFuQixFQUEyQkMsTUFBM0IsRUFBbUNDLFFBQW5DLENBQVA7QUFBc0QiLCJmaWxlIjoiY2hhcmFjdGVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IERpZmYgZnJvbSAnLi9iYXNlJztcblxuZXhwb3J0IGNvbnN0IGNoYXJhY3RlckRpZmYgPSBuZXcgRGlmZigpO1xuZXhwb3J0IGZ1bmN0aW9uIGRpZmZDaGFycyhvbGRTdHIsIG5ld1N0ciwgY2FsbGJhY2spIHsgcmV0dXJuIGNoYXJhY3RlckRpZmYuZGlmZihvbGRTdHIsIG5ld1N0ciwgY2FsbGJhY2spOyB9XG4iXX0=


/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	/*istanbul ignore start*/'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.wordDiff = undefined;
	exports. /*istanbul ignore end*/diffWords = diffWords;
	/*istanbul ignore start*/exports. /*istanbul ignore end*/diffWordsWithSpace = diffWordsWithSpace;

	var /*istanbul ignore start*/_base = __webpack_require__(1) /*istanbul ignore end*/;

	/*istanbul ignore start*/var _base2 = _interopRequireDefault(_base);

	/*istanbul ignore end*/var /*istanbul ignore start*/_params = __webpack_require__(4) /*istanbul ignore end*/;

	/*istanbul ignore start*/function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	/*istanbul ignore end*/ // Based on https://en.wikipedia.org/wiki/Latin_script_in_Unicode
	//
	// Ranges and exceptions:
	// Latin-1 Supplement, 0080–00FF
	//  - U+00D7  × Multiplication sign
	//  - U+00F7  ÷ Division sign
	// Latin Extended-A, 0100–017F
	// Latin Extended-B, 0180–024F
	// IPA Extensions, 0250–02AF
	// Spacing Modifier Letters, 02B0–02FF
	//  - U+02C7  ˇ &#711;  Caron
	//  - U+02D8  ˘ &#728;  Breve
	//  - U+02D9  ˙ &#729;  Dot Above
	//  - U+02DA  ˚ &#730;  Ring Above
	//  - U+02DB  ˛ &#731;  Ogonek
	//  - U+02DC  ˜ &#732;  Small Tilde
	//  - U+02DD  ˝ &#733;  Double Acute Accent
	// Latin Extended Additional, 1E00–1EFF
	var extendedWordChars = /^[A-Za-z\xC0-\u02C6\u02C8-\u02D7\u02DE-\u02FF\u1E00-\u1EFF]+$/;

	var reWhitespace = /\S/;

	var wordDiff = /*istanbul ignore start*/exports. /*istanbul ignore end*/wordDiff = new /*istanbul ignore start*/_base2['default'] /*istanbul ignore end*/();
	wordDiff.equals = function (left, right) {
	  return left === right || this.options.ignoreWhitespace && !reWhitespace.test(left) && !reWhitespace.test(right);
	};
	wordDiff.tokenize = function (value) {
	  var tokens = value.split(/(\s+|\b)/);

	  // Join the boundary splits that we do not consider to be boundaries. This is primarily the extended Latin character set.
	  for (var i = 0; i < tokens.length - 1; i++) {
	    // If we have an empty string in the next field and we have only word chars before and after, merge
	    if (!tokens[i + 1] && tokens[i + 2] && extendedWordChars.test(tokens[i]) && extendedWordChars.test(tokens[i + 2])) {
	      tokens[i] += tokens[i + 2];
	      tokens.splice(i + 1, 2);
	      i--;
	    }
	  }

	  return tokens;
	};

	function diffWords(oldStr, newStr, callback) {
	  var options = /*istanbul ignore start*/(0, _params.generateOptions) /*istanbul ignore end*/(callback, { ignoreWhitespace: true });
	  return wordDiff.diff(oldStr, newStr, options);
	}
	function diffWordsWithSpace(oldStr, newStr, callback) {
	  return wordDiff.diff(oldStr, newStr, callback);
	}
	
//**no source maps!**=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9kaWZmL3dvcmQuanMiXSwibmFtZXMiOlsiZGlmZldvcmRzIiwiZGlmZldvcmRzV2l0aFNwYWNlIiwiZXh0ZW5kZWRXb3JkQ2hhcnMiLCJyZVdoaXRlc3BhY2UiLCJ3b3JkRGlmZiIsImVxdWFscyIsImxlZnQiLCJyaWdodCIsIm9wdGlvbnMiLCJpZ25vcmVXaGl0ZXNwYWNlIiwidGVzdCIsInRva2VuaXplIiwidmFsdWUiLCJ0b2tlbnMiLCJzcGxpdCIsImkiLCJsZW5ndGgiLCJzcGxpY2UiLCJvbGRTdHIiLCJuZXdTdHIiLCJjYWxsYmFjayIsImRpZmYiXSwibWFwcGluZ3MiOiI7Ozs7OztnQ0ErQ2dCQSxTLEdBQUFBLFM7eURBSUFDLGtCLEdBQUFBLGtCOztBQW5EaEI7Ozs7dUJBQ0E7Ozs7d0JBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsSUFBTUMsb0JBQW9CLCtEQUExQjs7QUFFQSxJQUFNQyxlQUFlLElBQXJCOztBQUVPLElBQU1DLCtFQUFXLHdFQUFqQjtBQUNQQSxTQUFTQyxNQUFULEdBQWtCLFVBQVNDLElBQVQsRUFBZUMsS0FBZixFQUFzQjtBQUN0QyxTQUFPRCxTQUFTQyxLQUFULElBQW1CLEtBQUtDLE9BQUwsQ0FBYUMsZ0JBQWIsSUFBaUMsQ0FBQ04sYUFBYU8sSUFBYixDQUFrQkosSUFBbEIsQ0FBbEMsSUFBNkQsQ0FBQ0gsYUFBYU8sSUFBYixDQUFrQkgsS0FBbEIsQ0FBeEY7QUFDRCxDQUZEO0FBR0FILFNBQVNPLFFBQVQsR0FBb0IsVUFBU0MsS0FBVCxFQUFnQjtBQUNsQyxNQUFJQyxTQUFTRCxNQUFNRSxLQUFOLENBQVksVUFBWixDQUFiOztBQUVBO0FBQ0EsT0FBSyxJQUFJQyxJQUFJLENBQWIsRUFBZ0JBLElBQUlGLE9BQU9HLE1BQVAsR0FBZ0IsQ0FBcEMsRUFBdUNELEdBQXZDLEVBQTRDO0FBQzFDO0FBQ0EsUUFBSSxDQUFDRixPQUFPRSxJQUFJLENBQVgsQ0FBRCxJQUFrQkYsT0FBT0UsSUFBSSxDQUFYLENBQWxCLElBQ0tiLGtCQUFrQlEsSUFBbEIsQ0FBdUJHLE9BQU9FLENBQVAsQ0FBdkIsQ0FETCxJQUVLYixrQkFBa0JRLElBQWxCLENBQXVCRyxPQUFPRSxJQUFJLENBQVgsQ0FBdkIsQ0FGVCxFQUVnRDtBQUM5Q0YsYUFBT0UsQ0FBUCxLQUFhRixPQUFPRSxJQUFJLENBQVgsQ0FBYjtBQUNBRixhQUFPSSxNQUFQLENBQWNGLElBQUksQ0FBbEIsRUFBcUIsQ0FBckI7QUFDQUE7QUFDRDtBQUNGOztBQUVELFNBQU9GLE1BQVA7QUFDRCxDQWhCRDs7QUFrQk8sU0FBU2IsU0FBVCxDQUFtQmtCLE1BQW5CLEVBQTJCQyxNQUEzQixFQUFtQ0MsUUFBbkMsRUFBNkM7QUFDbEQsTUFBSVosVUFBVSw4RUFBZ0JZLFFBQWhCLEVBQTBCLEVBQUNYLGtCQUFrQixJQUFuQixFQUExQixDQUFkO0FBQ0EsU0FBT0wsU0FBU2lCLElBQVQsQ0FBY0gsTUFBZCxFQUFzQkMsTUFBdEIsRUFBOEJYLE9BQTlCLENBQVA7QUFDRDtBQUNNLFNBQVNQLGtCQUFULENBQTRCaUIsTUFBNUIsRUFBb0NDLE1BQXBDLEVBQTRDQyxRQUE1QyxFQUFzRDtBQUMzRCxTQUFPaEIsU0FBU2lCLElBQVQsQ0FBY0gsTUFBZCxFQUFzQkMsTUFBdEIsRUFBOEJDLFFBQTlCLENBQVA7QUFDRCIsImZpbGUiOiJ3b3JkLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IERpZmYgZnJvbSAnLi9iYXNlJztcbmltcG9ydCB7Z2VuZXJhdGVPcHRpb25zfSBmcm9tICcuLi91dGlsL3BhcmFtcyc7XG5cbi8vIEJhc2VkIG9uIGh0dHBzOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL0xhdGluX3NjcmlwdF9pbl9Vbmljb2RlXG4vL1xuLy8gUmFuZ2VzIGFuZCBleGNlcHRpb25zOlxuLy8gTGF0aW4tMSBTdXBwbGVtZW50LCAwMDgw4oCTMDBGRlxuLy8gIC0gVSswMEQ3ICDDlyBNdWx0aXBsaWNhdGlvbiBzaWduXG4vLyAgLSBVKzAwRjcgIMO3IERpdmlzaW9uIHNpZ25cbi8vIExhdGluIEV4dGVuZGVkLUEsIDAxMDDigJMwMTdGXG4vLyBMYXRpbiBFeHRlbmRlZC1CLCAwMTgw4oCTMDI0RlxuLy8gSVBBIEV4dGVuc2lvbnMsIDAyNTDigJMwMkFGXG4vLyBTcGFjaW5nIE1vZGlmaWVyIExldHRlcnMsIDAyQjDigJMwMkZGXG4vLyAgLSBVKzAyQzcgIMuHICYjNzExOyAgQ2Fyb25cbi8vICAtIFUrMDJEOCAgy5ggJiM3Mjg7ICBCcmV2ZVxuLy8gIC0gVSswMkQ5ICDLmSAmIzcyOTsgIERvdCBBYm92ZVxuLy8gIC0gVSswMkRBICDLmiAmIzczMDsgIFJpbmcgQWJvdmVcbi8vICAtIFUrMDJEQiAgy5sgJiM3MzE7ICBPZ29uZWtcbi8vICAtIFUrMDJEQyAgy5wgJiM3MzI7ICBTbWFsbCBUaWxkZVxuLy8gIC0gVSswMkREICDLnSAmIzczMzsgIERvdWJsZSBBY3V0ZSBBY2NlbnRcbi8vIExhdGluIEV4dGVuZGVkIEFkZGl0aW9uYWwsIDFFMDDigJMxRUZGXG5jb25zdCBleHRlbmRlZFdvcmRDaGFycyA9IC9eW2EtekEtWlxcdXtDMH0tXFx1e0ZGfVxcdXtEOH0tXFx1e0Y2fVxcdXtGOH0tXFx1ezJDNn1cXHV7MkM4fS1cXHV7MkQ3fVxcdXsyREV9LVxcdXsyRkZ9XFx1ezFFMDB9LVxcdXsxRUZGfV0rJC91O1xuXG5jb25zdCByZVdoaXRlc3BhY2UgPSAvXFxTLztcblxuZXhwb3J0IGNvbnN0IHdvcmREaWZmID0gbmV3IERpZmYoKTtcbndvcmREaWZmLmVxdWFscyA9IGZ1bmN0aW9uKGxlZnQsIHJpZ2h0KSB7XG4gIHJldHVybiBsZWZ0ID09PSByaWdodCB8fCAodGhpcy5vcHRpb25zLmlnbm9yZVdoaXRlc3BhY2UgJiYgIXJlV2hpdGVzcGFjZS50ZXN0KGxlZnQpICYmICFyZVdoaXRlc3BhY2UudGVzdChyaWdodCkpO1xufTtcbndvcmREaWZmLnRva2VuaXplID0gZnVuY3Rpb24odmFsdWUpIHtcbiAgbGV0IHRva2VucyA9IHZhbHVlLnNwbGl0KC8oXFxzK3xcXGIpLyk7XG5cbiAgLy8gSm9pbiB0aGUgYm91bmRhcnkgc3BsaXRzIHRoYXQgd2UgZG8gbm90IGNvbnNpZGVyIHRvIGJlIGJvdW5kYXJpZXMuIFRoaXMgaXMgcHJpbWFyaWx5IHRoZSBleHRlbmRlZCBMYXRpbiBjaGFyYWN0ZXIgc2V0LlxuICBmb3IgKGxldCBpID0gMDsgaSA8IHRva2Vucy5sZW5ndGggLSAxOyBpKyspIHtcbiAgICAvLyBJZiB3ZSBoYXZlIGFuIGVtcHR5IHN0cmluZyBpbiB0aGUgbmV4dCBmaWVsZCBhbmQgd2UgaGF2ZSBvbmx5IHdvcmQgY2hhcnMgYmVmb3JlIGFuZCBhZnRlciwgbWVyZ2VcbiAgICBpZiAoIXRva2Vuc1tpICsgMV0gJiYgdG9rZW5zW2kgKyAyXVxuICAgICAgICAgICYmIGV4dGVuZGVkV29yZENoYXJzLnRlc3QodG9rZW5zW2ldKVxuICAgICAgICAgICYmIGV4dGVuZGVkV29yZENoYXJzLnRlc3QodG9rZW5zW2kgKyAyXSkpIHtcbiAgICAgIHRva2Vuc1tpXSArPSB0b2tlbnNbaSArIDJdO1xuICAgICAgdG9rZW5zLnNwbGljZShpICsgMSwgMik7XG4gICAgICBpLS07XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHRva2Vucztcbn07XG5cbmV4cG9ydCBmdW5jdGlvbiBkaWZmV29yZHMob2xkU3RyLCBuZXdTdHIsIGNhbGxiYWNrKSB7XG4gIGxldCBvcHRpb25zID0gZ2VuZXJhdGVPcHRpb25zKGNhbGxiYWNrLCB7aWdub3JlV2hpdGVzcGFjZTogdHJ1ZX0pO1xuICByZXR1cm4gd29yZERpZmYuZGlmZihvbGRTdHIsIG5ld1N0ciwgb3B0aW9ucyk7XG59XG5leHBvcnQgZnVuY3Rpb24gZGlmZldvcmRzV2l0aFNwYWNlKG9sZFN0ciwgbmV3U3RyLCBjYWxsYmFjaykge1xuICByZXR1cm4gd29yZERpZmYuZGlmZihvbGRTdHIsIG5ld1N0ciwgY2FsbGJhY2spO1xufVxuIl19


/***/ },
/* 4 */
/***/ function(module, exports) {

	/*istanbul ignore start*/'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports. /*istanbul ignore end*/generateOptions = generateOptions;
	function generateOptions(options, defaults) {
	  if (typeof options === 'function') {
	    defaults.callback = options;
	  } else if (options) {
	    for (var name in options) {
	      /* istanbul ignore else */
	      if (options.hasOwnProperty(name)) {
	        defaults[name] = options[name];
	      }
	    }
	  }
	  return defaults;
	}
	
//**no source maps!**=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy91dGlsL3BhcmFtcy5qcyJdLCJuYW1lcyI6WyJnZW5lcmF0ZU9wdGlvbnMiLCJvcHRpb25zIiwiZGVmYXVsdHMiLCJjYWxsYmFjayIsIm5hbWUiLCJoYXNPd25Qcm9wZXJ0eSJdLCJtYXBwaW5ncyI6Ijs7Ozs7Z0NBQWdCQSxlLEdBQUFBLGU7QUFBVCxTQUFTQSxlQUFULENBQXlCQyxPQUF6QixFQUFrQ0MsUUFBbEMsRUFBNEM7QUFDakQsTUFBSSxPQUFPRCxPQUFQLEtBQW1CLFVBQXZCLEVBQW1DO0FBQ2pDQyxhQUFTQyxRQUFULEdBQW9CRixPQUFwQjtBQUNELEdBRkQsTUFFTyxJQUFJQSxPQUFKLEVBQWE7QUFDbEIsU0FBSyxJQUFJRyxJQUFULElBQWlCSCxPQUFqQixFQUEwQjtBQUN4QjtBQUNBLFVBQUlBLFFBQVFJLGNBQVIsQ0FBdUJELElBQXZCLENBQUosRUFBa0M7QUFDaENGLGlCQUFTRSxJQUFULElBQWlCSCxRQUFRRyxJQUFSLENBQWpCO0FBQ0Q7QUFDRjtBQUNGO0FBQ0QsU0FBT0YsUUFBUDtBQUNEIiwiZmlsZSI6InBhcmFtcy5qcyIsInNvdXJjZXNDb250ZW50IjpbImV4cG9ydCBmdW5jdGlvbiBnZW5lcmF0ZU9wdGlvbnMob3B0aW9ucywgZGVmYXVsdHMpIHtcbiAgaWYgKHR5cGVvZiBvcHRpb25zID09PSAnZnVuY3Rpb24nKSB7XG4gICAgZGVmYXVsdHMuY2FsbGJhY2sgPSBvcHRpb25zO1xuICB9IGVsc2UgaWYgKG9wdGlvbnMpIHtcbiAgICBmb3IgKGxldCBuYW1lIGluIG9wdGlvbnMpIHtcbiAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBlbHNlICovXG4gICAgICBpZiAob3B0aW9ucy5oYXNPd25Qcm9wZXJ0eShuYW1lKSkge1xuICAgICAgICBkZWZhdWx0c1tuYW1lXSA9IG9wdGlvbnNbbmFtZV07XG4gICAgICB9XG4gICAgfVxuICB9XG4gIHJldHVybiBkZWZhdWx0cztcbn1cbiJdfQ==


/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	/*istanbul ignore start*/'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.lineDiff = undefined;
	exports. /*istanbul ignore end*/diffLines = diffLines;
	/*istanbul ignore start*/exports. /*istanbul ignore end*/diffTrimmedLines = diffTrimmedLines;

	var /*istanbul ignore start*/_base = __webpack_require__(1) /*istanbul ignore end*/;

	/*istanbul ignore start*/var _base2 = _interopRequireDefault(_base);

	/*istanbul ignore end*/var /*istanbul ignore start*/_params = __webpack_require__(4) /*istanbul ignore end*/;

	/*istanbul ignore start*/function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	/*istanbul ignore end*/var lineDiff = /*istanbul ignore start*/exports. /*istanbul ignore end*/lineDiff = new /*istanbul ignore start*/_base2['default'] /*istanbul ignore end*/();
	lineDiff.tokenize = function (value) {
	  var retLines = [],
	      linesAndNewlines = value.split(/(\n|\r\n)/);

	  // Ignore the final empty token that occurs if the string ends with a new line
	  if (!linesAndNewlines[linesAndNewlines.length - 1]) {
	    linesAndNewlines.pop();
	  }

	  // Merge the content and line separators into single tokens
	  for (var i = 0; i < linesAndNewlines.length; i++) {
	    var line = linesAndNewlines[i];

	    if (i % 2 && !this.options.newlineIsToken) {
	      retLines[retLines.length - 1] += line;
	    } else {
	      if (this.options.ignoreWhitespace) {
	        line = line.trim();
	      }
	      retLines.push(line);
	    }
	  }

	  return retLines;
	};

	function diffLines(oldStr, newStr, callback) {
	  return lineDiff.diff(oldStr, newStr, callback);
	}
	function diffTrimmedLines(oldStr, newStr, callback) {
	  var options = /*istanbul ignore start*/(0, _params.generateOptions) /*istanbul ignore end*/(callback, { ignoreWhitespace: true });
	  return lineDiff.diff(oldStr, newStr, options);
	}
	
//**no source maps!**=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9kaWZmL2xpbmUuanMiXSwibmFtZXMiOlsiZGlmZkxpbmVzIiwiZGlmZlRyaW1tZWRMaW5lcyIsImxpbmVEaWZmIiwidG9rZW5pemUiLCJ2YWx1ZSIsInJldExpbmVzIiwibGluZXNBbmROZXdsaW5lcyIsInNwbGl0IiwibGVuZ3RoIiwicG9wIiwiaSIsImxpbmUiLCJvcHRpb25zIiwibmV3bGluZUlzVG9rZW4iLCJpZ25vcmVXaGl0ZXNwYWNlIiwidHJpbSIsInB1c2giLCJvbGRTdHIiLCJuZXdTdHIiLCJjYWxsYmFjayIsImRpZmYiXSwibWFwcGluZ3MiOiI7Ozs7OztnQ0E4QmdCQSxTLEdBQUFBLFM7eURBQ0FDLGdCLEdBQUFBLGdCOztBQS9CaEI7Ozs7dUJBQ0E7Ozs7dUJBRU8sSUFBTUMsK0VBQVcsd0VBQWpCO0FBQ1BBLFNBQVNDLFFBQVQsR0FBb0IsVUFBU0MsS0FBVCxFQUFnQjtBQUNsQyxNQUFJQyxXQUFXLEVBQWY7QUFBQSxNQUNJQyxtQkFBbUJGLE1BQU1HLEtBQU4sQ0FBWSxXQUFaLENBRHZCOztBQUdBO0FBQ0EsTUFBSSxDQUFDRCxpQkFBaUJBLGlCQUFpQkUsTUFBakIsR0FBMEIsQ0FBM0MsQ0FBTCxFQUFvRDtBQUNsREYscUJBQWlCRyxHQUFqQjtBQUNEOztBQUVEO0FBQ0EsT0FBSyxJQUFJQyxJQUFJLENBQWIsRUFBZ0JBLElBQUlKLGlCQUFpQkUsTUFBckMsRUFBNkNFLEdBQTdDLEVBQWtEO0FBQ2hELFFBQUlDLE9BQU9MLGlCQUFpQkksQ0FBakIsQ0FBWDs7QUFFQSxRQUFJQSxJQUFJLENBQUosSUFBUyxDQUFDLEtBQUtFLE9BQUwsQ0FBYUMsY0FBM0IsRUFBMkM7QUFDekNSLGVBQVNBLFNBQVNHLE1BQVQsR0FBa0IsQ0FBM0IsS0FBaUNHLElBQWpDO0FBQ0QsS0FGRCxNQUVPO0FBQ0wsVUFBSSxLQUFLQyxPQUFMLENBQWFFLGdCQUFqQixFQUFtQztBQUNqQ0gsZUFBT0EsS0FBS0ksSUFBTCxFQUFQO0FBQ0Q7QUFDRFYsZUFBU1csSUFBVCxDQUFjTCxJQUFkO0FBQ0Q7QUFDRjs7QUFFRCxTQUFPTixRQUFQO0FBQ0QsQ0F4QkQ7O0FBMEJPLFNBQVNMLFNBQVQsQ0FBbUJpQixNQUFuQixFQUEyQkMsTUFBM0IsRUFBbUNDLFFBQW5DLEVBQTZDO0FBQUUsU0FBT2pCLFNBQVNrQixJQUFULENBQWNILE1BQWQsRUFBc0JDLE1BQXRCLEVBQThCQyxRQUE5QixDQUFQO0FBQWlEO0FBQ2hHLFNBQVNsQixnQkFBVCxDQUEwQmdCLE1BQTFCLEVBQWtDQyxNQUFsQyxFQUEwQ0MsUUFBMUMsRUFBb0Q7QUFDekQsTUFBSVAsVUFBVSw4RUFBZ0JPLFFBQWhCLEVBQTBCLEVBQUNMLGtCQUFrQixJQUFuQixFQUExQixDQUFkO0FBQ0EsU0FBT1osU0FBU2tCLElBQVQsQ0FBY0gsTUFBZCxFQUFzQkMsTUFBdEIsRUFBOEJOLE9BQTlCLENBQVA7QUFDRCIsImZpbGUiOiJsaW5lLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IERpZmYgZnJvbSAnLi9iYXNlJztcbmltcG9ydCB7Z2VuZXJhdGVPcHRpb25zfSBmcm9tICcuLi91dGlsL3BhcmFtcyc7XG5cbmV4cG9ydCBjb25zdCBsaW5lRGlmZiA9IG5ldyBEaWZmKCk7XG5saW5lRGlmZi50b2tlbml6ZSA9IGZ1bmN0aW9uKHZhbHVlKSB7XG4gIGxldCByZXRMaW5lcyA9IFtdLFxuICAgICAgbGluZXNBbmROZXdsaW5lcyA9IHZhbHVlLnNwbGl0KC8oXFxufFxcclxcbikvKTtcblxuICAvLyBJZ25vcmUgdGhlIGZpbmFsIGVtcHR5IHRva2VuIHRoYXQgb2NjdXJzIGlmIHRoZSBzdHJpbmcgZW5kcyB3aXRoIGEgbmV3IGxpbmVcbiAgaWYgKCFsaW5lc0FuZE5ld2xpbmVzW2xpbmVzQW5kTmV3bGluZXMubGVuZ3RoIC0gMV0pIHtcbiAgICBsaW5lc0FuZE5ld2xpbmVzLnBvcCgpO1xuICB9XG5cbiAgLy8gTWVyZ2UgdGhlIGNvbnRlbnQgYW5kIGxpbmUgc2VwYXJhdG9ycyBpbnRvIHNpbmdsZSB0b2tlbnNcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBsaW5lc0FuZE5ld2xpbmVzLmxlbmd0aDsgaSsrKSB7XG4gICAgbGV0IGxpbmUgPSBsaW5lc0FuZE5ld2xpbmVzW2ldO1xuXG4gICAgaWYgKGkgJSAyICYmICF0aGlzLm9wdGlvbnMubmV3bGluZUlzVG9rZW4pIHtcbiAgICAgIHJldExpbmVzW3JldExpbmVzLmxlbmd0aCAtIDFdICs9IGxpbmU7XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmICh0aGlzLm9wdGlvbnMuaWdub3JlV2hpdGVzcGFjZSkge1xuICAgICAgICBsaW5lID0gbGluZS50cmltKCk7XG4gICAgICB9XG4gICAgICByZXRMaW5lcy5wdXNoKGxpbmUpO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiByZXRMaW5lcztcbn07XG5cbmV4cG9ydCBmdW5jdGlvbiBkaWZmTGluZXMob2xkU3RyLCBuZXdTdHIsIGNhbGxiYWNrKSB7IHJldHVybiBsaW5lRGlmZi5kaWZmKG9sZFN0ciwgbmV3U3RyLCBjYWxsYmFjayk7IH1cbmV4cG9ydCBmdW5jdGlvbiBkaWZmVHJpbW1lZExpbmVzKG9sZFN0ciwgbmV3U3RyLCBjYWxsYmFjaykge1xuICBsZXQgb3B0aW9ucyA9IGdlbmVyYXRlT3B0aW9ucyhjYWxsYmFjaywge2lnbm9yZVdoaXRlc3BhY2U6IHRydWV9KTtcbiAgcmV0dXJuIGxpbmVEaWZmLmRpZmYob2xkU3RyLCBuZXdTdHIsIG9wdGlvbnMpO1xufVxuIl19


/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	/*istanbul ignore start*/'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.sentenceDiff = undefined;
	exports. /*istanbul ignore end*/diffSentences = diffSentences;

	var /*istanbul ignore start*/_base = __webpack_require__(1) /*istanbul ignore end*/;

	/*istanbul ignore start*/var _base2 = _interopRequireDefault(_base);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	/*istanbul ignore end*/var sentenceDiff = /*istanbul ignore start*/exports. /*istanbul ignore end*/sentenceDiff = new /*istanbul ignore start*/_base2['default'] /*istanbul ignore end*/();
	sentenceDiff.tokenize = function (value) {
	  return value.split(/(\S.+?[.!?])(?=\s+|$)/);
	};

	function diffSentences(oldStr, newStr, callback) {
	  return sentenceDiff.diff(oldStr, newStr, callback);
	}
	
//**no source maps!**=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9kaWZmL3NlbnRlbmNlLmpzIl0sIm5hbWVzIjpbImRpZmZTZW50ZW5jZXMiLCJzZW50ZW5jZURpZmYiLCJ0b2tlbml6ZSIsInZhbHVlIiwic3BsaXQiLCJvbGRTdHIiLCJuZXdTdHIiLCJjYWxsYmFjayIsImRpZmYiXSwibWFwcGluZ3MiOiI7Ozs7OztnQ0FRZ0JBLGEsR0FBQUEsYTs7QUFSaEI7Ozs7Ozt1QkFHTyxJQUFNQyx1RkFBZSx3RUFBckI7QUFDUEEsYUFBYUMsUUFBYixHQUF3QixVQUFTQyxLQUFULEVBQWdCO0FBQ3RDLFNBQU9BLE1BQU1DLEtBQU4sQ0FBWSx1QkFBWixDQUFQO0FBQ0QsQ0FGRDs7QUFJTyxTQUFTSixhQUFULENBQXVCSyxNQUF2QixFQUErQkMsTUFBL0IsRUFBdUNDLFFBQXZDLEVBQWlEO0FBQUUsU0FBT04sYUFBYU8sSUFBYixDQUFrQkgsTUFBbEIsRUFBMEJDLE1BQTFCLEVBQWtDQyxRQUFsQyxDQUFQO0FBQXFEIiwiZmlsZSI6InNlbnRlbmNlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IERpZmYgZnJvbSAnLi9iYXNlJztcblxuXG5leHBvcnQgY29uc3Qgc2VudGVuY2VEaWZmID0gbmV3IERpZmYoKTtcbnNlbnRlbmNlRGlmZi50b2tlbml6ZSA9IGZ1bmN0aW9uKHZhbHVlKSB7XG4gIHJldHVybiB2YWx1ZS5zcGxpdCgvKFxcUy4rP1suIT9dKSg/PVxccyt8JCkvKTtcbn07XG5cbmV4cG9ydCBmdW5jdGlvbiBkaWZmU2VudGVuY2VzKG9sZFN0ciwgbmV3U3RyLCBjYWxsYmFjaykgeyByZXR1cm4gc2VudGVuY2VEaWZmLmRpZmYob2xkU3RyLCBuZXdTdHIsIGNhbGxiYWNrKTsgfVxuIl19


/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	/*istanbul ignore start*/'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.cssDiff = undefined;
	exports. /*istanbul ignore end*/diffCss = diffCss;

	var /*istanbul ignore start*/_base = __webpack_require__(1) /*istanbul ignore end*/;

	/*istanbul ignore start*/var _base2 = _interopRequireDefault(_base);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	/*istanbul ignore end*/var cssDiff = /*istanbul ignore start*/exports. /*istanbul ignore end*/cssDiff = new /*istanbul ignore start*/_base2['default'] /*istanbul ignore end*/();
	cssDiff.tokenize = function (value) {
	  return value.split(/([{}:;,]|\s+)/);
	};

	function diffCss(oldStr, newStr, callback) {
	  return cssDiff.diff(oldStr, newStr, callback);
	}
	
//**no source maps!**=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9kaWZmL2Nzcy5qcyJdLCJuYW1lcyI6WyJkaWZmQ3NzIiwiY3NzRGlmZiIsInRva2VuaXplIiwidmFsdWUiLCJzcGxpdCIsIm9sZFN0ciIsIm5ld1N0ciIsImNhbGxiYWNrIiwiZGlmZiJdLCJtYXBwaW5ncyI6Ijs7Ozs7O2dDQU9nQkEsTyxHQUFBQSxPOztBQVBoQjs7Ozs7O3VCQUVPLElBQU1DLDZFQUFVLHdFQUFoQjtBQUNQQSxRQUFRQyxRQUFSLEdBQW1CLFVBQVNDLEtBQVQsRUFBZ0I7QUFDakMsU0FBT0EsTUFBTUMsS0FBTixDQUFZLGVBQVosQ0FBUDtBQUNELENBRkQ7O0FBSU8sU0FBU0osT0FBVCxDQUFpQkssTUFBakIsRUFBeUJDLE1BQXpCLEVBQWlDQyxRQUFqQyxFQUEyQztBQUFFLFNBQU9OLFFBQVFPLElBQVIsQ0FBYUgsTUFBYixFQUFxQkMsTUFBckIsRUFBNkJDLFFBQTdCLENBQVA7QUFBZ0QiLCJmaWxlIjoiY3NzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IERpZmYgZnJvbSAnLi9iYXNlJztcblxuZXhwb3J0IGNvbnN0IGNzc0RpZmYgPSBuZXcgRGlmZigpO1xuY3NzRGlmZi50b2tlbml6ZSA9IGZ1bmN0aW9uKHZhbHVlKSB7XG4gIHJldHVybiB2YWx1ZS5zcGxpdCgvKFt7fTo7LF18XFxzKykvKTtcbn07XG5cbmV4cG9ydCBmdW5jdGlvbiBkaWZmQ3NzKG9sZFN0ciwgbmV3U3RyLCBjYWxsYmFjaykgeyByZXR1cm4gY3NzRGlmZi5kaWZmKG9sZFN0ciwgbmV3U3RyLCBjYWxsYmFjayk7IH1cbiJdfQ==


/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	/*istanbul ignore start*/'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.jsonDiff = undefined;

	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

	exports. /*istanbul ignore end*/diffJson = diffJson;
	/*istanbul ignore start*/exports. /*istanbul ignore end*/canonicalize = canonicalize;

	var /*istanbul ignore start*/_base = __webpack_require__(1) /*istanbul ignore end*/;

	/*istanbul ignore start*/var _base2 = _interopRequireDefault(_base);

	/*istanbul ignore end*/var /*istanbul ignore start*/_line = __webpack_require__(5) /*istanbul ignore end*/;

	/*istanbul ignore start*/function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	/*istanbul ignore end*/var objectPrototypeToString = Object.prototype.toString;

	var jsonDiff = /*istanbul ignore start*/exports. /*istanbul ignore end*/jsonDiff = new /*istanbul ignore start*/_base2['default'] /*istanbul ignore end*/();
	// Discriminate between two lines of pretty-printed, serialized JSON where one of them has a
	// dangling comma and the other doesn't. Turns out including the dangling comma yields the nicest output:
	jsonDiff.useLongestToken = true;

	jsonDiff.tokenize = /*istanbul ignore start*/_line.lineDiff /*istanbul ignore end*/.tokenize;
	jsonDiff.castInput = function (value) {
	  return typeof value === 'string' ? value : JSON.stringify(canonicalize(value), undefined, '  ');
	};
	jsonDiff.equals = function (left, right) {
	  return (/*istanbul ignore start*/_base2['default'] /*istanbul ignore end*/.prototype.equals(left.replace(/,([\r\n])/g, '$1'), right.replace(/,([\r\n])/g, '$1'))
	  );
	};

	function diffJson(oldObj, newObj, callback) {
	  return jsonDiff.diff(oldObj, newObj, callback);
	}

	// This function handles the presence of circular references by bailing out when encountering an
	// object that is already on the "stack" of items being processed.
	function canonicalize(obj, stack, replacementStack) {
	  stack = stack || [];
	  replacementStack = replacementStack || [];

	  var i = /*istanbul ignore start*/void 0 /*istanbul ignore end*/;

	  for (i = 0; i < stack.length; i += 1) {
	    if (stack[i] === obj) {
	      return replacementStack[i];
	    }
	  }

	  var canonicalizedObj = /*istanbul ignore start*/void 0 /*istanbul ignore end*/;

	  if ('[object Array]' === objectPrototypeToString.call(obj)) {
	    stack.push(obj);
	    canonicalizedObj = new Array(obj.length);
	    replacementStack.push(canonicalizedObj);
	    for (i = 0; i < obj.length; i += 1) {
	      canonicalizedObj[i] = canonicalize(obj[i], stack, replacementStack);
	    }
	    stack.pop();
	    replacementStack.pop();
	    return canonicalizedObj;
	  }

	  if (obj && obj.toJSON) {
	    obj = obj.toJSON();
	  }

	  if ( /*istanbul ignore start*/(typeof /*istanbul ignore end*/obj === 'undefined' ? 'undefined' : _typeof(obj)) === 'object' && obj !== null) {
	    stack.push(obj);
	    canonicalizedObj = {};
	    replacementStack.push(canonicalizedObj);
	    var sortedKeys = [],
	        key = /*istanbul ignore start*/void 0 /*istanbul ignore end*/;
	    for (key in obj) {
	      /* istanbul ignore else */
	      if (obj.hasOwnProperty(key)) {
	        sortedKeys.push(key);
	      }
	    }
	    sortedKeys.sort();
	    for (i = 0; i < sortedKeys.length; i += 1) {
	      key = sortedKeys[i];
	      canonicalizedObj[key] = canonicalize(obj[key], stack, replacementStack);
	    }
	    stack.pop();
	    replacementStack.pop();
	  } else {
	    canonicalizedObj = obj;
	  }
	  return canonicalizedObj;
	}
	
//**no source maps!**=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9kaWZmL2pzb24uanMiXSwibmFtZXMiOlsiZGlmZkpzb24iLCJjYW5vbmljYWxpemUiLCJvYmplY3RQcm90b3R5cGVUb1N0cmluZyIsIk9iamVjdCIsInByb3RvdHlwZSIsInRvU3RyaW5nIiwianNvbkRpZmYiLCJ1c2VMb25nZXN0VG9rZW4iLCJ0b2tlbml6ZSIsImNhc3RJbnB1dCIsInZhbHVlIiwiSlNPTiIsInN0cmluZ2lmeSIsInVuZGVmaW5lZCIsImVxdWFscyIsImxlZnQiLCJyaWdodCIsInJlcGxhY2UiLCJvbGRPYmoiLCJuZXdPYmoiLCJjYWxsYmFjayIsImRpZmYiLCJvYmoiLCJzdGFjayIsInJlcGxhY2VtZW50U3RhY2siLCJpIiwibGVuZ3RoIiwiY2Fub25pY2FsaXplZE9iaiIsImNhbGwiLCJwdXNoIiwiQXJyYXkiLCJwb3AiLCJ0b0pTT04iLCJzb3J0ZWRLZXlzIiwia2V5IiwiaGFzT3duUHJvcGVydHkiLCJzb3J0Il0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Z0NBbUJnQkEsUSxHQUFBQSxRO3lEQUtBQyxZLEdBQUFBLFk7O0FBeEJoQjs7Ozt1QkFDQTs7Ozt1QkFFQSxJQUFNQywwQkFBMEJDLE9BQU9DLFNBQVAsQ0FBaUJDLFFBQWpEOztBQUdPLElBQU1DLCtFQUFXLHdFQUFqQjtBQUNQO0FBQ0E7QUFDQUEsU0FBU0MsZUFBVCxHQUEyQixJQUEzQjs7QUFFQUQsU0FBU0UsUUFBVCxHQUFvQixnRUFBU0EsUUFBN0I7QUFDQUYsU0FBU0csU0FBVCxHQUFxQixVQUFTQyxLQUFULEVBQWdCO0FBQ25DLFNBQU8sT0FBT0EsS0FBUCxLQUFpQixRQUFqQixHQUE0QkEsS0FBNUIsR0FBb0NDLEtBQUtDLFNBQUwsQ0FBZVgsYUFBYVMsS0FBYixDQUFmLEVBQW9DRyxTQUFwQyxFQUErQyxJQUEvQyxDQUEzQztBQUNELENBRkQ7QUFHQVAsU0FBU1EsTUFBVCxHQUFrQixVQUFTQyxJQUFULEVBQWVDLEtBQWYsRUFBc0I7QUFDdEMsU0FBTyxvRUFBS1osU0FBTCxDQUFlVSxNQUFmLENBQXNCQyxLQUFLRSxPQUFMLENBQWEsWUFBYixFQUEyQixJQUEzQixDQUF0QixFQUF3REQsTUFBTUMsT0FBTixDQUFjLFlBQWQsRUFBNEIsSUFBNUIsQ0FBeEQ7QUFBUDtBQUNELENBRkQ7O0FBSU8sU0FBU2pCLFFBQVQsQ0FBa0JrQixNQUFsQixFQUEwQkMsTUFBMUIsRUFBa0NDLFFBQWxDLEVBQTRDO0FBQUUsU0FBT2QsU0FBU2UsSUFBVCxDQUFjSCxNQUFkLEVBQXNCQyxNQUF0QixFQUE4QkMsUUFBOUIsQ0FBUDtBQUFpRDs7QUFHdEc7QUFDQTtBQUNPLFNBQVNuQixZQUFULENBQXNCcUIsR0FBdEIsRUFBMkJDLEtBQTNCLEVBQWtDQyxnQkFBbEMsRUFBb0Q7QUFDekRELFVBQVFBLFNBQVMsRUFBakI7QUFDQUMscUJBQW1CQSxvQkFBb0IsRUFBdkM7O0FBRUEsTUFBSUMsbUNBQUo7O0FBRUEsT0FBS0EsSUFBSSxDQUFULEVBQVlBLElBQUlGLE1BQU1HLE1BQXRCLEVBQThCRCxLQUFLLENBQW5DLEVBQXNDO0FBQ3BDLFFBQUlGLE1BQU1FLENBQU4sTUFBYUgsR0FBakIsRUFBc0I7QUFDcEIsYUFBT0UsaUJBQWlCQyxDQUFqQixDQUFQO0FBQ0Q7QUFDRjs7QUFFRCxNQUFJRSxrREFBSjs7QUFFQSxNQUFJLHFCQUFxQnpCLHdCQUF3QjBCLElBQXhCLENBQTZCTixHQUE3QixDQUF6QixFQUE0RDtBQUMxREMsVUFBTU0sSUFBTixDQUFXUCxHQUFYO0FBQ0FLLHVCQUFtQixJQUFJRyxLQUFKLENBQVVSLElBQUlJLE1BQWQsQ0FBbkI7QUFDQUYscUJBQWlCSyxJQUFqQixDQUFzQkYsZ0JBQXRCO0FBQ0EsU0FBS0YsSUFBSSxDQUFULEVBQVlBLElBQUlILElBQUlJLE1BQXBCLEVBQTRCRCxLQUFLLENBQWpDLEVBQW9DO0FBQ2xDRSx1QkFBaUJGLENBQWpCLElBQXNCeEIsYUFBYXFCLElBQUlHLENBQUosQ0FBYixFQUFxQkYsS0FBckIsRUFBNEJDLGdCQUE1QixDQUF0QjtBQUNEO0FBQ0RELFVBQU1RLEdBQU47QUFDQVAscUJBQWlCTyxHQUFqQjtBQUNBLFdBQU9KLGdCQUFQO0FBQ0Q7O0FBRUQsTUFBSUwsT0FBT0EsSUFBSVUsTUFBZixFQUF1QjtBQUNyQlYsVUFBTUEsSUFBSVUsTUFBSixFQUFOO0FBQ0Q7O0FBRUQsTUFBSSx5REFBT1YsR0FBUCx5Q0FBT0EsR0FBUCxPQUFlLFFBQWYsSUFBMkJBLFFBQVEsSUFBdkMsRUFBNkM7QUFDM0NDLFVBQU1NLElBQU4sQ0FBV1AsR0FBWDtBQUNBSyx1QkFBbUIsRUFBbkI7QUFDQUgscUJBQWlCSyxJQUFqQixDQUFzQkYsZ0JBQXRCO0FBQ0EsUUFBSU0sYUFBYSxFQUFqQjtBQUFBLFFBQ0lDLHFDQURKO0FBRUEsU0FBS0EsR0FBTCxJQUFZWixHQUFaLEVBQWlCO0FBQ2Y7QUFDQSxVQUFJQSxJQUFJYSxjQUFKLENBQW1CRCxHQUFuQixDQUFKLEVBQTZCO0FBQzNCRCxtQkFBV0osSUFBWCxDQUFnQkssR0FBaEI7QUFDRDtBQUNGO0FBQ0RELGVBQVdHLElBQVg7QUFDQSxTQUFLWCxJQUFJLENBQVQsRUFBWUEsSUFBSVEsV0FBV1AsTUFBM0IsRUFBbUNELEtBQUssQ0FBeEMsRUFBMkM7QUFDekNTLFlBQU1ELFdBQVdSLENBQVgsQ0FBTjtBQUNBRSx1QkFBaUJPLEdBQWpCLElBQXdCakMsYUFBYXFCLElBQUlZLEdBQUosQ0FBYixFQUF1QlgsS0FBdkIsRUFBOEJDLGdCQUE5QixDQUF4QjtBQUNEO0FBQ0RELFVBQU1RLEdBQU47QUFDQVAscUJBQWlCTyxHQUFqQjtBQUNELEdBbkJELE1BbUJPO0FBQ0xKLHVCQUFtQkwsR0FBbkI7QUFDRDtBQUNELFNBQU9LLGdCQUFQO0FBQ0QiLCJmaWxlIjoianNvbi5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBEaWZmIGZyb20gJy4vYmFzZSc7XG5pbXBvcnQge2xpbmVEaWZmfSBmcm9tICcuL2xpbmUnO1xuXG5jb25zdCBvYmplY3RQcm90b3R5cGVUb1N0cmluZyA9IE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmc7XG5cblxuZXhwb3J0IGNvbnN0IGpzb25EaWZmID0gbmV3IERpZmYoKTtcbi8vIERpc2NyaW1pbmF0ZSBiZXR3ZWVuIHR3byBsaW5lcyBvZiBwcmV0dHktcHJpbnRlZCwgc2VyaWFsaXplZCBKU09OIHdoZXJlIG9uZSBvZiB0aGVtIGhhcyBhXG4vLyBkYW5nbGluZyBjb21tYSBhbmQgdGhlIG90aGVyIGRvZXNuJ3QuIFR1cm5zIG91dCBpbmNsdWRpbmcgdGhlIGRhbmdsaW5nIGNvbW1hIHlpZWxkcyB0aGUgbmljZXN0IG91dHB1dDpcbmpzb25EaWZmLnVzZUxvbmdlc3RUb2tlbiA9IHRydWU7XG5cbmpzb25EaWZmLnRva2VuaXplID0gbGluZURpZmYudG9rZW5pemU7XG5qc29uRGlmZi5jYXN0SW5wdXQgPSBmdW5jdGlvbih2YWx1ZSkge1xuICByZXR1cm4gdHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJyA/IHZhbHVlIDogSlNPTi5zdHJpbmdpZnkoY2Fub25pY2FsaXplKHZhbHVlKSwgdW5kZWZpbmVkLCAnICAnKTtcbn07XG5qc29uRGlmZi5lcXVhbHMgPSBmdW5jdGlvbihsZWZ0LCByaWdodCkge1xuICByZXR1cm4gRGlmZi5wcm90b3R5cGUuZXF1YWxzKGxlZnQucmVwbGFjZSgvLChbXFxyXFxuXSkvZywgJyQxJyksIHJpZ2h0LnJlcGxhY2UoLywoW1xcclxcbl0pL2csICckMScpKTtcbn07XG5cbmV4cG9ydCBmdW5jdGlvbiBkaWZmSnNvbihvbGRPYmosIG5ld09iaiwgY2FsbGJhY2spIHsgcmV0dXJuIGpzb25EaWZmLmRpZmYob2xkT2JqLCBuZXdPYmosIGNhbGxiYWNrKTsgfVxuXG5cbi8vIFRoaXMgZnVuY3Rpb24gaGFuZGxlcyB0aGUgcHJlc2VuY2Ugb2YgY2lyY3VsYXIgcmVmZXJlbmNlcyBieSBiYWlsaW5nIG91dCB3aGVuIGVuY291bnRlcmluZyBhblxuLy8gb2JqZWN0IHRoYXQgaXMgYWxyZWFkeSBvbiB0aGUgXCJzdGFja1wiIG9mIGl0ZW1zIGJlaW5nIHByb2Nlc3NlZC5cbmV4cG9ydCBmdW5jdGlvbiBjYW5vbmljYWxpemUob2JqLCBzdGFjaywgcmVwbGFjZW1lbnRTdGFjaykge1xuICBzdGFjayA9IHN0YWNrIHx8IFtdO1xuICByZXBsYWNlbWVudFN0YWNrID0gcmVwbGFjZW1lbnRTdGFjayB8fCBbXTtcblxuICBsZXQgaTtcblxuICBmb3IgKGkgPSAwOyBpIDwgc3RhY2subGVuZ3RoOyBpICs9IDEpIHtcbiAgICBpZiAoc3RhY2tbaV0gPT09IG9iaikge1xuICAgICAgcmV0dXJuIHJlcGxhY2VtZW50U3RhY2tbaV07XG4gICAgfVxuICB9XG5cbiAgbGV0IGNhbm9uaWNhbGl6ZWRPYmo7XG5cbiAgaWYgKCdbb2JqZWN0IEFycmF5XScgPT09IG9iamVjdFByb3RvdHlwZVRvU3RyaW5nLmNhbGwob2JqKSkge1xuICAgIHN0YWNrLnB1c2gob2JqKTtcbiAgICBjYW5vbmljYWxpemVkT2JqID0gbmV3IEFycmF5KG9iai5sZW5ndGgpO1xuICAgIHJlcGxhY2VtZW50U3RhY2sucHVzaChjYW5vbmljYWxpemVkT2JqKTtcbiAgICBmb3IgKGkgPSAwOyBpIDwgb2JqLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgICBjYW5vbmljYWxpemVkT2JqW2ldID0gY2Fub25pY2FsaXplKG9ialtpXSwgc3RhY2ssIHJlcGxhY2VtZW50U3RhY2spO1xuICAgIH1cbiAgICBzdGFjay5wb3AoKTtcbiAgICByZXBsYWNlbWVudFN0YWNrLnBvcCgpO1xuICAgIHJldHVybiBjYW5vbmljYWxpemVkT2JqO1xuICB9XG5cbiAgaWYgKG9iaiAmJiBvYmoudG9KU09OKSB7XG4gICAgb2JqID0gb2JqLnRvSlNPTigpO1xuICB9XG5cbiAgaWYgKHR5cGVvZiBvYmogPT09ICdvYmplY3QnICYmIG9iaiAhPT0gbnVsbCkge1xuICAgIHN0YWNrLnB1c2gob2JqKTtcbiAgICBjYW5vbmljYWxpemVkT2JqID0ge307XG4gICAgcmVwbGFjZW1lbnRTdGFjay5wdXNoKGNhbm9uaWNhbGl6ZWRPYmopO1xuICAgIGxldCBzb3J0ZWRLZXlzID0gW10sXG4gICAgICAgIGtleTtcbiAgICBmb3IgKGtleSBpbiBvYmopIHtcbiAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBlbHNlICovXG4gICAgICBpZiAob2JqLmhhc093blByb3BlcnR5KGtleSkpIHtcbiAgICAgICAgc29ydGVkS2V5cy5wdXNoKGtleSk7XG4gICAgICB9XG4gICAgfVxuICAgIHNvcnRlZEtleXMuc29ydCgpO1xuICAgIGZvciAoaSA9IDA7IGkgPCBzb3J0ZWRLZXlzLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgICBrZXkgPSBzb3J0ZWRLZXlzW2ldO1xuICAgICAgY2Fub25pY2FsaXplZE9ialtrZXldID0gY2Fub25pY2FsaXplKG9ialtrZXldLCBzdGFjaywgcmVwbGFjZW1lbnRTdGFjayk7XG4gICAgfVxuICAgIHN0YWNrLnBvcCgpO1xuICAgIHJlcGxhY2VtZW50U3RhY2sucG9wKCk7XG4gIH0gZWxzZSB7XG4gICAgY2Fub25pY2FsaXplZE9iaiA9IG9iajtcbiAgfVxuICByZXR1cm4gY2Fub25pY2FsaXplZE9iajtcbn1cbiJdfQ==


/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	/*istanbul ignore start*/'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports. /*istanbul ignore end*/applyPatch = applyPatch;
	/*istanbul ignore start*/exports. /*istanbul ignore end*/applyPatches = applyPatches;

	var /*istanbul ignore start*/_parse = __webpack_require__(10) /*istanbul ignore end*/;

	var /*istanbul ignore start*/_distanceIterator = __webpack_require__(11) /*istanbul ignore end*/;

	/*istanbul ignore start*/var _distanceIterator2 = _interopRequireDefault(_distanceIterator);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	/*istanbul ignore end*/function applyPatch(source, uniDiff) {
	  /*istanbul ignore start*/var /*istanbul ignore end*/options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

	  if (typeof uniDiff === 'string') {
	    uniDiff = /*istanbul ignore start*/(0, _parse.parsePatch) /*istanbul ignore end*/(uniDiff);
	  }

	  if (Array.isArray(uniDiff)) {
	    if (uniDiff.length > 1) {
	      throw new Error('applyPatch only works with a single input.');
	    }

	    uniDiff = uniDiff[0];
	  }

	  // Apply the diff to the input
	  var lines = source.split('\n'),
	      hunks = uniDiff.hunks,
	      compareLine = options.compareLine || function (lineNumber, line, operation, patchContent) /*istanbul ignore start*/{
	    return (/*istanbul ignore end*/line === patchContent
	    );
	  },
	      errorCount = 0,
	      fuzzFactor = options.fuzzFactor || 0,
	      minLine = 0,
	      offset = 0,
	      removeEOFNL = /*istanbul ignore start*/void 0 /*istanbul ignore end*/,
	      addEOFNL = /*istanbul ignore start*/void 0 /*istanbul ignore end*/;

	  /**
	   * Checks if the hunk exactly fits on the provided location
	   */
	  function hunkFits(hunk, toPos) {
	    for (var j = 0; j < hunk.lines.length; j++) {
	      var line = hunk.lines[j],
	          operation = line[0],
	          content = line.substr(1);

	      if (operation === ' ' || operation === '-') {
	        // Context sanity check
	        if (!compareLine(toPos + 1, lines[toPos], operation, content)) {
	          errorCount++;

	          if (errorCount > fuzzFactor) {
	            return false;
	          }
	        }
	        toPos++;
	      }
	    }

	    return true;
	  }

	  // Search best fit offsets for each hunk based on the previous ones
	  for (var i = 0; i < hunks.length; i++) {
	    var hunk = hunks[i],
	        maxLine = lines.length - hunk.oldLines,
	        localOffset = 0,
	        toPos = offset + hunk.oldStart - 1;

	    var iterator = /*istanbul ignore start*/(0, _distanceIterator2['default']) /*istanbul ignore end*/(toPos, minLine, maxLine);

	    for (; localOffset !== undefined; localOffset = iterator()) {
	      if (hunkFits(hunk, toPos + localOffset)) {
	        hunk.offset = offset += localOffset;
	        break;
	      }
	    }

	    if (localOffset === undefined) {
	      return false;
	    }

	    // Set lower text limit to end of the current hunk, so next ones don't try
	    // to fit over already patched text
	    minLine = hunk.offset + hunk.oldStart + hunk.oldLines;
	  }

	  // Apply patch hunks
	  for (var _i = 0; _i < hunks.length; _i++) {
	    var _hunk = hunks[_i],
	        _toPos = _hunk.offset + _hunk.newStart - 1;
	    if (_hunk.newLines == 0) {
	      _toPos++;
	    }

	    for (var j = 0; j < _hunk.lines.length; j++) {
	      var line = _hunk.lines[j],
	          operation = line[0],
	          content = line.substr(1);

	      if (operation === ' ') {
	        _toPos++;
	      } else if (operation === '-') {
	        lines.splice(_toPos, 1);
	        /* istanbul ignore else */
	      } else if (operation === '+') {
	        lines.splice(_toPos, 0, content);
	        _toPos++;
	      } else if (operation === '\\') {
	        var previousOperation = _hunk.lines[j - 1] ? _hunk.lines[j - 1][0] : null;
	        if (previousOperation === '+') {
	          removeEOFNL = true;
	        } else if (previousOperation === '-') {
	          addEOFNL = true;
	        }
	      }
	    }
	  }

	  // Handle EOFNL insertion/removal
	  if (removeEOFNL) {
	    while (!lines[lines.length - 1]) {
	      lines.pop();
	    }
	  } else if (addEOFNL) {
	    lines.push('');
	  }
	  return lines.join('\n');
	}

	// Wrapper that supports multiple file patches via callbacks.
	function applyPatches(uniDiff, options) {
	  if (typeof uniDiff === 'string') {
	    uniDiff = /*istanbul ignore start*/(0, _parse.parsePatch) /*istanbul ignore end*/(uniDiff);
	  }

	  var currentIndex = 0;
	  function processIndex() {
	    var index = uniDiff[currentIndex++];
	    if (!index) {
	      return options.complete();
	    }

	    options.loadFile(index, function (err, data) {
	      if (err) {
	        return options.complete(err);
	      }

	      var updatedContent = applyPatch(data, index, options);
	      options.patched(index, updatedContent, function (err) {
	        if (err) {
	          return options.complete(err);
	        }

	        processIndex();
	      });
	    });
	  }
	  processIndex();
	}
	
//**no source maps!**=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9wYXRjaC9hcHBseS5qcyJdLCJuYW1lcyI6WyJhcHBseVBhdGNoIiwiYXBwbHlQYXRjaGVzIiwic291cmNlIiwidW5pRGlmZiIsIm9wdGlvbnMiLCJBcnJheSIsImlzQXJyYXkiLCJsZW5ndGgiLCJFcnJvciIsImxpbmVzIiwic3BsaXQiLCJodW5rcyIsImNvbXBhcmVMaW5lIiwibGluZU51bWJlciIsImxpbmUiLCJvcGVyYXRpb24iLCJwYXRjaENvbnRlbnQiLCJlcnJvckNvdW50IiwiZnV6ekZhY3RvciIsIm1pbkxpbmUiLCJvZmZzZXQiLCJyZW1vdmVFT0ZOTCIsImFkZEVPRk5MIiwiaHVua0ZpdHMiLCJodW5rIiwidG9Qb3MiLCJqIiwiY29udGVudCIsInN1YnN0ciIsImkiLCJtYXhMaW5lIiwib2xkTGluZXMiLCJsb2NhbE9mZnNldCIsIm9sZFN0YXJ0IiwiaXRlcmF0b3IiLCJ1bmRlZmluZWQiLCJuZXdTdGFydCIsIm5ld0xpbmVzIiwic3BsaWNlIiwicHJldmlvdXNPcGVyYXRpb24iLCJwb3AiLCJwdXNoIiwiam9pbiIsImN1cnJlbnRJbmRleCIsInByb2Nlc3NJbmRleCIsImluZGV4IiwiY29tcGxldGUiLCJsb2FkRmlsZSIsImVyciIsImRhdGEiLCJ1cGRhdGVkQ29udGVudCIsInBhdGNoZWQiXSwibWFwcGluZ3MiOiI7Ozs7O2dDQUdnQkEsVSxHQUFBQSxVO3lEQXNIQUMsWSxHQUFBQSxZOztBQXpIaEI7O0FBQ0E7Ozs7Ozt1QkFFTyxTQUFTRCxVQUFULENBQW9CRSxNQUFwQixFQUE0QkMsT0FBNUIsRUFBbUQ7QUFBQSxzREFBZEMsT0FBYyx1RUFBSixFQUFJOztBQUN4RCxNQUFJLE9BQU9ELE9BQVAsS0FBbUIsUUFBdkIsRUFBaUM7QUFDL0JBLGNBQVUsd0VBQVdBLE9BQVgsQ0FBVjtBQUNEOztBQUVELE1BQUlFLE1BQU1DLE9BQU4sQ0FBY0gsT0FBZCxDQUFKLEVBQTRCO0FBQzFCLFFBQUlBLFFBQVFJLE1BQVIsR0FBaUIs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QixFQUF3QztBQUM3QyxNQUFJLE9BQU9ELE9BQVAsS0FBbUIsUUFBdkIsRUFBaUM7QUFDL0JBLGNBQVUsd0VBQVdBLE9BQVgsQ0FBVjtBQUNEOztBQUVELE1BQUl3QyxlQUFlLENBQW5CO0FBQ0EsV0FBU0MsWUFBVCxHQUF3QjtBQUN0QixRQUFJQyxRQUFRMUMsUUFBUXdDLGNBQVIsQ0FBWjtBQUNBLFFBQUksQ0FBQ0UsS0FBTCxFQUFZO0FBQ1YsYUFBT3pDLFFBQVEwQyxRQUFSLEVBQVA7QUFDRDs7QUFFRDFDLFlBQVEyQyxRQUFSLENBQWlCRixLQUFqQixFQUF3QixVQUFTRyxHQUFULEVBQWNDLElBQWQsRUFBb0I7QUFDMUMsVUFBSUQsR0FBSixFQUFTO0FBQ1AsZUFBTzVDLFFBQVEwQyxRQUFSLENBQWlCRSxHQUFqQixDQUFQO0FBQ0Q7O0FBRUQsVUFBSUUsaUJBQWlCbEQsV0FBV2lELElBQVgsRUFBaUJKLEtBQWpCLEVBQXdCekMsT0FBeEIsQ0FBckI7QUFDQUEsY0FBUStDLE9BQVIsQ0FBZ0JOLEtBQWhCLEVBQXVCSyxjQUF2QixFQUF1QyxVQUFTRixHQUFULEVBQWM7QUFDbkQsWUFBSUEsR0FBSixFQUFTO0FBQ1AsaUJBQU81QyxRQUFRMEMsUUFBUixDQUFpQkUsR0FBakIsQ0FBUDtBQUNEOztBQUVESjtBQUNELE9BTkQ7QUFPRCxLQWJEO0FBY0Q7QUFDREE7QUFDRCIsImZpbGUiOiJhcHBseS5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7cGFyc2VQYXRjaH0gZnJvbSAnLi9wYXJzZSc7XG5pbXBvcnQgZGlzdGFuY2VJdGVyYXRvciBmcm9tICcuLi91dGlsL2Rpc3RhbmNlLWl0ZXJhdG9yJztcblxuZXhwb3J0IGZ1bmN0aW9uIGFwcGx5UGF0Y2goc291cmNlLCB1bmlEaWZmLCBvcHRpb25zID0ge30pIHtcbiAgaWYgKHR5cGVvZiB1bmlEaWZmID09PSAnc3RyaW5nJykge1xuICAgIHVuaURpZmYgPSBwYXJzZVBhdGNoKHVuaURpZmYpO1xuICB9XG5cbiAgaWYgKEFycmF5LmlzQXJyYXkodW5pRGlmZikpIHtcbiAgICBpZiAodW5pRGlmZi5sZW5ndGggPiAxKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ2FwcGx5UGF0Y2ggb25seSB3b3JrcyB3aXRoIGEgc2luZ2xlIGlucHV0LicpO1xuICAgIH1cblxuICAgIHVuaURpZmYgPSB1bmlEaWZmWzBdO1xuICB9XG5cbiAgLy8gQXBwbHkgdGhlIGRpZmYgdG8gdGhlIGlucHV0XG4gIGxldCBsaW5lcyA9IHNvdXJjZS5zcGxpdCgnXFxuJyksXG4gICAgICBodW5rcyA9IHVuaURpZmYuaHVua3MsXG5cbiAgICAgIGNvbXBhcmVMaW5lID0gb3B0aW9ucy5jb21wYXJlTGluZSB8fCAoKGxpbmVOdW1iZXIsIGxpbmUsIG9wZXJhdGlvbiwgcGF0Y2hDb250ZW50KSA9PiBsaW5lID09PSBwYXRjaENvbnRlbnQpLFxuICAgICAgZXJyb3JDb3VudCA9IDAsXG4gICAgICBmdXp6RmFjdG9yID0gb3B0aW9ucy5mdXp6RmFjdG9yIHx8IDAsXG4gICAgICBtaW5MaW5lID0gMCxcbiAgICAgIG9mZnNldCA9IDAsXG5cbiAgICAgIHJlbW92ZUVPRk5MLFxuICAgICAgYWRkRU9GTkw7XG5cbiAgLyoqXG4gICAqIENoZWNrcyBpZiB0aGUgaHVuayBleGFjdGx5IGZpdHMgb24gdGhlIHByb3ZpZGVkIGxvY2F0aW9uXG4gICAqL1xuICBmdW5jdGlvbiBodW5rRml0cyhodW5rLCB0b1Bvcykge1xuICAgIGZvciAobGV0IGogPSAwOyBqIDwgaHVuay5saW5lcy5sZW5ndGg7IGorKykge1xuICAgICAgbGV0IGxpbmUgPSBodW5rLmxpbmVzW2pdLFxuICAgICAgICAgIG9wZXJhdGlvbiA9IGxpbmVbMF0sXG4gICAgICAgICAgY29udGVudCA9IGxpbmUuc3Vic3RyKDEpO1xuXG4gICAgICBpZiAob3BlcmF0aW9uID09PSAnICcgfHwgb3BlcmF0aW9uID09PSAnLScpIHtcbiAgICAgICAgLy8gQ29udGV4dCBzYW5pdHkgY2hlY2tcbiAgICAgICAgaWYgKCFjb21wYXJlTGluZSh0b1BvcyArIDEsIGxpbmVzW3RvUG9zXSwgb3BlcmF0aW9uLCBjb250ZW50KSkge1xuICAgICAgICAgIGVycm9yQ291bnQrKztcblxuICAgICAgICAgIGlmIChlcnJvckNvdW50ID4gZnV6ekZhY3Rvcikge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICB0b1BvcysrO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgLy8gU2VhcmNoIGJlc3QgZml0IG9mZnNldHMgZm9yIGVhY2ggaHVuayBiYXNlZCBvbiB0aGUgcHJldmlvdXMgb25lc1xuICBmb3IgKGxldCBpID0gMDsgaSA8IGh1bmtzLmxlbmd0aDsgaSsrKSB7XG4gICAgbGV0IGh1bmsgPSBodW5rc1tpXSxcbiAgICAgICAgbWF4TGluZSA9IGxpbmVzLmxlbmd0aCAtIGh1bmsub2xkTGluZXMsXG4gICAgICAgIGxvY2FsT2Zmc2V0ID0gMCxcbiAgICAgICAgdG9Qb3MgPSBvZmZzZXQgKyBodW5rLm9sZFN0YXJ0IC0gMTtcblxuICAgIGxldCBpdGVyYXRvciA9IGRpc3RhbmNlSXRlcmF0b3IodG9Qb3MsIG1pbkxpbmUsIG1heExpbmUpO1xuXG4gICAgZm9yICg7IGxvY2FsT2Zmc2V0ICE9PSB1bmRlZmluZWQ7IGxvY2FsT2Zmc2V0ID0gaXRlcmF0b3IoKSkge1xuICAgICAgaWYgKGh1bmtGaXRzKGh1bmssIHRvUG9zICsgbG9jYWxPZmZzZXQpKSB7XG4gICAgICAgIGh1bmsub2Zmc2V0ID0gb2Zmc2V0ICs9IGxvY2FsT2Zmc2V0O1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAobG9jYWxPZmZzZXQgPT09IHVuZGVmaW5lZCkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIC8vIFNldCBsb3dlciB0ZXh0IGxpbWl0IHRvIGVuZCBvZiB0aGUgY3VycmVudCBodW5rLCBzbyBuZXh0IG9uZXMgZG9uJ3QgdHJ5XG4gICAgLy8gdG8gZml0IG92ZXIgYWxyZWFkeSBwYXRjaGVkIHRleHRcbiAgICBtaW5MaW5lID0gaHVuay5vZmZzZXQgKyBodW5rLm9sZFN0YXJ0ICsgaHVuay5vbGRMaW5lcztcbiAgfVxuXG4gIC8vIEFwcGx5IHBhdGNoIGh1bmtzXG4gIGZvciAobGV0IGkgPSAwOyBpIDwgaHVua3MubGVuZ3RoOyBpKyspIHtcbiAgICBsZXQgaHVuayA9IGh1bmtzW2ldLFxuICAgICAgICB0b1BvcyA9IGh1bmsub2Zmc2V0ICsgaHVuay5uZXdTdGFydCAtIDE7XG4gICAgaWYgKGh1bmsubmV3TGluZXMgPT0gMCkgeyB0b1BvcysrOyB9XG5cbiAgICBmb3IgKGxldCBqID0gMDsgaiA8IGh1bmsubGluZXMubGVuZ3RoOyBqKyspIHtcbiAgICAgIGxldCBsaW5lID0gaHVuay5saW5lc1tqXSxcbiAgICAgICAgICBvcGVyYXRpb24gPSBsaW5lWzBdLFxuICAgICAgICAgIGNvbnRlbnQgPSBsaW5lLnN1YnN0cigxKTtcblxuICAgICAgaWYgKG9wZXJhdGlvbiA9PT0gJyAnKSB7XG4gICAgICAgIHRvUG9zKys7XG4gICAgICB9IGVsc2UgaWYgKG9wZXJhdGlvbiA9PT0gJy0nKSB7XG4gICAgICAgIGxpbmVzLnNwbGljZSh0b1BvcywgMSk7XG4gICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgZWxzZSAqL1xuICAgICAgfSBlbHNlIGlmIChvcGVyYXRpb24gPT09ICcrJykge1xuICAgICAgICBsaW5lcy5zcGxpY2UodG9Qb3MsIDAsIGNvbnRlbnQpO1xuICAgICAgICB0b1BvcysrO1xuICAgICAgfSBlbHNlIGlmIChvcGVyYXRpb24gPT09ICdcXFxcJykge1xuICAgICAgICBsZXQgcHJldmlvdXNPcGVyYXRpb24gPSBodW5rLmxpbmVzW2ogLSAxXSA/IGh1bmsubGluZXNbaiAtIDFdWzBdIDogbnVsbDtcbiAgICAgICAgaWYgKHByZXZpb3VzT3BlcmF0aW9uID09PSAnKycpIHtcbiAgICAgICAgICByZW1vdmVFT0ZOTCA9IHRydWU7XG4gICAgICAgIH0gZWxzZSBpZiAocHJldmlvdXNPcGVyYXRpb24gPT09ICctJykge1xuICAgICAgICAgIGFkZEVPRk5MID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8vIEhhbmRsZSBFT0ZOTCBpbnNlcnRpb24vcmVtb3ZhbFxuICBpZiAocmVtb3ZlRU9GTkwpIHtcbiAgICB3aGlsZSAoIWxpbmVzW2xpbmVzLmxlbmd0aCAtIDFdKSB7XG4gICAgICBsaW5lcy5wb3AoKTtcbiAgICB9XG4gIH0gZWxzZSBpZiAoYWRkRU9GTkwpIHtcbiAgICBsaW5lcy5wdXNoKCcnKTtcbiAgfVxuICByZXR1cm4gbGluZXMuam9pbignXFxuJyk7XG59XG5cbi8vIFdyYXBwZXIgdGhhdCBzdXBwb3J0cyBtdWx0aXBsZSBmaWxlIHBhdGNoZXMgdmlhIGNhbGxiYWNrcy5cbmV4cG9ydCBmdW5jdGlvbiBhcHBseVBhdGNoZXModW5pRGlmZiwgb3B0aW9ucykge1xuICBpZiAodHlwZW9mIHVuaURpZmYgPT09ICdzdHJpbmcnKSB7XG4gICAgdW5pRGlmZiA9IHBhcnNlUGF0Y2godW5pRGlmZik7XG4gIH1cblxuICBsZXQgY3VycmVudEluZGV4ID0gMDtcbiAgZnVuY3Rpb24gcHJvY2Vzc0luZGV4KCkge1xuICAgIGxldCBpbmRleCA9IHVuaURpZmZbY3VycmVudEluZGV4KytdO1xuICAgIGlmICghaW5kZXgpIHtcbiAgICAgIHJldHVybiBvcHRpb25zLmNvbXBsZXRlKCk7XG4gICAgfVxuXG4gICAgb3B0aW9ucy5sb2FkRmlsZShpbmRleCwgZnVuY3Rpb24oZXJyLCBkYXRhKSB7XG4gICAgICBpZiAoZXJyKSB7XG4gICAgICAgIHJldHVybiBvcHRpb25zLmNvbXBsZXRlKGVycik7XG4gICAgICB9XG5cbiAgICAgIGxldCB1cGRhdGVkQ29udGVudCA9IGFwcGx5UGF0Y2goZGF0YSwgaW5kZXgsIG9wdGlvbnMpO1xuICAgICAgb3B0aW9ucy5wYXRjaGVkKGluZGV4LCB1cGRhdGVkQ29udGVudCwgZnVuY3Rpb24oZXJyKSB7XG4gICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICByZXR1cm4gb3B0aW9ucy5jb21wbGV0ZShlcnIpO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJvY2Vzc0luZGV4KCk7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfVxuICBwcm9jZXNzSW5kZXgoKTtcbn1cbiJdfQ==


/***/ },
/* 10 */
/***/ function(module, exports) {

	/*istanbul ignore start*/'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports. /*istanbul ignore end*/parsePatch = parsePatch;
	function parsePatch(uniDiff) {
	  /*istanbul ignore start*/var /*istanbul ignore end*/options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

	  var diffstr = uniDiff.split('\n'),
	      list = [],
	      i = 0;

	  function parseIndex() {
	    var index = {};
	    list.push(index);

	    // Parse diff metadata
	    while (i < diffstr.length) {
	      var line = diffstr[i];

	      // File header found, end parsing diff metadata
	      if (/^(\-\-\-|\+\+\+|@@)\s/.test(line)) {
	        break;
	      }

	      // Diff index
	      var header = /^(?:Index:|diff(?: -r \w+)+)\s+(.+?)\s*$/.exec(line);
	      if (header) {
	        index.index = header[1];
	      }

	      i++;
	    }

	    // Parse file headers if they are defined. Unified diff requires them, but
	    // there's no technical issues to have an isolated hunk without file header
	    parseFileHeader(index);
	    parseFileHeader(index);

	    // Parse hunks
	    index.hunks = [];

	    while (i < diffstr.length) {
	      var _line = diffstr[i];

	      if (/^(Index:|diff|\-\-\-|\+\+\+)\s/.test(_line)) {
	        break;
	      } else if (/^@@/.test(_line)) {
	        index.hunks.push(parseHunk());
	      } else if (_line && options.strict) {
	        // Ignore unexpected content unless in strict mode
	        throw new Error('Unknown line ' + (i + 1) + ' ' + JSON.stringify(_line));
	      } else {
	        i++;
	      }
	    }
	  }

	  // Parses the --- and +++ headers, if none are found, no lines
	  // are consumed.
	  function parseFileHeader(index) {
	    var headerPattern = /^(---|\+\+\+)\s+([\S ]*)(?:\t(.*?)\s*)?$/;
	    var fileHeader = headerPattern.exec(diffstr[i]);
	    if (fileHeader) {
	      var keyPrefix = fileHeader[1] === '---' ? 'old' : 'new';
	      index[keyPrefix + 'FileName'] = fileHeader[2];
	      index[keyPrefix + 'Header'] = fileHeader[3];

	      i++;
	    }
	  }

	  // Parses a hunk
	  // This assumes that we are at the start of a hunk.
	  function parseHunk() {
	    var chunkHeaderIndex = i,
	        chunkHeaderLine = diffstr[i++],
	        chunkHeader = chunkHeaderLine.split(/@@ -(\d+)(?:,(\d+))? \+(\d+)(?:,(\d+))? @@/);

	    var hunk = {
	      oldStart: +chunkHeader[1],
	      oldLines: +chunkHeader[2] || 1,
	      newStart: +chunkHeader[3],
	      newLines: +chunkHeader[4] || 1,
	      lines: []
	    };

	    var addCount = 0,
	        removeCount = 0;
	    for (; i < diffstr.length; i++) {
	      // Lines starting with '---' could be mistaken for the "remove line" operation
	      // But they could be the header for the next file. Therefore prune such cases out.
	      if (diffstr[i].indexOf('--- ') === 0 && i + 2 < diffstr.length && diffstr[i + 1].indexOf('+++ ') === 0 && diffstr[i + 2].indexOf('@@') === 0) {
	        break;
	      }
	      var operation = diffstr[i][0];

	      if (operation === '+' || operation === '-' || operation === ' ' || operation === '\\') {
	        hunk.lines.push(diffstr[i]);

	        if (operation === '+') {
	          addCount++;
	        } else if (operation === '-') {
	          removeCount++;
	        } else if (operation === ' ') {
	          addCount++;
	          removeCount++;
	        }
	      } else {
	        break;
	      }
	    }

	    // Handle the empty block count case
	    if (!addCount && hunk.newLines === 1) {
	      hunk.newLines = 0;
	    }
	    if (!removeCount && hunk.oldLines === 1) {
	      hunk.oldLines = 0;
	    }

	    // Perform optional sanity checking
	    if (options.strict) {
	      if (addCount !== hunk.newLines) {
	        throw new Error('Added line count did not match for hunk at line ' + (chunkHeaderIndex + 1));
	      }
	      if (removeCount !== hunk.oldLines) {
	        throw new Error('Removed line count did not match for hunk at line ' + (chunkHeaderIndex + 1));
	      }
	    }

	    return hunk;
	  }

	  while (i < diffstr.length) {
	    parseIndex();
	  }

	  return list;
	}
	
//**no source maps!**=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9wYXRjaC9wYXJzZS5qcyJdLCJuYW1lcyI6WyJwYXJzZVBhdGNoIiwidW5pRGlmZiIsIm9wdGlvbnMiLCJkaWZmc3RyIiwic3BsaXQiLCJsaXN0IiwiaSIsInBhcnNlSW5kZXgiLCJpbmRleCIsInB1c2giLCJsZW5ndGgiLCJsaW5lIiwidGVzdCIsImhlYWRlciIsImV4ZWMiLCJwYXJzZUZpbGVIZWFkZXIiLCJodW5rcyIsInBhcnNlSHVuayIsInN0cmljdCIsIkVycm9yIiwiSlNPTiIsInN0cmluZ2lmeSIsImhlYWRlclBhdHRlcm4iLCJmaWxlSGVhZGVyIiwia2V5UHJlZml4IiwiY2h1bmtIZWFkZXJJbmRleCIsImNodW5rSGVhZGVyTGluZSIsImNodW5rSGVhZGVyIiwiaHVuayIsIm9sZFN0YXJ0Iiwib2xkTGluZXMiLCJuZXdTdGFydCIsIm5ld0xpbmVzIiwibGluZXMiLCJhZGRDb3VudCIsInJlbW92ZUNvdW50IiwiaW5kZXhPZiIsIm9wZXJhdGlvbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7Z0NBQWdCQSxVLEdBQUFBLFU7QUFBVCxTQUFTQSxVQUFULENBQW9CQyxPQUFwQixFQUEyQztBQUFBLHNEQUFkQyxPQUFjLHVFQUFKLEVBQUk7O0FBQ2hELE1BQUlDLFVBQVVGLFFBQVFHLEtBQVIsQ0FBYyxJQUFkLENBQWQ7QUFBQSxNQUNJQyxPQUFPLEVBRFg7QUFBQSxNQUVJQyxJQUFJLENBRlI7O0FBSUEsV0FBU0MsVUFBVCxHQUFzQjtBQUNwQixRQUFJQyxRQUFRLEVBQVo7QUFDQUgsU0FBS0ksSUFBTCxDQUFVRCxLQUFWOztBQUVBO0FBQ0EsV0FBT0YsSUFBSUgsUUFBUU8sTUFBbkIsRUFBMkI7QUFDekIsVUFBSUMsT0FBT1IsUUFBUUcsQ0FBUixDQUFYOztBQUVBO0FBQ0EsVUFBSSx3QkFBd0JNLElBQXhCLENBQTZCRCxJQUE3QixDQUFKLEVBQXdDO0FBQ3RDO0FBQ0Q7O0FBRUQ7QUFDQSxVQUFJRSxTQUFVLDBDQUFELENBQTZDQyxJQUE3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O0FBQ3JCSDtBQUNELFNBRkQsTUFFTyxJQUFJRyxjQUFjLEdBQWxCLEVBQXVCO0FBQzVCRjtBQUNELFNBRk0sTUFFQSxJQUFJRSxjQUFjLEdBQWxCLEVBQXVCO0FBQzVCSDtBQUNBQztBQUNEO0FBQ0YsT0FYRCxNQVdPO0FBQ0w7QUFDRDtBQUNGOztBQUVEO0FBQ0EsUUFBSSxDQUFDRCxRQUFELElBQWFOLEtBQUtJLFFBQUwsS0FBa0IsQ0FBbkMsRUFBc0M7QUFDcENKLFdBQUtJLFFBQUwsR0FBZ0IsQ0FBaEI7QUFDRDtBQUNELFFBQUksQ0FBQ0csV0FBRCxJQUFnQlAsS0FBS0UsUUFBTCxLQUFrQixDQUF0QyxFQUF5QztBQUN2Q0YsV0FBS0UsUUFBTCxHQUFnQixDQUFoQjtBQUNEOztBQUVEO0FBQ0EsUUFBSTVCLFFBQVFnQixNQUFaLEVBQW9CO0FBQ2xCLFVBQUlnQixhQUFhTixLQUFLSSxRQUF0QixFQUFnQztBQUM5QixjQUFNLElBQUliLEtBQUosQ0FBVSxzREFBc0RNLG1CQUFtQixDQUF6RSxDQUFWLENBQU47QUFDRDtBQUNELFVBQUlVLGdCQUFnQlAsS0FBS0UsUUFBekIsRUFBbUM7QUFDakMsY0FBTSxJQUFJWCxLQUFKLENBQVUsd0RBQXdETSxtQkFBbUIsQ0FBM0UsQ0FBVixDQUFOO0FBQ0Q7QUFDRjs7QUFFRCxXQUFPRyxJQUFQO0FBQ0Q7O0FBRUQsU0FBT3RCLElBQUlILFFBQVFPLE1BQW5CLEVBQTJCO0FBQ3pCSDtBQUNEOztBQUVELFNBQU9GLElBQVA7QUFDRCIsImZpbGUiOiJwYXJzZS5qcyIsInNvdXJjZXNDb250ZW50IjpbImV4cG9ydCBmdW5jdGlvbiBwYXJzZVBhdGNoKHVuaURpZmYsIG9wdGlvbnMgPSB7fSkge1xuICBsZXQgZGlmZnN0ciA9IHVuaURpZmYuc3BsaXQoJ1xcbicpLFxuICAgICAgbGlzdCA9IFtdLFxuICAgICAgaSA9IDA7XG5cbiAgZnVuY3Rpb24gcGFyc2VJbmRleCgpIHtcbiAgICBsZXQgaW5kZXggPSB7fTtcbiAgICBsaXN0LnB1c2goaW5kZXgpO1xuXG4gICAgLy8gUGFyc2UgZGlmZiBtZXRhZGF0YVxuICAgIHdoaWxlIChpIDwgZGlmZnN0ci5sZW5ndGgpIHtcbiAgICAgIGxldCBsaW5lID0gZGlmZnN0cltpXTtcblxuICAgICAgLy8gRmlsZSBoZWFkZXIgZm91bmQsIGVuZCBwYXJzaW5nIGRpZmYgbWV0YWRhdGFcbiAgICAgIGlmICgvXihcXC1cXC1cXC18XFwrXFwrXFwrfEBAKVxccy8udGVzdChsaW5lKSkge1xuICAgICAgICBicmVhaztcbiAgICAgIH1cblxuICAgICAgLy8gRGlmZiBpbmRleFxuICAgICAgbGV0IGhlYWRlciA9ICgvXig/OkluZGV4OnxkaWZmKD86IC1yIFxcdyspKylcXHMrKC4rPylcXHMqJC8pLmV4ZWMobGluZSk7XG4gICAgICBpZiAoaGVhZGVyKSB7XG4gICAgICAgIGluZGV4LmluZGV4ID0gaGVhZGVyWzFdO1xuICAgICAgfVxuXG4gICAgICBpKys7XG4gICAgfVxuXG4gICAgLy8gUGFyc2UgZmlsZSBoZWFkZXJzIGlmIHRoZXkgYXJlIGRlZmluZWQuIFVuaWZpZWQgZGlmZiByZXF1aXJlcyB0aGVtLCBidXRcbiAgICAvLyB0aGVyZSdzIG5vIHRlY2huaWNhbCBpc3N1ZXMgdG8gaGF2ZSBhbiBpc29sYXRlZCBodW5rIHdpdGhvdXQgZmlsZSBoZWFkZXJcbiAgICBwYXJzZUZpbGVIZWFkZXIoaW5kZXgpO1xuICAgIHBhcnNlRmlsZUhlYWRlcihpbmRleCk7XG5cbiAgICAvLyBQYXJzZSBodW5rc1xuICAgIGluZGV4Lmh1bmtzID0gW107XG5cbiAgICB3aGlsZSAoaSA8IGRpZmZzdHIubGVuZ3RoKSB7XG4gICAgICBsZXQgbGluZSA9IGRpZmZzdHJbaV07XG5cbiAgICAgIGlmICgvXihJbmRleDp8ZGlmZnxcXC1cXC1cXC18XFwrXFwrXFwrKVxccy8udGVzdChsaW5lKSkge1xuICAgICAgICBicmVhaztcbiAgICAgIH0gZWxzZSBpZiAoL15AQC8udGVzdChsaW5lKSkge1xuICAgICAgICBpbmRleC5odW5rcy5wdXNoKHBhcnNlSHVuaygpKTtcbiAgICAgIH0gZWxzZSBpZiAobGluZSAmJiBvcHRpb25zLnN0cmljdCkge1xuICAgICAgICAvLyBJZ25vcmUgdW5leHBlY3RlZCBjb250ZW50IHVubGVzcyBpbiBzdHJpY3QgbW9kZVxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1Vua25vd24gbGluZSAnICsgKGkgKyAxKSArICcgJyArIEpTT04uc3RyaW5naWZ5KGxpbmUpKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGkrKztcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvLyBQYXJzZXMgdGhlIC0tLSBhbmQgKysrIGhlYWRlcnMsIGlmIG5vbmUgYXJlIGZvdW5kLCBubyBsaW5lc1xuICAvLyBhcmUgY29uc3VtZWQuXG4gIGZ1bmN0aW9uIHBhcnNlRmlsZUhlYWRlcihpbmRleCkge1xuICAgIGNvbnN0IGhlYWRlclBhdHRlcm4gPSAvXigtLS18XFwrXFwrXFwrKVxccysoW1xcUyBdKikoPzpcXHQoLio/KVxccyopPyQvO1xuICAgIGNvbnN0IGZpbGVIZWFkZXIgPSBoZWFkZXJQYXR0ZXJuLmV4ZWMoZGlmZnN0cltpXSk7XG4gICAgaWYgKGZpbGVIZWFkZXIpIHtcbiAgICAgIGxldCBrZXlQcmVmaXggPSBmaWxlSGVhZGVyWzFdID09PSAnLS0tJyA/ICdvbGQnIDogJ25ldyc7XG4gICAgICBpbmRleFtrZXlQcmVmaXggKyAnRmlsZU5hbWUnXSA9IGZpbGVIZWFkZXJbMl07XG4gICAgICBpbmRleFtrZXlQcmVmaXggKyAnSGVhZGVyJ10gPSBmaWxlSGVhZGVyWzNdO1xuXG4gICAgICBpKys7XG4gICAgfVxuICB9XG5cbiAgLy8gUGFyc2VzIGEgaHVua1xuICAvLyBUaGlzIGFzc3VtZXMgdGhhdCB3ZSBhcmUgYXQgdGhlIHN0YXJ0IG9mIGEgaHVuay5cbiAgZnVuY3Rpb24gcGFyc2VIdW5rKCkge1xuICAgIGxldCBjaHVua0hlYWRlckluZGV4ID0gaSxcbiAgICAgICAgY2h1bmtIZWFkZXJMaW5lID0gZGlmZnN0cltpKytdLFxuICAgICAgICBjaHVua0hlYWRlciA9IGNodW5rSGVhZGVyTGluZS5zcGxpdCgvQEAgLShcXGQrKSg/OiwoXFxkKykpPyBcXCsoXFxkKykoPzosKFxcZCspKT8gQEAvKTtcblxuICAgIGxldCBodW5rID0ge1xuICAgICAgb2xkU3RhcnQ6ICtjaHVua0hlYWRlclsxXSxcbiAgICAgIG9sZExpbmVzOiArY2h1bmtIZWFkZXJbMl0gfHwgMSxcbiAgICAgIG5ld1N0YXJ0OiArY2h1bmtIZWFkZXJbM10sXG4gICAgICBuZXdMaW5lczogK2NodW5rSGVhZGVyWzRdIHx8IDEsXG4gICAgICBsaW5lczogW11cbiAgICB9O1xuXG4gICAgbGV0IGFkZENvdW50ID0gMCxcbiAgICAgICAgcmVtb3ZlQ291bnQgPSAwO1xuICAgIGZvciAoOyBpIDwgZGlmZnN0ci5sZW5ndGg7IGkrKykge1xuICAgICAgLy8gTGluZXMgc3RhcnRpbmcgd2l0aCAnLS0tJyBjb3VsZCBiZSBtaXN0YWtlbiBmb3IgdGhlIFwicmVtb3ZlIGxpbmVcIiBvcGVyYXRpb25cbiAgICAgIC8vIEJ1dCB0aGV5IGNvdWxkIGJlIHRoZSBoZWFkZXIgZm9yIHRoZSBuZXh0IGZpbGUuIFRoZXJlZm9yZSBwcnVuZSBzdWNoIGNhc2VzIG91dC5cbiAgICAgIGlmIChkaWZmc3RyW2ldLmluZGV4T2YoJy0tLSAnKSA9PT0gMFxuICAgICAgICAgICAgJiYgKGkgKyAyIDwgZGlmZnN0ci5sZW5ndGgpXG4gICAgICAgICAgICAmJiBkaWZmc3RyW2kgKyAxXS5pbmRleE9mKCcrKysgJykgPT09IDBcbiAgICAgICAgICAgICYmIGRpZmZzdHJbaSArIDJdLmluZGV4T2YoJ0BAJykgPT09IDApIHtcbiAgICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICAgIGxldCBvcGVyYXRpb24gPSBkaWZmc3RyW2ldWzBdO1xuXG4gICAgICBpZiAob3BlcmF0aW9uID09PSAnKycgfHwgb3BlcmF0aW9uID09PSAnLScgfHwgb3BlcmF0aW9uID09PSAnICcgfHwgb3BlcmF0aW9uID09PSAnXFxcXCcpIHtcbiAgICAgICAgaHVuay5saW5lcy5wdXNoKGRpZmZzdHJbaV0pO1xuXG4gICAgICAgIGlmIChvcGVyYXRpb24gPT09ICcrJykge1xuICAgICAgICAgIGFkZENvdW50Kys7XG4gICAgICAgIH0gZWxzZSBpZiAob3BlcmF0aW9uID09PSAnLScpIHtcbiAgICAgICAgICByZW1vdmVDb3VudCsrO1xuICAgICAgICB9IGVsc2UgaWYgKG9wZXJhdGlvbiA9PT0gJyAnKSB7XG4gICAgICAgICAgYWRkQ291bnQrKztcbiAgICAgICAgICByZW1vdmVDb3VudCsrO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBIYW5kbGUgdGhlIGVtcHR5IGJsb2NrIGNvdW50IGNhc2VcbiAgICBpZiAoIWFkZENvdW50ICYmIGh1bmsubmV3TGluZXMgPT09IDEpIHtcbiAgICAgIGh1bmsubmV3TGluZXMgPSAwO1xuICAgIH1cbiAgICBpZiAoIXJlbW92ZUNvdW50ICYmIGh1bmsub2xkTGluZXMgPT09IDEpIHtcbiAgICAgIGh1bmsub2xkTGluZXMgPSAwO1xuICAgIH1cblxuICAgIC8vIFBlcmZvcm0gb3B0aW9uYWwgc2FuaXR5IGNoZWNraW5nXG4gICAgaWYgKG9wdGlvbnMuc3RyaWN0KSB7XG4gICAgICBpZiAoYWRkQ291bnQgIT09IGh1bmsubmV3TGluZXMpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdBZGRlZCBsaW5lIGNvdW50IGRpZCBub3QgbWF0Y2ggZm9yIGh1bmsgYXQgbGluZSAnICsgKGNodW5rSGVhZGVySW5kZXggKyAxKSk7XG4gICAgICB9XG4gICAgICBpZiAocmVtb3ZlQ291bnQgIT09IGh1bmsub2xkTGluZXMpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdSZW1vdmVkIGxpbmUgY291bnQgZGlkIG5vdCBtYXRjaCBmb3IgaHVuayBhdCBsaW5lICcgKyAoY2h1bmtIZWFkZXJJbmRleCArIDEpKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gaHVuaztcbiAgfVxuXG4gIHdoaWxlIChpIDwgZGlmZnN0ci5sZW5ndGgpIHtcbiAgICBwYXJzZUluZGV4KCk7XG4gIH1cblxuICByZXR1cm4gbGlzdDtcbn1cbiJdfQ==


/***/ },
/* 11 */
/***/ function(module, exports) {

	/*istanbul ignore start*/"use strict";

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	exports["default"] = /*istanbul ignore end*/function (start, minLine, maxLine) {
	  var wantForward = true,
	      backwardExhausted = false,
	      forwardExhausted = false,
	      localOffset = 1;

	  return function iterator() {
	    if (wantForward && !forwardExhausted) {
	      if (backwardExhausted) {
	        localOffset++;
	      } else {
	        wantForward = false;
	      }

	      // Check if trying to fit beyond text length, and if not, check it fits
	      // after offset location (or desired location on first iteration)
	      if (start + localOffset <= maxLine) {
	        return localOffset;
	      }

	      forwardExhausted = true;
	    }

	    if (!backwardExhausted) {
	      if (!forwardExhausted) {
	        wantForward = true;
	      }

	      // Check if trying to fit before text beginning, and if not, check it fits
	      // before offset location
	      if (minLine <= start - localOffset) {
	        return -localOffset++;
	      }

	      backwardExhausted = true;
	      return iterator();
	    }

	    // We tried to fit hunk before text beginning and beyond text lenght, then
	    // hunk can't fit on the text. Return undefined
	  };
	};
	
//**no source maps!**=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy91dGlsL2Rpc3RhbmNlLWl0ZXJhdG9yLmpzIl0sIm5hbWVzIjpbInN0YXJ0IiwibWluTGluZSIsIm1heExpbmUiLCJ3YW50Rm9yd2FyZCIsImJhY2t3YXJkRXhoYXVzdGVkIiwiZm9yd2FyZEV4aGF1c3RlZCIsImxvY2FsT2Zmc2V0IiwiaXRlcmF0b3IiXSwibWFwcGluZ3MiOiI7Ozs7Ozs0Q0FHZSxVQUFTQSxLQUFULEVBQWdCQyxPQUFoQixFQUF5QkMsT0FBekIsRUFBa0M7QUFDL0MsTUFBSUMsY0FBYyxJQUFsQjtBQUFBLE1BQ0lDLG9CQUFvQixLQUR4QjtBQUFBLE1BRUlDLG1CQUFtQixLQUZ2QjtBQUFBLE1BR0lDLGNBQWMsQ0FIbEI7O0FBS0EsU0FBTyxTQUFTQyxRQUFULEdBQW9CO0FBQ3pCLFFBQUlKLGVBQWUsQ0FBQ0UsZ0JBQXBCLEVBQXNDO0FBQ3BDLFVBQUlELGlCQUFKLEVBQXVCO0FBQ3JCRTtBQUNELE9BRkQsTUFFTztBQUNMSCxzQkFBYyxLQUFkO0FBQ0Q7O0FBRUQ7QUFDQTtBQUNBLFVBQUlILFFBQVFNLFdBQVIsSUFBdUJKLE9BQTNCLEVBQW9DO0FBQ2xDLGVBQU9JLFdBQVA7QUFDRDs7QUFFREQseUJBQW1CLElBQW5CO0FBQ0Q7O0FBRUQsUUFBSSxDQUFDRCxpQkFBTCxFQUF3QjtBQUN0QixVQUFJLENBQUNDLGdCQUFMLEVBQXVCO0FBQ3JCRixzQkFBYyxJQUFkO0FBQ0Q7O0FBRUQ7QUFDQTtBQUNBLFVBQUlGLFdBQVdELFFBQVFNLFdBQXZCLEVBQW9DO0FBQ2xDLGVBQU8sQ0FBQ0EsYUFBUjtBQUNEOztBQUVERiwwQkFBb0IsSUFBcEI7QUFDQSxhQUFPRyxVQUFQO0FBQ0Q7O0FBRUQ7QUFDQTtBQUNELEdBbENEO0FBbUNELEMiLCJmaWxlIjoiZGlzdGFuY2UtaXRlcmF0b3IuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvLyBJdGVyYXRvciB0aGF0IHRyYXZlcnNlcyBpbiB0aGUgcmFuZ2Ugb2YgW21pbiwgbWF4XSwgc3RlcHBpbmdcbi8vIGJ5IGRpc3RhbmNlIGZyb20gYSBnaXZlbiBzdGFydCBwb3NpdGlvbi4gSS5lLiBmb3IgWzAsIDRdLCB3aXRoXG4vLyBzdGFydCBvZiAyLCB0aGlzIHdpbGwgaXRlcmF0ZSAyLCAzLCAxLCA0LCAwLlxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oc3RhcnQsIG1pbkxpbmUsIG1heExpbmUpIHtcbiAgbGV0IHdhbnRGb3J3YXJkID0gdHJ1ZSxcbiAgICAgIGJhY2t3YXJkRXhoYXVzdGVkID0gZmFsc2UsXG4gICAgICBmb3J3YXJkRXhoYXVzdGVkID0gZmFsc2UsXG4gICAgICBsb2NhbE9mZnNldCA9IDE7XG5cbiAgcmV0dXJuIGZ1bmN0aW9uIGl0ZXJhdG9yKCkge1xuICAgIGlmICh3YW50Rm9yd2FyZCAmJiAhZm9yd2FyZEV4aGF1c3RlZCkge1xuICAgICAgaWYgKGJhY2t3YXJkRXhoYXVzdGVkKSB7XG4gICAgICAgIGxvY2FsT2Zmc2V0Kys7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB3YW50Rm9yd2FyZCA9IGZhbHNlO1xuICAgICAgfVxuXG4gICAgICAvLyBDaGVjayBpZiB0cnlpbmcgdG8gZml0IGJleW9uZCB0ZXh0IGxlbmd0aCwgYW5kIGlmIG5vdCwgY2hlY2sgaXQgZml0c1xuICAgICAgLy8gYWZ0ZXIgb2Zmc2V0IGxvY2F0aW9uIChvciBkZXNpcmVkIGxvY2F0aW9uIG9uIGZpcnN0IGl0ZXJhdGlvbilcbiAgICAgIGlmIChzdGFydCArIGxvY2FsT2Zmc2V0IDw9IG1heExpbmUpIHtcbiAgICAgICAgcmV0dXJuIGxvY2FsT2Zmc2V0O1xuICAgICAgfVxuXG4gICAgICBmb3J3YXJkRXhoYXVzdGVkID0gdHJ1ZTtcbiAgICB9XG5cbiAgICBpZiAoIWJhY2t3YXJkRXhoYXVzdGVkKSB7XG4gICAgICBpZiAoIWZvcndhcmRFeGhhdXN0ZWQpIHtcbiAgICAgICAgd2FudEZvcndhcmQgPSB0cnVlO1xuICAgICAgfVxuXG4gICAgICAvLyBDaGVjayBpZiB0cnlpbmcgdG8gZml0IGJlZm9yZSB0ZXh0IGJlZ2lubmluZywgYW5kIGlmIG5vdCwgY2hlY2sgaXQgZml0c1xuICAgICAgLy8gYmVmb3JlIG9mZnNldCBsb2NhdGlvblxuICAgICAgaWYgKG1pbkxpbmUgPD0gc3RhcnQgLSBsb2NhbE9mZnNldCkge1xuICAgICAgICByZXR1cm4gLWxvY2FsT2Zmc2V0Kys7XG4gICAgICB9XG5cbiAgICAgIGJhY2t3YXJkRXhoYXVzdGVkID0gdHJ1ZTtcbiAgICAgIHJldHVybiBpdGVyYXRvcigpO1xuICAgIH1cblxuICAgIC8vIFdlIHRyaWVkIHRvIGZpdCBodW5rIGJlZm9yZSB0ZXh0IGJlZ2lubmluZyBhbmQgYmV5b25kIHRleHQgbGVuZ2h0LCB0aGVuXG4gICAgLy8gaHVuayBjYW4ndCBmaXQgb24gdGhlIHRleHQuIFJldHVybiB1bmRlZmluZWRcbiAgfTtcbn1cbiJdfQ==


/***/ },
/* 12 */
/***/ function(module, exports, __webpack_require__) {

	/*istanbul ignore start*/'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports. /*istanbul ignore end*/structuredPatch = structuredPatch;
	/*istanbul ignore start*/exports. /*istanbul ignore end*/createTwoFilesPatch = createTwoFilesPatch;
	/*istanbul ignore start*/exports. /*istanbul ignore end*/createPatch = createPatch;

	var /*istanbul ignore start*/_line = __webpack_require__(5) /*istanbul ignore end*/;

	/*istanbul ignore start*/function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

	/*istanbul ignore end*/function structuredPatch(oldFileName, newFileName, oldStr, newStr, oldHeader, newHeader, options) {
	  if (!options) {
	    options = { context: 4 };
	  }

	  var diff = /*istanbul ignore start*/(0, _line.diffLines) /*istanbul ignore end*/(oldStr, newStr);
	  diff.push({ value: '', lines: [] }); // Append an empty value to make cleanup easier

	  function contextLines(lines) {
	    return lines.map(function (entry) {
	      return ' ' + entry;
	    });
	  }

	  var hunks = [];
	  var oldRangeStart = 0,
	      newRangeStart = 0,
	      curRange = [],
	      oldLine = 1,
	      newLine = 1;

	  /*istanbul ignore start*/var _loop = function _loop( /*istanbul ignore end*/i) {
	    var current = diff[i],
	        lines = current.lines || current.value.replace(/\n$/, '').split('\n');
	    current.lines = lines;

	    if (current.added || current.removed) {
	      /*istanbul ignore start*/var _curRange;

	      /*istanbul ignore end*/ // If we have previous context, start with that
	      if (!oldRangeStart) {
	        var prev = diff[i - 1];
	        oldRangeStart = oldLine;
	        newRangeStart = newLine;

	        if (prev) {
	          curRange = options.context > 0 ? contextLines(prev.lines.slice(-options.context)) : [];
	          oldRangeStart -= curRange.length;
	          newRangeStart -= curRange.length;
	        }
	      }

	      // Output our changes
	      /*istanbul ignore start*/(_curRange = /*istanbul ignore end*/curRange).push. /*istanbul ignore start*/apply /*istanbul ignore end*/( /*istanbul ignore start*/_curRange /*istanbul ignore end*/, /*istanbul ignore start*/_toConsumableArray( /*istanbul ignore end*/lines.map(function (entry) {
	        return (current.added ? '+' : '-') + entry;
	      })));

	      // Track the updated file position
	      if (current.added) {
	        newLine += lines.length;
	      } else {
	        oldLine += lines.length;
	      }
	    } else {
	      // Identical context lines. Track line changes
	      if (oldRangeStart) {
	        // Close out any changes that have been output (or join overlapping)
	        if (lines.length <= options.context * 2 && i < diff.length - 2) {
	          /*istanbul ignore start*/var _curRange2;

	          /*istanbul ignore end*/ // Overlapping
	          /*istanbul ignore start*/(_curRange2 = /*istanbul ignore end*/curRange).push. /*istanbul ignore start*/apply /*istanbul ignore end*/( /*istanbul ignore start*/_curRange2 /*istanbul ignore end*/, /*istanbul ignore start*/_toConsumableArray( /*istanbul ignore end*/contextLines(lines)));
	        } else {
	          /*istanbul ignore start*/var _curRange3;

	          /*istanbul ignore end*/ // end the range and output
	          var contextSize = Math.min(lines.length, options.context);
	          /*istanbul ignore start*/(_curRange3 = /*istanbul ignore end*/curRange).push. /*istanbul ignore start*/apply /*istanbul ignore end*/( /*istanbul ignore start*/_curRange3 /*istanbul ignore end*/, /*istanbul ignore start*/_toConsumableArray( /*istanbul ignore end*/contextLines(lines.slice(0, contextSize))));

	          var hunk = {
	            oldStart: oldRangeStart,
	            oldLines: oldLine - oldRangeStart + contextSize,
	            newStart: newRangeStart,
	            newLines: newLine - newRangeStart + contextSize,
	            lines: curRange
	          };
	          if (i >= diff.length - 2 && lines.length <= options.context) {
	            // EOF is inside this hunk
	            var oldEOFNewline = /\n$/.test(oldStr);
	            var newEOFNewline = /\n$/.test(newStr);
	            if (lines.length == 0 && !oldEOFNewline) {
	              // special case: old has no eol and no trailing context; no-nl can end up before adds
	              curRange.splice(hunk.oldLines, 0, '\\ No newline at end of file');
	            } else if (!oldEOFNewline || !newEOFNewline) {
	              curRange.push('\\ No newline at end of file');
	            }
	          }
	          hunks.push(hunk);

	          oldRangeStart = 0;
	          newRangeStart = 0;
	          curRange = [];
	        }
	      }
	      oldLine += lines.length;
	      newLine += lines.length;
	    }
	  };

	  for (var i = 0; i < diff.length; i++) {
	    /*istanbul ignore start*/_loop( /*istanbul ignore end*/i);
	  }

	  return {
	    oldFileName: oldFileName, newFileName: newFileName,
	    oldHeader: oldHeader, newHeader: newHeader,
	    hunks: hunks
	  };
	}

	function createTwoFilesPatch(oldFileName, newFileName, oldStr, newStr, oldHeader, newHeader, options) {
	  var diff = structuredPatch(oldFileName, newFileName, oldStr, newStr, oldHeader, newHeader, options);

	  var ret = [];
	  if (oldFileName == newFileName) {
	    ret.push('Index: ' + oldFileName);
	  }
	  ret.push('===================================================================');
	  ret.push('--- ' + diff.oldFileName + (typeof diff.oldHeader === 'undefined' ? '' : '\t' + diff.oldHeader));
	  ret.push('+++ ' + diff.newFileName + (typeof diff.newHeader === 'undefined' ? '' : '\t' + diff.newHeader));

	  for (var i = 0; i < diff.hunks.length; i++) {
	    var hunk = diff.hunks[i];
	    ret.push('@@ -' + hunk.oldStart + ',' + hunk.oldLines + ' +' + hunk.newStart + ',' + hunk.newLines + ' @@');
	    ret.push.apply(ret, hunk.lines);
	  }

	  return ret.join('\n') + '\n';
	}

	function createPatch(fileName, oldStr, newStr, oldHeader, newHeader, options) {
	  return createTwoFilesPatch(fileName, fileName, oldStr, newStr, oldHeader, newHeader, options);
	}
	
//**no source maps!**=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9wYXRjaC9jcmVhdGUuanMiXSwibmFtZXMiOlsic3RydWN0dXJlZFBhdGNoIiwiY3JlYXRlVHdvRmlsZXNQYXRjaCIsImNyZWF0ZVBhdGNoIiwib2xkRmlsZU5hbWUiLCJuZXdGaWxlTmFtZSIsIm9sZFN0ciIsIm5ld1N0ciIsIm9sZEhlYWRlciIsIm5ld0hlYWRlciIsIm9wdGlvbnMiLCJjb250ZXh0IiwiZGlmZiIsInB1c2giLCJ2YWx1ZSIsImxpbmVzIiwiY29udGV4dExpbmVzIiwibWFwIiwiZW50cnkiLCJodW5rcyIsIm9sZFJhbmdlU3RhcnQiLCJuZXdSYW5nZVN0YXJ0IiwiY3VyUmFuZ2UiLCJvbGRMaW5lIiwibmV3TGluZSIsImkiLCJjdXJyZW50IiwicmVwbGFjZSIsInNwbGl0IiwiYWRkZWQiLCJyZW1vdmVkIiwicHJldiIsInNsaWNlIiwibGVuZ3RoIiwiY29udGV4dFNpemUiLCJNYXRoIiwibWluIiwiaHVuayIsIm9sZFN0YXJ0Iiwib2xkTGluZXMiLCJuZXdTdGFydCIsIm5ld0xpbmVzIiwib2xkRU9GTmV3bGluZSIsInRlc3QiLCJuZXdFT0ZOZXdsaW5lIiwic3BsaWNlIiwicmV0IiwiYXBwbHkiLCJqb2luIiwiZmlsZU5hbWUiXSwibWFwcGluZ3MiOiI7Ozs7O2dDQUVnQkEsZSxHQUFBQSxlO3lEQThGQUMsbUIsR0FBQUEsbUI7eURBd0JBQyxXLEdBQUFBLFc7O0FBeEhoQjs7Ozt1QkFFTyxTQUFTRixlQUFULENBQXlCRyxXQUF6QixFQUFzQ0MsV0FBdEMsRUFBbURDLE1BQW5ELEVBQTJEQyxNQUEzRCxFQUFtRUMsU0FBbkUsRUFBOEVDLFNBQTlFLEVBQXlGQyxPQUF6RixFQUFrRztBQUN2RyxNQUFJLENBQUNBLE9BQUwsRUFBYztBQUNaQSxjQUFVLEVBQUVDLFNBQVMsQ0FBWCxFQUFWO0FBQ0Q7O0FBRUQsTUFBTUMsT0FBTyxzRUFBVU4sTUFBVixFQUFrQkMsTUFBbEIsQ0FBYjtBQUNBSyxPQUFLQyxJQUFMLENBQVUs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QXdDM0MsTUFBeEMsRUFBZ0RDLE1BQWhELEVBQXdEQyxTQUF4RCxFQUFtRUMsU0FBbkUsRUFBOEVDLE9BQTlFLENBQVA7QUFDRCIsImZpbGUiOiJjcmVhdGUuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge2RpZmZMaW5lc30gZnJvbSAnLi4vZGlmZi9saW5lJztcblxuZXhwb3J0IGZ1bmN0aW9uIHN0cnVjdHVyZWRQYXRjaChvbGRGaWxlTmFtZSwgbmV3RmlsZU5hbWUsIG9sZFN0ciwgbmV3U3RyLCBvbGRIZWFkZXIsIG5ld0hlYWRlciwgb3B0aW9ucykge1xuICBpZiAoIW9wdGlvbnMpIHtcbiAgICBvcHRpb25zID0geyBjb250ZXh0OiA0IH07XG4gIH1cblxuICBjb25zdCBkaWZmID0gZGlmZkxpbmVzKG9sZFN0ciwgbmV3U3RyKTtcbiAgZGlmZi5wdXNoKHt2YWx1ZTogJycsIGxpbmVzOiBbXX0pOyAgIC8vIEFwcGVuZCBhbiBlbXB0eSB2YWx1ZSB0byBtYWtlIGNsZWFudXAgZWFzaWVyXG5cbiAgZnVuY3Rpb24gY29udGV4dExpbmVzKGxpbmVzKSB7XG4gICAgcmV0dXJuIGxpbmVzLm1hcChmdW5jdGlvbihlbnRyeSkgeyByZXR1cm4gJyAnICsgZW50cnk7IH0pO1xuICB9XG5cbiAgbGV0IGh1bmtzID0gW107XG4gIGxldCBvbGRSYW5nZVN0YXJ0ID0gMCwgbmV3UmFuZ2VTdGFydCA9IDAsIGN1clJhbmdlID0gW10sXG4gICAgICBvbGRMaW5lID0gMSwgbmV3TGluZSA9IDE7XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgZGlmZi5sZW5ndGg7IGkrKykge1xuICAgIGNvbnN0IGN1cnJlbnQgPSBkaWZmW2ldLFxuICAgICAgICAgIGxpbmVzID0gY3VycmVudC5saW5lcyB8fCBjdXJyZW50LnZhbHVlLnJlcGxhY2UoL1xcbiQvLCAnJykuc3BsaXQoJ1xcbicpO1xuICAgIGN1cnJlbnQubGluZXMgPSBsaW5lcztcblxuICAgIGlmIChjdXJyZW50LmFkZGVkIHx8IGN1cnJlbnQucmVtb3ZlZCkge1xuICAgICAgLy8gSWYgd2UgaGF2ZSBwcmV2aW91cyBjb250ZXh0LCBzdGFydCB3aXRoIHRoYXRcbiAgICAgIGlmICghb2xkUmFuZ2VTdGFydCkge1xuICAgICAgICBjb25zdCBwcmV2ID0gZGlmZltpIC0gMV07XG4gICAgICAgIG9sZFJhbmdlU3RhcnQgPSBvbGRMaW5lO1xuICAgICAgICBuZXdSYW5nZVN0YXJ0ID0gbmV3TGluZTtcblxuICAgICAgICBpZiAocHJldikge1xuICAgICAgICAgIGN1clJhbmdlID0gb3B0aW9ucy5jb250ZXh0ID4gMCA/IGNvbnRleHRMaW5lcyhwcmV2LmxpbmVzLnNsaWNlKC1vcHRpb25zLmNvbnRleHQpKSA6IFtdO1xuICAgICAgICAgIG9sZFJhbmdlU3RhcnQgLT0gY3VyUmFuZ2UubGVuZ3RoO1xuICAgICAgICAgIG5ld1JhbmdlU3RhcnQgLT0gY3VyUmFuZ2UubGVuZ3RoO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8vIE91dHB1dCBvdXIgY2hhbmdlc1xuICAgICAgY3VyUmFuZ2UucHVzaCguLi4gbGluZXMubWFwKGZ1bmN0aW9uKGVudHJ5KSB7XG4gICAgICAgIHJldHVybiAoY3VycmVudC5hZGRlZCA/ICcrJyA6ICctJykgKyBlbnRyeTtcbiAgICAgIH0pKTtcblxuICAgICAgLy8gVHJhY2sgdGhlIHVwZGF0ZWQgZmlsZSBwb3NpdGlvblxuICAgICAgaWYgKGN1cnJlbnQuYWRkZWQpIHtcbiAgICAgICAgbmV3TGluZSArPSBsaW5lcy5sZW5ndGg7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBvbGRMaW5lICs9IGxpbmVzLmxlbmd0aDtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgLy8gSWRlbnRpY2FsIGNvbnRleHQgbGluZXMuIFRyYWNrIGxpbmUgY2hhbmdlc1xuICAgICAgaWYgKG9sZFJhbmdlU3RhcnQpIHtcbiAgICAgICAgLy8gQ2xvc2Ugb3V0IGFueSBjaGFuZ2VzIHRoYXQgaGF2ZSBiZWVuIG91dHB1dCAob3Igam9pbiBvdmVybGFwcGluZylcbiAgICAgICAgaWYgKGxpbmVzLmxlbmd0aCA8PSBvcHRpb25zLmNvbnRleHQgKiAyICYmIGkgPCBkaWZmLmxlbmd0aCAtIDIpIHtcbiAgICAgICAgICAvLyBPdmVybGFwcGluZ1xuICAgICAgICAgIGN1clJhbmdlLnB1c2goLi4uIGNvbnRleHRMaW5lcyhsaW5lcykpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vIGVuZCB0aGUgcmFuZ2UgYW5kIG91dHB1dFxuICAgICAgICAgIGxldCBjb250ZXh0U2l6ZSA9IE1hdGgubWluKGxpbmVzLmxlbmd0aCwgb3B0aW9ucy5jb250ZXh0KTtcbiAgICAgICAgICBjdXJSYW5nZS5wdXNoKC4uLiBjb250ZXh0TGluZXMobGluZXMuc2xpY2UoMCwgY29udGV4dFNpemUpKSk7XG5cbiAgICAgICAgICBsZXQgaHVuayA9IHtcbiAgICAgICAgICAgIG9sZFN0YXJ0OiBvbGRSYW5nZVN0YXJ0LFxuICAgICAgICAgICAgb2xkTGluZXM6IChvbGRMaW5lIC0gb2xkUmFuZ2VTdGFydCArIGNvbnRleHRTaXplKSxcbiAgICAgICAgICAgIG5ld1N0YXJ0OiBuZXdSYW5nZVN0YXJ0LFxuICAgICAgICAgICAgbmV3TGluZXM6IChuZXdMaW5lIC0gbmV3UmFuZ2VTdGFydCArIGNvbnRleHRTaXplKSxcbiAgICAgICAgICAgIGxpbmVzOiBjdXJSYW5nZVxuICAgICAgICAgIH07XG4gICAgICAgICAgaWYgKGkgPj0gZGlmZi5sZW5ndGggLSAyICYmIGxpbmVzLmxlbmd0aCA8PSBvcHRpb25zLmNvbnRleHQpIHtcbiAgICAgICAgICAgIC8vIEVPRiBpcyBpbnNpZGUgdGhpcyBodW5rXG4gICAgICAgICAgICBsZXQgb2xkRU9GTmV3bGluZSA9ICgvXFxuJC8udGVzdChvbGRTdHIpKTtcbiAgICAgICAgICAgIGxldCBuZXdFT0ZOZXdsaW5lID0gKC9cXG4kLy50ZXN0KG5ld1N0cikpO1xuICAgICAgICAgICAgaWYgKGxpbmVzLmxlbmd0aCA9PSAwICYmICFvbGRFT0ZOZXdsaW5lKSB7XG4gICAgICAgICAgICAgIC8vIHNwZWNpYWwgY2FzZTogb2xkIGhhcyBubyBlb2wgYW5kIG5vIHRyYWlsaW5nIGNvbnRleHQ7IG5vLW5sIGNhbiBlbmQgdXAgYmVmb3JlIGFkZHNcbiAgICAgICAgICAgICAgY3VyUmFuZ2Uuc3BsaWNlKGh1bmsub2xkTGluZXMsIDAsICdcXFxcIE5vIG5ld2xpbmUgYXQgZW5kIG9mIGZpbGUnKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoIW9sZEVPRk5ld2xpbmUgfHwgIW5ld0VPRk5ld2xpbmUpIHtcbiAgICAgICAgICAgICAgY3VyUmFuZ2UucHVzaCgnXFxcXCBObyBuZXdsaW5lIGF0IGVuZCBvZiBmaWxlJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIGh1bmtzLnB1c2goaHVuayk7XG5cbiAgICAgICAgICBvbGRSYW5nZVN0YXJ0ID0gMDtcbiAgICAgICAgICBuZXdSYW5nZVN0YXJ0ID0gMDtcbiAgICAgICAgICBjdXJSYW5nZSA9IFtdO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBvbGRMaW5lICs9IGxpbmVzLmxlbmd0aDtcbiAgICAgIG5ld0xpbmUgKz0gbGluZXMubGVuZ3RoO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiB7XG4gICAgb2xkRmlsZU5hbWU6IG9sZEZpbGVOYW1lLCBuZXdGaWxlTmFtZTogbmV3RmlsZU5hbWUsXG4gICAgb2xkSGVhZGVyOiBvbGRIZWFkZXIsIG5ld0hlYWRlcjogbmV3SGVhZGVyLFxuICAgIGh1bmtzOiBodW5rc1xuICB9O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlVHdvRmlsZXNQYXRjaChvbGRGaWxlTmFtZSwgbmV3RmlsZU5hbWUsIG9sZFN0ciwgbmV3U3RyLCBvbGRIZWFkZXIsIG5ld0hlYWRlciwgb3B0aW9ucykge1xuICBjb25zdCBkaWZmID0gc3RydWN0dXJlZFBhdGNoKG9sZEZpbGVOYW1lLCBuZXdGaWxlTmFtZSwgb2xkU3RyLCBuZXdTdHIsIG9sZEhlYWRlciwgbmV3SGVhZGVyLCBvcHRpb25zKTtcblxuICBjb25zdCByZXQgPSBbXTtcbiAgaWYgKG9sZEZpbGVOYW1lID09IG5ld0ZpbGVOYW1lKSB7XG4gICAgcmV0LnB1c2goJ0luZGV4OiAnICsgb2xkRmlsZU5hbWUpO1xuICB9XG4gIHJldC5wdXNoKCc9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09Jyk7XG4gIHJldC5wdXNoKCctLS0gJyArIGRpZmYub2xkRmlsZU5hbWUgKyAodHlwZW9mIGRpZmYub2xkSGVhZGVyID09PSAndW5kZWZpbmVkJyA/ICcnIDogJ1xcdCcgKyBkaWZmLm9sZEhlYWRlcikpO1xuICByZXQucHVzaCgnKysrICcgKyBkaWZmLm5ld0ZpbGVOYW1lICsgKHR5cGVvZiBkaWZmLm5ld0hlYWRlciA9PT0gJ3VuZGVmaW5lZCcgPyAnJyA6ICdcXHQnICsgZGlmZi5uZXdIZWFkZXIpKTtcblxuICBmb3IgKGxldCBpID0gMDsgaSA8IGRpZmYuaHVua3MubGVuZ3RoOyBpKyspIHtcbiAgICBjb25zdCBodW5rID0gZGlmZi5odW5rc1tpXTtcbiAgICByZXQucHVzaChcbiAgICAgICdAQCAtJyArIGh1bmsub2xkU3RhcnQgKyAnLCcgKyBodW5rLm9sZExpbmVzXG4gICAgICArICcgKycgKyBodW5rLm5ld1N0YXJ0ICsgJywnICsgaHVuay5uZXdMaW5lc1xuICAgICAgKyAnIEBAJ1xuICAgICk7XG4gICAgcmV0LnB1c2guYXBwbHkocmV0LCBodW5rLmxpbmVzKTtcbiAgfVxuXG4gIHJldHVybiByZXQuam9pbignXFxuJykgKyAnXFxuJztcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZVBhdGNoKGZpbGVOYW1lLCBvbGRTdHIsIG5ld1N0ciwgb2xkSGVhZGVyLCBuZXdIZWFkZXIsIG9wdGlvbnMpIHtcbiAgcmV0dXJuIGNyZWF0ZVR3b0ZpbGVzUGF0Y2goZmlsZU5hbWUsIGZpbGVOYW1lLCBvbGRTdHIsIG5ld1N0ciwgb2xkSGVhZGVyLCBuZXdIZWFkZXIsIG9wdGlvbnMpO1xufVxuIl19


/***/ },
/* 13 */
/***/ function(module, exports) {

	/*istanbul ignore start*/"use strict";

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports. /*istanbul ignore end*/convertChangesToDMP = convertChangesToDMP;
	// See: http://code.google.com/p/google-diff-match-patch/wiki/API
	function convertChangesToDMP(changes) {
	  var ret = [],
	      change = /*istanbul ignore start*/void 0 /*istanbul ignore end*/,
	      operation = /*istanbul ignore start*/void 0 /*istanbul ignore end*/;
	  for (var i = 0; i < changes.length; i++) {
	    change = changes[i];
	    if (change.added) {
	      operation = 1;
	    } else if (change.removed) {
	      operation = -1;
	    } else {
	      operation = 0;
	    }

	    ret.push([operation, change.value]);
	  }
	  return ret;
	}
	
//**no source maps!**=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jb252ZXJ0L2RtcC5qcyJdLCJuYW1lcyI6WyJjb252ZXJ0Q2hhbmdlc1RvRE1QIiwiY2hhbmdlcyIsInJldCIsImNoYW5nZSIsIm9wZXJhdGlvbiIsImkiLCJsZW5ndGgiLCJhZGRlZCIsInJlbW92ZWQiLCJwdXNoIiwidmFsdWUiXSwibWFwcGluZ3MiOiI7Ozs7O2dDQUNnQkEsbUIsR0FBQUEsbUI7QUFEaEI7QUFDTyxTQUFTQSxtQkFBVCxDQUE2QkMsT0FBN0IsRUFBc0M7QUFDM0MsTUFBSUMsTUFBTSxFQUFWO0FBQUEsTUFDSUMsd0NBREo7QUFBQSxNQUVJQywyQ0FGSjtBQUdBLE9BQUssSUFBSUMsSUFBSSxDQUFiLEVBQWdCQSxJQUFJSixRQUFRSyxNQUE1QixFQUFvQ0QsR0FBcEMsRUFBeUM7QUFDdkNGLGFBQVNGLFFBQVFJLENBQVIsQ0FBVDtBQUNBLFFBQUlGLE9BQU9JLEtBQVgsRUFBa0I7QUFDaEJILGtCQUFZLENBQVo7QUFDRCxLQUZELE1BRU8sSUFBSUQsT0FBT0ssT0FBWCxFQUFvQjtBQUN6Qkosa0JBQVksQ0FBQyxDQUFiO0FBQ0QsS0FGTSxNQUVBO0FBQ0xBLGtCQUFZLENBQVo7QUFDRDs7QUFFREYsUUFBSU8sSUFBSixDQUFTLENBQUNMLFNBQUQsRUFBWUQsT0FBT08sS0FBbkIsQ0FBVDtBQUNEO0FBQ0QsU0FBT1IsR0FBUDtBQUNEIiwiZmlsZSI6ImRtcC5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8vIFNlZTogaHR0cDovL2NvZGUuZ29vZ2xlLmNvbS9wL2dvb2dsZS1kaWZmLW1hdGNoLXBhdGNoL3dpa2kvQVBJXG5leHBvcnQgZnVuY3Rpb24gY29udmVydENoYW5nZXNUb0RNUChjaGFuZ2VzKSB7XG4gIGxldCByZXQgPSBbXSxcbiAgICAgIGNoYW5nZSxcbiAgICAgIG9wZXJhdGlvbjtcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBjaGFuZ2VzLmxlbmd0aDsgaSsrKSB7XG4gICAgY2hhbmdlID0gY2hhbmdlc1tpXTtcbiAgICBpZiAoY2hhbmdlLmFkZGVkKSB7XG4gICAgICBvcGVyYXRpb24gPSAxO1xuICAgIH0gZWxzZSBpZiAoY2hhbmdlLnJlbW92ZWQpIHtcbiAgICAgIG9wZXJhdGlvbiA9IC0xO1xuICAgIH0gZWxzZSB7XG4gICAgICBvcGVyYXRpb24gPSAwO1xuICAgIH1cblxuICAgIHJldC5wdXNoKFtvcGVyYXRpb24sIGNoYW5nZS52YWx1ZV0pO1xuICB9XG4gIHJldHVybiByZXQ7XG59XG4iXX0=


/***/ },
/* 14 */
/***/ function(module, exports) {

	/*istanbul ignore start*/'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports. /*istanbul ignore end*/convertChangesToXML = convertChangesToXML;
	function convertChangesToXML(changes) {
	  var ret = [];
	  for (var i = 0; i < changes.length; i++) {
	    var change = changes[i];
	    if (change.added) {
	      ret.push('<ins>');
	    } else if (change.removed) {
	      ret.push('<del>');
	    }

	    ret.push(escapeHTML(change.value));

	    if (change.added) {
	      ret.push('</ins>');
	    } else if (change.removed) {
	      ret.push('</del>');
	    }
	  }
	  return ret.join('');
	}

	function escapeHTML(s) {
	  var n = s;
	  n = n.replace(/&/g, '&amp;');
	  n = n.replace(/</g, '&lt;');
	  n = n.replace(/>/g, '&gt;');
	  n = n.replace(/"/g, '&quot;');

	  return n;
	}
	
//**no source maps!**=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jb252ZXJ0L3htbC5qcyJdLCJuYW1lcyI6WyJjb252ZXJ0Q2hhbmdlc1RvWE1MIiwiY2hhbmdlcyIsInJldCIsImkiLCJsZW5ndGgiLCJjaGFuZ2UiLCJhZGRlZCIsInB1c2giLCJyZW1vdmVkIiwiZXNjYXBlSFRNTCIsInZhbHVlIiwiam9pbiIsInMiLCJuIiwicmVwbGFjZSJdLCJtYXBwaW5ncyI6Ijs7Ozs7Z0NBQWdCQSxtQixHQUFBQSxtQjtBQUFULFNBQVNBLG1CQUFULENBQTZCQyxPQUE3QixFQUFzQztBQUMzQyxNQUFJQyxNQUFNLEVBQVY7QUFDQSxPQUFLLElBQUlDLElBQUksQ0FBYixFQUFnQkEsSUFBSUYsUUFBUUcsTUFBNUIsRUFBb0NELEdBQXBDLEVBQXlDO0FBQ3ZDLFFBQUlFLFNBQVNKLFFBQVFFLENBQVIsQ0FBYjtBQUNBLFFBQUlFLE9BQU9DLEtBQVgsRUFBa0I7QUFDaEJKLFVBQUlLLElBQUosQ0FBUyxPQUFUO0FBQ0QsS0FGRCxNQUVPLElBQUlGLE9BQU9HLE9BQVgsRUFBb0I7QUFDekJOLFVBQUlLLElBQUosQ0FBUyxPQUFUO0FBQ0Q7O0FBRURMLFFBQUlLLElBQUosQ0FBU0UsV0FBV0osT0FBT0ssS0FBbEIsQ0FBVDs7QUFFQSxRQUFJTCxPQUFPQyxLQUFYLEVBQWtCO0FBQ2hCSixVQUFJSyxJQUFKLENBQVMsUUFBVDtBQUNELEtBRkQsTUFFTyxJQUFJRixPQUFPRyxPQUFYLEVBQW9CO0FBQ3pCTixVQUFJSyxJQUFKLENBQVMsUUFBVDtBQUNEO0FBQ0Y7QUFDRCxTQUFPTCxJQUFJUyxJQUFKLENBQVMsRUFBVCxDQUFQO0FBQ0Q7O0FBRUQsU0FBU0YsVUFBVCxDQUFvQkcsQ0FBcEIsRUFBdUI7QUFDckIsTUFBSUMsSUFBSUQsQ0FBUjtBQUNBQyxNQUFJQSxFQUFFQyxPQUFGLENBQVUsSUFBVixFQUFnQixPQUFoQixDQUFKO0FBQ0FELE1BQUlBLEVBQUVDLE9BQUYsQ0FBVSxJQUFWLEVBQWdCLE1BQWhCLENBQUo7QUFDQUQsTUFBSUEsRUFBRUMsT0FBRixDQUFVLElBQVYsRUFBZ0IsTUFBaEIsQ0FBSjtBQUNBRCxNQUFJQSxFQUFFQyxPQUFGLENBQVUsSUFBVixFQUFnQixRQUFoQixDQUFKOztBQUVBLFNBQU9ELENBQVA7QUFDRCIsImZpbGUiOiJ4bWwuanMiLCJzb3VyY2VzQ29udGVudCI6WyJleHBvcnQgZnVuY3Rpb24gY29udmVydENoYW5nZXNUb1hNTChjaGFuZ2VzKSB7XG4gIGxldCByZXQgPSBbXTtcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBjaGFuZ2VzLmxlbmd0aDsgaSsrKSB7XG4gICAgbGV0IGNoYW5nZSA9IGNoYW5nZXNbaV07XG4gICAgaWYgKGNoYW5nZS5hZGRlZCkge1xuICAgICAgcmV0LnB1c2goJzxpbnM+Jyk7XG4gICAgfSBlbHNlIGlmIChjaGFuZ2UucmVtb3ZlZCkge1xuICAgICAgcmV0LnB1c2goJzxkZWw+Jyk7XG4gICAgfVxuXG4gICAgcmV0LnB1c2goZXNjYXBlSFRNTChjaGFuZ2UudmFsdWUpKTtcblxuICAgIGlmIChjaGFuZ2UuYWRkZWQpIHtcbiAgICAgIHJldC5wdXNoKCc8L2lucz4nKTtcbiAgICB9IGVsc2UgaWYgKGNoYW5nZS5yZW1vdmVkKSB7XG4gICAgICByZXQucHVzaCgnPC9kZWw+Jyk7XG4gICAgfVxuICB9XG4gIHJldHVybiByZXQuam9pbignJyk7XG59XG5cbmZ1bmN0aW9uIGVzY2FwZUhUTUwocykge1xuICBsZXQgbiA9IHM7XG4gIG4gPSBuLnJlcGxhY2UoLyYvZywgJyZhbXA7Jyk7XG4gIG4gPSBuLnJlcGxhY2UoLzwvZywgJyZsdDsnKTtcbiAgbiA9IG4ucmVwbGFjZSgvPi9nLCAnJmd0OycpO1xuICBuID0gbi5yZXBsYWNlKC9cIi9nLCAnJnF1b3Q7Jyk7XG5cbiAgcmV0dXJuIG47XG59XG4iXX0=


/***/ }
/******/ ])
});
;