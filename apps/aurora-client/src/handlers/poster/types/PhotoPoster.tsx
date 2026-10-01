import { useEffect, useState } from 'react';
import { GewisPhotoAlbumParams, getPhoto, PosterResponse } from '@gewis/aurora-api-client';
import useStableArray from '../useStableArray';
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

  const albums = useStableArray(poster.albums ?? []);
  useEffect(() => {
    if (albums.length === 0) {
      setUrl('');
      setLabel('');
      return;
    }

    const body: GewisPhotoAlbumParams = {
      albumIds: albums,
    };
    // TODO what do display if photo is not fetched?
    getPhoto({ body })
      .then((res) => {
        setUrl(res.data!.url);
        setLabel(res.data!.label);
      })
      .catch((e) => console.error(e));
  }, [albums]);

  return <ImagePoster source={url} />;
}
