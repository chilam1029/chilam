# Mochi Hydration

An Expo React Native MVP based on the [six-screen Figma wireframes](https://www.figma.com/design/ZTTUSs735T8TszkVewvnZ4). Choose to drink, log water, collect permanent cosmetic items, and welcome a new Mochi each month. No notifications.

## Run

Install Node 22+, then run `npm ci` and `npm start` in this folder. Open the Expo QR code in Expo Go on iOS or Android. Create an account using email and a password of at least six characters. Supabase email confirmation may require confirming the message before signing in.

The app uses the existing Mochi Hydration Supabase project. Its publishable client key is in `src/lib/supabase.ts`; no secret key is shipped. The applied schema is saved in `supabase/migrations/0001_initial.sql`. User owned records are protected with RLS; log and draw mutations run atomically on the server.

## MVP limits

Daily target starts at 2,000 mL and the database day currently uses UTC. Drops earn at 1 per 2 mL up to the daily target; 300 Drops buy a cosmetic draw; duplicate draws return 90 Drops; rare or better is guaranteed by the twentieth draw. These economy values are provisional. Mochi visuals, month recap, native home-screen widget, and Bluetooth bottle support are later work. The existing Figma widget frame is a concept; this runnable version uses in-app quick logging.
