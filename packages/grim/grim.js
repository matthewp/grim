function valueEnumerable(value) {
  return { enumerable: true, value };
}

let noop = () => {};

function delve(obj, keys) {
  let len = keys.length, val = obj, i = 0;
  for(; i < len; i++) {
    val = val[keys[i]];
  }
  return val;
}

function updateFragment(data = {}) {
  let dirty = this.dirty;
  let parts = this.parts;
  parts.forEach(function updatePart(part) {
    let value = delve(data, part.prop);
    if(part.update(value, data)) dirty.push(part);
  });
  dirty.forEach(function commitPart(part) {
    part.commit();
  });
  this.dirty.length = 0;
}

function walk(root, cb) {
  let walker = document.createTreeWalker(root, -1);
  let currentNode = walker.nextNode();
  let index = 0;

  while(currentNode) {
    cb(currentNode, index);
    index++;
    currentNode = walker.nextNode();
  }
}

let Template = {
  createInstance(data) {
    let frag = document.importNode(this.template.content, true);
    let parts = [];

    walk(frag, (node, index) => {
      if(this.parts.has(index)) {
        for(let [Part, prop, args] of this.parts.get(index)) {
          parts.push(...Part.create(node, prop, null, args));
        }
      }
    });

    Object.defineProperties(frag, {
      parts: valueEnumerable(parts),
      dirty: valueEnumerable([]),
      update: valueEnumerable(updateFragment)
    });
    frag.update(data);
    return frag;
  }
};

class Part {
  constructor(node, prop, value, args) {
    this.node = node;
    this.prop = prop;
    this.value = value;
    this.args = args;
  }

  update(value, data) {
    if(value !== this.value) {
      this.value = value;
      this.set(value, data);
      return true;
    }
    return false;
  }

  commit(){}

  static args() {
    return {};
  }

  static create(...args) {
    return [new this(...args)];
  }
}

let textExp = /{{(.+?)}}/g;

class MultiString {
  constructor(statics) {
    this.dirty = false;
    this.statics = Array.from(statics);
  }

  set(index, value) {
    this.dirty = true;
    this.statics[index] = value;
  }

  commit() {
    this.dirty = false;
    return this.statics.join('');
  }

  static create(a, _, c, { ctr, name, names, statics }) {
    const inst = new this(statics);
    return names.map(([i, n]) => new ctr(a, n, c, { name, index: i, committer: inst }))
  }
}

class TextPart extends Part {
  set(value) {
    this.node.data = value;
  }
}

class AttributePart extends Part {
  set(value) {
    this.args.committer.set(this.args.index, value);
  }
  commit() {
    if(this.args.committer.dirty)
      this.node.setAttribute(this.args.name, this.args.committer.commit());
  }
}

class BooleanAttributePart extends Part {
  set(value) {
    if(value) {
      this.node.setAttribute(this.args.name, '');
    } else if(this.node.hasAttribute(this.args.name)) {
      this.node.removeAttribute(this.args.name);
    }
  }
}

class PropertyPart extends Part {
  set(value) {
    this.node[this.args.prop] = value;
  }
}

class EventPart extends Part {
  set(value) {
    if(this._bound) {
      this.node.removeEventListener(this.args.event, this._bound);
    }

    this._bound = value;
    this.node.addEventListener(this.args.event, value);
  }
}

class DirectivePart extends Part {
  update(fn, data) {
    if(!('updater' in this)) {
      this.updater = fn(this.node, data) || noop;
    } else {
      this.updater(data);
    }
  }
}

