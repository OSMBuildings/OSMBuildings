
module.exports = class DocToHTML {

  constructor (json) {
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
  }

  getTOC () {
    let html = '';

    html += '<h3><a href="#class-' + this.classes[0].name + '">' + this.classes[0].name + '</a></h3>';
    html += this.createTOCItems('method', this.methods);

    html += '<h3>Static</h3>';
    html += this.createTOCItems('static', this.statics);

    html += '<h3>Events</h3>';
    html += this.createTOCItems('event', this.events);

    html += '<h3>Global</h3>';
    html += this.createTOCItems('global', this.globals);

    return html;
  }

  getContent () {
    let html = '';

    html += '<h2>Class</h2>';
    html += this.createContentItems('class', this.classes);

    html += '<h2>Methods</h2>';
    html += this.createContentItems('method', this.methods);

    html += '<h2>Static</h2>';
    html += this.createContentItems('static', this.statics);

    html += '<h2>Events</h2>';
    html += this.createContentItems('event', this.events);

    html += '<h2>Global</h2>';
    html += this.createContentItems('global', this.globals);

    return html;
  }

  getDescription (description) {
    let html = '';
    if (description !== undefined && description.children) {
      description.children.forEach(item => {
        let openTag = '';
        let closeTag = '';

        switch (item.type) {
          case 'paragraph':
            openTag = '<p>';
            closeTag = '</p>';
            break;
          case 'list':
            openTag = '<ul>';
            closeTag = '</ul>';
            break;
          case 'listItem':
            openTag = '<li>';
            closeTag = '</li>';
            break;
        }

        if (item.value !== undefined) {
          html += openTag + item.value + closeTag;
        }

        if (item.children !== undefined) {
          html += openTag + this.getDescription(item) + closeTag;
        }
      });
    }

    return html;
  }

  getType (type) {
    if (type === undefined) {
      return null;
    }

    if (type.type === 'NameExpression') {
      return { name: type.name, optional: null };
    }

    if (type.type === 'OptionalType') {
      return { name: type.expression.name, optional: true };
    }

    return null;
  }

  getParams (params) {
    let res = [];

    params.forEach(item => {
      const type = this.getType(item.type !== undefined ? item.type : null);

      if (type !== null) {
        res.push({
          name: item.name,
          description: this.getDescription(item.description !== undefined ? item.description : null),
          default: item.default !== undefined ? item.default : null,
          type: type.name,
          optional: type.optional
        });
      }

      if (item.properties !== undefined) {
        res = res.concat(this.getParams(item.properties));
      }
    });

    if (res.length) {
      return res;
    }

    return null;
  }

  getReturns (returns) {
    const res = [];
    returns.forEach(item => {
      const type = this.getType(item.type);
      if (type !== null) {
        res.push({
          description: this.getDescription(item.description),
          type: type.name
        });
      }
    });

    if (res.length) {
      return res;
    }

    return null;
  }

  getItem (item) {
    return {
      name: item.name.replace(/^[a-z0-9]+#/i, ''),
      description: this.getDescription(item.description),
      params: this.getParams(item.params),
      returns: this.getReturns(item.returns)
    };
  }

  createTOCItems (type, data) {
    let html = '';
    html += '<ul>';
    data.forEach(item => {
      html += '<li><a href="#' + type + '-' + item.name + '">' + item.name + '</a></li>';
    });
    html += '</ul>';
    return html;
  }

  createContentItems (type, data) {
    let html = '';
    data.forEach(item => {
      html += '<article>';
      html += '<a name="' + type + '-' + item.name + '"></a><h3>' + item.name + '</h3>';
      html += '<p>' + item.description + '</p>';

      if (item.params !== undefined) {
        html += '<em>Parameters</em>';
        html += this.createParamItems(item.params);
      }

      if (item.returns !== undefined) {
        html += '<em>Returns</em>';
        html += this.createReturnItems(item.returns);
      }

      html += '<div class="top"><a href="#top">Top</a></div>';
      html += '</article>';
    });

    return html;
  }

  createParamItems (params) {
    let html = '';
    html += '<table style="width:100%">';

    html += '<colgroup>';
    html += '<col width="120">';
    html += '<col width="80">';
    html += '<col width="100">';
    html += '<col width="50">';
    html += '<col>';
    html += '</colgroup>';

    html += '<thead>';
    html += '<tr><th>Name</th><th>Type</th><th>Default</th><th>Optional</th><th>Description</th></tr>';
    html += '</thead>';

    html += '<tbody>';

    params.forEach(item => {
      html += '<tr>';
      html += '<td>' + item.name + '</td>';
      html += '<td>' + item.type + '</td>';
      html += '<td>' + (item.default ? item.default : '') + '</td>';
      html += '<td>' + (item.optional ? 'optional' : '') + '</td>';
      html += '<td>' + item.description + '</td>';
      html += '</tr>';
    });

    html += '</tbody>';
    html += '</table>';
    return html;
  }

  createReturnItems (returns) {
    let html = '';
    html += '<table>';
    html += '<thead>';
    html += '<tr><th class="returns-type">Type</th><th class="returns-description">Description</th></tr>';
    html += '</thead>';

    html += '<tbody>';

    returns.forEach(item => {
      html += '<tr>';
      html += '<td class="returns-type">' + item.type + '</td>';
      html += '<td class="returns-description">' + item.description + '</td>';
      html += '</tr>';
    });

    html += '</tbody>';
    html += '</table>';
    return html;
  }
}
