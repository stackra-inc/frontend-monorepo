/**
 * @fileoverview Configuration interface for the map control type.
 *
 * Defines default center, zoom level, and search capability
 * for location-picker setting fields.
 *
 * @module interfaces/map-config
 */

/**
 * Config for 'map' control
 */
export interface MapConfig {
  defaultCenter?: { lat: number; lng: number };
  defaultZoom?: number;
  searchable?: boolean;
}