let specials = new Map([
  ['if', class extends Part {
    update(value, data) {
      super.update(value, data);
      this.frag.update(data);
    }
    set(value, data) {
      if(!this.nodes) {
        let template = stamp(this.node);
        this.frag = template.createInstance(data);
        this.nodes = Array.from(this.frag.childNodes);
        this.placeholder = document.createComment(`if(${this.prop})`);
        this.node.replaceWith(this.placeholder);
      }
      if(value) {
        let frag = document.createDocumentFragment();
        for(let node of this.nodes) {
          frag.append(node);
        }
        this.placeholder.replaceWith(frag);
      } else if(!this.frag.hasChildNodes()) {
        for(let i = 1; i < this.nodes.length; i++) {
          this.nodes[i].remove();
        }
        this.nodes[0].replaceWith(this.placeholder);
      }
    }
  }],
  ['each', class extends Part {
    static args(node) {
      return { key: node.dataset.key };
    }
    update(values, parentData) {
      if(!super.update(values, parentData)) {
        this.updateValues(values, parentData);
      }
    }
    set(values, parentData) {
      if(!this.start) {
        this.key = this.args.key ? this.keyKeyed : this.keyNonKeyed;
        this.start = document.createComment(`each(${this.prop})`);
        this.end = document.createComment(`end each(${this.prop})`);
        this.node.replaceWith(this.start);
        this.start.after(this.end);
        this.frags = [];
        this.keys = [];
        this.keyMap = new Map();
      }
      this.updateValues(values, parentData);
    }
    createData(value, parentData) {
      return Object.create(parentData, {
        item: { value }
      });
    }
    render(value, parentData) {
      let template = stamp(this.node);
      let data = this.createData(value, parentData);
      let frag = template.createInstance(data);
      frag.nodes = Array.from(frag.childNodes);
      frag.data = data;
      return frag;
    }
    keyNonKeyed(_, index) {
      return index;
    }
    keyKeyed(value) {
      return value[this.args.key];
    }
    refrag(frag) {
      if(!frag.firstChild && frag.nodes)
        frag.append(...frag.nodes);
      return frag;
    }
    append(frag, ref) {
      let sibling = ref ? ref.nodes[ref.nodes.length - 1] : this.start;
      sibling.after(this.refrag(frag));
    }
    before(frag, ref) {
      let sibling = ref ? ref.nodes[0] : this.end;
      sibling.before(this.refrag(frag));
    }
    remove(frag) {
      this.clear(frag.nodes[0], frag.nodes[frag.nodes.length - 1].nextSibling);
    }
    clear(startNode = this.start.nextSibling, end = this.end) {
      let node = startNode;
      let next;
      while(node !== end) {
        next = node.nextSibling;
        node.remove();
        node = next;
      }
    }
    updateFrag(frag, value, parentData) {
      frag.update(frag.data.item === value ? frag.data : frag.data = this.createData(value, parentData));
      return frag;
    }
    updateValues(values = [], parentData) {
      let oldFrags = this.frags,
      newFrags = [],
      oldKeys = this.keys;

      let expectedMap = new Map();
      let newKeys = [];
      for(let i = 0, len = values.length; i < len; i++) {
        let key = this.key(values[i], i);
        expectedMap.set(key, values[i]);
        newKeys[i] = key;
      }

      let newHead = 0,
        newTail = values.length - 1,
        oldHead = 0,
        oldTail = oldFrags.length - 1;
      
      while(oldHead <= oldTail && newHead <= newTail) {
        if (oldFrags[oldHead] === null) {
          oldHead++;
        } else if (oldFrags[oldTail] === null) {
          oldTail--;
        } else if(oldKeys[oldHead] === newKeys[newHead]) {
          newFrags[newHead] =
            this.updateFrag(oldFrags[oldHead], values[newHead], parentData);
          oldHead++;
          newHead++;
        } else if(oldKeys[oldTail] === newKeys[newTail]) {
          newFrags[newTail] =
            this.updateFrag(oldFrags[oldTail], values[newTail], parentData);
          oldTail--;
          newTail--;
        } else if(oldKeys[oldHead] === newKeys[newTail]) {
          newFrags[newTail] =
            this.updateFrag(oldFrags[oldHead], values[newTail], parentData);
          this.before(oldFrags[oldHead], newFrags[newTail + 1]);
          oldHead++;
          newTail--;
        } else if(oldKeys[oldTail] === newKeys[newHead]) {
          newFrags[newHead] =
            this.updateFrag(oldFrags[oldTail], values[newHead], parentData);
          this.before(oldFrags[oldTail], oldFrags[oldHead]);
          oldTail--;
          newHead++;
        } else {
          if(!expectedMap.has(oldKeys[oldHead])) {
            this.remove(oldFrags[oldHead]);
            oldHead++;
          } else if(!expectedMap.has(oldKeys[oldTail])) {
            this.remove(oldFrags[oldTail]);
            oldTail--;
          } else {
            let value = values[newHead];
            let frag = this.keyMap.get(this.key(value, newHead));
            if(frag === undefined) {
              frag = this.render(value, parentData);
              this.keyMap.set(this.key(value, newHead), frag);
            } else {
              frag = this.updateFrag(frag, value, parentData);
              oldFrags[oldFrags.indexOf(frag)] = null;
            }
            newFrags[newHead] = frag;
            this.append(frag, oldFrags[newHead - 1]);
            newHead++;
          }
        }
      }

      while(newHead <= newTail) {
        let frag = this.render(values[newHead], parentData);
        this.keyMap.set(this.key(frag.data.item, newHead), frag);
        this.append(frag, newFrags[newHead - 1]);
        newFrags[newHead++] = frag;
      }

      while(oldHead <= oldTail) {
        let frag = oldFrags[oldHead];
        this.keyMap.delete(this.key(frag.data.item, oldHead));
        oldHead++;
        this.remove(frag);
      }

      this.keys = newKeys;
      this.frags = newFrags;
    }
  }]
]);

