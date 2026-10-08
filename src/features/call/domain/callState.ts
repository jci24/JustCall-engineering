export type CallState =
  | { readonly kind: 'ready' }
  | { readonly kind: 'connecting' }
  | { readonly kind: 'listening' }
  | { readonly kind: 'speaking' }
  | { readonly kind: 'ending' }
  | { readonly kind: 'ended' }
  | { readonly kind: 'failed'; readonly message: string };

export type VoiceConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';
export type VoiceMode = 'listening' | 'speaking';

export type CallEvent =
  | { readonly type: 'start-requested' }
  | { readonly type: 'end-requested' }
  | {
      readonly type: 'connection-changed';
      readonly status: VoiceConnectionStatus;
      readonly message?: string;
    }
  | { readonly type: 'mode-changed'; readonly mode: VoiceMode }
  | { readonly type: 'session-released' };

export const initialCallState: CallState = { kind: 'ready' };

export function reduceCallState(state: CallState, event: CallEvent): CallState {
  switch (event.type) {
    case 'start-requested':
      return { kind: 'connecting' };

    case 'end-requested':
      return canEndCall(state) ? { kind: 'ending' } : state;

    case 'mode-changed':
      return isActiveCall(state) ? { kind: event.mode } : state;

    case 'session-released':
      return canFinishSession(state) ? { kind: 'ended' } : state;

    case 'connection-changed':
      return reduceConnectionChange(state, event.status, event.message);
  }
}

function reduceConnectionChange(
  state: CallState,
  status: VoiceConnectionStatus,
  message?: string,
): CallState {
  switch (status) {
    case 'connecting':
      return state.kind === 'ending' ? state : { kind: 'connecting' };
    case 'connected':
      return state.kind === 'ending' ? state : { kind: 'listening' };
    case 'error':
      return { kind: 'failed', message: message ?? 'JustCall could not connect.' };
    case 'disconnected':
      return isActiveCall(state) ? { kind: 'ending' } : state;
  }
}

function isActiveCall(state: CallState): boolean {
  return state.kind === 'listening' || state.kind === 'speaking';
}

function canEndCall(state: CallState): boolean {
  return state.kind === 'connecting' || isActiveCall(state);
}

function canFinishSession(state: CallState): boolean {
  return state.kind === 'ending' || isActiveCall(state);
}
