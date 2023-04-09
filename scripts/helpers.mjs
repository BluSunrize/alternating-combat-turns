export class ConfigHelper {
  static module_id = 'alternating-combat-turns';

  static registerConfig(name, configuration) {
    game.settings.register(ConfigHelper.module_id, name, {
      name: game.i18n.localize(`ALTCOMTUR.config.${name}.name`),
      hint: game.i18n.localize(`ALTCOMTUR.config.${name}.hint`),
      scope: 'world',
      config: true,
      type: String,
      ...configuration,
    });
  }

  static getConfig(name) {
    return game.settings.get(ConfigHelper.module_id, name);
  }

}