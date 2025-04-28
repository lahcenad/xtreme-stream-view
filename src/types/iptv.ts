
export interface XtremeCredentials {
  url: string;
  username: string;
  password: string;
}

export interface IPTVChannel {
  id: string;
  name: string;
  stream_url: string;
  stream_icon?: string;
  epg_channel_id?: string;
  category_id?: string;
}

export interface IPTVCategory {
  id: string;
  name: string;
  channels?: IPTVChannel[];
}

export interface PlayerState {
  isPlaying: boolean;
  volume: number;
  currentTime: number;
  duration: number;
  loading: boolean;
}
