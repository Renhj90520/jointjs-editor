export function extendTextEditor() {
  joint.ui.TextEditor = joint.mvc.View.extend(
    {
      options: {
        text: void 0,
        newlineCharacterBBoxWidth: 10,
        placeholder: void 0,
        focus: !0,
        debug: !1,
        useNativeSelection: !0,
        annotateUrls: !1,
        urlAnnotation: {
          attrs: {
            class: "url-annotation",
            fill: "lightblue",
            "text-decoration": "underline"
          }
        },
        textareaAttributes: {
          autocorrect: "off",
          autocomplete: "off",
          autocapitalize: "off",
          spellcheck: "false",
          tabindex: "0"
        }
      },
      className: "text-editor",
      events: {
        "keyup textarea": "onKeyup",
        "input textarea": "onInput",
        "copy textarea": "onCopy",
        "cut textarea": "onCut",
        "paste textarea": "onPaste",
        "mousedown .char-selection-box": "onMousedown",
        "dblclick .char-selection-box": "onDoubleClick",
        "click .char-selection-box": "onTripleClick"
      },
      selection: { start: null, end: null },
      selecting: !1,
      init: function() {
        joint.util.bindAll(
          this,
          "onMousedown",
          "onMousemove",
          "onMouseup",
          "onDoubleClick",
          "onTripleClick",
          "onKeydown",
          "onAfterPaste",
          "onAfterKeydown"
        ),
          this.setTextElement(this.options.text),
          $(document.body).on("mousemove", this.onMousemove),
          $(document.body).on("mouseup", this.onMouseup),
          $(document.body).on("keydown", this.onKeydown),
          this.options.cellView
            ? (this.$viewport = $(this.options.cellView.paper.viewport))
            : (this.$viewport = $(this.options.text)),
          this.options.annotations &&
            this.setAnnotations(this.options.annotations);
      },
      setTextElement: function(a) {
        this.$elText && this.unbindTextElement(),
          (this.options.text = a),
          (this.$elText = $(a)),
          this.$elText.on("mousedown", this.onMousedown),
          this.$elText.on("dblclick", this.onDoubleClick),
          this.$elText.on("click", this.onTripleClick);
      },
      render: function(a) {
        (this.$caret = $("<div>", { class: "caret" })),
          (this.$selection = $("<div>")),
          (this.$selectionBox = $("<div>", { class: "char-selection-box" })),
          this.$el.append(this.$caret, this.$selection),
          (this.$textareaContainer = $("<div>", {
            class: "textarea-container"
          })),
          (this.$textarea = $("<textarea>", this.options.textareaAttributes)),
          (this.textarea = this.$textarea[0]),
          (this._textContent = this.textarea.value = this.getTextContent()),
          (this._textareaValueBeforeInput = this.textarea.value),
          this.$textareaContainer.append(this.textarea),
          this.options.focus && this.$el.append(this.$textareaContainer),
          $(a || document.body).append(this.$el);
        var b = joint.V(this.options.text).bbox();
        return (
          this.$textareaContainer.css({ left: b.x, top: b.y }),
          this.focus(),
          joint.V(this.options.text).attr("cursor", "text"),
          this.selectAll(),
          this
        );
      },
      annotateURLBeforeCaret: function(a) {
        var b = this.getURLBoundary(Math.max(a - 1, 0));
        return (
          !!b && (this.annotateURL(this.getAnnotations() || [], b[0], b[1]), !0)
        );
      },
      hasSelection: function() {
        return (
          joint.util.isNumber(this.selection.start) &&
          joint.util.isNumber(this.selection.end) &&
          this.selection.start !== this.selection.end
        );
      },
      textContentHasChanged: function() {
        return this._textContent !== this.textarea.value;
      },
      restoreTextAreaSelectionDirection: function() {
        this._selectionDirection &&
          (this.textarea.selectionDirection = this._selectionDirection);
      },
      storeSelectionDirection: function() {
        this._selectionDirection = this.textarea.selectionDirection;
      },
      onKeydown: function(a) {
        this.options.debug && console.log("onKeydown(): ", a.keyCode),
          this.hasSelection() &&
            (this.deselect(), this.restoreTextAreaSelectionDirection()),
          setTimeout(this.onAfterKeydown, 0),
          (this._copied = !1),
          (this._selectionStartBeforeInput = this.textarea.selectionStart),
          (this._selectionEndBeforeInput = this.textarea.selectionEnd);
      },
      onAfterKeydown: function() {
        this.$textarea.is(":focus") &&
          (this.storeSelectionDirection(),
          this.textarea.selectionStart === this.textarea.selectionEnd
            ? this.setCaret(this.textarea.selectionStart)
            : this.select(
                this.textarea.selectionStart,
                this.textarea.selectionEnd
              ));
      },
      onKeyup: function(a) {
        this.textContentHasChanged() && this.onInput(a);
      },
      onCopy: function(a) {
        this._copied || this.copyToClipboard();
      },
      onCut: function(a) {
        this._copied || this.copyToClipboard();
      },
      copyToClipboard: function() {
        var a =
          document.queryCommandSupported &&
          document.queryCommandSupported("copy");
        a && ((this._copied = !0), document.execCommand("copy"));
      },
      onInput: function(a) {
        if (this.textContentHasChanged()) {
          var b =
              this.textarea.value.length -
              this._textareaValueBeforeInput.length,
            c = {
              start: this._selectionStartBeforeInput,
              end: this._selectionEndBeforeInput
            },
            d = {
              start: this.textarea.selectionStart,
              end: this.textarea.selectionEnd
            };
          this.options.debug &&
            console.log(
              "onInput()",
              a,
              "selectionBeforeInput",
              c,
              "selectionAfterInput",
              d,
              "diffLength",
              b
            );
          var e = this.inferTextOperationType(c, d, b),
            f = !1,
            g = this.getAnnotations();
          if (this.options.annotateUrls && "insert" === e) {
            var h = this.textarea.value.substr(c.start, b);
            this.options.debug && console.log("onInput()", "inserted text", h),
              /\s/.test(h) &&
                ((f = this.annotateURLBeforeCaret(c.start)),
                f && (g = this.shiftAnnotations(g, d.end, b)));
          }
          if (
            g &&
            (f || (g = this.annotate(g, c, d, b)),
            this.options.debug &&
              console.log("onInput()", "modified annotations", g),
            this._currentAnnotationAttributes && "insert" === e)
          ) {
            var i = {
              start: c.start,
              end: d.end,
              attrs: this._currentAnnotationAttributes
            };
            g.push(i),
              (this._currentAnnotationAttributes = void 0),
              this.options.debug &&
                console.log(
                  "onInput()",
                  "insert annotation",
                  i,
                  "final annotations",
                  g
                );
          }
          (this._annotations = g),
            this.trigger(
              "text:change",
              this.textarea.value,
              this._textareaValueBeforeInput,
              g,
              c,
              d
            ),
            (this._selectionBeforeInput = d),
            (this._textareaValueBeforeInput = this.textarea.value),
            (this._textContent = this.textarea.value);
        }
      },
      onPaste: function(a) {
        this.options.debug && console.log("onPaste()"),
          (this._textareaValueBeforeInput = this.textarea.value),
          setTimeout(this.onAfterPaste, 0);
      },
      onAfterPaste: function() {
        this.setCaret(this.textarea.selectionStart);
      },
      onMousedown: function(a) {
        if (3 !== a.originalEvent.detail) {
          this.options.debug && console.log("onMousedown()");
          var b = this.getCharNumFromEvent(a);
          this.startSelecting(),
            this.select(b),
            a.preventDefault(),
            a.stopPropagation();
        }
      },
      onMousemove: function(a) {
        if (this.selectionInProgress()) {
          this.options.debug && console.log("onMousemove()");
          var b = this.getCharNumFromEvent(a);
          this.storeSelectionDirection(),
            this.select(null, b),
            a.preventDefault(),
            a.stopPropagation();
        }
      },
      onMouseup: function(a) {
        this.selectionInProgress() &&
          (this.options.debug && console.log("onMouseup()"),
          this.stopSelecting(),
          this.trigger(
            "select:changed",
            this.selection.start,
            this.selection.end
          ));
      },
      onDoubleClick: function(a) {
        this.options.debug && console.log("onDoubleClick()");
        var b = this.getCharNumFromEvent(a),
          c = this.getWordBoundary(b);
        this.select(c[0], c[1]), a.preventDefault(), a.stopPropagation();
      },
      onTripleClick: function(a) {
        3 === a.originalEvent.detail &&
          (this.options.debug && console.log("onTripleClick()"),
          this.hideCaret(),
          this.selectAll(),
          a.preventDefault(),
          a.stopPropagation());
      },
      findAnnotationsUnderCursor: function(a, b) {
        return joint.V.findAnnotationsAtIndex(a, b);
      },
      findAnnotationsInSelection: function(a, b, c) {
        return joint.V.findAnnotationsBetweenIndexes(a, b, c);
      },
      inferTextOperationType: function(a, b, c) {
        return a.start === a.end && b.start === b.end && c > 0
          ? "insert"
          : a.start === a.end && b.start === b.end && c <= 0
            ? "delete-single"
            : a.start !== a.end && b.start === b.end && b.start === a.start
              ? "delete"
              : a.start !== a.end && b.start !== a.start
                ? "delete-insert"
                : void 0;
      },
      annotate: function(a, b, c, d) {
        var e = [],
          f = this.inferTextOperationType(b, c, d);
        return (
          joint.util.toArray(a).forEach(function(a) {
            var g, h;
            switch (f) {
              case "insert":
                a.start < b.start && b.start <= a.end
                  ? (a.end += d)
                  : a.start >= b.start && ((a.start += d), (a.end += d));
                break;
              case "delete-single":
                a.start < b.start && b.start <= a.end && b.start !== c.start
                  ? (a.end += d)
                  : a.start <= b.start && b.start < a.end && b.start === c.start
                    ? (a.end += d)
                    : a.start >= b.start && ((a.start += d), (a.end += d));
                break;
              case "delete":
                a.start <= b.start && b.start <= a.end
                  ? b.end <= a.end
                    ? (a.end += d)
                    : (a.end += c.start - a.end)
                  : a.start >= b.start && a.start < b.end
                    ? ((g = a.end - a.start),
                      (h = b.end - a.start),
                      (a.start = b.start),
                      (a.end = a.start + g - h))
                    : a.start >= b.end && ((a.start += d), (a.end += d));
                break;
              case "delete-insert":
                if (a.start <= b.start && b.start <= a.end)
                  b.start < a.end &&
                    (b.end > a.end
                      ? (a.end = c.end)
                      : (a.end = c.end + (a.end - b.end)));
                else if (a.start >= b.start && a.start <= b.end) {
                  var i = c.start - b.start;
                  (h = b.end - a.start),
                    (g = a.end - a.start),
                    (a.start = b.start + i),
                    (a.end = a.start + g - h);
                } else
                  a.start >= b.start && a.end <= b.end
                    ? (a.start = a.end = 0)
                    : a.start >= b.end && ((a.start += d), (a.end += d));
                break;
              default:
                this.options.debug &&
                  console.log("ui.TextEditor: Unknown text operation.");
            }
            a.end > a.start && e.push(a);
          }, this),
          e
        );
      },
      shiftAnnotations: function(a, b, c) {
        return joint.V.shiftAnnotations(a, b, c);
      },
      setCurrentAnnotation: function(a) {
        this._currentAnnotationAttributes = a;
      },
      setAnnotations: function(a) {
        this._annotations = a;
      },
      getAnnotations: function() {
        return this._annotations;
      },
      getCombinedAnnotationAttrsAtIndex: function(a, b) {
        var c = {};
        return (
          joint.util.toArray(b).forEach(function(b) {
            void 0 === b.start && void 0 === b.end
              ? joint.V.mergeAttrs(c, b.attrs)
              : a >= b.start && a < b.end && joint.V.mergeAttrs(c, b.attrs);
          }),
          c
        );
      },
      getSelectionAttrs: function(a, b) {
        var c = a.start,
          d = a.end;
        if (c === d && 0 === c)
          return this.getCombinedAnnotationAttrsAtIndex(c, b);
        if (c === d) return this.getCombinedAnnotationAttrsAtIndex(c - 1, b);
        for (var e, f = c; f < d; f++) {
          var g = this.getCombinedAnnotationAttrsAtIndex(f, b);
          if (e && !joint.util.isEqual(e, g)) {
            (e = joint.util.flattenObject(joint.V.mergeAttrs({}, e))),
              (g = joint.util.flattenObject(joint.V.mergeAttrs({}, g)));
            var h = {};
            joint.util.forIn(g, function(a, b) {
              e[b] === g[b] && joint.util.setByPath(h, b, a);
            }),
              (e = h);
          } else e = g;
        }
        return e;
      },
      getTextContent: function() {
        var a = this.options.text,
          b = joint.V(a).find(".v-line");
        return 0 === b.length
          ? a.textContent
          : b.reduce(function(a, b, c, d) {
              var e = b.node.textContent;
              return (
                b.hasClass("v-empty-line") && (e = ""),
                c === d.length - 1 ? a + e : a + e + "\n"
              );
            }, "");
      },
      startSelecting: function() {
        this.selecting = !0;
      },
      stopSelecting: function() {
        this.selecting = !1;
      },
      selectionInProgress: function() {
        return this.selecting === !0;
      },
      selectAll: function() {
        return this.select(0, this.getNumberOfChars());
      },
      select: function(a, b) {
        return (
          this.options.debug && console.log("select(", a, b, ")"),
          void 0 === b && (b = a),
          joint.util.isNumber(a) && (this.selection.start = a),
          joint.util.isNumber(b) && (this.selection.end = b),
          joint.util.isNumber(this.selection.end) ||
            (this.selection.end = this.selection.start),
          joint.util.isNumber(this.selection.start) &&
            joint.util.isNumber(this.selection.end) &&
            (this.selection.start === this.selection.end
              ? (this.clearSelection(),
                this.focus(),
                this.setCaret(this.selection.start))
              : (this.hideCaret(),
                this.renderSelection(this.selection.start, this.selection.end)),
            this.trigger(
              "select:change",
              this.selection.start,
              this.selection.end
            )),
          this
        );
      },
      setTextAreaSelection: function(a, b) {
        var c = { start: a, end: b };
        (c = this.normalizeSelectionRange(c)),
          this.textarea.focus(),
          (this.textarea.selectionStart = c.start),
          (this.textarea.selectionEnd = c.end);
      },
      renderSelection: function(a, b) {
        this.options.debug && console.log("renderSelection()");
        var c = { start: a, end: b };
        if (
          ((c = this.normalizeSelectionRange(c)),
          this.clearSelection(),
          this.options.useNativeSelection)
        ) {
          this.$viewport &&
            ((this._viewportUserSelectBefore = this.$viewport.css(
              "user-select"
            )),
            this.$viewport.css({
              "-webkit-user-select": "all",
              "-moz-user-select": "all",
              "user-select": "all"
            }));
          var d = c.end - c.start;
          this.selectTextInElement(this.options.text, c.start, d);
        } else this.renderSelectionBoxes(c.start, c.end);
      },
      normalizeSelectionStartAndLength: function(a, b, c) {
        var d = a.substr(0, b),
          e = a.substr(b, c),
          f = this.countLineBreaks(d),
          g = this.countLineBreaks(e);
        (b -= f), (c -= g);
        var h = this.countEmptyLines(d),
          i = this.countEmptyLines(e);
        return (b += h), (c += h), (c -= h), (c += i), { start: b, length: c };
      },
      selectTextInElement: function(a, b, c) {
        if (
          (joint.util.isFunction(a.selectSubString) &&
            this.selectTextInElementUsingSelectSubString(a, b, c),
          !this.actualSelectionMatchesExpectedSelection(b, c))
        )
          try {
            this.selectTextInElementUsingRanges(a, b, c);
          } catch (d) {
            this.options.debug && console.log(d),
              joint.util.isFunction(a.selectSubString) &&
                this.selectTextInElementUsingSelectSubString(a, b, c);
          }
      },
      selectTextInElementUsingSelectSubString: function(a, b, c) {
        var d = this.normalizeSelectionStartAndLength(
          this.getTextContent(),
          b,
          c
        );
        try {
          a.selectSubString(d.start, d.length);
        } catch (e) {
          this.options.debug && console.log(e);
        }
      },
      selectTextInElementUsingRanges: function(a, b, c) {
        var d = window.getSelection();
        d.removeAllRanges();
        var e = this.normalizeSelectionStartAndLength(
          this.getTextContent(),
          b,
          c
        );
        (b = 0 + e.start), (c = 0 + e.length);
        for (
          var f,
            g,
            h,
            i,
            j,
            k,
            l = this.getTextNodesFromDomElement(a),
            m = 0,
            n = b + c;
          c > 0 && l.length > 0;

        )
          (f = l.shift()),
            (h = m),
            (i = m + f.length),
            ((h >= b && h < n) ||
              (i > b && i <= n) ||
              (b >= h && b < i) ||
              (n > h && n <= i)) &&
              ((j = Math.max(b - h, 0)),
              (k = Math.min(j + Math.min(c, f.length), i)),
              (g = document.createRange()),
              g.setStart(f, j),
              g.setEnd(f, k),
              d.addRange(g),
              (c -= k - j)),
            (m += f.length);
      },
      actualSelectionMatchesExpectedSelection: function(a, b) {
        var c = window.getSelection(),
          d = c.toString(),
          e = this.getExpectedSelectedContent(a, b);
        return (d = d.replace(/\s/g, " ")), e === d;
      },
      getExpectedSelectedContent: function(a, b) {
        var c = this.getTextContent(),
          d = c.substr(a, b);
        return (
          (d = d.replace(/(\n\r|\r|\n){2,}/g, "-")),
          (d = d.replace(/\n\r|\r|\n/g, "")),
          (d = d.replace(/\s/g, " "))
        );
      },
      getTextNodesFromDomElement: function(a) {
        for (var b = [], c = 0, d = a.childNodes.length; c < d; c++) {
          var e = a.childNodes[c];
          void 0 !== e.tagName
            ? (b = b.concat(this.getTextNodesFromDomElement(e)))
            : b.push(e);
        }
        return b;
      },
      renderSelectionBoxes: function(a, b) {
        this.options.debug && console.log("renderSelectionBoxes()"),
          this.$selection.empty();
        for (
          var c,
            d,
            e,
            f = this.getFontSize(),
            g = this.getTextTransforms(),
            h = g.rotation,
            i = a;
          i < b;
          i++
        ) {
          var j = this.$selectionBox.clone();
          try {
            e = this.getCharBBox(i);
          } catch (k) {
            this.trigger("select:out-of-range", a, b);
            break;
          }
          d &&
          0 === h &&
          Math.round(e.y) === Math.round(d.y) &&
          Math.round(e.height) === Math.round(d.height) &&
          Math.round(e.x) === Math.round(d.x + d.width)
            ? c.css({ width: "+=" + e.width })
            : (j.css({
                left: e.x,
                top: e.y - e.height,
                width: e.width,
                height: e.height,
                "-webkit-transform": "rotate(" + h + "deg)",
                "-webkit-transform-origin": "0% 100%",
                "-moz-transform": "rotate(" + h + "deg)",
                "-moz-transform-origin": "0% 100%"
              }),
              this.$selection.append(j),
              (c = j)),
            (d = e);
        }
        e &&
          this.$textareaContainer.css({ left: e.x, top: e.y - f * g.scaleY });
      },
      clearSelection: function() {
        return (
          this.options.debug && console.log("clearSelection()"),
          this.$selection.empty(),
          this.options.text.selectSubString &&
            (this.$viewport &&
              this._viewportUserSelectBefore &&
              this.$viewport.css({
                "-webkit-user-select": this._viewportUserSelectBefore,
                "-moz-user-select": this._viewportUserSelectBefore,
                "user-select": this._viewportUserSelectBefore
              }),
            window.getSelection().removeAllRanges()),
          this
        );
      },
      deselect: function() {
        return (
          this.options.debug && console.log("deselect()"),
          this.stopSelecting(),
          this.clearSelection(),
          this.setTextAreaSelection(this.selection.start, this.selection.end),
          this
        );
      },
      getSelectionStart: function() {
        return this.selection.start;
      },
      getSelectionEnd: function() {
        return this.selection.end;
      },
      getSelectionRange: function() {
        return this.normalizeSelectionRange(this.selection);
      },
      normalizeSelectionRange: function(a) {
        return (
          (a = joint.util.clone(a)),
          a.start > a.end && (a.end = [a.start, (a.start = a.end)][0]),
          a
        );
      },
      getSelectionLength: function() {
        var a = this.getSelectionRange();
        return a.end - a.start;
      },
      getSelection: function() {
        var a = this.getSelectionRange();
        return this.getTextContent().slice(a.start, a.end);
      },
      getWordBoundary: function(a) {
        for (var b = this.textarea.value, c = /\W/, d = a; d; ) {
          if (c.test(b[d])) {
            d += 1;
            break;
          }
          d -= 1;
        }
        for (var e = this.getNumberOfChars(), f = a; f <= e && !c.test(b[f]); )
          f += 1;
        return d < f ? [d, f] : [f, d];
      },
      getURLBoundary: function(a) {
        for (
          var b = this.textarea.value,
            c = /\s/,
            d = /[-a-zA-Z0-9@:%_+.~#?&\/\/=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_+.~#?&\/\/=]*)?/,
            e = a;
          e;

        ) {
          if (c.test(b[e])) {
            e += 1;
            break;
          }
          e -= 1;
        }
        for (var f = this.getNumberOfChars(), g = a; g <= f && !c.test(b[g]); )
          g += 1;
        if (d.test(b.substring(e, g))) return [e, g];
      },
      annotateURL: function(a, b, c) {
        var d = this.textarea.value.substring(b, c),
          e = joint.util.assign({ url: d }, this.options.urlAnnotation);
        return (
          (e.start = b),
          (e.end = c),
          joint.util.isEqual(e, a[a.length - 1]) || a.push(e),
          a
        );
      },
      getCharBBox: function(a) {
        if (this.isLineEnding(a)) {
          var b = this.getCharBBox(a - 1);
          return (
            (b.x = b.x2),
            (b.y = b.y2),
            (b.width = this.options.newlineCharacterBBoxWidth || 10),
            b
          );
        }
        var c = this.realToSvgCharNum(a),
          d = this.options.text,
          e = d.getStartPositionOfChar(c),
          f = d.getEndPositionOfChar(c),
          g = d.getExtentOfChar(c);
        (e = this.localToScreenCoordinates(e)),
          (f = this.localToScreenCoordinates(f));
        var h = this.getTextTransforms(),
          i = e.x,
          j = e.y,
          k = g.width * h.scaleX,
          l = g.height * h.scaleY;
        return { x: i, y: j, width: k, height: l, x2: f.x, y2: f.y };
      },
      realToSvgCharNum: function(a) {
        for (var b = 0, c = 0; c <= a; c++) this.isLineEnding(c) && (b += 1);
        return a - b;
      },
      selectionStartToSvgCharNum: function(a) {
        return a - this.nonEmptyLinesBefore(a);
      },
      isLineEnding: function(a) {
        var b = this.textarea.value;
        return "\n" === b[a] && a > 0 && "\n" !== b[a - 1];
      },
      svgToRealCharNum: function(a) {
        for (var b = 0, c = 0; c <= a + b; c++)
          this.isLineEnding(c) && (b += 1);
        return a + b;
      },
      localToScreenCoordinates: function(a) {
        return (
          $(this.options.text).show(),
          joint.V.transformPoint(a, this.options.text.getCTM())
        );
      },
      getNumberOfChars: function() {
        return this.getTextContent().length;
      },
      getCharNumFromEvent: function(a) {
        var b = this.options.text,
          c = a.clientX,
          d = a.clientY,
          e = joint.V(b).toLocalPoint(c, d),
          f = b.getCharNumAtPosition(e);
        if (f < 0) return this.getNumberOfChars();
        var g = this.localToScreenCoordinates(e),
          h = this.getCharBBox(this.svgToRealCharNum(f));
        return Math.abs(h.x - g.x) < Math.abs(h.x + h.width - g.x)
          ? this.svgToRealCharNum(f)
          : this.svgToRealCharNum(f) + 1;
      },
      lineNumber: function(a) {
        var b = this.textarea.value.substr(0, a);
        return this.countLineBreaks(b);
      },
      emptyLinesBefore: function(a) {
        for (
          var b = this.textarea.value.split(/\n\r|\r|\n/g),
            c = this.lineNumber(a),
            d = 0,
            e = c - 1;
          e >= 0;
          e--
        )
          b[e] || (d += 1);
        return d;
      },
      countLineBreaks: function(a) {
        return (a.match(/\n\r|\r|\n/g) || []).length;
      },
      countEmptyLines: function(a) {
        return (a.match(/(\n\r|\r|\n){2,}/g) || []).length;
      },
      nonEmptyLinesBefore: function(a) {
        return this.lineNumber(a) - this.emptyLinesBefore(a);
      },
      isEmptyLine: function(a) {
        var b = this.textarea.value.split(/\n\r|\r|\n/g);
        return !b[a];
      },
      isEmptyLineUnderSelection: function(a) {
        var b = this.lineNumber(a);
        return this.isEmptyLine(b);
      },
      getTextTransforms: function() {
        var a = this.options.text.getCTM();
        return joint.V.decomposeMatrix(a);
      },
      getFontSize: function() {
        return parseInt(joint.V(this.options.text).attr("font-size"), 10);
      },
      getTextAnchor: function() {
        return joint.V(this.options.text).attr("text-anchor") || "";
      },
      setCaret: function(a, b) {
        joint.util.isObject(a) && ((b = a), (a = void 0)), (b = b || {});
        var c = this.options.text,
          d = this.getNumberOfChars(),
          e = this.selection.start,
          f = this.textarea.value;
        "undefined" != typeof a &&
          ((a = Math.min(Math.max(a, 0), d)),
          (e = this.selection.start = this.selection.end = a)),
          b.silent || this.trigger("caret:change", e),
          this.setTextAreaSelection(e, e),
          this.options.debug &&
            console.log(
              "setCaret(",
              a,
              b,
              ")",
              "selectionStart",
              e,
              "isLineEnding",
              this.isLineEnding(e),
              "isEmptyLineUnderSelection",
              this.isEmptyLineUnderSelection(e),
              "svgCharNum",
              this.selectionStartToSvgCharNum(e),
              "nonEmptyLinesBefore",
              this.nonEmptyLinesBefore(e)
            );
        var g;
        try {
          var h;
          this.isEmptyLineUnderSelection(e) ||
          (!this.isLineEnding(e) && f.length !== e)
            ? ((h = this.selectionStartToSvgCharNum(e)),
              (g = c.getStartPositionOfChar(h)))
            : ((h = this.selectionStartToSvgCharNum(e) - 1),
              (g = c.getEndPositionOfChar(h)));
        } catch (i) {
          this.trigger("caret:out-of-range", e), (g = { x: 0, y: 0 });
        }
        var j = this.localToScreenCoordinates(g),
          k = this.getTextTransforms(),
          l = k.rotation,
          m = this.getFontSize() * k.scaleY;
        return (
          this.options.placeholder &&
            this.$caret.toggleClass("placeholder", 0 === d),
          this.$caret
            .css({
              left: j.x,
              top: j.y + (d ? -m : 0),
              height: m,
              "line-height": m + "px",
              "font-size": m + "px",
              "-webkit-transform": "rotate(" + l + "deg)",
              "-webkit-transform-origin": "0% 100%",
              "-moz-transform": "rotate(" + l + "deg)",
              "-moz-transform-origin": "0% 100%"
            })
            .attr({ "text-anchor": this.getTextAnchor() })
            .show(),
          this.$textareaContainer.css({ left: j.x, top: j.y + (d ? -m : 0) }),
          this.focus(),
          this
        );
      },
      focus: function() {
        return (
          this.options.debug && console.log("focus()"), this.showCaret(), this
        );
      },
      blur: function() {
        return (
          this.options.debug && console.log("blur()"), this.hideCaret(), this
        );
      },
      showCaret: function() {
        return (
          this.options.debug && console.log("showCaret()"),
          this.$caret.show(),
          this
        );
      },
      hideCaret: function() {
        return (
          this.options.debug && console.log("hideCaret()"),
          this.$caret.hide(),
          this
        );
      },
      unbindTextElement: function() {
        this.$elText.off("mousedown", this.onMousedown),
          this.$elText.off("dblclick", this.onDoubleClick),
          this.$elText.off("click", this.onTripleClick);
      },
      onRemove: function() {
        this.deselect(),
          this.unbindTextElement(),
          $(document.body).off("mousemove", this.onMousemove),
          $(document.body).off("mouseup", this.onMouseup),
          $(document.body).off("keydown", this.onKeydown),
          joint.V(this.options.text).attr("cursor", "");
      }
    },
    joint.util.assign(
      {
        getTextElement: function(a) {
          var b = a.tagName.toUpperCase();
          if ("TEXT" === b || "TSPAN" === b || "TEXTPATH" === b)
            return "TEXT" === b ? a : this.getTextElement(a.parentNode);
        },
        edit: function(a, b) {
          b = b || {};
          var c = b.update !== !1;
          this.options = joint.util.assign({}, b, { update: c });
          var d = this.getTextElement(a);
          if (!d)
            return void (
              this.options.debug &&
              console.log("ui.TextEditor: cannot find a text element.")
            );
          this.close(),
            (this.ed = new joint.ui.TextEditor(
              joint.util.assign({ text: d }, b)
            )),
            this.ed.on("all", this.trigger, this);
          var e;
          if (b.cellView) {
            if (
              ((e = b.cellView.paper.el),
              (this.cellViewUnderEdit = b.cellView),
              (this.cellViewUnderEditInteractiveOption = this.cellViewUnderEdit.options.interactive),
              (this.cellViewUnderEdit.options.interactive = !1),
              b.annotationsProperty && !this.ed.getAnnotations())
            ) {
              var f = this.cellViewUnderEdit.model.prop(b.annotationsProperty);
              f && this.ed.setAnnotations(this.deepCloneAnnotations(f));
            }
          } else {
            var g = joint.V(d).svg();
            e = g.parentNode;
          }
          return (
            c &&
              this.ed.on(
                "text:change",
                function(a, c, e) {
                  if (b.cellView) {
                    var f = null;
                    if (
                      (b.textProperty &&
                        (b.cellView.model.isLink() &&
                          "labels" ===
                            b.textProperty.substr(0, "labels".length) &&
                          (f = joint
                            .V($(joint.V(d).node).closest(".label")[0])
                            .index()),
                        b.cellView.model.prop(b.textProperty, a, {
                          textEditor: this.ed.cid
                        })),
                      b.annotationsProperty &&
                        b.cellView.model.prop(
                          b.annotationsProperty,
                          this.deepCloneAnnotations(e),
                          { rewrite: !0, textEditor: this.ed.cid }
                        ),
                      null !== f)
                    ) {
                      var g = joint.V(b.cellView.el).find(".label");
                      (d = g[f].findOne("text")),
                        this.ed.setTextElement(d.node);
                    }
                  } else joint.V(d).text(a, e);
                },
                this
              ),
            this.ed.render(e),
            this
          );
        },
        close: function() {
          if (this.ed) {
            if (this.ed.options.annotateUrls) {
              var a = this.ed.getSelectionStart(),
                b = this.findAnnotationsUnderCursor(),
                c = b.find(function(a) {
                  return !!a.url && a;
                });
              if (!c) {
                var d = this.ed.annotateURLBeforeCaret(a);
                d && this.applyAnnotations(this.getAnnotations());
              }
            }
            this.ed.remove(),
              this.cellViewUnderEdit &&
                (this.cellViewUnderEdit.options.interactive = this.cellViewUnderEditInteractiveOption),
              (this.ed = this.cellViewUnderEdit = this.cellViewUnderEditInteractiveOption = void 0);
          }
        },
        applyAnnotations: function(a) {
          var b = this.options;
          if (this.ed && b.update) {
            b.cellView && b.annotationsProperty
              ? (b.cellView.model.prop(
                  b.annotationsProperty,
                  this.deepCloneAnnotations(a),
                  { rewrite: !0 }
                ),
                this.ed.setAnnotations(a))
              : joint.V(this.ed.options.text).text(this.ed.getTextContent(), a);
            var c = this.getSelectionRange(),
              d = this.getSelectionLength();
            d > 0 ? this.ed.select(c.start, c.end) : this.ed.setCaret();
          }
        },
        deepCloneAnnotations: function(a) {
          try {
            return JSON.parse(JSON.stringify(a));
          } catch (b) {
            return;
          }
        },
        proxy: function(a, b) {
          if (this.ed) return this.ed[a].apply(this.ed, b);
        },
        setCurrentAnnotation: function(a) {
          return this.proxy("setCurrentAnnotation", arguments);
        },
        getAnnotations: function() {
          return this.proxy("getAnnotations", arguments);
        },
        setCaret: function() {
          return this.proxy("setCaret", arguments);
        },
        deselect: function() {
          return this.proxy("deselect", arguments);
        },
        selectAll: function() {
          return this.proxy("selectAll", arguments);
        },
        select: function() {
          return this.proxy("select", arguments);
        },
        getNumberOfChars: function() {
          return this.proxy("getNumberOfChars", arguments);
        },
        getCharNumFromEvent: function() {
          return this.proxy("getCharNumFromEvent", arguments);
        },
        getWordBoundary: function() {
          return this.proxy("getWordBoundary", arguments);
        },
        findAnnotationsUnderCursor: function() {
          return this.proxy("findAnnotationsUnderCursor", [
            this.ed.getAnnotations(),
            this.ed.getSelectionStart()
          ]);
        },
        findAnnotationsInSelection: function() {
          if (this.ed) {
            var a = this.ed.getSelectionRange();
            return this.proxy("findAnnotationsInSelection", [
              this.ed.getAnnotations(),
              a.start,
              a.end
            ]);
          }
        },
        getSelectionAttrs: function(a) {
          if (this.ed) {
            var b = this.ed.getSelectionRange();
            return this.proxy("getSelectionAttrs", [b, a]);
          }
        },
        getSelectionLength: function() {
          return this.proxy("getSelectionLength", arguments);
        },
        getSelectionRange: function() {
          return this.proxy("getSelectionRange", arguments);
        }
      },
      Backbone.Events
    )
  );
}
