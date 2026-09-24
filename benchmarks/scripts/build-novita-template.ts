import 'dotenv/config';
import { Novita, defaultBuildLogger } from 'novita-sandbox';

async function main() {
  const apiKey = process.env.NOVITA_API_KEY;
  if (!apiKey) {
    throw new Error('NOVITA_API_KEY environment variable is not set');
  }

  const novita = new Novita({ apiKey });

  // TTI executes `node -v` in a fresh, non-interactive sandbox. Install Node
  // on the system PATH at build time instead of relying on shell/NVM setup.
  const template = novita.template
    .new()
    .fromTemplate("base")
    .runCmd(
      'apt-get update && DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends nodejs && /usr/bin/node -v',
      { user: 'root' },
    )
    .runCmd('node -v');

  // Rebuild the alias; an existing template does not prove Node is available.
  // Let build errors propagate so we cannot silently reuse an unsuitable image.
  await novita.template.build(template, 'base-8c-16g', {
    cpuCount: 8,
    memoryMB: 16384,
    onBuildLogs: defaultBuildLogger(),
  });
  console.log('Novita template base-8c-16g built successfully (node -v verified)');
}

main().catch((error) => {
  console.error('Failed to build Novita template:', error);
  process.exit(1);
});
