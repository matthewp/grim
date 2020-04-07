function valueEnumerable(value) {
  return { enumerable: true, value };
}

let noop = () => {};

function delve(obj, key, def, p, undef) {
  key = key.split ? key.split('.') : key;
  for (p = 0; p < key.length; p++) {
    obj = obj ? obj[key[p]] : undef;
  }
  return obj === undef ? def : obj;
}

function updateFragment(data = {}) {
  let parts = this.parts;
  parts.forEach(function updatePart(part) {
    let value = delve(data, part.prop);
    part.update(value, data);
  });
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
          parts.push(new Part(node, prop, null, args));
        }
      }
    });

    Object.defineProperties(frag, {
      parts: valueEnumerable(parts),
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
}

let textExp = /{{(.+?)}}/g;

class TextPart extends Part {
  set(value) {
    this.node.data = value;
  }
}

class AttributePart extends Part {
  set(value) {
    this.node.setAttribute(this.args.name, value);
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
    update(values, parentData) {
      if(!super.update(values, parentData)) {
        this.updateValues(values, parentData);
      }
    }
    set(values, parentData) {
      if(!this.start) {
        this.start = document.createComment(`each(${this.prop})`);
        this.end = document.createComment(`end each(${this.prop})`);
        this.node.replaceWith(this.start);
        this.start.after(this.end);
        //this.frags = new Map();
        this.frags = [];
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
      //this.frags.set(value, [frag, data]);
      return frag;
    }
    key(value) {
      return value;
    }
    updateValues(values = [], parentData) {
      if(this.args.key) {

      } else {
        let index = 0;
        let frags = this.frags;
        let frag;
        let last;
        for(let value of values) {
          frag = frags[index];

          if(frag === undefined) {
            let sibling = last ? last.nodes[last.nodes.length - 1] : this.start;
            frag = this.render(value, parentData);
            frags.push(frag);
            sibling.after(frag);
          } else {
            frag.update(frag.data.item === value ? frag.data : frag.data = this.createData(value, parentData));
          }

          last = frag;
          index++;
        }

        if(index < frags.length) {
          frags.length = index;
          this.clear(frag && frag.nodes[frag.nodes.length - 1].nextSibling);
        }
      }
    }

    clear(startNode = this.start.nextSibling) {
      let node = startNode;
      let end = this.end;
      let parent = end.parentNode;
      let next;
      while(node !== end) {
        next = node.nextSibling;
        parent.removeChild(node);
        node = next;
      }
    }
  }]
]);

function addPart(parts, index, item) {
  if(!parts.has(index)) {
    parts.set(index, []);
  } else {

  }
  let items = parts.get(index);
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
            addPart(parts, index, [AttributePart, match[1], { name }]);
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
                  addPart(parts, index, [specials.get(directive), value, {}]);
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