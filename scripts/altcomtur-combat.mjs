import { ConfigHelper } from './helpers.mjs';

export class AltComTurCombat extends Combat {

  constructor(data, context) {
    super(data, context);
    this.flags.pcs_lead = data.flags.pcs_lead;
  }

  // override default sort to be inverted
  _sortCombatants(a, b) {
    return -super._sortCombatants(a, b);
  }

  // override start of combat to handle slot transformation
  async startCombat() {
    this._playCombatSound('startEncounter');
    const pcs_lead = await this.determineLead();
    const updateData = {
      round: 1,
      turn: 0,
      flags: {
        pcs_lead: pcs_lead,
      },
      combatants: await this.generateAlternatingInitiative(pcs_lead),
    };
    Hooks.callAll('combatStart', this, updateData);
    return this.update(updateData);
  }

  // override rolling to instead assign initiatives
  async rollInitiative(ids, { formula = null, updateTurn = true, messageOptions = {} } = {}) {
    if (this.started) {
      await this.updateEmbeddedDocuments(
        'Combatant',
        await this.generateAlternatingInitiative(this.flags.pcs_lead)
      );
    } else {
      ui.notifications.info(game.i18n.localize('ALTCOMTUR.notification.no_roll_init'));
    }
  }

  async determineLead() {
    // if not yet defined, figure out who is leading
    switch (ConfigHelper.getConfig('leader')) {
      case 2:
        return false;
      case 1:
        return true;
      case 0:
      default:
        return await Dialog.confirm({
          title: game.i18n.localize('ALTCOMTUR.dialog.ask_leader.title'),
          content: game.i18n.localize('ALTCOMTUR.dialog.ask_leader.text'),
          yes: () => { },
          no: () => { },
          defaultYes: false
        }) == 'yes';
    }
  }


  async generateAlternatingInitiative(pcs_lead) {
    // fetch icons and names from settings
    const icons = {
      true: ConfigHelper.getConfig('image-ally'),
      false: ConfigHelper.getConfig('image-enemy'),
    };
    const slot_names = {
      true: ConfigHelper.getConfig('name-ally'),
      false: ConfigHelper.getConfig('name-enemy'),
    };

    // create lists by disposition
    let list_ally = this.combatants.filter(e => e.token?.disposition === 1);
    let list_enemy = this.combatants.filter(e => e.token?.disposition === -1);
    let list_neutral = this.combatants.filter(e => e.token?.disposition === 0);

    // handle neutrals
    switch (ConfigHelper.getConfig('handle-neutrals')) {
      case 0:
        list_enemy += list_neutral;
        break;
      case 1:
        list_ally += list_neutral;
        break;
      default:
        break;
    }

    // longer list determines amount of iterations
    const length = Math.max(list_enemy.length, list_ally.length) * 2;
    // populate update list
    let updates = [];
    for (let i = 0; i < length; i++) {
      // do allies take even or uneven slots?
      let is_ally = (i % 2 === 0) == pcs_lead;
      // fetch next from appropriate array
      let next = is_ally ? list_ally.pop() : list_enemy.pop();
      // next may be undefined if one list runs out
      if (next) {
        updates.push({
          _id: next.id,
          img: icons[is_ally],
          name: slot_names[is_ally],
          initiative: updates.length + 1, // index starts on 1
        });
      }
    }

    return updates;
  }
}
