import { useEffect, useState } from 'react';
import { GewisPhotoAlbumParams, getPhoto, PosterResponse } from '@gewis/aurora-api-client';
import ImagePoster from './ImagePoster';

interface Props {
  poster: PosterResponse;
  visible: boolean;
  setTitle: (title: string) => void;
}

export default function PhotoPoster({ poster, visible, setTitle }: Props) {
  const [url, setUrl] = useState('');
  const [label, setLabel] = useState('');

  useEffect(() => {
    if (visible) setTitle(label);
  }, [label, setTitle, visible]);

  const albumKey = (poster.albums ?? []).join(',');
  useEffect(() => {
    if (!albumKey) {
      setUrl('');
      setLabel('');
      return;
    }

    let ignore = false;
    const body: GewisPhotoAlbumParams = {
      albumIds: albumKey.split(',').map(Number),
    };
    // TODO what do display if photo is not fetched?
    getPhoto({ body })
      .then((res) => {
        if (res.error) console.error(res.error);
        if (ignore || !res.data) return;
        setUrl(res.data.url);
        setLabel(res.data.label);
      })
      .catch((e) => console.error(e));

    return () => {
      ignore = true;
    };
  }, [albumKey]);

  return <ImagePoster source={url} />;
}
