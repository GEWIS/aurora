interface Props {
  size: string | number;
  dark?: boolean;
}

export function LogoStream({ size, dark }: Props) {
  return (
    <div className="flex flex-col items-center leading-none">
      <img
        src={!dark ? '/base/streaming-white.svg' : '/base/streaming-black.svg'}
        alt="Aurora"
        className="block"
        style={{
          filter: 'invert(10%)',
          height: `calc(${size} * 10)`,
        }}
      />

      <span
        className={!dark ? 'text-neutral-100' : 'text-black'}
        style={{
          fontSize: size,
          marginTop: `calc(${size} * -0.15)`,
        }}
      >
        Streaming with Aurora
      </span>
    </div>
  );
}
