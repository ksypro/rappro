# Verification — 2026-11-17

- `npm test`: 12 passed. Three courses at 40 / 80 / 240 BPM; 16-bar boundaries, segment timing, subdivision changes, ghost bars, tempo limits.
- `npx playwright test`: 5 passed (36.7 seconds), Chrome with 390 × 844 mobile viewport, synthetic microphone input.
- Full 240 BPM take completed; recorded blob decoded to non-silent audio; segment playback stopped at its boundary; audio export triggered a download.
- Self-rating survived reload. Cached app and recorded session were available offline. Existing metronome loaded saved BPM and retained the legacy calendar key.
- Denied microphone allowed unrecorded practice. Simulated quota failure retained an exportable recording and a retry saved it. Visibility interruption saved a partial take without marking completion; deletion worked.
- Mobile screenshot visually reviewed: `artifacts/mobile-gym.png` (generated locally, not tracked).
- `git diff --check`: passed.

Not verified: physical iPhone Safari / standalone PWA, actual microphone quality, Bluetooth or wired headphone latency, real incoming calls / OS termination, hardware playback-to-screen alignment, GitHub Pages deployment. This checkout has not been pushed or published. No automatic performance scoring is implemented.
