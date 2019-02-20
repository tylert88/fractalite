const { html, stripIndent } = require('common-tags');

module.exports = function(opts = {}) {
  return function inspectorInfoPlugin(app) {
    if (opts === false) return;

    const className = 'inspector-panel-info';

    // TODO: allow user-customisation of prop tables

    app.addInspectorPanel({
      name: 'info',

      label: opts.label || 'Info',

      template: html`
        <div class="${className}">
          <div class="${className}__header">
            <h2 class="${className}__title">{{ component.label }}</h2>
          </div>
          <div class="${className}__content fr-prose">
            <div class="fr-proptable ${className}__proptable">
              {% for ctx in component.scenarios %}
              <div class="fr-proptable__row">
                <td class="fr-proptable__cell">
                  <a href="{{ ctx.url }}">
                    {% if scenario.name == ctx.name %}<strong>{{ ctx.label }}</strong>{% else %}{{ ctx.label }}{% endif %}
                  </a>
                </td>
                <td class="fr-proptable__cell fr-proptable__cell--fit">
                  <app-link to="{{ ctx.previewUrl }}" target="_blank">Preview</app-link>
                </td>
              </div>
              {% endfor %}
            </div>
            <h4>Files:</h4>
            <div class="fr-proptable ${className}__proptable">
              {% for file in component.files %}
              <div class="fr-proptable__row">
                <td class="fr-proptable__cell">
                  {{ file.relative }}
                </td>
                <td class="fr-proptable__cell fr-proptable__cell--fit">
                  {{ file.size }}
                </td>
                <td class="fr-proptable__cell fr-proptable__cell--fit">
                  <app-link to="{{ file.url }}" target="_blank">View</app-link>
                </td>
              </div>
              {% endfor %}
            </div>
          </div>
        </div>
      `
    });

    app.addCSS(stripIndent`
      .${className} {
        padding: 12px;
      }
      .${className}__header {
        display: flex;
        border-bottom: 1px solid #ddd;
        padding-bottom: 12px;
        margin-bottom: 20px;
      }
      .${className}__title {
        font-size: 20px;
      }
      .${className}__proptable a {
        text-decoration: none;
      }
    `);
  };
};