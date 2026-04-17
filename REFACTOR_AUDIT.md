# Frontend Monorepo — Single Export Per File Audit

## Convention

Every `export interface`, `export type`, and `export enum` must:

1. Live in its own dedicated file (`interfaces/`, `types/`, `enums/` folder)
2. Follow the naming pattern: `kebab-case-name.interface.ts`,
   `kebab-case-name.type.ts`, `kebab-case-name.enum.ts`
3. NOT be mixed with implementation code (hooks, functions, classes)
4. Have exactly ONE export per file (barrel `index.ts` re-exports are OK)

---

## Violations Found: 11 Files

### Category 1: Interfaces Mixed with Implementation Code (4 files)

These hook files export interfaces alongside function implementations. Extract
the interface into `interfaces/`.

| File                                                                     | Interface to Extract     | Target File                                                           |
| ------------------------------------------------------------------------ | ------------------------ | --------------------------------------------------------------------- |
| `packages/theming/src/hooks/use-theme.ts`                                | `UseThemeReturn`         | `packages/theming/src/interfaces/use-theme-return.interface.ts`       |
| `packages/refine/src/hooks/use-can/use-can.hook.ts`                      | `UseCanProps`            | `packages/refine/src/interfaces/use-can-props.interface.ts`           |
| `packages/refine/src/hooks/use-subscription/use-subscription.hook.ts`    | `UseSubscriptionProps`   | `packages/refine/src/interfaces/use-subscription-props.interface.ts`  |
| `packages/pwa/src/hooks/use-pull-to-refresh/use-pull-to-refresh.hook.ts` | `UsePullToRefreshReturn` | `packages/pwa/src/interfaces/use-pull-to-refresh-return.interface.ts` |

### Category 2: Multiple Interfaces in Single File (6 files)

These files contain multiple `export interface` declarations. Split each into
its own file.

#### `packages/refine/src/interfaces/auth.interface.ts` → 4 files

| Interface            | Target File                                    |
| -------------------- | ---------------------------------------------- |
| `AuthActionResponse` | `interfaces/auth-action-response.interface.ts` |
| `CheckResponse`      | `interfaces/check-response.interface.ts`       |
| `OnErrorResponse`    | `interfaces/on-error-response.interface.ts`    |
| `IAuthService`       | `interfaces/i-auth-service.interface.ts`       |

#### `packages/refine/src/interfaces/realtime.interface.ts` → 4 files

| Interface          | Target File                                  |
| ------------------ | -------------------------------------------- |
| `SubscribeParams`  | `interfaces/subscribe-params.interface.ts`   |
| `PublishParams`    | `interfaces/publish-params.interface.ts`     |
| `LiveEvent`        | `interfaces/live-event.interface.ts`         |
| `IRealtimeService` | `interfaces/i-realtime-service.interface.ts` |

#### `packages/refine/src/interfaces/sdui.interface.ts` → 7 files

| Interface            | Target File                                   |
| -------------------- | --------------------------------------------- |
| `PageDefinition`     | `interfaces/page-definition.interface.ts`     |
| `ResourceConfig`     | `interfaces/resource-config.interface.ts`     |
| `FieldDefinition`    | `interfaces/field-definition.interface.ts`    |
| `SchemaComponent`    | `interfaces/schema-component.interface.ts`    |
| `RelationDefinition` | `interfaces/relation-definition.interface.ts` |
| `FilterConfig`       | `interfaces/filter-config.interface.ts`       |
| `ColumnDefinition`   | `interfaces/column-definition.interface.ts`   |

#### `packages/refine/src/interfaces/hook-props.interface.ts` → 26 files

