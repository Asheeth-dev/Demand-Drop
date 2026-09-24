# Dashboard WhatsApp controls

## What will change
- Make **Ignored** visibly red and **Just stocked** visibly green in both the status badge and dropdown.
- Show the WhatsApp number for every customer still waiting beneath the relevant product.
- Add a **Send WhatsApp** button beside the waiting contacts.
- Send the approved stock-alert template to all unnotified contacts for that product, then show the sent count and remove successfully notified contacts from the waiting list.
- Keep the existing automatic send when the owner changes the status to **Just stocked**; the new button also allows a manual send without changing the status again.

## Safety and behavior
- Disable the button while messages are sending and when nobody is waiting.
- Never mark a contact as notified unless WhatsApp accepts the message.
- Show a clear dashboard message when WhatsApp is not connected or a send fails.
- Prevent repeat messages by continuing to use each request's notification timestamp.

## Technical details
- Add a focused server action that validates request IDs, loads only unnotified requests with phone numbers, sends the configured template, and records successful sends.
- Return per-action totals so the dashboard can report success accurately.
- Use the project’s WhatsApp Business connection for server-side sends; no credentials will be exposed in the page.
- Verify the dashboard on desktop and mobile, including status colors, visible numbers, loading state, successful refresh, and current build health.
