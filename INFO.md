# Recent Codex Changes (Detailed)

This document summarizes the recent modifications made in this repository by Codex during the latest implementation cycle.

## 1) Codex Plan Mode Support

### Backend command support

File: `server/routes/commands.js`

- Added `/plan` to the built-in command list.
- Added `/plan` built-in handler returning:
- `type: "builtin"`
- `action: "plan"`
- `data` payload with provider context and `"Plan mode enabled"` message.
- Outcome: `/plan` now appears in slash-command UI results and can be executed through `/api/commands/execute`.

### Backend Codex runtime mapping

File: `server/openai-codex.js`

- Added support for permission mode `"plan"` in `mapPermissionModeToCodexOptions()`.
- `"plan"` maps to the same runtime policy as default:
- `sandboxMode: "workspace-write"`
- `approvalPolicy: "untrusted"`
- Updated function docs/comments to include plan mode in accepted options.
- Outcome: Codex backend correctly accepts and executes with plan-mode permission semantics.

### Frontend command execution behavior

File: `src/components/chat/hooks/useChatComposerState.ts`

- Added handling for built-in command action `"plan"`:
- Sets UI permission mode to `"plan"`.
- Persists plan mode per session in `localStorage` (`permissionMode-<sessionId>`).
- Pushes confirmation assistant message in chat.
- Updated hook dependencies accordingly.
- Outcome: Running `/plan` in chat now actively switches the session UI mode to Plan.

### Permission mode cycling

File: `src/components/chat/hooks/useChatProviderState.ts`

- Updated `cyclePermissionMode()` to include `"plan"` in the rotation for mode switching.
- Removed provider-specific branch so the mode cycle is unified:
- `default -> acceptEdits -> bypassPermissions -> plan`.
- Outcome: keyboard/tab mode cycling includes plan mode for Codex too.

### Shared typing updates

File: `src/components/chat/types/types.ts`

- `PermissionMode` already included `plan`.
- Added `CodexThinkingEffort` type:
- `'low' | 'medium' | 'high' | 'xhigh'`.

File: `src/components/settings/types/types.ts`

- Extended `CodexPermissionMode` to include `'plan'`.

File: `src/components/settings/hooks/useSettingsController.ts`

- Updated `toCodexPermissionMode()` parser to accept `'plan'`.

### Settings UI updates

File: `src/components/settings/view/tabs/agents-settings/sections/content/PermissionsContent.tsx`

- Added a new selectable radio card for Codex `"plan"` mode in permissions settings.
- Added corresponding technical detail line for plan mode in the expandable details area.
- Outcome: Plan mode is now configurable from settings UI.

## 2) Codex Thinking Effort Selector (low/medium/high/xhigh)

### New selector component

File: `src/components/chat/view/subcomponents/CodexThinkingEffortSelector.tsx` (new)

- Added a Codex-only selector component with a `<select>` input and brain icon.
- Supported options:
- `low`
- `medium`
- `high`
- `xhigh`
- Wired to i18n labels (`chat.codexThinkingEffort.*`).
- Outcome: User can choose Codex reasoning effort directly in composer controls.

### Composer state and payload integration

File: `src/components/chat/hooks/useChatComposerState.ts`

- Added `codexThinkingEffort` local state with safe hydration from localStorage key `codex-thinking-effort`.
- Added validation/normalization helper with allowed values:
- `low`, `medium`, `high`, `xhigh`.
- Persisted selected effort back to localStorage via effect.
- Included `effort` in outgoing `codex-command` message options.
- Kept Codex `permissionMode` as selected mode (including plan).
- Outcome: selected effort is durable and is sent to backend when invoking Codex.

### Composer + control prop plumbing

File: `src/components/chat/view/ChatInterface.tsx`

- Passed `setPermissionMode` into `useChatComposerState` so built-in plan action can mutate mode.
- Added wiring for:
- `codexThinkingEffort`
- `setCodexThinkingEffort`
- Forwarded values to `ChatComposer`.

File: `src/components/chat/view/subcomponents/ChatComposer.tsx`

- Added props:
- `codexThinkingEffort`
- `setCodexThinkingEffort`
- Passed these through to `ChatInputControls`.

File: `src/components/chat/view/subcomponents/ChatInputControls.tsx`

- Added Codex-only rendering of `CodexThinkingEffortSelector`.
- Added props and type imports for effort state.
- Kept existing token usage pie and other controls intact.

