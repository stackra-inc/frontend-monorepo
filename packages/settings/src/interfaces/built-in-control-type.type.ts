/**
 * @fileoverview Built-in control type definitions for setting fields.
 *
 * Defines the set of built-in UI control types and the extensible
 * SettingControlType union that also accepts custom strings.
 *
 * @module interfaces/built-in-control-type
 */

/**
 * Built-in control types with default renderers.
 *
 * | Type         | Value type              | Renders as                    |
 * |--------------|-------------------------|-------------------------------|
 * | `toggle`     | `boolean`               | On/off switch                 |
 * | `select`     | `string \| number`      | Dropdown                      |
 * | `slider`     | `number`                | Range slider                  |
 * | `text`       | `string`                | Single-line input             |
 * | `textarea`   | `string`                | Multi-line input              |
 * | `number`     | `number`                | Numeric input                 |
 * | `color`      | `string`                | Color picker                  |
 * | `radio`      | `string \| number`      | Radio group                   |
 * | `password`   | `string`                | Masked input                  |
 * | `date`       | `string` (ISO)          | Date picker                   |
 * | `time`       | `string` (HH:mm)        | Time picker                   |
 * | `datetime`   | `string` (ISO)          | Date+time picker              |
 * | `attachment` | `string` (URL)          | File upload                   |
 * | `map`        | `{ lat, lng }`          | Location picker               |
 * | `json`       | `object`                | JSON editor                   |
 * | `keyValue`   | `Record<string,string>` | Key-value list                |
 * | `list`       | `string[]`              | Ordered list                  |
 * | `tags`       | `string[]`              | Tag input                     |
 * | `cron`       | `string`                | Cron builder                  |
 * | `locale`     | `string` (BCP 47)       | Language picker                |
 * | `timezone`   | `string` (IANA)         | Timezone picker               |
 * | `currency`   | `string` (ISO 4217)     | Currency picker               |
 * | `icon`       | `string`                | Icon picker                   |
 * | `segment`    | `string \| number`      | Segmented buttons             |
 */
export type BuiltInControlType =
  | 'toggle'
  | 'select'
  | 'slider'
  | 'text'
  | 'textarea'
  | 'number'
  | 'color'
  | 'radio'
  | 'password'
  | 'date'
  | 'time'
  | 'datetime'
  | 'attachment'
  | 'map'
  | 'json'
  | 'keyValue'
  | 'list'
  | 'tags'
  | 'cron'
  | 'locale'
  | 'timezone'
  | 'currency'
  | 'icon'
  | 'segment';

/**
 * Control type — built-in or custom string.
 * Custom types need a registered renderer in the settings UI.
 */
export type SettingControlType = BuiltInControlType | (string & {});
