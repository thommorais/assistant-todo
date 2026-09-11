import "intlayer";
import _1e4kh4hnn02 from './common.ts';
import _1afml1sbmhf from './exams.ts';
import _3i2ocd13i0 from './finance.ts';
import _1ybb6sa33jr from './flags.ts';
import _2516hcagfll from './metrics.ts';
import _202781rn2wb from './notifications.ts';
import _2bzegolgtz9 from './pets.ts';
import _2rjeaqny3d from './pomodoro.ts';
import _21ry4558n6l from './shopping.ts';
import _eyvc92354d from './stacks.ts';

declare module 'intlayer' {
  interface __DictionaryRegistry {
    "common": typeof _1e4kh4hnn02;
    "exams": typeof _1afml1sbmhf;
    "finance": typeof _3i2ocd13i0;
    "flags": typeof _1ybb6sa33jr;
    "metrics": typeof _2516hcagfll;
    "notifications": typeof _202781rn2wb;
    "pets": typeof _2bzegolgtz9;
    "pomodoro": typeof _2rjeaqny3d;
    "shopping": typeof _21ry4558n6l;
    "stacks": typeof _eyvc92354d;
  }

  interface __DeclaredLocalesRegistry {
    "en": 1;
    "pt": 1;
  }

  interface __RequiredLocalesRegistry {
    "en": 1;
    "pt": 1;
  }

  interface __SchemaRegistry {

  }

  interface __StrictModeRegistry { mode: 'inclusive' }

  interface __EditorRegistry { enabled : false }

  interface __RoutingRegistry { mode: 'prefix-no-default'; defaultLocale: 'pt' }
}
