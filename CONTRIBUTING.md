# Contributing to vereinsflieger_api

Thank you for your interest in contributing to this project! 

## How to Contribute

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Ensure all changes follow the coding standards below
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

## Coding Standards

- All methods must have complete JSDoc documentation
- Include parameter types, descriptions, and return types
- Add input validation for required parameters
- Use proper error handling with descriptive messages
- Follow the existing code style (ES6+, async/await)
- Test your changes with `node test.js`

## JSDoc Example

```javascript
/**
 * Brief description of the method
 * @param {string} param1 - Description (required)
 * @param {number} [param2=0] - Optional parameter with default
 * @returns {Promise<Object>} Description of return value
 * @throws {Error} Description of when errors are thrown
 */
async myMethod(param1, param2 = 0) {
    // Implementation
}
```

## Bug Reports

When reporting bugs, please include:
- Node.js version
- Steps to reproduce
- Expected vs actual behavior
- Error messages (if any)

## Feature Requests

Feature requests are welcome! Please:
- Check if the feature already exists
- Explain the use case
- Consider if it fits the project scope

## Questions?

Feel free to open an issue for questions or clarifications.
