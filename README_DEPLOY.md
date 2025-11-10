Automated deploy for partner1 demo

This repository includes scripts and a GitHub Actions workflow to automate deploying the `partner-demos/website-1-video` site to the partner VPS.

Files added

- `scripts/deploy_partner1.ps1` — PowerShell script to package & upload and run remote deploy steps (Windows/dev machine).
- `scripts/deploy_partner1.sh` — Bash script for Linux/macOS or CI runner.
- `.github/workflows/deploy_partner1.yml` — GitHub Actions workflow that runs on push to `main` (paths limited to partner-demos/website-1-video/\*\*).

Quick manual usage (local):

PowerShell (Windows):

```powershell
# from repo root
.
\scripts\deploy_partner1.ps1 -Host 160.30.112.42 -User root -TargetDir /www/wwwroot/partner1.mojistudio.vn -KeyPath C:\path\to\id_rsa
```

Bash (Linux/macOS):

```bash
./scripts/deploy_partner1.sh 160.30.112.42 root /www/wwwroot/partner1.mojistudio.vn /path/to/id_rsa
```

GitHub Actions setup

1. Add the following repository secrets:

   - DEPLOY_HOST: e.g. 160.30.112.42
   - DEPLOY_USER: e.g. root
   - DEPLOY_KEY: private SSH key (PEM format) that can authenticate to the server
   - DEPLOY_TARGET_DIR: /www/wwwroot/partner1.mojistudio.vn
   - DEPLOY_PORT (optional): default 22

2. Push changes to `main`. The workflow triggers on changes under `partner-demos/website-1-video/**`.

Security notes

- The workflow and scripts create timestamped backups under the target dir's `backups/`. Move those backups to a secure folder if desired.
- Never store private keys in the repo. Use GitHub Secrets for actions or a secure key file on your CI machine.

If you want, I can:

- Run the PowerShell script from this environment to deploy now (will prompt for SSH password if key not provided), or
- Configure the workflow and help set up repository secrets (you must add secrets in GitHub settings).
