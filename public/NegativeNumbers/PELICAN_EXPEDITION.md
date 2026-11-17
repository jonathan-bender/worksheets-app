# Pelican Math · Creature Expedition

Open `math_pelican_expedition.html` in any modern browser. It is a self-contained HTML/CSS/Canvas/JavaScript file, needs no build step, network connection, account, or CDN, and does not replace the original `math_pelican.html`.

## Tomorrow’s lesson (30-minute suggested plan)

- 3 minutes: demonstrate signed elevation, zero/sea level, and the target beacon. Ask students to predict the landing elevation before choosing a route.
- 6 minutes: level 1, signed integers. Green/terracotta boxes also display explicit signs.
- 6 minutes: level 2, parentheses without color and without double negatives. Includes `+(+n)`, `+(−n)`, `−(+n)`.
- 7 minutes: level 3, two connected boxes written as `(-3) + (+5)`. All terms are collected together.
- 6 minutes: level 4, three terms in expedition A and four in B. Encourage cancellation strategies.
- 2 minutes: compare strategies and discuss a rescue reflection prompt.

Levels 1–4 each contain expedition A and B with four rescues each: 32 rescues total. Classroom pace requires six bundle decisions per rescue (192 decisions), Quick tour three, and Deep practice nine. Duration varies with the class; the teacher can jump to any expedition, and students can return later. The timer counts active play, pauses in dialogs, and does not stop play at zero. It is a pacing aid, not a timed lock.

Levels 5–7 cover multiplication, order of operations, and three mystery equations, adapted from the original game’s later concepts and creatures. The mystery beacon stays hidden until the player solves the equation. There are 43 rescues across the complete game.

## Controls and mechanics

- Click/tap a route card, press 1/2/3, or click a floating bundle on the desktop scene. All connected terms are added once, as a single move.
- Read the feedback calculation to compare the starting and ending elevation.
- Hold Up/Down or the on-screen Fly/Dive controls for fine adjustments. These cost wing power when moving away from sea level; passive regeneration and math bundles restore it.
- The target card names the creature, its elevation, and the remaining distance. A golden ruler marker and creature beacon clamp to the edge when off-screen, with arrows for direction.
- Rescue requires both the practice quota and an elevation within 2 metres of the target. Gentle drift stops near the target and after the quota, so students can fine-tune without a moving goal.
- Pause uses P. Levels & settings is always visible; X + G is also supported. Fullscreen is available on supported browsers.
- Progress is stored locally in this browser; private browsing or blocked storage may prevent saving. Students do not need accounts. Start expedition starts a fresh journey; Continue saved journey restores the previous one.

This version deliberately uses a route-selection mechanic rather than time-critical collision avoidance, so students can reason before moving. There is no food-catching subsystem; math bundles refill stamina. The sea/sky world, drift, limited manual flight, linked sums, creature collection, and algebraic destinations are retained as teaching concepts.

## Validation

Browser QA in Chromium covered 8,600 generated expressions across all levels and expeditions, sign/parenthesis restrictions, bundle lengths, keyboard route selection, pause, rescue gating and progression, mystery solutions, teacher navigation, mobile horizontal overflow, and saved progress. Desktop and 390px mobile screenshots were inspected. Phone Safari and actual classroom pacing have not been tested.