function addPart(parts, index, item) {
  if(!parts.has(index)) {
    parts.set(index, []);
  }
  let items = parts.get(index);
  item[1] = item[1].split('.');
  items.push(item);
}

function process(template) {
  let walker = document.createTreeWalker(template.content, 133, null, false);
  let currentNode = walker.nextNode();
  let index = 0, parts = new Map();
  let callAfters = [];

  while(currentNode) {
    switch(currentNode.nodeType) {
      case 1: {
        let removes = [];
        for(let {name, value} of currentNode.attributes) {
          textExp.lastIndex = 0;
          let match = textExp.exec(value);
          let remove = true;
          if(match) {
            let i = 0, stri = 0;
            let statics = [];
            let names = [];

            do {
              if(match.index > stri)
                statics[i++] = value.substr(stri, match.index - stri);

              names.push([i, match[1].split('.')]);
              //addPart(parts, index, [AttributePart, match[1], { name, multi, index: i }]);

              statics[i++] = '';
              stri = match.index + match[0].length;

              match = textExp.exec(value);
            } while(match);
            if(value.length > stri) statics[i] = value.substr(stri);

            addPart(parts, index, [MultiString, '', { name, names, statics, ctr: AttributePart }]);
          } else {
            switch(name[0]) {
              case '@':
                addPart(parts, index, [EventPart, value, { event: name.substr(1) }]);
                break;
              case '.':
                addPart(parts, index, [PropertyPart, value, { prop: name.substr(1) }]);
                break;
              case '$':
                let directive = name.substr(1);
                if(specials.has(directive)) {
                  let Part = specials.get(directive);
                  addPart(parts, index, [Part, value, Part.args(currentNode)]);
                } else {
                  addPart(parts, index, [DirectivePart, directive]);
                }
                break;
              case '?':
                addPart(parts, index, [BooleanAttributePart, value, { name: name.substr(1) }]);
                break;
              default:
                remove = false;
                break;
            }
          }

          if(remove) {
            removes.push(name);
          }
        }
        removes.forEach(name => currentNode.removeAttribute(name));
        break;
      }
      case 3: {
        let node = currentNode;
        textExp.lastIndex = 0;
        let matches = node.data.split(textExp);
        if(matches.length > 1) {
          let frag = document.createDocumentFragment();
          for(let i = 0; i < matches.length; i++) {
            let text = matches[i];
            if(i % 2 !== 0) {
              addPart(parts, index, [TextPart, text]);
              text = "";
            }

            frag.append(document.createTextNode(text));
            index++;
          }
          index--;
          callAfters.push(() => node.replaceWith(frag));
        }

        break;
      }
    }

    index++;
    currentNode = walker.nextNode();
  }

  callAfters.forEach(cb => cb());

  return parts;
}

const templateMap = new WeakMap();
function stamp(template) {
  let parts;
  if(templateMap.has(template)) {
    parts = templateMap.get(template);
  } else {
    parts = process(template);
    templateMap.set(template, parts);
  }

  return Object.create(Template, {
    parts: valueEnumerable(parts),
    template: valueEnumerable(template)
  });
}

export { stamp };