# JustCall — product engineering example

**A small, runnable example of handling the lifecycle of a voice call.**

JustCall is an early iOS English-conversation product: call an AI partner, talk
naturally, hang up and review feedback. This repository shares one generic piece
of its engineering: an explicit call-state reducer and seven focused tests.
The full application remains private.

## Start with the code

- [Call-state reducer](src/features/call/domain/callState.ts): plain TypeScript,
  immutable states and explicit events.
- [Behavior tests](src/features/call/__tests__/callState.unit.test.ts): starting,
  listening/speaking, ending, provider disconnect, stale release and failures.

The reducer keeps an ending call in `ending` until `session-released` arrives.
Connection events and UI requests are separate inputs. This makes the transition
boundary visible without putting provider or navigation code in the domain logic.

## The product problem behind it

A learner can leave the screen while a call is active or still connecting.
The application needs to finish that session before another call proceeds normally.

Guided iPhone checks exercised both situations. The learner reported that Nico
stopped, the microphone indicator cleared and the next call connected normally.
The full product owns native transport cleanup separately; this public sample's
unit tests establish domain transitions, not microphone release or every race.

## Run it locally

Use Node.js 22 LTS (22.13 or later within that series) or 24 LTS, and npm.
From this repository's directory:

```sh
npm ci
npm test
npm run typecheck
```

No account, API key, recording, native build or provider request is needed.
There are seven focused tests. The repository does not launch the JustCall app.

## My role

I am Jaime Castresana, the founder of JustCall. I lead product direction, scope,
validation and integration, with AI coding agents assisting implementation and
review. I turn observed friction into narrow changes, check the behavior through
tests and the real learner flow, and remain accountable for the product decisions.

The full MVP uses TypeScript, React Native, Expo and native voice integration.
This sample illustrates the pure TypeScript boundary only. It does not publish
learning rules, AI instructions, evaluation methods or future product plans.

## Scope

This is a code sample for technical review, not a complete application release.
Tests show selected behavior; they do not establish adoption, learning effectiveness
or general AI accuracy. See [source provenance](SOURCE.md).