| Export                        | Kind      | Target File                                              |
| ----------------------------- | --------- | -------------------------------------------------------- |
| `UseOneProps`                 | interface | `interfaces/use-one-props.interface.ts`                  |
| `UseOneReturnType`            | type      | `types/use-one-return-type.type.ts`                      |
| `UseListProps`                | interface | `interfaces/use-list-props.interface.ts`                 |
| `UseListReturnType`           | type      | `types/use-list-return-type.type.ts`                     |
| `UseManyProps`                | interface | `interfaces/use-many-props.interface.ts`                 |
| `UseManyReturnType`           | type      | `types/use-many-return-type.type.ts`                     |
| `UseShowProps`                | interface | `interfaces/use-show-props.interface.ts`                 |
| `UseShowReturnType`           | type      | `types/use-show-return-type.type.ts`                     |
| `UseInfiniteListProps`        | interface | `interfaces/use-infinite-list-props.interface.ts`        |
| `UseInfiniteListReturnType`   | type      | `types/use-infinite-list-return-type.type.ts`            |
| `UseCustomProps`              | interface | `interfaces/use-custom-props.interface.ts`               |
| `UseCustomReturnType`         | type      | `types/use-custom-return-type.type.ts`                   |
| `UseCreateProps`              | interface | `interfaces/use-create-props.interface.ts`               |
| `CreateMutationVariables`     | interface | `interfaces/create-mutation-variables.interface.ts`      |
| `UseCreateReturnType`         | type      | `types/use-create-return-type.type.ts`                   |
| `UseUpdateProps`              | interface | `interfaces/use-update-props.interface.ts`               |
| `UpdateMutationVariables`     | interface | `interfaces/update-mutation-variables.interface.ts`      |
| `UseUpdateReturnType`         | type      | `types/use-update-return-type.type.ts`                   |
| `UseDeleteProps`              | interface | `interfaces/use-delete-props.interface.ts`               |
| `DeleteMutationVariables`     | interface | `interfaces/delete-mutation-variables.interface.ts`      |
| `UseDeleteReturnType`         | type      | `types/use-delete-return-type.type.ts`                   |
| `UseCreateManyProps`          | interface | `interfaces/use-create-many-props.interface.ts`          |
| `CreateManyMutationVariables` | interface | `interfaces/create-many-mutation-variables.interface.ts` |
| `UseCreateManyReturnType`     | type      | `types/use-create-many-return-type.type.ts`              |
| `UseUpdateManyProps`          | interface | `interfaces/use-update-many-props.interface.ts`          |
| `UpdateManyMutationVariables` | interface | `interfaces/update-many-mutation-variables.interface.ts` |
| `UseUpdateManyReturnType`     | type      | `types/use-update-many-return-type.type.ts`              |
| `UseDeleteManyProps`          | interface | `interfaces/use-delete-many-props.interface.ts`          |
| `DeleteManyMutationVariables` | interface | `interfaces/delete-many-mutation-variables.interface.ts` |
| `UseDeleteManyReturnType`     | type      | `types/use-delete-many-return-type.type.ts`              |
| `UseCustomMutationProps`      | interface | `interfaces/use-custom-mutation-props.interface.ts`      |
| `UseCustomMutationReturnType` | type      | `types/use-custom-mutation-return-type.type.ts`          |

#### `packages/refine/src/interfaces/hook-results.interface.ts` → 4 files

| Interface               | Target File                                        |
| ----------------------- | -------------------------------------------------- |
| `UseQueryHookResult`    | `interfaces/use-query-hook-result.interface.ts`    |
| `UseListResult`         | `interfaces/use-list-result.interface.ts`          |
| `UseMutationHookResult` | `interfaces/use-mutation-hook-result.interface.ts` |
| `UseInfiniteListResult` | `interfaces/use-infinite-list-result.interface.ts` |

#### `packages/pwa/src/interfaces/vite-pwa-plugin-options.interface.ts` → 4 files

| Interface              | Target File                                       |
| ---------------------- | ------------------------------------------------- |
| `ManifestIcon`         | `interfaces/manifest-icon.interface.ts`           |
| `ManifestOptions`      | `interfaces/manifest-options.interface.ts`        |
| `RuntimeCachingEntry`  | `interfaces/runtime-caching-entry.interface.ts`   |
| `VitePwaPluginOptions` | `interfaces/vite-pwa-plugin-options.interface.ts` |

### Category 3: Multiple Types in Single File (1 file)

| File                                 | Types to Split                 | Target Files                                                 |
| ------------------------------------ | ------------------------------ | ------------------------------------------------------------ |
| `packages/refine/src/types/index.ts` | `Type`, `HttpRepositoryConfig` | `types/type.type.ts`, `types/http-repository-config.type.ts` |

---

## Summary

| Category                             | Files  | New Files to Create |
| ------------------------------------ | ------ | ------------------- |
| Interfaces mixed with implementation | 4      | 4                   |
| Multiple interfaces in single file   | 6      | ~49                 |
| Multiple types in single file        | 1      | 2                   |
| **Total**                            | **11** | **~55**             |

## Packages Affected

| Package              | Violations                                                                    |
| -------------------- | ----------------------------------------------------------------------------- |
| `packages/refine`    | 7 (auth, realtime, sdui, hook-props, hook-results, use-can, use-subscription) |
| `packages/pwa`       | 2 (vite-pwa-plugin-options, use-pull-to-refresh)                              |
| `packages/theming`   | 1 (use-theme)                                                                 |
| `packages/events`    | 0 (clean)                                                                     |
| `packages/router`    | 0 (clean)                                                                     |
| `packages/container` | 0 (clean)                                                                     |
| `packages/http`      | 0 (clean)                                                                     |
| `packages/logger`    | 0 (clean)                                                                     |
| `packages/support`   | 0 (clean)                                                                     |

## Refactoring Steps

1. For each violation, create the new target file with the single export
2. Add proper file-level JSDoc with `@fileoverview`, `@module`, `@category`
3. Update the barrel `index.ts` to re-export from the new file
4. Update all import statements across the codebase
5. Delete the original multi-export file (after all imports are updated)
6. Run `pnpm build` to verify no broken imports
