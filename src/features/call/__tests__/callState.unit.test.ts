import { describe, expect, it } from 'vitest';

import { initialCallState, reduceCallState } from '../domain/callState';

describe('reduceCallState', () => {
  it('moves from a start request into an active listening call', () => {
    const connecting = reduceCallState(initialCallState, { type: 'start-requested' });
    const listening = reduceCallState(connecting, {
      type: 'connection-changed',
      status: 'connected',
    });

    expect(connecting).toEqual({ kind: 'connecting' });
    expect(listening).toEqual({ kind: 'listening' });
  });

  it('reflects whether the user or Nico has the turn', () => {
    const listening = { kind: 'listening' } as const;

    expect(reduceCallState(listening, { type: 'mode-changed', mode: 'speaking' })).toEqual({
      kind: 'speaking',
    });
  });

  it('keeps ending until the provider confirms the session is fully released', () => {
    const ending = reduceCallState({ kind: 'speaking' }, { type: 'end-requested' });
    const disconnecting = reduceCallState(ending, {
      type: 'connection-changed',
      status: 'disconnected',
    });
    const ended = reduceCallState(disconnecting, { type: 'session-released' });

    expect(ending).toEqual({ kind: 'ending' });
    expect(disconnecting).toEqual({ kind: 'ending' });
    expect(ended).toEqual({ kind: 'ended' });
  });

  it('waits for full release when the provider ends an active call', () => {
    const disconnecting = reduceCallState(
      { kind: 'listening' },
      { type: 'connection-changed', status: 'disconnected' },
    );

    expect(disconnecting).toEqual({ kind: 'ending' });
    expect(reduceCallState(disconnecting, { type: 'session-released' })).toEqual({
      kind: 'ended',
    });
  });

  it('ignores a stale release when no active session is ending', () => {
    expect(reduceCallState(initialCallState, { type: 'session-released' })).toEqual(
      initialCallState,
    );
  });

  it('turns provider errors into a readable failure state', () => {
    expect(
      reduceCallState({ kind: 'connecting' }, {
        type: 'connection-changed',
        status: 'error',
        message: 'Microphone permission was denied.',
      }),
    ).toEqual({ kind: 'failed', message: 'Microphone permission was denied.' });
  });

  it('ignores the provider initial disconnected status before a call connects', () => {
    expect(
      reduceCallState({ kind: 'connecting' }, {
        type: 'connection-changed',
        status: 'disconnected',
      }),
    ).toEqual({ kind: 'connecting' });
  });
});
