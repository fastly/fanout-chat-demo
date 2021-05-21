# Chat Demo for Fastly Fanout

This application demonstrates the use of [Fastly Fanout](https://docs.fastly.com/products/fanout)
in a simple web chat app that uses EventStream.

A live instance of this demo can be found at [fanout-chat-demo.edgecompute.app](https://fanout-chat-demo.edgecompute.app/).

## Components

To enable realtime updates, [Fastly Fanout](https://docs.fastly.com/products/fanout) is positioned as a
[GRIP (Generic Realtime Intermediary Protocol)](https://pushpin.org/docs/protocols/grip/) proxy. Responses for streaming
requests are held open by Fanout. Then, as updates become ready, the backend application publishes these updates through
Fanout to all connected clients. For details on this mechanism, see [Real-time Updates](#real-time-updates) below.

The project comprises two main parts:

* A web application. The backend for this web application is written in Python. It uses the
  [Django framework](https://www.djangoproject.com) and uses [SQLite](https://www.sqlite.org/) to maintain a
  small database. The frontend for this web application is a standard HTML application that uses
  [jQuery](https://jquery.com/). The files that compose the frontend are served by the backend as static files.

* An edge application. A [Fastly Compute@Edge](https://docs.fastly.com/products/compute-at-edge)
  application that passes traffic through to the web application, and activates the
  [Fanout feature](https://docs.fastly.com/products/fanout) for relevant requests.

The live instance's backend runs on [Glitch](https://glitch.com/), and the project can be viewed here:
[https://glitch.com/~fanout-chat-demo](https://glitch.com/~fanout-chat-demo).

The live instance's edge application is at [fanout-chat-demo.edgecompute.app](https://fanout-chat-demo.edgecompute.app/).
It is configured with the above Glitch application as the backend, and the service has the
[Fanout feature enabled](https://developer.fastly.com/learning/concepts/real-time-messaging/fanout/#enable-fanout).

## Usage

### Development

Though the project is designed with Glitch and Fastly in mind, it's possible to run
it locally for development.

You will need:

* [Python](https://python.org/) - 3.7 or newer
* [Pushpin](https://pushpin.org/) - This open source GRIP proxy implementation can take the place of Fanout during
  development.

Preparation:

1. [Install Pushpin](https://pushpin.org/docs/install/).

2. Configure Pushpin using `localhost:3000` by modifying the `routes` file.
   For example, on a default macOS installation, set the contents of `/opt/homebrew/etc/pushpin/routes`:

    ```
    * localhost:3000
    ```

3. Setup virtualenv, install Python dependencies, create empty environment config, and set up the database.

    ```sh
    virtualenv --python=python3 venv
    . venv/bin/activate
    pip install -r requirements.txt
    touch .env
    python manage.py migrate
    ```

To start the application:

```sh
python manage.py runserver 3000
```

Now, browse to your application at http://localhost:7999/.

### Production

To run in production, you will need a [Fastly Compute@Edge service with Fanout enabled](https://developer.fastly.com/learning/concepts/real-time-messaging/fanout/#enable-fanout).

You will also need to run the server application on an origin server that is visible from the internet.

#### Running on Glitch

This application is written with Glitch in mind.

> NOTE: If you are using Glitch, consider [boosting your app](https://glitch.happyfox.com/kb/article/73-glitch-pro/) so
> that it doesn't go to sleep.

1. Create a new project on [Glitch](https://glitch.com/) and import this GitHub repository. Note the public URL of your project, which
   typically has the domain name `https://<project-name>.glitch.me`.

2. Set up the environment. In the Glitch interface, modify `.env` and set the following values:
    * `GRIP_URL`: `https://api.fastly.com/service/<service-id>?verify-iss=fastly:<service-id>&key=<api-token>`

        Replace `<service-id>` with your Fastly service ID, and `<api-token>`
        with an API token for your service that has `global` scope.

    * `GRIP_VERIFY_KEY`: `base64:LS0tLS1CRUdJTiBQVUJMSUMgS0VZLS0tLS0KTUZrd0V3WUhLb1pJemowQ0FRWUlLb1pJemowREFRY0RRZ0FFQ0tvNUExZWJ5RmNubVZWOFNFNU9uKzhHODFKeQpCalN2Y3J4NFZMZXRXQ2p1REFtcHBUbzN4TS96ejc2M0NPVENnSGZwLzZsUGRDeVlqanFjK0dNN3N3PT0KLS0tLS1FTkQgUFVCTElDIEtFWS0tLS0t`(\*)

        (*) This is a base64-encoded version of the public key published at [Validating GRIP requests](https://developer.fastly.com/learning/concepts/real-time-messaging/fanout/#validating-grip-requests) on the Fastly Developer Hub.

    * `DJANGO_SECRET_KEY`: Django uses a secret key to provide cryptographic signing. Set a unique, unpredictable value.

        See [SECRET_KEY](https://docs.djangoproject.com/en/4.2/ref/settings/#secret-key) in the Django documentation for
        more details. 

3. Glitch will find the `glitch.json` file and automatically install the dependencies and start your application.

4. Set up the [edge application](edge) on your Fastly account, and set your Glitch application as a backend for it
   using the name `origin`. See the edge application's [README.md](edge/README.md) file for details.

5. Browse to your application at the public URL of your Edge application.

#### Running on your own Python server

This application is written with Glitch in mind, but you can alternatively use any Python server that is visible from
the internet.

1. Clone this repository to a new directory on your Python server.

2. Switch to the directory, install dependencies, create the environment file, and set up the database:

    ```
    pip3 install -r requirements.txt
    touch .env
    python3 manage.py migrate
    ```

3. Set the following environment variables. Modify `.env` and set the following values:
    * `GRIP_URL`: `https://api.fastly.com/service/<service-id>?verify-iss=fastly:<service-id>&key=<api-token>`

        Replace `<service-id>` with your Fastly service ID, and `<api-token>`
        with an API token for your service that has `global` scope.

    * `GRIP_VERIFY_KEY`: `base64:LS0tLS1CRUdJTiBQVUJMSUMgS0VZLS0tLS0KTUZrd0V3WUhLb1pJemowQ0FRWUlLb1pJemowREFRY0RRZ0FFQ0tvNUExZWJ5RmNubVZWOFNFNU9uKzhHODFKeQpCalN2Y3J4NFZMZXRXQ2p1REFtcHBUbzN4TS96ejc2M0NPVENnSGZwLzZsUGRDeVlqanFjK0dNN3N3PT0KLS0tLS1FTkQgUFVCTElDIEtFWS0tLS0t`(\*)

        (*) This is a base64-encoded version of the public key published at [Validating GRIP requests](https://developer.fastly.com/learning/concepts/real-time-messaging/fanout/#validating-grip-requests) on the Fastly Developer Hub.

    * `DJANGO_SECRET_KEY`: Django uses a secret key to provide cryptographic signing. Set a unique, unpredictable value.

        See [SECRET_KEY](https://docs.djangoproject.com/en/4.2/ref/settings/#secret-key) in the Django documentation for
        more details.

4. Start your application:

    ```
    python manage.py runserver
    ```

5. Set up the [edge application](edge) on your Fastly account, and set your Python application as a backend for it using
   the name `origin`. See the edge application's [README.md](edge/README.md) file for details.

6. Browse to your application at the public URL of your Edge application.

#### Production on your own Pushpin instance (advanced)

It's also possible to run in production using your own instance of Pushpin. The details are beyond the scope of this
document, but here are some pointers:

* Configure Pushpin to proxy to your instance of the server application
* Then set your `GRIP_URL` to point to your Pushpin instance

For more details, see [Pushpin Configuration](https://pushpin.org/docs/configuration/).

### Configuration

This program can be configured using two environment variables:

* `GRIP_URL` - a URL used to publish messages through a GRIP proxy. The default value
  is `http://127.0.0.1:5561/`, a value that can be used in development to publish to Pushpin.
* `GRIP_VERIFY_KEY` - (optional) a string that can be used to configure the `verify-key` component
  of `GRIP_URL`. See [Configuration of js-serve-grip](https://github.com/fanout/js-serve-grip#configuration)
  for details.

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

The `/rooms/{room-id}/events/` endpoint uses [django-eventstream](https://pypi.org/project/django-eventstream/) to
use GRIP to serve updated data to clients.

## Issues

If you encounter any non-security-related bug or unexpected behavior, please [file an issue][bug]
using the bug report template.

[bug]: https://github.com/fastly/fanout-chat-demo/issues/new?labels=bug

### Security issues

Please see our [SECURITY.md](SECURITY.md) for guidance on reporting security-related issues.

## License

[MIT](LICENSE.md).
