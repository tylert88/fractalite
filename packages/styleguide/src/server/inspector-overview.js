const { map } = require('asyncro');
const { defaultsDeep } = require('@fractalite/support/utils');
const { html, stripIndent } = require('common-tags');

module.exports = function(opts = {}) {
  return function inspectorInfoPlugin(app) {
    if (opts === false) return;

    const { styleguide } = app;
    const className = 'inspector-panel-info';

    // TODO: allow user-customisation of prop tables

    styleguide.addInspectorPanel({
      name: 'overview',

      label: opts.label || 'Overview',

      async template(ctx) {
        const { component, variant } = ctx;

        const tpl = html`
          <div class="{{ className }}">
            <div class="{{ className }}__header">
              <h2 class="{{ className }}__title">{{ component.label }}</h2>
            </div>
            <div class="{{ className }}__content fr-prose">
              <h4>Variants:</h4>
              <div class="fr-proptable {{ className }}__proptable">
                {% for var in component.variants %}
                <div class="fr-proptable__row">
                  <td class="fr-proptable__cell">
                    <a href="{{ var.url }}">
                      {% if variant.name == var.name %}<strong>{{ var.label }}</strong>{% else %}{{ var.label }}{% endif %}
                    </a>
                  </td>
                  <td class="fr-proptable__cell fr-proptable__cell--fit">
                    <app-link to="{{ var.previewUrl }}" target="_blank">Preview</app-link>
                  </td>
                </div>
                {% endfor %}
              </div>
              <h4>Files:</h4>
              <div class="fr-proptable {{ className }}__proptable">
                {% for file in component.files %}
                <div class="fr-proptable__row">
                  <td class="fr-proptable__cell">
                    {{ file.relative }}
                  </td>
                  <td class="fr-proptable__cell fr-proptable__cell--fit" style="opacity: 0.8; font-family: monospace;">
                    @{{ file.handle }}
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
        `;

        return styleguide.renderPage(tpl, {
          template: true,
          ctx: { ...ctx, className }
        });
      }
    });

    styleguide.addCSS(stripIndent`
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

    app.compiler.use(async ({ components }) => {
      await map(components, async component => {
        component.notes = component.notes || component.config.notes;
      });
    });
  };
};