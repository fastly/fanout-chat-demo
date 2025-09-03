# Chat Demo for Fastly Fanout

This application demonstrates the use of [Fastly Fanout](https://docs.fastly.com/products/fanout) in a simple web chat app that uses EventStream.

A live instance of this demo can be found at [fanout-chat-demo.edgecompute.app](https://fanout-chat-demo.edgecompute.app/).

## Overview

To enable realtime updates, [Fastly Fanout](https://docs.fastly.com/products/fanout) is positioned as a [GRIP (Generic Realtime Intermediary Protocol)](https://pushpin.org/docs/protocols/grip/) proxy. Responses for streaming requests are held open by Fanout. Then, as updates become ready, the backend application publishes these updates through Fanout to all connected clients. For details on this mechanism, see [Real-time Updates](#real-time-updates) below.

The project comprises two main parts:

* A web application. The backend for this web application is written in Python. It uses the [Django framework](https://www.djangoproject.com) and uses [SQLite](https://www.sqlite.org/) to maintain a small database. The frontend for this web application is a standard HTML application that uses [jQuery](https://jquery.com/). The files that compose the frontend are served by the backend as static files.

* An edge application. A [Fastly Compute](https://www.fastly.com/products/edge-compute) application that passes traffic through to the web application, and activates the [Fanout feature](https://docs.fastly.com/products/fanout) for relevant requests.

The live instance's backend runs on an instance of Google App Engine.

The live instance's edge application is at [fanout-chat-demo.edgecompute.app](https://fanout-chat-demo.edgecompute.app/). It is configured with the above backend application as the backend, and the service has the [Fanout feature enabled](https://developer.fastly.com/learning/concepts/real-time-messaging/fanout/#enable-fanout).

## Usage

### Development

This application can be run locally without needing to create a Fastly account or enable the Fanout feature.

To run this application locally, you will need to run both the backend application (on Python) and the edge application (in Fastly's local development server).

You will need the following on your development environment:

* [Python](https://python.org/) 3.7 or newer
* [Node.js](https://nodejs.dev/) 20.x or newer
* [Fastly CLI](https://www.fastly.com/documentation/reference/tools/cli/) version 11.5.0 or newer
* [Viceroy](https://github.com/fastly/Viceroy) version 0.14.0 or newer (usually managed by Fastly CLI)
* [a local installation](https://pushpin.org/docs/install/) of Pushpin

#### Run the backend application

1. Clone this repository to a new directory on your development environment.

2. Set up virtualenv and install Python dependencies for this project.

   ```
   cd origin
   virtualenv --python=python3 venv
   . venv/bin/activate
   pip install -r requirements.txt
   ```

3. Create the environment config file.

   ```
   cp .env.template .env
   ```
   
4. Set up the database.

   ```
   python manage.py migrate
   ```

To start the application:

```sh
python manage.py runserver 3000
```

The backend application will run at http://localhost:3000/.

#### Run the edge application

The files live in the `edge/` directory of this repo.

1. Switch to the `edge` directory and install JavaScript dependencies.

   ```
   cd edge
   npm install
   ```

2. Start the application:

   ```
   npm run dev
   ```

Now, browse to your application at http://localhost:7676/.

### Production

To run in production, you will need a [Fastly Compute service with Fanout enabled](https://developer.fastly.com/learning/concepts/real-time-messaging/fanout/#enable-fanout).

You will also need to run the backend application on an origin server that is visible from the internet.

#### Deploy the backend application

Use a Python server that is visible from the internet.

1. Clone this repository to a new directory on your Python server.

2. Set up virtualenv and install Python dependencies for this project.

   ```
   cd origin
   virtualenv --python=python3 venv
   . venv/bin/activate
   pip install -r requirements.txt
   ```

3. Copy `.env.template` to `.env`, and modify it to set the following environment variables:
    * `GRIP_URL`: `https://api.fastly.com/service/<service-id>?verify-iss=fastly:<service-id>&key=<api-token>`

        Replace `<service-id>` with your Fastly service ID, and `<api-token>`
        with an API token for your service that has `global` scope.(\*)

        (*) It's likely that your Fastly service ID is not determined yet, as you have not yet deployed the edge application. If this is the case, leave this blank for now and set it up after you have deployed your edge application.

    * `GRIP_VERIFY_KEY`: `base64:LS0tLS1CRUdJTiBQVUJMSUMgS0VZLS0tLS0KTUZrd0V3WUhLb1pJemowQ0FRWUlLb1pJemowREFRY0RRZ0FFQ0tvNUExZWJ5RmNubVZWOFNFNU9uKzhHODFKeQpCalN2Y3J4NFZMZXRXQ2p1REFtcHBUbzN4TS96ejc2M0NPVENnSGZwLzZsUGRDeVlqanFjK0dNN3N3PT0KLS0tLS1FTkQgUFVCTElDIEtFWS0tLS0t`(\*)

        (*) This is a base64-encoded version of the public key published at [Validating GRIP requests](https://developer.fastly.com/learning/concepts/real-time-messaging/fanout/#validating-grip-requests) on the Fastly Developer Hub.

4. Set up the database.

   ```
   python manage.py migrate
   ```

Then, start the application.

```
python manage.py runserver 80
```

The `80` denotes the port to run the backend server. Set this to an appropriate number to run the backend server.

#### Deploy the edge application

The files live in the `edge/` directory of this repo.

1. Switch to the `edge` directory and install JavaScript dependencies.

   ```
   cd edge
   npm install
   ```

2. Deploy the application:

   ```
   npm run deploy
   ```

3. The first time you deploy this application, the Fastly CLI will prompt you for a service ID or offer to create a new one. Follow the on-screen prompts to set up the service. You will also be prompted to set up backends. Use the name `origin` and set it up to point to the public domain name of your backend application.

4. You also need to [enable Fanout](https://developer.fastly.com/learning/concepts/real-time-messaging/fanout/#enable-fanout) on your service.

   ```term
   $ fastly products --enable=fanout
   ```

5. Now that your service ID has been determined, return to your backend and update the GRIP_URL environment variable with the service ID. Restart the backend application. 

6. Browse to the public domain name of your Compute service.

### Configuration

This program can be configured using these environment variables set in the `.env` file:

* `DJANGO_SECRET_KEY` - a developer-provided random string used by the Django framework during cryptographic operations
* `GRIP_URL` - a URL used to publish messages through a GRIP proxy. The default value is `http://127.0.0.1:5561/`, a value that can be used in development to publish to Pushpin.
* `GRIP_VERIFY_KEY` - (optional) a string that can be used to configure the `verify-key` component of `GRIP_URL`. See [Configuration of js-serve-grip](https://github.com/fanout/js-serve-grip#configuration) for details.

## API

### Get past messages:

```http
GET /rooms/{room-id}/messages/
```

Params: (None)

Returns: JSON object, with fields:

* `messages`: list of the most recent messages, in time descending order
* `last-event-id`: last event ID (use this when listening for events)

### Send message:

```http
POST /rooms/{room-id}/messages/
```

Params:

* `from={string}`: the name of the user sending the message
* `text={string}`: the content of the message

Returns: JSON object of message

### Get events:

```http
GET /rooms/{room-id}/events/
```

Params:

* `lastEventId`: event ID to start reading from (optional)

Returns: SSE stream

## Architecture

### Real-time Updates

The `/rooms/{room-id}/events/` endpoint uses [django-eventstream](https://pypi.org/project/django-eventstream/) to use GRIP to serve updated data to clients.

## Issues

If you encounter any non-security-related bug or unexpected behavior, please [file an issue][bug] using the bug report template.

[bug]: https://github.com/fastly/fanout-chat-demo/issues/new?labels=bug

### Security issues

Please see our [SECURITY.md](SECURITY.md) for guidance on reporting security-related issues.

## License

[MIT](LICENSE.md).
