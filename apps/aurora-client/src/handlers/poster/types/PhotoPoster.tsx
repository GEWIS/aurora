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

  useEffect(() => {
    if (!poster.albums || poster.albums.length === 0) {
      setUrl('');
      setLabel('');
      return;
    }

    const body: GewisPhotoAlbumParams = {
      albumIds: poster.albums,
    };
    // TODO what do display if photo is not fetched?
    getPhoto({ body })
      .then((res) => {
        setUrl(res.data!.url);
        setLabel(res.data!.label);
      })
      .catch((e) => console.error(e));
  }, [poster.albums]);

  return <ImagePoster source={url} />;
}
