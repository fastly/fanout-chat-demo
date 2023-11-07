# Edge

This is the Edge code used with this Fanout Demo.

The purpose of this program is to invoke [Fastly Fanout](https://docs.fastly.com/products/fanout) on
incoming requests at the Edge.

## Usage

Deploy this to your Fastly Compute service and set it up with a backend that runs the [main application](../).

This backend needs to be set up on your service as an entry in the **Hosts** section,
and given the name `origin`.

You also need to [enable Fanout](https://developer.fastly.com/learning/concepts/real-time-messaging/fanout/#enable-fanout)
on your service.

```
npm install
npm run deploy
```

If this is your first time deploying this application, then the Fastly CLI will prompt you for a service
ID or offer to create a new one. Follow the on-screen prompts to set up the service.

See [README of the full project](../README.md) for more details.
