# Security Policy

## Reporting a Vulnerability

We take security vulnerabilities seriously. If you discover a security issue, please report it responsibly.

### How to Report

**Email**: <security@mkcubed.com>

Please include:

1. **Description**: Clear description of the vulnerability
2. **Impact**: Potential impact and severity assessment
3. **Reproduction Steps**: Detailed steps to reproduce the issue
4. **Affected Components**: Which parts of the system are affected
5. **Suggested Fix**: If you have a suggested remediation (optional)

### What to Expect

| Timeline            | Action                                                |
| ------------------- | ----------------------------------------------------- |
| **Within 48 hours** | Initial acknowledgment of your report                 |
| **Within 7 days**   | Preliminary assessment and severity classification    |
| **Within 30 days**  | Resolution plan or fix deployed (for critical issues) |
| **After fix**       | Public disclosure (coordinated with reporter)         |

### Severity Levels

| Level    | Description                                     | Target Resolution |
| -------- | ----------------------------------------------- | ----------------- |
| Critical | Remote code execution, data breach, auth bypass | 24-48 hours       |
| High     | Privilege escalation, significant data exposure | 7 days            |
| Medium   | Limited data exposure, denial of service        | 30 days           |
| Low      | Information disclosure, minor issues            | Next release      |

## Supported Versions

| Version | Supported |
| ------- | --------- |
| 0.1.x   | Yes       |

## Security Best Practices

When contributing to this project, follow these security guidelines:

### Code Security

- **Input Validation**: Always validate and sanitize user input
- **Authentication**: Use the `@repo/auth` package for all auth flows
- **Authorization**: Implement proper role-based access control
- **Secrets**: Never commit secrets; use environment variables

### Dependency Security

- Keep dependencies updated
- Review security advisories for dependencies
- Use `pnpm audit` to check for known vulnerabilities

### Data Protection

- Use parameterized queries to prevent SQL injection
- Implement proper CORS policies
- Use HTTPS for all external communications
- Follow data minimization principles

## Scope

This security policy applies to:

- The main application codebase
- All packages in the monorepo
- CI/CD pipeline configurations
- Infrastructure configurations

### Out of Scope

- Third-party services (report to respective vendors)
- Social engineering attacks
- Physical security issues

## Recognition

We appreciate security researchers who help keep our platform safe. With your permission, we will acknowledge your contribution in our security advisories.

## Contact

For security-related inquiries:

- **Security Reports**: <security@mkcubed.com>
- **General Questions**: Open a GitHub issue (for non-sensitive matters)

## Additional Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [CWE Top 25](https://cwe.mitre.org/top25/)
