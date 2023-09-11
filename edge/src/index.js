/*
 * Copyright Fastly, Inc.
 * Licensed under the MIT license. See LICENSE file for details.
 */

/// <reference types="@fastly/js-compute" />
import { createFanoutHandoff } from 'fastly:fanout';

addEventListener('fetch', (event) => event.respondWith(handleRequest(event)));

/**
 * @param { FetchEvent } event
 */
async function handleRequest(event) {
  if (event.request.method === 'GET') {
    // If it's a GET request, then we will pass it through Fanout

    // The createFanoutHandoff() creates a Response instance
    // passing the original request, through Fanout, to the declared backend.
    return createFanoutHandoff(event.request, 'origin');
  }

  return fetch(event.request, { backend: 'origin' });
}
