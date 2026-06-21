import './BlurredImage.css';

interface Props {
  cover: string;
}

export default function BlurredImage({ cover }: Props) {
  return (
    <div className="w-full h-full bg-black absolute overflow-hidden">
      <div className="blurred-image" style={{ backgroundImage: `url("${cover}")` }} />
    </div>
  );
}
