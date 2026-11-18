# v0.9.1 Safari resilience review — 2026-11-18

## Changes

- Playback invokes play inside the tap gesture, waits for metadata before seeking, catches seek/play failures, cancels stale pending seeks, and pauses on page hiding. A short playback timer supplements timeupdate at segment boundaries.
- Recording responds to microphone mute/ended, unexpected recorder stop, and AudioContext interruption. Stop releases the microphone immediately and waits at most 2.5 seconds of active page execution for final recorder events; a missing event yields an explicitly incomplete take, never a completed session.
- Cancelling a pending permission request releases any stream arriving later. Starting a recorder has a bounded wait. No microphone monitoring is sent to the speaker.
- Immediate retry buttons now unlock after saving. Audio initialization errors no longer display as a user cancellation.
- PWA cache version updated to v0.9.1 and includes playback.js. Existing user storage is unchanged.

## Automated evidence and limits

Executed results: `npm test` — 14 passed; `npx playwright test` — 9 passed (8 Chromium, 1 WebKit DOM/controller), 2 native WebKit tests skipped for unavailable media capabilities. No physical iPhone tests were run.

Node regression suite covers timelines plus missing recorder stop events and metadata-dependent seeking. Chromium uses a synthetic microphone and native MediaRecorder, decode and playback. Browser tests cover permission denial/cancellation, storage failure, reload, offline, page visibility, microphone mute/ended and repeat controls.

Playwright WebKit 27.2 on this Windows host exposes neither AudioContext nor MediaRecorder and cannot run native recording/playback validation. Two native WebKit tests are explicitly skipped based on missing capability; WebKit DOM/layout and mocked playback-controller tests are separate evidence. This is not physical iPhone Safari or standalone PWA testing.

The OS may freeze timers or kill a page before final recording data and IndexedDB writes arrive. The app cannot guarantee preservation of the last audio fragment after forced termination. A timeout-recovered blob may be truncated; it is retained for recovery, not claimed to be a complete playable recording. No millisecond timing or codec accuracy claims are made.

## Physical iPhone acceptance — pending

Test both Safari and Add to Home Screen on the target iOS version, recording iPhone model, iOS version and output device:

1. At 80 BPM, allow microphone, speak during a full take, confirm audible voice and reference beat. Replay all and each four-bar segment, then close/reopen and replay again.
2. Start another take and lock the screen for 10 seconds midway. Unlock: the take must be marked interrupted, controls must work, and any saved fragment should be auditioned. Repeat with app switching and an incoming call.
3. Deny microphone, then retry after allowing it; cancel while the permission dialog is pending. Confirm the microphone indicator stops after cancellation or completion.
4. Export audio to Files, play it outside Safari, then test offline after one successful online load. Repeat with the actual headset; Bluetooth latency is not measured by this app.

Reference: https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder/dataavailable_event (delivery timing is not exact), https://developer.mozilla.org/en-US/docs/Web/API/BaseAudioContext/state (interrupted state), https://playwright.dev/docs/browsers#webkit (WebKit build/platform limits).
