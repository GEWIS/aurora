import { useEffect, useState } from 'react';
import { LoadingView } from '../default';
import { getRoomResponsibleLegacyUrl } from '../../api';

export default function RoomResponsibleLegacyView() {
  const [url, setUrl] = useState('');

  useEffect(() => {
    getRoomResponsibleLegacyUrl()
      .then((res) => {
        if (res && res.data) setUrl(res.data);
      })
      .catch((e) => console.error(e));
  }, []);

  if (!url) {
    return (
      <LoadingView>
        <h1>Fetching url...</h1>
      </LoadingView>
    );
  }

  return (
    <div className="h-screen w-screen bg-black">
      <iframe src={url} title="Room Responsible Legacy" className="w-full h-full border-0" />
      <div className="absolute bottom-0 right-0 w-10 pb-1 overflow-hidden">
        <img src="/base/helmet-white.svg" alt="Aurora" />
      </div>
    </div>
  );
}
