# Kinescope integration — frontend notes

This file captures everything I changed on the frontend (`../web`) to add Kinescope as a second video provider alongside Yandex Cloud, and lists what the backend (this repo) needs to do to match. Keep this around until the backend side is wired up.

## Scope on the frontend

The frontend mirrors the existing Yandex Cloud flow: backend returns a TUS upload URL, frontend uploads bytes via `tus-js-client`, then calls `finish-upload` and `publish`. Service is now selectable at video creation time.

### What changed

**Entity / type**
- `src/core/data/entities/Video.ts` — `serviceType: 'yandex' | 'kinescope'` (was `'yandex'` only).
- `env.d.ts` — `declare module '@kinescope/vue-kinescope-player'` (the package ships no `.d.ts`).

**New components** (parallel to `yandex/`, under `src/components/computed/video/kinescope/`):
- `kinescope-video-uploader.vue` — identical TUS upload flow to `yandex-video-uploader.vue`. Props: `uploadUrl: string | null`. Emits: `before-upload(file)`, `upload-finished`, `error`. Sends only `filename` and `filetype` as TUS metadata.
- `kinescope-video-player.vue` — wraps `KinescopePlayer` from `@kinescope/vue-kinescope-player`. Uses `video.uniqueIdentifier` as the Kinescope `video-id`.

**Wiring**
- `src/components/computed/video/video-player.vue` — switch branch added: `case 'kinescope' → KinescopeVideoPlayer`.
- `src/components/computed/video/creation/video-creation-upload-form.vue` — renders `<kinescope-video-uploader>` when `serviceType === 'kinescope'`.
- `src/components/computed/video/creation/video-creation-info-form.vue` — added "Сервис загрузки" select bound to `videoModel.serviceType` with options `yandex` / `kinescope`.
- `src/modules/nootube/views/video-view.vue` — embed-link computed returns `https://kinescope.io/<uniqueIdentifier>` for kinescope, otherwise the Yandex player URL.

**Package**
- `@kinescope/vue-kinescope-player ^2.1.0` added to `dependencies`. Installed with `npm install --legacy-peer-deps`.

### Frontend → backend contract (unchanged shape, new provider value)

`POST /video` body is the existing `Video` payload, but `serviceType` may now be `'kinescope'`. Response stays `{ id, uploadUrl }`. The frontend then:

1. Uploads file bytes via TUS `PATCH` requests to the returned `uploadUrl`.
2. Calls `POST /video/{id}/finish-upload` once TUS reports success.
3. Calls `POST /video/{id}/publish` to flip the video to `uploaded`.

The frontend only sends `filename` and `filetype` as TUS metadata. If Kinescope's API needs anything extra (e.g. `parent_id` / folder, `title`), the backend must embed those into the upload URL or pre-create the asset before handing the URL to the frontend.

The `Video.uniqueIdentifier` field is what the player renders. For Kinescope it must be the **Kinescope video ID** (the value `KinescopePlayer` accepts as `video-id`, which is the same ID app.kinescope.io shows). The backend has to populate this field after the upload is finalized — same role `uniqueIdentifier` plays for Yandex today.

## What the backend needs to do

These are the asks for the backend side, derived from how Yandex is currently wired and from Kinescope's API (Postman collection: https://documenter.getpostman.com/view/10589901/TVCcXpNM).

### 1. Accept `serviceType: 'kinescope'`
Wherever `Video.serviceType` is validated (DTO/schema/enum/DB column), add `'kinescope'`. The DB column likely needs the same widening (enum or string CHECK constraint).

### 2. Provider abstraction
There is presumably a Yandex-specific service that:
- creates an upload session,
- returns a TUS upload URL,
- handles the `finish-upload` webhook/poll,
- resolves the final `uniqueIdentifier` and playable state.

Add a `KinescopeVideoService` (or whatever the existing pattern is) that implements the same interface. Pick the provider in `createVideo` based on the request's `serviceType`.

### 3. Kinescope upload flow
Per Kinescope docs, the typical flow is:
- `POST https://uploader.kinescope.io/` (or `/v2/videos`, depending on which path the account uses) with auth `Authorization: Bearer <API_TOKEN>` to create the upload session. Response includes a TUS endpoint.
- Client `PATCH`es bytes using TUS protocol — this is what the frontend already does with the URL we hand it.
- Once upload completes, Kinescope processes the asset asynchronously. The video ID is known up front from the create-session response and is what should be saved as `Video.uniqueIdentifier`.

Concretely, on `POST /video` when `serviceType === 'kinescope'`:
1. Call Kinescope to create an upload session, passing `filename`, `filesize`, optionally `parent_id` (folder/project), `title`.
2. Persist the new `Video` row with `serviceType = 'kinescope'`, `state = 'uploading'`, `uniqueIdentifier = <kinescope video id>`, `uploadUrl = <tus url from kinescope>`.
3. Return `{ id, uploadUrl }` to the frontend.

### 4. `finish-upload` and `publish`
- `POST /video/{id}/finish-upload`: for Kinescope this is mostly a state flip. TUS upload completing on Kinescope's side already means the bytes are in. You may want to optionally poll Kinescope's `GET /v1/videos/{id}` to confirm processing has started before flipping `state` to `uploaded`. If you'd rather match Yandex behavior exactly, just flip the state.
- `POST /video/{id}/publish`: same as Yandex — your existing publish logic. If access control / privacy needs to be pushed to Kinescope (e.g. setting the video's privacy to `public` / `private`), do it here.

### 5. Webhooks (optional but recommended)
Kinescope sends webhooks on processing events (`video.ready`, `video.failed`, etc). Wire one endpoint that updates `Video.state` (`uploaded` / `failed`) and ideally `duration` / `sizeInBytes` when the asset is ready. This is the cleanest replacement for whatever polling/webhook Yandex uses today.

### 6. Config
- `KINESCOPE_API_TOKEN` env var (Bearer token from app.kinescope.io).
- Optional: `KINESCOPE_PARENT_ID` — default folder/project to upload into.
- Optional: webhook secret if you implement webhook verification.

### 7. Embed / public link
The frontend builds the public embed URL itself as `https://kinescope.io/<uniqueIdentifier>`. No backend work required for that, but if you generate share/embed links anywhere on the backend, mirror this format.

### 8. Things to confirm against the Postman collection
I implemented the frontend purely from the assumption that "TUS upload URL comes from backend" — same as Yandex. Before backend work begins, double-check on the Postman collection:
- Exact create-upload-session endpoint and its response shape (TUS URL field name, video ID field name).
- Whether `parent_id` is required.
- Whether the TUS URL is single-use / time-limited (affects retry / resume after page reload).
- Webhook event names and payload shape.

## Quick checklist for the backend session

- [ ] Widen `serviceType` to include `'kinescope'` (DTO + DB).
- [ ] Add `KINESCOPE_API_TOKEN` (and any other config) to env + config loader.
- [ ] Implement `KinescopeVideoService` mirroring the Yandex one.
- [ ] Branch in `createVideo` on `serviceType` to pick the provider.
- [ ] Make `finish-upload` and `publish` provider-aware.
- [ ] (Optional) Webhook endpoint for Kinescope processing events.
- [ ] Verify against the Postman collection that request/response shapes match what the implementation assumes.
