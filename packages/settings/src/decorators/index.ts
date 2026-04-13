/**
 * Decorators barrel export.
 * @module decorators
 */

// Class decorator
export {
  Setting,
  getSettingMeta,
  SETTING_META_KEY,
  FIELD_META_KEY,
  GROUP_META_KEY,
  SECTION_META_KEY,
} from './setting.decorator';
export type { SettingOptions } from './setting.decorator';

// Property decorators
export { Field, getFieldDescriptors } from './field.decorator';
export type { FieldOptions, FieldDescriptor, FieldOption } from './field.decorator';

export { Group, getGroupDescriptors } from './group.decorator';
export type { GroupOptions, GroupDescriptor } from './group.decorator';

export { Section, getSectionForField } from './section.decorator';
export type { SectionOptions } from './section.decorator';
