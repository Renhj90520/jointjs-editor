export function extendCommandManager() {
  joint.dia.CommandManager = Backbone.Model.extend(
    {
      defaults: {
        cmdBeforeAdd: null,
        cmdNameRegex: /^(?:add|remove|change:\w+)$/,
        applyOptionsList: ["propertyPath"],
        revertOptionsList: ["propertyPath"]
      },
      PREFIX_LENGTH: 7,
      initialize: function(a) {
        joint.util.bindAll(this, "initBatchCommand", "storeBatchCommand"),
          (this.graph = a.graph),
          this.reset(),
          this.listen();
      },
      listen: function() {
        this.listenTo(this.graph, "all", this.addCommand, this),
          this.listenTo(this.graph, "batch:start", this.initBatchCommand, this),
          this.listenTo(this.graph, "batch:stop", this.storeBatchCommand, this);
      },
      createCommand: function(a) {
        var command = {
          action: void 0,
          data: { id: void 0, type: void 0, previous: {}, next: {} },
          batch: a && a.batch
        };
        return command;
      },
      push: function(command) {
        (this.redoStack = []),
          command.batch
            ? ((this.lastCmdIndex = Math.max(this.lastCmdIndex, 0)),
              this.trigger("batch", command))
            : (this.undoStack.push(command), this.trigger("add", command));
      },
      addCommand: function(a, b, c, d) {
        if (
          (!d || !d.dry) &&
          this.get("cmdNameRegex").test(a) &&
          ("function" != typeof this.get("cmdBeforeAdd") ||
            this.get("cmdBeforeAdd").apply(this, arguments))
        ) {
          var e = void 0,
            f = b instanceof joint.dia.Graph;
          if (this.batchCommand) {
            e = this.batchCommand[Math.max(this.lastCmdIndex, 0)];
            var g = (f && !e.graphChange) || e.data.id !== b.id,
              h = e.action !== a;
            if (this.lastCmdIndex >= 0 && (g || h)) {
              var i = this.batchCommand.findIndex(function(c, d) {
                return (
                  ((f && c.graphChange) || c.data.id === b.id) && c.action === a
                );
              });
              i < 0 || "add" === a || "remove" === a
                ? (e = this.createCommand({ batch: !0 }))
                : ((e = this.batchCommand[i]), this.batchCommand.splice(i, 1)),
                (this.lastCmdIndex = this.batchCommand.push(e) - 1);
            }
          } else e = this.createCommand({ batch: !1 });
          if ("add" === a || "remove" === a)
            return (
              (e.action = a),
              (e.data.id = b.id),
              (e.data.type = b.attributes.type),
              (e.data.attributes = joint.util.merge({}, b.toJSON())),
              (e.options = d || {}),
              void this.push(e)
            );
          var j = a.substr(this.PREFIX_LENGTH);
          (e.batch && e.action) ||
            ((e.action = a),
            (e.data.previous[j] = joint.util.clone(b.previous(j))),
            (e.options = d || {}),
            f
              ? (e.graphChange = !0)
              : ((e.data.id = b.id), (e.data.type = b.attributes.type))),
            (e.data.next[j] = joint.util.clone(b.get(j))),
            this.push(e);
        }
      },
      initBatchCommand: function() {
        this.batchCommand
          ? this.batchLevel++
          : ((this.batchCommand = [this.createCommand({ batch: !0 })]),
            (this.lastCmdIndex = -1),
            (this.batchLevel = 0));
      },
      storeBatchCommand: function() {
        if (this.batchCommand && this.batchLevel <= 0) {
          var a = this.filterBatchCommand(this.batchCommand);
          a.length > 0 &&
            ((this.redoStack = []),
            this.undoStack.push(a),
            this.trigger("add", a)),
            (this.batchCommand = null),
            (this.lastCmdIndex = null),
            (this.batchLevel = null);
        } else this.batchCommand && this.batchLevel > 0 && this.batchLevel--;
      },
      filterBatchCommand: function(a) {
        for (var b = a.slice(), c = []; b.length > 0; ) {
          var d = b.shift(),
            e = d.data.id;
          if (null != d.action && (null != e || d.graphChange)) {
            if ("add" === d.action) {
              var f = b.findIndex(function(a) {
                return "remove" === a.action && a.data && a.data.id === e;
              });
              if (f >= 0) {
                b = b.filter(function(a, b) {
                  return b > f || a.data.id !== e;
                });
                continue;
              }
            } else if ("remove" === d.action) {
              var g = b.findIndex(function(a) {
                return "add" === a.action && a.data && a.data.id == e;
              });
              if (g >= 0) {
                b.splice(g, 1);
                continue;
              }
            } else if (
              0 === d.action.indexOf("change") &&
              joint.util.isEqual(d.data.previous, d.data.next)
            )
              continue;
            c.push(d);
          }
        }
        return c;
      },
      revertCommand: function(a, b) {
        this.stopListening();
        var c;
        c = Array.isArray(a) ? this.constructor.sortBatchCommands(a) : [a];
        for (var d = this.graph, e = c.length - 1; e >= 0; e--) {
          var f = c[e],
            g = f.graphChange ? d : d.getCell(f.data.id),
            h = joint.util.assign(
              { commandManager: this.id || this.cid },
              b,
              joint.util.pick(f.options, this.get("revertOptionsList"))
            );
          switch (f.action) {
            case "add":
              g.remove(h);
              break;
            case "remove":
              d.addCell(f.data.attributes, h);
              break;
            default:
              var i = f.action.substr(this.PREFIX_LENGTH);
              g.set(i, f.data.previous[i], h);
          }
        }
        this.listen();
      },
      applyCommand: function(a, b) {
        this.stopListening();
        var c;
        c = Array.isArray(a) ? this.constructor.sortBatchCommands(a) : [a];
        for (var d = this.graph, e = 0; e < c.length; e++) {
          var f = c[e],
            g = f.graphChange ? d : d.getCell(f.data.id),
            h = joint.util.assign(
              { commandManager: this.id || this.cid },
              b,
              joint.util.pick(f.options, this.get("applyOptionsList"))
            );
          switch (f.action) {
            case "add":
              d.addCell(f.data.attributes, h);
              break;
            case "remove":
              g.remove(h);
              break;
            default:
              var i = f.action.substr(this.PREFIX_LENGTH);
              g.set(i, f.data.next[i], h);
          }
        }
        this.listen();
      },
      undo: function(a) {
        var b = this.undoStack.pop();
        b && (this.revertCommand(b, a), this.redoStack.push(b));
      },
      redo: function(a) {
        var b = this.redoStack.pop();
        b && (this.applyCommand(b, a), this.undoStack.push(b));
      },
      cancel: function(a) {
        this.hasUndo() &&
          (this.revertCommand(this.undoStack.pop(), a), (this.redoStack = []));
      },
      reset: function() {
        (this.undoStack = []), (this.redoStack = []);
      },
      hasUndo: function() {
        return this.undoStack.length > 0;
      },
      hasRedo: function() {
        return this.redoStack.length > 0;
      }
    },
    {
      sortBatchCommands: function(a) {
        for (var b = [], c = 0; c < a.length; c++) {
          var d = a[c],
            e = null;
          if ("add" === d.action)
            for (var f = d.data.id, g = 0; g < c; g++)
              if (a[g].data.id === f) {
                e = g - 1;
                break;
              }
          null !== e ? b.splice(e, 0, d) : b.push(d);
        }
        return b;
      }
    }
  );
}
