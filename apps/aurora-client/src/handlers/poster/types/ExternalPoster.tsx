import { PosterLayer, PosterStack } from '../components/PosterLayers';
import ImagePoster from './ImagePoster';

interface Props {
  url: string;
}

export default function ExternalPoster({ url }: Props) {
  return (
    <PosterStack>
      <PosterLayer>
        <ImagePoster source="/base/avico-stuk.png" />
      </PosterLayer>
      <PosterLayer>
        <iframe
          title="External video"
          className="border-none w-full h-full overflow-hidden"
          src={url}
          seamless
        />
      </PosterLayer>
    </PosterStack>
  );
}
