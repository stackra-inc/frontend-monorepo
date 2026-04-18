/**
 * Services Barrel Export
 *
 * - {@link I18nextService} — Low-level i18next wrapper (owns singleton lifecycle)
 * - {@link I18nService} — High-level `@Injectable()` service (translation + resolvers + RTL)
 *
 * @module services
 */

export { I18nextService } from './i18next.service';
export { I18nService } from './i18n.service';
