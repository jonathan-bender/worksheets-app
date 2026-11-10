# Angle Crew / צוות הזוויות

A separate classroom adaptation of **Road Fixer (challenge 5)**. The original five-challenge solo game remains available at `../angle_master.html`.

## Use in class

1. Open `/Angles/classroom/` on the teacher computer and choose **Create game**. The default goal is three stars per student, calculated when you start; you can choose or change a fixed goal.
2. Save the private **host link** using the teacher-screen button. Anyone with this link can control the room. It is the only way to recover teacher controls in another browser; the public room code is for joining.
3. Project the teacher screen. Students open the same page, enter the six-digit code and their name, then choose an emoji and color. Sharing the join link prefills the code. There are no accounts or passwords.
4. Start when the crew is ready. Each student repairs their own roads; successful repairs add one shared star. The puzzles progress from one gap to two, then three, with more varied angles.
5. Three consecutive first-try repairs without hints feature the student's avatar on the projected screen. Mistakes and hints reset the streak but never subtract class stars or prevent earning a repair star. There is no public ranking.

The teacher can pause/resume, lock joining, change the goal, remove a participant, and end the game. Reaching the goal celebrates the class; play can continue until the teacher ends it. New arrivals do not move a goal already set at the start. Refreshing the same tab restores the student and placements; leaving private browsing or clearing site storage removes that recovery capability. Up to 80 participants can join a room. Rooms expire after 12 hours; a daily server task deletes expired room data.

On phones, tap a triangle and then a gap. On computers, dragging also works. Both ends of a repair must complete adjacent angles to 180°. Triangle colors distinguish pieces, rather than encoding correctness.

## Try it alone

Choose **Test room** before creating the game. Add 5 or 30 simulated students, then start. They join and submit through the real backend, at different speeds and with occasional mistakes. Their stars belong only to that test room. Keep the teacher tab open for simulations to run; **Stop simulations** stops their answers, and their avatars eventually show as offline. Open the join link in a separate tab/private window or on your phone to play alongside them.

## Local development

Requires Node 22+ and npm:

```sh
cd functions
npm ci
npm test
npm run dev
```

Open `http://127.0.0.1:8082/Angles/classroom/`. The development server uses memory storage, so restarting it removes local rooms. It does not touch Firebase. Browser checks are in `tests/classroom-browser.py` (Chrome and Python websocket-client required). `functions/test/live-check.js` exercises 30 simultaneous students against `CLASSROOM_API`, which defaults to the local API.

## Firebase

`classroomApi` is an HTTP Cloud Function in `europe-west1`; Hosting rewrites `/api/classroom/**` to it. The Realtime Database is `worksheets-c5d83-default-rtdb` in the same region. Browser access to the database is denied. The backend validates answers and updates room scores in transactions; retries carry an attempt ID and cannot award extra stars. Temporary host and player capabilities are hashed before storage. No Firebase Authentication is used.

The teacher and students poll about every two seconds. A short server cache reduces repeated database downloads. Production requires the Blaze plan. The API scales from zero to at most three instances; cleanup runs once daily. These settings limit resources but are not a spending cap. Billing is managed in the Firebase/Google Cloud console.

```sh
firebase deploy --only functions,database,hosting --project worksheets-c5d83
```

Keep `functions/package-lock.json` committed. See the repository's `CLASSROOM-ROLLBACK.md` for restoring the site before classroom mode.
