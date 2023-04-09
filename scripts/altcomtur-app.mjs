import { AltComTurCombat } from './altcomtur-combat.mjs';
import { ConfigHelper } from './helpers.mjs';

Hooks.on('init', () => {
  CONFIG.Combat.documentClass = AltComTurCombat;

  // icons and names
  ConfigHelper.registerConfig('image-ally', {
    default: 'icons/svg/mystery-man.svg',
  });
  ConfigHelper.registerConfig('image-enemy', {
    default: 'icons/svg/mystery-man-black.svg',
  });
  ConfigHelper.registerConfig('name-ally', {
    default: 'Ally',
  });
  ConfigHelper.registerConfig('name-enemy', {
    default: 'Enemy',
  });

  // handling neutral tokens
  ConfigHelper.registerConfig('handle-neutrals', {
    choices: {
      0: game.i18n.localize('ALTCOMTUR.config.handle-neutrals.choice.enemy'),
      1: game.i18n.localize('ALTCOMTUR.config.handle-neutrals.choice.ally'),
      2: game.i18n.localize('ALTCOMTUR.config.handle-neutrals.choice.ignore'),
    },
    default: 0,
  });

  // handling who goes first
  ConfigHelper.registerConfig('leader', {
    choices: {
      0: game.i18n.localize('ALTCOMTUR.config.leader.choice.enemy'),
      1: game.i18n.localize('ALTCOMTUR.config.leader.choice.ally'),
      2: game.i18n.localize('ALTCOMTUR.config.leader.choice.ask'),
    },
    default: 2,
  });
});


// register hook to handle removal, because the combat class has no function to override
Hooks.on('deleteCombatant', async (combatant) => {
  let combat = combatant.combat;
  if (combat instanceof AltComTurCombat && combat.started)
    combat.updateEmbeddedDocuments(
      'Combatant',
      await combat.generateAlternatingInitiative(combat.flags.pcs_lead)
    );
});


