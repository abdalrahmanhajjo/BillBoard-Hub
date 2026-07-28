import { parseResponse } from '@/client/lib/response-utils';

export const rotationClientService = {
  /** Device contract endpoint — what is playing on a screen right now. */
  async getNowPlaying(billboardId: string) {
    const response = await fetch(
      `/api/v1/public/screens/${encodeURIComponent(billboardId)}/now-playing`,
      { method: 'GET', credentials: 'include' },
    );
    return parseResponse(response);
  },

  /** Admin preview of a specific schedule's ordered rotation. */
  async getScheduleRotation(scheduleId: string) {
    const response = await fetch(`/api/v1/schedules/${encodeURIComponent(scheduleId)}/rotation`, {
      method: 'GET',
      credentials: 'include',
    });
    return parseResponse(response);
  },
};
