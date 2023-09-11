# Edge

This is the Edge code used with the Leaderboard Demo.

The purpose of this program is to invoke [Fastly Fanout](https://docs.fastly.com/products/fanout) on
incoming requests at the Edge.

## Usage

Deploy this to your Fastly WASM service and set it up with a backend that runs the [Server](../server)
Node.js program.

This backend needs to be set up on your service as an entry in the **Hosts** section,
and given the name `origin`.

```
npm install
npm run deploy
```

If this is your first time deploying this application, then the Fastly CLI will prompt you for a service
ID or offer to create a new one. Follow the on-screen prompts to set up the service.

## Issues

If you encounter any non-security-related bug or unexpected behavior, please [file an issue][bug]
using the bug report template.

[bug]: https://github.com/fastly/fanout-leaderboard-demo/issues/new?labels=bug

### Security issues

Please see our [SECURITY.md](../SECURITY.md) for guidance on reporting security-related issues.

## License

[MIT](../LICENSE).
