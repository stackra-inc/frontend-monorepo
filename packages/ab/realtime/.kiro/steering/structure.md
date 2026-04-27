# Project Structure

## Source Organization

```
src/
├── index.ts                — Main entry point
├── realtime.module.ts      — DI module with forRoot()
├── config/                 — Default configuration values
├── constants/              — DI tokens
├── enums/                  — Enumerations (ConnectionStatus)
├── facades/                — Facades (RealtimeFacade)
├── hooks/                  — React hooks (useChannel, usePresence, useRealtime)
├── interfaces/             — TypeScript interfaces (RealtimeConfig)
└── services/               — Injectable services (RealtimeManager, ChannelWrapper, PresenceChannelWrapper)
```

## Conventions

- Each folder has an `index.ts` barrel export
- Tests in `__tests__/`
- Examples in `.examples/`
- React hooks in `src/hooks/use-*.hook.ts`
- Services in `src/services/*.service.ts`
- Enums in `src/enums/*.enum.ts`
