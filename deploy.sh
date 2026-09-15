#!/bin/sh
# Build, then deploy - and STOP if the build failed.
#
# The first version of this was one `npx next build | tail -3 && scp ...` line.
# A pipeline's exit status is the LAST command's, so `tail` returning 0 hid a
# failed build and the old out/ went to the server while the terminal said
# "redeployed". Hence `set -e` and no pipe on the build.
set -e
cd "$(dirname "$0")"
npx next build
test -f out/index.html
tar czf /tmp/bronier-out.tgz -C out .
sshpass -p "$VPS_PASS" scp -o StrictHostKeyChecking=no /tmp/bronier-out.tgz root@185.103.164.237:/tmp/
sshpass -p "$VPS_PASS" ssh -o StrictHostKeyChecking=no root@185.103.164.237 \
  'rm -rf /var/www/bronier-prototype/* && tar xzf /tmp/bronier-out.tgz -C /var/www/bronier-prototype && chown -R www-data:www-data /var/www/bronier-prototype'
echo "deployed https://bronier-demo.185.103.164.237.nip.io/"
