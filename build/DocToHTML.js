
module.exports = class DocToHTML {

  static convert (json) {
    this.classes = [];
    this.events  = [];
    this.globals = [];
    this.statics = [];
    this.methods = [];

    json.forEach(item => {
      if (item.kind === 'typedef') {
        this.globals.push(this.getItem(item));
      }

      if (item.kind === 'event') {
        this.events.push(this.getItem(item));
      }

      if (item.kind === 'class') {
        this.classes.push(this.getItem(item));

        item.members.instance.forEach(instance => {
          this.methods.push(this.getItem(instance));
        });

        item.members.static.forEach(staticc => {
          this.statics.push(this.getItem(staticc));
        });
      }
    });

    let html = '';
    html += '<html>\n<body>\n';
    html += '<a name="top"></a>\n';

    html += '<div class="doc-toc">\n';
    html += '<h3><a href="#class-' + this.classes[0].name + '">' + this.classes[0].name + '</a></h3>\n\n';
    html += this.createTOCItems('method', this.methods);

    html += '<h3>Static</h3>\n\n';
    html += this.createTOCItems('static', this.statics);

    html += '<h3>Events</h3>\n\n';
    html += this.createTOCItems('event', this.events);

    html += '<h3>Global</h3>\n\n';
    html += this.createTOCItems('global', this.globals);
    html += '</div>\n\n';



    html += '<div class="doc-content">\n';
    html += '<h1>Documentation</h1>\n\n';

    html += '<h2>Class</h2>\n\n';
    html += this.createContentItems('class', this.classes);

    html += '<h2>Methods</h2>\n\n';
    html += this.createContentItems('method', this.methods);

    html += '<h2>Static</h2>\n\n';
    html += this.createContentItems('static', this.statics);

    html += '<h2>Events</h2>\n\n';
    html += this.createContentItems('event', this.events);

    html += '<h2>Global</h2>\n\n';
    html += this.createContentItems('global', this.globals);
    html += '</div>\n';


    html += '</body>\n</html>';

    return html;
  }

  static getDescription (description) {
    let html = '';
    if (description && description.children) {
      description.children.forEach(item => {
        let openTag = '';
        let closeTag = '';

        switch (item.type) {
          case 'paragraph':
            // openTag = '<p>';
            // closeTag = '</p>\n\n';
            break;
          case 'list':
            openTag = '<ul>';
            closeTag = '</ul>\n\n';
            break;
          case 'listItem':
            openTag = '<li>';
            closeTag = '</li>\n';
            break;
        }

        if (item.value) {
          html += openTag + item.value + closeTag;
        }

        if (item.children) {
          html += openTag + this.getDescription(item) + closeTag;
        }
      });
    }

    return html;
  }

  static getType (type) {
    if (!type) {
      return;
    }

    if (type.type === 'NameExpression') {
      return { name: type.name };
    }

    if (type.type === 'OptionalType') {
      return { name: type.expression.name, optional: true };
    }
  }

  static getParams (params) {
    let res = [];

    params.forEach(item => {
      const type = this.getType(item.type);

      if (type) {
        res.push({
          name: item.name,
          description: this.getDescription(item.description),
          default: item.default,
          type: type.name,
          optional: type.optional
        });
      }

      if (item.properties) {
        res = res.concat(this.getParams(item.properties));
      }
    });

    if (res.length) {
      return res;
    }
  }

  static getReturns (returns) {
    const res = [];
    returns.forEach(item => {
      const type = this.getType(item.type);
      if (type) {
        res.push({
          description: this.getDescription(item.description),
          type: type.name
        });
      }
    });

    if (res.length) {
      return res;
    }
  }

  static getItem (item) {
    const name = item.name.replace(/^[a-z0-9]+#/i, '');

    let doc = item;
    if (item.constructorComment) {
      debugger
      doc = item.constructorComment;
    }

    return {
      name: name,
      description: this.getDescription(doc.description),
      params: this.getParams(doc.params),
      returns: this.getReturns(doc.returns)
    };
  }

  static createTOCItems (type, data) {
    let html = '';
    html += '<ul>\n';
    data.forEach(item => {
      html += '<li><a href="#' + type + '-' + item.name + '">' + item.name + '</a></li>\n';
    });
    html += '</ul>\n\n';
    return html;
  }

  static createContentItems (type, data) {
    let html = '';
    data.forEach(item => {
      html += '<article>\n';
      html += '<a name="' + type + '-' + item.name + '"></a>\n<h3>' + item.name + '</h3>\n\n';
      html += '<p>' + item.description + '</p>\n\n';

      if (item.params) {
        html += '<em>Parameters</em>\n';
        html += this.createParamItems(item.params);
      }

      if (item.returns) {
        html += '<em>Returns</em>\n';
        html += this.createReturnItems(item.returns);
      }

      html += '<div class="top"><a href="#top">Top</a></div>\n';
      html += '</article>\n\n';
    });

    return html;
  }

  static createParamItems (params) {
    let html = '';
    html += '<table style="width:100%">\n';

    html += '<colgroup>\n';
    html += '<col width="120"/>\n';
    html += '<col width="80"/>\n';
    html += '<col width="100"/>\n';
    html += '<col width="50"/>\n';
    html += '<col/>\n';
    html += '</colgroup>\n\n';

    html += '<thead>\n';
    html += '<tr><th>Name</th><th>Type</th><th>Default</th><th>Optional</th><th>Description</th></tr>\n';
    html += '</thead>\n\n';

    html += '<tbody>\n';

    params.forEach(item => {
      html += '<tr>\n';
      html += '<td>' + item.name + '</td>\n';
      html += '<td>' + item.type + '</td>\n';
      html += '<td>' + (item.default ? item.default : '') + '</td>\n';
      html += '<td>' + (item.optional ? 'optional' : '') + '</td>\n';
      html += '<td>' + item.description + '</td>\n';
      html += '</tr>\n\n';
    });

    html += '</tbody>\n';
    html += '</table>\n\n';
    return html;
  }

  static createReturnItems (returns) {
    let html = '';
    html += '<table>\n';
    html += '<thead>\n';
    html += '<tr><th class="returns-type">Type</th><th class="returns-description">Description</th></tr>\n';
    html += '</thead>\n\n';

    html += '<tbody>\n';

    returns.forEach(item => {
      html += '<tr>\n';
      html += '<td class="returns-type">' + item.type + '</td>\n';
      html += '<td class="returns-description">' + item.description + '</td>\n';
      html += '</tr>\n\n';
    });

    html += '</tbody>\n';
    html += '</table>\n\n';
    return html;
  }
};
