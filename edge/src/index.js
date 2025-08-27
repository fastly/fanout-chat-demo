/*
 * Copyright Fastly, Inc.
 * Licensed under the MIT license. See LICENSE file for details.
 */

/// <reference types="@fastly/js-compute" />
import { createFanoutHandoff } from 'fastly:fanout';
import { includeBytes } from 'fastly:experimental';

const demoManifest = includeBytes('/resources/demo-manifest.txt');
const screenshot = includeBytes('/resources/screenshot.png');

addEventListener('fetch', (event) => event.respondWith(handleRequest(event)));

/**
 * @param { FetchEvent } event
 */
async function handleRequest(event) {
  if (event.request.method === 'GET') {
    const { pathname } = new URL(event.request.url);

    if (pathname === '/.well-known/fastly/demo-manifest') {
      return new Response(demoManifest, {
        status: 200,
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
        },
      });
    }

    if (pathname === '/images/screenshot.png') {
      return new Response(screenshot, {
        status: 200,
        headers: {
          'Content-Type': 'image/png',
        },
      });
    }

    // If it's a GET request for 'rooms/<room_id>/events/', then we will pass it through Fanout
    if (pathname.startsWith('/rooms/') && pathname.endsWith('/events/')) {
      // The createFanoutHandoff() creates a Response instance
      // passing the original request, through Fanout, to the declared backend.
      return createFanoutHandoff(event.request, 'origin');
    }
  }

  return fetch(event.request, { backend: 'origin' });
}
