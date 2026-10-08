
# Cloud Portfolio

A personal portfolio website showcasing hands-on projects in AWS cloud infrastructure, DevOps automation, CI/CD, and Site Reliability Engineering.

The website is hosted on Amazon S3 and delivered through Amazon CloudFront, with automated deployments using GitHub Actions and secure AWS authentication through OpenID Connect (OIDC).

## Architecture

![AWS Architecture](https://github.com/user-attachments/assets/89130586-8f99-4330-91c5-15aa7bed0f58)

### Technology Stack

| Category | Technologies |
|----------|--------------|
| Cloud Provider | Amazon Web Services (AWS) |
| Hosting  | Amazon S3 |
| CDN | Amazon CloudFront |
| DNS | Amazon Route 53 |
| SSL/TLS | AWS Certificate Manager |
| Security | AWS IAM, OIDC |
| CI/CD | GitHub Actions |
| Domain Registrar | Namecheap |
| Frontend | HTML, CSS, JavaScript |
| Edge Routing | CloudFront Functions |

## Key Features

- **Static Website Hosting:** Hosts portfolio content using Amazon S3.
- **Global Content Delivery:** Uses Amazon CloudFront for caching and low-latency content delivery.
- **HTTPS:** Uses AWS Certificate Manager for SSL/TLS certificates.
- **Custom Domain:** Integrates Namecheap domain registration with Amazon Route 53 DNS.
- **Automated Deployment:** Deploys website changes automatically using GitHub Actions.
- **Keyless AWS Authentication:** Uses GitHub Actions OIDC to assume an AWS IAM role without long-lived access keys.
- **Cache Invalidation:** Automatically invalidates CloudFront cache after deployment.
- **Clean URLs:** Uses CloudFront Functions for URL rewriting and redirects.

## CI/CD Workflow

The deployment pipeline is defined in `.github/workflows/main.yml`.

1. A developer pushes changes to the `main` branch.
2. GitHub Actions starts the deployment workflow.
3. The workflow authenticates to AWS using OIDC.
4. Updated website files are synchronized to Amazon S3.
5. CloudFront cache is invalidated to serve updated content.

### Deployment Flow

```text
Developer
    |
    v
GitHub Repository
    |
    | Push to main
    v
GitHub Actions
    |
    | Assume IAM Role via OIDC
    v
Amazon S3
    |
    | Cache Invalidation
    v
Amazon CloudFront
    |
    v
Portfolio Website
```

## Project Structure

```text
cloud-portfolio/
├── .github/
│   └── workflows/
│       └── main.yml
├── cloudfront-functions/
│   └── clean-project-urls.js
├── images/
├── projects/
│   ├── cicd-fargate.html
│   ├── github-actions-oidc.html
│   ├── s3-static-website.html
│   └── terraform-state.html
├── 404.html
├── index.html
├── script.js
├── style.css
├── README.md
└── LICENSE
```

## Featured Projects

The portfolio includes technical project pages covering:

- **AWS Static Website Hosting** — S3, CloudFront, Route 53, and automated deployments.
- **Amazon ECS Fargate CI/CD** — Container deployments and CI/CD automation.
- **GitHub Actions OIDC** — Secure AWS authentication for deployment pipelines.
- **Terraform Remote State** — Infrastructure state management using Terraform.

Explore the implementation details in the `projects/` directory.

## Run Locally

Clone the repository:

```bash
git clone https://github.com/lehibonafe/cloud-portfolio.git
cd cloud-portfolio
```

Start a local development server:

```bash
python3 -m http.server 5500
```

Open your browser:

```text
http://localhost:5500
```

## Deployment Configuration

The GitHub Actions workflow requires the following repository secrets:

| Secret | Description |
|--------|-------------|
| `AWS_ACCOUNT_ID` | AWS account containing the deployment role |
| `AWS_REGION` | AWS region for the deployment |
| `S3_BUCKET` | S3 destination used by the sync command |
| `CLOUDFRONT_DISTRIBUTION_ID` | Distribution to invalidate after deployment |

The deployment IAM role is named `GitHubOIDC`.

The role must trust GitHub's OIDC provider and have the appropriate permissions for S3 deployment and CloudFront invalidation.

## Security Considerations

- Uses OIDC instead of storing long-lived AWS access keys in GitHub.
- Restricts AWS access through IAM role permissions.
- Delivers website content over HTTPS.
- Uses AWS-managed services to reduce server administration overhead.

## Lessons Learned

This project demonstrates practical experience in:

- Building and operating a static website on AWS.
- Implementing automated deployment pipelines.
- Integrating GitHub Actions with AWS IAM using OIDC.
- Managing CDN caching and invalidation.
- Configuring domain resolution and HTTPS.
- Implementing URL routing at the CloudFront edge.

## References

- [GitHub Repository](https://github.com/lehibonafe/cloud-portfolio)
- [AWS Documentation](https://docs.aws.amazon.com/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)

## License

See the [LICENSE](LICENSE) file for details.
