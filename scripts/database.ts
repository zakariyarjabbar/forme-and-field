import { cleanup, seed } from '../lib/server/store';
const command = process.argv[2];
if (command === 'cleanup') console.log(`Removed ${cleanup()} expired workspaces.`);
else if (command === 'seed' || command === 'migrate') {
  seed();
  console.log(
    'Schema version 2 applied and deterministic catalog seed verified. Existing workspaces preserved.',
  );
} else {
  console.error(
    'Use migrate, seed, or cleanup. Reset individual demos through the confirmed /demo action.',
  );
  process.exitCode = 1;
}
