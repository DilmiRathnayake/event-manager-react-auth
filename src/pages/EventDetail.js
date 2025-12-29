import { Suspense } from 'react';
import {
  useRouteLoaderData,
  json,
  redirect,
  defer,
  Await,
} from 'react-router-dom';

import EventItem from '../components/EventItem';
import EventsList from '../components/EventsList';
import { getAuthToken } from '../util/auth';

function EventDetailPage() {
  const { event, events } = useRouteLoaderData('event-detail');

  return (
    <>
      <Suspense fallback={<p style={{ textAlign: 'center' }}>Loading...</p>}>
        <Await resolve={event}>
          {(loadedEvent) => <EventItem event={loadedEvent} />}
        </Await>
      </Suspense>

      <Suspense fallback={<p style={{ textAlign: 'center' }}>Loading...</p>}>
        <Await resolve={events}>
          {(loadedEvents) => <EventsList events={loadedEvents} />}
        </Await>
      </Suspense>
    </>
  );
}

export default EventDetailPage;

async function loadEvent(id) {
  const response = await fetch('http://localhost:8080/events/' + id);

  if (!response.ok) {
    throw json(
      { message: 'Could not fetch event.' },
      { status: 500 }
    );
  }

  const resData = await response.json();
  return resData.event;
}

async function loadEvents() {
  const response = await fetch('http://localhost:8080/events');

  if (!response.ok) {
    throw json(
      { message: 'Could not fetch events.' },
      { status: 500 }
    );
  }

  const resData = await response.json();
  return resData.events;
}

export async function loader({ params }) {
  return defer({
    event: await loadEvent(params.eventId),
    events: loadEvents(),
  });
}

export async function action({ params, request }) {
  const token = getAuthToken();

  if (!token) {
    return redirect('/auth');
  }

  const response = await fetch(
    'http://localhost:8080/events/' + params.eventId,
    {
      method: request.method,
      headers: {
        'Authorization': 'Bearer ' + token, // ✅ FIXED
      },
    }
  );

  if (!response.ok) {
    throw json(
      { message: 'Could not delete event.' },
      { status: 500 }
    );
  }

  return redirect('/events');
}