## 3) Codex Backend Effort Handling

File: `server/openai-codex.js`

- Added `VALID_REASONING_EFFORTS` set:
- `low`, `medium`, `high`, `xhigh`.
- Accepts `effort` from command options and normalizes it.
- Passes normalized `effort` to `thread.runStreamed()` options when valid.
- Outcome: frontend-selected effort is now used by Codex SDK execution.

## 4) Localization Updates

### Chat locale updates

Files:

- `src/i18n/locales/en/chat.json`
- `src/i18n/locales/ja/chat.json`
- `src/i18n/locales/ko/chat.json`
- `src/i18n/locales/zh-CN/chat.json`

Changes:

- Updated Codex plan-mode description text to clarify behavior:
- planning-focused mode using default execution policy.
- Added `codexThinkingEffort` translation block with labels/options:
- `title`
- `label`
- option labels for `low`, `medium`, `high`, `xhigh`.

### Settings locale updates

Files:

- `src/i18n/locales/en/settings.json`
- `src/i18n/locales/ja/settings.json`
- `src/i18n/locales/ko/settings.json`
- `src/i18n/locales/zh-CN/settings.json`

Changes:

- Added Codex plan mode title/description in permission mode list.
- Added technical info line describing plan runtime settings.
- Outcome: plan mode is fully localized in both chat and settings UIs.

## 5) Lockfile Changes

File: `package-lock.json`

- Lockfile metadata updated, primarily removing many `peer: true` flags and minor metadata reshaping.
- No functional application code logic changed in this file.
- Outcome: dependency lockfile reflects updated npm resolution metadata.

## 6) Functional End State

- `/plan` is available and executable as a built-in slash command.
- Executing `/plan` switches current chat session mode to `plan`.
- Plan mode is configurable in settings and included in mode cycling.
- Codex thinking effort selector is available in chat controls.
- Selected effort is persisted and sent to backend.
- Backend accepts and applies both `plan` mode and effort values.
- i18n strings are updated for EN/JA/KO/ZH-CN for the new behavior.

## 7) Plan Mode Workflow Upgrade (Codex CLI-like)

File: `src/components/chat/hooks/useChatComposerState.ts`

- Added a two-phase plan workflow when provider is Codex and mode is `plan`.
- Phase 1 (planning):
- User request is wrapped with a planning instruction prompt requiring:
- objective/constraints
- current-state findings
- step-by-step implementation plan
- risks and edge cases
- validation strategy
- rollback strategy
- model must end by asking: `Do you want me to implement this plan now?`
- Phase 2 (implementation approval):
- If next user message is an approval (`yes`, `go ahead`, `implement`, etc.), UI sends an implementation prompt based on the stored original request.
- On approval, mode auto-switches from `plan` to `default` for execution and persists that mode for the selected session.
- Added stale approval state handling with TTL (30 minutes) and cleanup when leaving Codex plan mode.

Outcome:

- Plan mode now behaves like Codex CLI’s planning flow: detailed plan first, explicit implementation confirmation second.

## 8) Latest Delta Notes (Most Recent Patch)

File: `src/components/chat/hooks/useChatComposerState.ts`

- Added explicit approval-intent parsing for plan confirmation replies.
- Supported confirmation examples include: `yes`, `y`, `go ahead`, `proceed`, `implement`, `implement it`, `please implement`, `do it`, `ship it`, `start implementation`.
- Added a pending plan request cache (`originalRequest` + `createdAt`) to link approval messages to the correct prior plan request.
- Added a 30-minute TTL (`CODEX_PLAN_APPROVAL_TTL_MS`) for pending plan approvals.
- Added fallback behavior in plan mode:
- if message is not an approval (or approval is stale), treat it as a new planning request and regenerate a detailed plan prompt.
- Added mode handoff behavior for approval path:
- implementation request is sent with `permissionMode: default` (via `effectivePermissionMode`),
- UI mode is switched to `default`,
- session-local permission mode is persisted as `default`.
- Added cleanup effect:
- pending plan approval state is cleared when provider is not Codex or mode is no longer `plan`.

Outcome:

- The plan workflow is now stateful and resilient: plan generation and implementation are explicitly separated, approval intent is recognized reliably, stale approvals are prevented, and execution mode transition is deterministic.
