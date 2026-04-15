# Security Policy

## Supported Versions

We release patches for security vulnerabilities. Currently supported versions:

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

We take the security of our project seriously. If you believe you have found a
security vulnerability, please report it to us as described below.

### Please Do Not

- Open a public GitHub issue for security vulnerabilities
- Disclose the vulnerability publicly before it has been addressed

### Please Do

1. **Email us directly** at security@your-domain.com with:
   - Description of the vulnerability
   - Steps to reproduce the issue
   - Potential impact
   - Suggested fix (if any)

2. **Allow time for response**:
   - We will acknowledge receipt within 48 hours
   - We will provide a detailed response within 7 days
   - We will work with you to understand and address the issue

3. **Coordinate disclosure**:
   - We will notify you when the vulnerability is fixed
   - We will credit you in the security advisory (unless you prefer to remain
     anonymous)
   - We will coordinate the public disclosure timing with you

## Security Best Practices

### For Contributors

- Never commit sensitive data (API keys, passwords, tokens)
- Use environment variables for configuration
- Keep dependencies up to date
- Run security audits regularly: `pnpm audit`
- Follow secure coding practices

### For Users

- Keep your installation up to date
- Use strong, unique passwords
- Enable two-factor authentication when available
- Review and limit third-party integrations
- Monitor your application logs

## Security Features

This project implements several security measures:

### Dependency Management

- Regular dependency updates via Dependabot
- Automated security audits in CI/CD
- Lockfile verification

### Code Analysis

- CodeQL security scanning
- ESLint security rules
- TypeScript strict mode

### Runtime Security

- Environment variable validation
- Input sanitization
- CORS configuration
- Rate limiting
- Secure headers

## Security Updates

Security updates are released as soon as possible after a vulnerability is
confirmed. Updates are announced via:

- GitHub Security Advisories
- Release notes
- Email notifications (for critical issues)

## Vulnerability Disclosure Timeline

1. **Day 0**: Vulnerability reported
2. **Day 1-2**: Acknowledgment sent
3. **Day 3-7**: Initial assessment and response
4. **Day 7-30**: Fix development and testing
5. **Day 30**: Coordinated public disclosure

## Security Hall of Fame

We recognize and thank security researchers who responsibly disclose
vulnerabilities:

<!-- List of contributors who reported security issues -->

## Contact

For security concerns, contact:

- Email: security@your-domain.com
- PGP Key: [Link to PGP key]

## Additional Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [Next.js Security Headers](https://nextjs.org/docs/advanced-features/security-headers)
