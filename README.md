## Overview
The goal of this project is to build a static website using **AWS S3**, **Cloudfront**, **Route53**, **ACM**, and **IAM** with **namecheap** as domain registar and automatic deployment pipeline with **GitHub Actions**.

## Architecture
<img width="1351" height="432" alt="s3-website-architecture" src="https://github.com/user-attachments/assets/89130586-8f99-4330-91c5-15aa7bed0f58" />

## Clone the repository
```
git clone https://github.com/lehibonafe/s3-cloudfront-portfolio.git
cd s3-cloudfront-portfolio
```
## Blog Post
[https://dev.to/lehibonafe/deploying-a-static-website-on-aws-s3-with-cloudfront-route53-and-github-actions](https://dev.to/lehibonafe/deploying-a-static-website-on-aws-s3-with-cloudfront-route53-and-github-actions-4463?preview=30ee896c3767737399f50c641535c41b8a0d6f33b3429ce86b9b5ecce09f8e525f39deca4b0d65e8c349cf6b35e4aca1f360f9c3bdea436c98f2ed52)

## Clean project URLs

Project pages remain HTML objects in S3, but visitors use extensionless URLs:

```text
/projects -> /#projects (301 redirect)
/projects/ -> /#projects (301 redirect)
/projects/index.html -> /#projects (301 redirect)
/projects/s3-static-website -> /projects/s3-static-website.html (internal rewrite)
/projects/s3-static-website.html -> /projects/s3-static-website (301 redirect)
```

The viewer-request function is stored in
[`cloudfront-functions/clean-project-urls.js`](cloudfront-functions/clean-project-urls.js).

To enable it in AWS:

1. In CloudFront, create a function using the JavaScript runtime 2.0.
2. Paste the function source, save it, test it, and publish it.
3. Edit the distribution's default cache behavior.
4. Associate the function with the **Viewer request** event.
5. Wait for the distribution to deploy, then invalidate `/*` once.

Keep the distribution's default root object set to `index.html`.
